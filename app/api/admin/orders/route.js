import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
export async function GET() {
  try {
    const { getSession } = await import("@/lib/session");
    const session = await getSession();
    if (!session?.isLoggedIn || !session?.adminId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized access" },
        { status: 401 }
      );
    }
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray();
    const formattedOrders = orders.map((order) => ({
      receipt: order.receipt || order.orderNumber || order.order_number || "",
      customer: {
        fullname: order.customer?.fullname || order.customer?.full_name || order.customer?.name || "",
        mobile: order.customer?.mobile || order.customer?.phone || "",
        email: order.customer?.email || "",
        address: order.customer?.address || "",
        state: order.customer?.state || "",
        pincode: order.customer?.pincode || "",
        country: order.customer?.country || "",
      },
      items: (order.items || []).map((item) => ({
        product_title: item.product_title || item.name || "Product",
        product_image: item.product_image || "",
        weight: item.weight || "",
        quantity: Number(item.quantity || 1),
        final_price: Number(item.final_price || 0),
      })),
      summary: {
        subtotal: Number(order.summary?.subtotal || 0),
        shipping: Number(order.summary?.shipping || 0),
        total: Number(order.summary?.total ?? order.summary?.subtotal ?? 0),
      },
      paymentMethod: order.paymentMethod || order.payment_method || "",
      paymentStatus: order.paymentStatus || "",
      orderStatus: order.orderStatus || order.order_status || "Pending",
      orderDate: order.orderDate || "",
      createdAt: order.createdAt || null,
      currency: order.currency || "INR",
    }));
    return NextResponse.json({
      success: true,
      totalOrders: formattedOrders.length,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Admin orders API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}