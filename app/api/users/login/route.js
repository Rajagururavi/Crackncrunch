
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("crackncrunch");

    const user = await db.collection("users").findOne({
      email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        { status: 401 }
      );
    }

    // Read customer details using common field names
    const getValue = (...keys) => {
      for (const key of keys) {
        const value = user[key];

        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          return String(value).trim();
        }
      }

      return "";
    };

    const userData = {
      id: user._id.toString(),

      name: getValue(
        "name",
        "full_name",
        "fullName",
        "fullname"
      ),

      email: getValue("email"),

      phone: getValue(
        "phone",
        "mobile",
        "mobile_number",
        "phone_number"
      ),

      address: getValue(
        "address",
        "delivery_address",
        "deliveryAddress",
        "shipping_address",
        "full_address"
      ),

      state: getValue(
        "state",
        "delivery_state",
        "deliveryState",
        "shipping_state"
      ),

      pincode: getValue(
        "pincode",
        "pin_code",
        "pinCode",
        "postal_code",
        "postalCode",
        "zip_code"
      ),

      country: getValue(
        "country",
        "delivery_country",
        "deliveryCountry"
      ) || "India",
    };

    return NextResponse.json({
      success: true,
      message: "Login successful.",
      user: userData,
    });
  } catch (error) {
    console.error("User Login API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Login failed. Please try again.",
      },
      { status: 500 }
    );
  }
}