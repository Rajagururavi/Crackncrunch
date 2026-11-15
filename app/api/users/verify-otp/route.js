import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import crypto from "crypto";
export async function POST(request) {
  try {
    const { email, otp } = await request.json();
    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required." },
        { status: 400 }
      );
    }
    if (!/^\d{6}$/.test(String(otp))) {
      return NextResponse.json(
        { success: false, message: "Enter a valid 6-digit OTP." },
        { status: 400 }
      );
    }
    const normalizedEmail = email.toLowerCase().trim();
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const otpCollection = db.collection("email_otps");
    const record = await otpCollection.findOne({
      email: normalizedEmail,
    });
    if (!record) {
      return NextResponse.json(
        { success: false, message: "OTP not found. Please request a new OTP." },
        { status: 400 }
      );
    }
    if (record.expiresAt < new Date()) {
      await otpCollection.deleteOne({ email: normalizedEmail });
      return NextResponse.json(
        { success: false, message: "OTP expired. Please request a new OTP." },
        { status: 400 }
      );
    }
    if (record.verified) {
      return NextResponse.json(
        { success: false, message: "OTP already verified." },
        { status: 400 }
      );
    }
    if (record.attempts >= 5) {
      await otpCollection.deleteOne({ email: normalizedEmail });
      return NextResponse.json(
        { success: false, message: "Too many attempts. Please request a new OTP." },
        { status: 429 }
      );
    }
    const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
    if (otpHash !== record.otpHash) {
      await otpCollection.updateOne(
        { email: normalizedEmail },
        { $inc: { attempts: 1 } }
      );
      return NextResponse.json(
        { success: false, message: "Incorrect OTP. Please try again." },
        { status: 400 }
      );
    }
    const verificationToken = crypto.randomBytes(32).toString("hex");
    await otpCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          verified: true,
          verificationToken,
          verifiedAt: new Date(),
          verificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      }
    );
    return NextResponse.json({
      success: true,
      message: "Email verified successfully.",
      verificationToken,
    });
  } catch (error) {
    console.error("Verify OTP API error:", error);
    return NextResponse.json(
      { success: false, message: "OTP verification failed." },
      { status: 500 }
    );
  }
}