import { NextResponse } from "next/server";
import { getOrdersCollection } from "@/app/models/Order";
export const dynamic = "force-dynamic";
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }
    const ordersCollection = await getOrdersCollection();
    const orders = await ordersCollection
      .find({
        $or: [
          { "customer.id": userId },
          { "customer._id": userId },
          { "customer.userId": userId },
          { "customer.user_id": userId },
          { userId: userId },
          { user_id: userId },
          { customerId: userId }
        ]
      }).sort({ createdAt: -1 }).toArray();
    const formattedOrders = orders.map((order) => ({
      _id: String(order._id),
      receipt: order.receipt || "",
      items: order.items || [],
      customer: order.customer || {},
      summary: order.summary || {},
      paymentMethod: order.paymentMethod || order.payment_method || "Razorpay",
      paymentStatus: order.paymentStatus || "Pending",
      orderStatus: order.orderStatus || "Pending",
      createdAt: order.createdAt || order.created_at || null
    }));
    return NextResponse.json({
      success: true,
      orders: formattedOrders
    });
  } catch (error) {
    console.error("My Orders API Error:", error);
    return NextResponse.json(
      { success: false, message: "Unable to fetch orders" },
      { status: 500 }
    );
  }
}