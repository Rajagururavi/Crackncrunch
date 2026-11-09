import { NextResponse } from "next/server";
import Razorpay from "razorpay";
export const runtime = "nodejs";
export async function POST(request) {
  try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay keys are not configured." },
        { status: 500 }
      );
    }
    const body = await request.json();
    const amount = Number(body.amount);
    if (!Number.isSafeInteger(amount) || amount < 100) {
      return NextResponse.json(
        { success: false, error: "Invalid payment amount." },
        { status: 400 }
      );
    }
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: String(body.receipt || `receipt_${Date.now()}`).slice(0, 40),
    });
    return NextResponse.json({
      success: true,
      keyId,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unable to create payment order.",
      },
      { status: 500 }
    );
  }
}