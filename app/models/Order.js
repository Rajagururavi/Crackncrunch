import clientPromise from "@/lib/mongodb";
const DB_NAME = process.env.MONGODB_DB || "crackncrunch";
let indexPromise = null;
export async function getOrdersCollection() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection("orders");
}
async function ensureOrdersIndex(orders) {
  if (!indexPromise) {
    indexPromise = orders.createIndex(
      { razorpay_order_id: 1 },
      {
        unique: true,
        name: "unique_razorpay_order_id",
      }
    ).catch((error) => {
      indexPromise = null;
      throw error;
    });
  }
  await indexPromise;
}
export async function createOrder(orderData) {
  try {
    if (!orderData?.razorpay_order_id) {
      return {
        success: false,
        message: "Razorpay order ID is required.",
      };
    }
    const orders = await getOrdersCollection();
    await ensureOrdersIndex(orders);
    const existingOrder = await orders.findOne({
      razorpay_order_id: orderData.razorpay_order_id,
    });
    if (existingOrder) {
      return {
        success: false,
        message: "Order already exists.",
        order: existingOrder,
      };
    }
    const newOrder = {
      ...orderData,
      paymentStatus: "Paid",
      orderStatus: orderData.orderStatus || "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await orders.insertOne(newOrder);
    return {
      success: true,
      order: {
        ...newOrder,
        _id: result.insertedId,
      },
    };
  } catch (error) {
    if (error.code === 11000) {
      const orders = await getOrdersCollection();
      const existingOrder = await orders.findOne({
        razorpay_order_id: orderData.razorpay_order_id,
      });
      return {
        success: false,
        message: "Order already exists.",
        order: existingOrder,
      };
    }
    console.error("Create order error:", error);
    return {
      success: false,
      message: "Unable to save order.",
    };
  }
}
export async function getOrderByRazorpayId(razorpayOrderId) {
  const orders = await getOrdersCollection();
  return orders.findOne({
    razorpay_order_id: razorpayOrderId,
  });
}