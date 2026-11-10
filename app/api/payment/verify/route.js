import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  createOrder,
  getOrderByRazorpayId,
} from "@/app/models/Order";
export const runtime = "nodejs";
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
    const existingOrder = await getOrderByRazorpayId(razorpay_order_id);
    if (existingOrder) {
      if (existingOrder.razorpay_payment_id === razorpay_payment_id) {
        return NextResponse.json({
          success: true,
          message: "Order already saved.",
          orderId: String(existingOrder._id),
          paymentId: razorpay_payment_id,
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: "This order is already linked to another payment.",
        },
        { status: 409 }
      );
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
    if (!customer || !customer.fullname || !customer.mobile || !customer.address) {
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
      receipt: receipt || "", orderDate: orderDate || new Date().toISOString(),
      customer: {
        id: String(customer.id || customer._id || customer.userId || customer.user_id || ""),
        fullname: String(customer.fullname || ""),
        mobile: String(customer.mobile || ""),
        email: String(customer.email || ""),
        address: String(customer.address || ""),
        state: String(customer.state || ""),
        pincode: String(customer.pincode || ""),
        country: String(customer.country || "India"),
      },
      items, summary: {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await createOrder(orderData);
    if (!result.success) {
      const savedOrder = await getOrderByRazorpayId(
        razorpay_order_id
      );
      if (savedOrder && savedOrder.razorpay_payment_id === razorpay_payment_id) {
        return NextResponse.json({
          success: true,
          message: "Order already saved.",
          orderId: String(savedOrder._id),
          paymentId: razorpay_payment_id,
        });
      }
      return NextResponse.json(
        {
          success: false,
          error: result.message || "Order saving failed.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Payment verified and order saved successfully.",
      orderId: String(result.order._id),
      paymentId: razorpay_payment_id,
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