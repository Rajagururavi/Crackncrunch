import { NextResponse } from "next/server";
import { getOrdersCollection } from "@/app/models/Order";
import { getSession } from "@/lib/session";
export const dynamic = "force-dynamic";
const STATUSES = [
  "Processing",
  "Pending",
  "Shipping",
  "Delivered",
  "Cancelled",
];
function getAmount(order) {
  return (Number(order.summary?.total ?? order.totalAmount ?? order.total_amount ?? order.grandTotal ?? order.grand_total ?? order.total ?? order.amount ?? order.subtotal ?? 0) || 0);
}
function getOrderStatus(order) {
  const value = String(order.orderStatus || "Pending").toLowerCase();
  return (STATUSES.find((status) => status.toLowerCase() === value) || "Pending");
}
function getCustomerName(order) {
  return (order.customer?.fullname || order.customer?.full_name || order.customer?.name || order.full_name || order.fullName || order.customerName || order.name || order.shippingAddress?.full_name || order.address?.full_name || "Customer");
}
function getOrderNumber(order) {
  return (order.receipt || order.order_number || order.orderNumber || order.razorpay_order_id || String(order._id));
}
function getOrderDate(order) {
  if (order.orderDate) {
    const parsedDate = new Date(order.orderDate);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  if (order.createdAt) {
    const parsedDate = new Date(order.createdAt);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }
  }
  return null;
}
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session.isLoggedIn || !session.adminId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }
    const ordersCollection = await getOrdersCollection();
    const orders = await ordersCollection.find({}).sort({ createdAt: -1 }).toArray();
    const currentYear = new Date().getFullYear();
    const count = {
      processing: 0,
      pending: 0,
      shipping: 0,
      delivered: 0,
      cancelled: 0,
      total_orders: orders.length,
      revenue: 0,
    };
    const formattedOrders = orders.map((order) => {
      const status = getOrderStatus(order);
      count[status.toLowerCase()]++;
      const date = getOrderDate(order);
      const paymentStatus = String(order.paymentStatus || "").toLowerCase();
      if (date && date.getFullYear() === currentYear && paymentStatus === "paid") {
        count.revenue += getAmount(order);
      }
      return {
        id: String(order._id),
        orderNumber: getOrderNumber(order),
        customer: getCustomerName(order),
        amount: getAmount(order),
        status,
        date: date ? date.toISOString() : null,
        paymentStatus: order.paymentStatus || "Unknown",
      };
    });
    const { searchParams } = new URL(request.url);
    const requestedStatus = searchParams.get("status");
    const filteredOrders = STATUSES.includes(requestedStatus) ? formattedOrders.filter((order) => order.status === requestedStatus): formattedOrders;
    return NextResponse.json({
      success: true,
      count,
      orders: filteredOrders.slice(0, 50),
    });
  } catch (error) {
    console.error("ADMIN DASHBOARD ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to load dashboard",
      },
      { status: 500 }
    );
  }
}