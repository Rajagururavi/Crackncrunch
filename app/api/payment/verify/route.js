import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  createOrder,
  getOrderByRazorpayId,
} from "@/app/models/Order";
import { sendOrderEmail } from "@/lib/sendOrderEmail";
import { generateInvoice } from "@/lib/generateInvoice";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export const runtime = "nodejs";
async function sendInvoiceEmail(db, savedOrder, invoiceSettings) {
  if (!savedOrder?._id || !savedOrder?.customer?.email) {
    console.error("Invoice email: Order ID or customer email missing.");
    return "failed";
  }
  const orders = db.collection("orders");
  const now = new Date();
  const staleTime = new Date(Date.now() - 10 * 60 * 1000);
  try {
    const claim = await orders.updateOne(
      {
        _id: savedOrder._id,
        emailSentAt: { $exists: false },
        $or: [
          { 
            emailStatus: { $in: ["pending", "failed"] } 
          },
          { 
            emailStatus: { $exists: false } 
          },
          {
            emailStatus: "sending",
            emailSendingAt: { $lt: staleTime },
          },
        ],
      },
      {
        $set: {
          emailStatus: "sending",
          emailSendingAt: now,
        },
      }
    );
    if (claim.modifiedCount !== 1) {
      const latestOrder = await orders.findOne({
        _id: savedOrder._id,
      });
      if (latestOrder?.emailSentAt) {
        return "sent";
      }
      return latestOrder?.emailStatus || "pending";
    }
    const invoicePdfBuffer = await generateInvoice(savedOrder, invoiceSettings);
    await sendOrderEmail({
      to: savedOrder.customer.email,
      order: savedOrder,
      invoicePdfBuffer,
    });
    await orders.updateOne(
      { _id: savedOrder._id },
      {
        $set: {
          emailStatus: "sent",
          emailSentAt: new Date(),
        },
        $unset: {
          emailSendingAt: "",
          emailError: "",
        },
      }
    );
    console.log("Invoice email sent successfully:", savedOrder.customer.email);
    return "sent";
  } catch (emailError) {
    console.error("Invoice email error:", emailError);
    await orders.updateOne(
      { _id: savedOrder._id },
      {
        $set: {
          emailStatus: "failed",
          emailError: String(emailError.message || emailError).slice(0, 500),
        },
        $unset: {
          emailSendingAt: "",
        },
      }
    );
    return "failed";
  }
}
export async function POST(request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          error: "Razorpay configuration is missing.",
        },
        { status: 500 }
      );
    }
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      receipt,
      orderDate,
      customer,
      items,
      summary,
      currency,
    } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment details are incomplete.",
        },
        { status: 400 }
      );
    }
    const generatedSignature = crypto.createHmac("sha256", keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    const received = Buffer.from(razorpay_signature, "hex");
    const generated = Buffer.from(generatedSignature, "hex");
    if (received.length !== generated.length || !crypto.timingSafeEqual(received, generated)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid payment signature.",
        },
        { status: 400 }
      );
    }
    const userId = String(customer?.id || customer?._id || customer?.userId || customer?.user_id || "");
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Valid customer account ID is required.",
        },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "crackncrunch");
    const registeredUser = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });
    if (!registeredUser || !registeredUser.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Registered customer email not found.",
        },
        { status: 400 }
      );
    }
    const registeredEmail = String(registeredUser.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registeredEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "Registered customer email is invalid.",
        },
        { status: 400 }
      );
    }
    const registeredName = String(registeredUser.name || registeredUser.full_name || registeredUser.fullName || registeredUser.fullname || customer?.fullname || "");
    const registeredPhone = String(registeredUser.phone || registeredUser.mobile || registeredUser.mobile_number || registeredUser.phone_number || customer?.mobile || "");
    const adminSettings = await db.collection("admins").findOne(
        {},
        {
          projection: {
            phone: 1,
            email: 1,
            address: 1,
            gst: 1,
            fssai: 1,
            logo: 1,
          },
        }
      );
    const invoiceSettings = {
      phone: adminSettings?.phone || "",
      email: adminSettings?.email || "",
      address: adminSettings?.address || "",
      gst: adminSettings?.gst || "",
      fssai: adminSettings?.fssai || "",
      logo: adminSettings?.logo || "",
    };
    const existingOrder = await getOrderByRazorpayId(razorpay_order_id);
    if (existingOrder) {
      if (existingOrder.razorpay_payment_id !== razorpay_payment_id) {
        return NextResponse.json(
          {
            success: false,
            error: "This order is already linked to another payment.",
          },
          { status: 409 }
        );
      }
      await db.collection("orders").updateOne(
        { _id: existingOrder._id },
        {
          $set: {
            "customer.id": userId,
            "customer.email": registeredEmail,
            "customer.fullname": registeredName,
            "customer.mobile": registeredPhone,
          },
        }
      );
      const refreshedOrder = await db.collection("orders").findOne({ _id: existingOrder._id });
      const emailStatus = await sendInvoiceEmail(db, refreshedOrder, invoiceSettings);
      return NextResponse.json({
        success: true,
        message: "Order already saved.",
        orderId: String(existingOrder._id),
        paymentId: razorpay_payment_id,
        emailStatus,
      });
    }
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const headers = {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    };
    const orderResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpay_order_id)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );
    const razorpayOrder = await orderResponse.json();
    if (!orderResponse.ok) {
      console.error("Razorpay order error:", razorpayOrder);
      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify Razorpay order.",
        },
        { status: 400 }
      );
    }
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );
    const paymentData = await paymentResponse.json();
    if (!paymentResponse.ok) {
      console.error("Razorpay payment error:", paymentData);
      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify Razorpay payment.",
        },
        { status: 400 }
      );
    }
    if (paymentData.order_id !== razorpay_order_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment order ID does not match.",
        },
        { status: 400 }
      );
    }
    if (paymentData.status !== "captured") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment is not captured yet.",
        },
        { status: 400 }
      );
    }
    if (Number(paymentData.amount) !== Number(razorpayOrder.amount)) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment amount mismatch.",
        },
        { status: 400 }
      );
    }
    if (paymentData.currency !== "INR" || razorpayOrder.currency !== "INR" || (currency && currency !== paymentData.currency)) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment currency mismatch.",
        },
        { status: 400 }
      );
    }
    if (!customer || !customer.address) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer delivery details are missing.",
        },
        { status: 400 }
      );
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Order products are missing.",
        },
        { status: 400 }
      );
    }
    const orderData = {
      receipt: receipt || "",
      orderDate: orderDate || new Date().toISOString(),
      customer: {
        id: userId,
        fullname: registeredName,
        mobile: registeredPhone,
        email: registeredEmail,
        address: String(customer.address || ""),
        state: String(customer.state || ""),
        pincode: String(customer.pincode || ""),
        country: String(customer.country || registeredUser.country || "India"),
      },
      items,
      summary: {
        subtotal: Number(summary?.subtotal || 0),
        shipping: Number(summary?.shipping || 0),
        total: Number(paymentData.amount) / 100,
      },
      currency: paymentData.currency,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_amount: Number(paymentData.amount),
      razorpay_status: paymentData.status,
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      orderStatus: "Processing",
      emailStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await createOrder(orderData);
    let savedOrder = null;
    if (result.success) {
      savedOrder = result.order;
    } else {
      savedOrder = await getOrderByRazorpayId(razorpay_order_id);
      if (!savedOrder || savedOrder.razorpay_payment_id !== razorpay_payment_id) {
        return NextResponse.json(
          {
            success: false,
            error: result.message || "Order saving failed.",
          },
          { status: 500 }
        );
      }
      await db.collection("orders").updateOne(
        { _id: savedOrder._id },
        {
          $set: {
            "customer.id": userId,
            "customer.email": registeredEmail,
            "customer.fullname": registeredName,
            "customer.mobile": registeredPhone,
          },
        }
      );
      savedOrder = await db.collection("orders").findOne({
        _id: savedOrder._id,
      });
    }
    const emailStatus = await sendInvoiceEmail(db, savedOrder, invoiceSettings);
    return NextResponse.json({
      success: true,
      message: "Payment verified and order saved successfully.",
      orderId: String(savedOrder._id),
      paymentId: razorpay_payment_id,
      emailStatus,
      emailMessage: emailStatus === "sent" ? "Invoice email sent successfully." : emailStatus === "failed" ? "Order saved. Invoice email could not be sent." : "Order saved. Invoice email is pending.",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Payment verification failed.",
      },
      { status: 500 }
    );
  }
}