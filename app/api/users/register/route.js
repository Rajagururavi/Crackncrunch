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
    } = body;

    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !pincode ||
      !state ||
      !country ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("crackncrunch");

    const existingUser = await db.collection("users").findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already registered.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      state: state.trim(),
      country: country || "India",
      password: hashedPassword,
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(user);

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error("Register API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create account.",
      },
      { status: 500 }
    );
  }
}