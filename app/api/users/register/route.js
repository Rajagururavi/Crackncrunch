import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      pincode,
      state,
      country,
      password,
      verificationToken,
    } = body;
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !address?.trim() || !pincode?.trim() || !state?.trim() || !password || !verificationToken) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const users = db.collection("users");
    const otpCollection = db.collection("email_otps");
    const otpRecord = await otpCollection.findOne({
      email: normalizedEmail,
      verified: true,
      verificationToken,
      verificationExpiresAt: { $gt: new Date() },
    });
    if (!otpRecord) {
      return NextResponse.json(
        {
          success: false,
          message: "Email verification expired or invalid. Please verify your email again.",
        },
        { status: 400 }
      );
    }
    const existingUser = await users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered." },
        { status: 400 }
      );
    }
    const existingPhone = await users.findOne({ phone: normalizedPhone });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, message: "Phone number already exists!" },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      name: name.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      address: address.trim(),
      pincode: pincode.trim(),
      state: state.trim(),
      country: country?.trim() || "India",
      password: hashedPassword,
      createdAt: new Date(),
    };
    await users.insertOne(user);
    await otpCollection.deleteOne({ _id: otpRecord._id });
    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create account." },
      { status: 500 }
    );
  }
}