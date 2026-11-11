
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    // Check admin login
    const { getSession } = await import("@/lib/session");
    const session = await getSession();

    if (!session?.isLoggedIn || !session?.adminId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
        },
        { status: 401 }
      );
    }

    // Connect MongoDB
    const client = await clientPromise;
    const db = client.db("crackncrunch");

    // Get customer details without password
    const users = await db
      .collection("users")
      .find(
        {},
        {
          projection: {
            _id: 0,
            name: 1,
            email: 1,
            phone: 1,
            address: 1,
            pincode: 1,
            state: 1,
            country: 1,
            createdAt: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Admin users API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}