import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return Response.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const admin = await db.collection("admins").findOne({ username });
    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 }
      );
    }
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return Response.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 }
      );
    }
    const session = await getSession();
    session.adminId = admin._id.toString();
    session.username = admin.username;
    session.isLoggedIn = true;
    await session.save();
    return Response.json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Login failed",
      },
      { status: 500 }
    );
  }
}