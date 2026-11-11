import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
const DB_NAME = "crackncrunch";
async function checkAdmin() {
  const { getSession } = await import("@/lib/session");
  const session = await getSession();
  return !!(session?.isLoggedIn && session?.adminId);
}
export async function GET(request, { params }) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }
    const { receipt } = await params;
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const order = await db.collection("orders").findOne({
      receipt: decodeURIComponent(receipt),
    });
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    const result = {
      receipt: order.receipt || "",
      orderDate: order.orderDate || "",
      createdAt: order.createdAt || null,
      updatedAt: order.updatedAt || null,
      customer: {
        fullname: order.customer?.fullname || "",
        mobile: order.customer?.mobile || "",
        email: order.customer?.email || "",
        address: order.customer?.address || "",
        city: order.customer?.city || "",
        state: order.customer?.state || "",
        pincode: order.customer?.pincode || "",
        country: order.customer?.country || "",
      },
      items: (order.items || []).map((item) => ({
        product_title: item.product_title || "Product",
        product_image: item.product_image || "",
        quantity: Number(item.quantity || 1),
        weight: item.weight || "",
        final_price: Number(item.final_price || 0),
      })),
      summary: {
        subtotal: Number(order.summary?.subtotal || 0),
        shipping: Number(order.summary?.shipping || 0),
        total: Number(order.summary?.total ?? order.summary?.subtotal ?? 0),
      },
      paymentMethod: order.paymentMethod || "",
      paymentStatus: order.paymentStatus || "",
      paymentDate: order.paymentDate || order.createdAt || null,
      transactionId: order.razorpay_payment_id || order.transaction_id || "",
      razorpayOrderId: order.razorpay_order_id || "",
      orderStatus: order.orderStatus || "Pending",
      customerNote: order.customer_note || "",
      currency: order.currency || "INR",
    };
    return NextResponse.json({
      success: true,
      order: result,
    });
  } catch (error) {
    console.error("Order details GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
export async function PATCH(request, { params }) {
  try {
    if (!(await checkAdmin())) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }
    const { receipt } = await params;
    const body = await request.json();
    const orderStatus = String(body.orderStatus || "").trim();
    const allowedStatuses = [
      "Pending",
      "Processing",
      "Packed",
      "Shipping",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];
    if (!allowedStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid order status" },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection("orders").updateOne(
      { receipt: decodeURIComponent(receipt) },
      {
        $set: {
          orderStatus,
          updatedAt: new Date(),
        },
      }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      orderStatus,
    });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update order status" },
      { status: 500 }
    );
  }
}