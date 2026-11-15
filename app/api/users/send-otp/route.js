import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import nodemailer from "nodemailer";
import crypto from "crypto";
export async function POST(request) {
  try {
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }
    const normalizedEmail = email.toLowerCase().trim();
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const existingUser = await db.collection("users").findOne({
      email: normalizedEmail,
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered." },
        { status: 400 }
      );
    }
    const otpCollection = db.collection("email_otps");
    const previousOtp = await otpCollection.findOne({
      email: normalizedEmail,
    });
    if (previousOtp?.sentAt && Date.now() - new Date(previousOtp.sentAt).getTime() < 60000) {
      return NextResponse.json(
        {
          success: false,
          message: "Please wait 60 seconds before requesting another OTP.",
        },
        { status: 429 }
      );
    }
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Crack n Crunch" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Your Crack n Crunch Email Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Crack n Crunch</h2>
          <p>Your email verification OTP is:</p>
          <h1 style="letter-spacing: 8px; color: #d62828;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
          <p>Please do not share this OTP with anyone.</p>
        </div>
      `,
    });
    await otpCollection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          otpHash,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          sentAt: new Date(),
          verified: false,
          attempts: 0,
        },
      },
      { upsert: true }
    );
    return NextResponse.json({
      success: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error("Send OTP API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send OTP. Please try again.",
      },
      { status: 500 }
    );
  }
}