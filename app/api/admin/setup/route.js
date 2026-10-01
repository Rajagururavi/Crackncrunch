import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
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
    const existingAdmin = await db
      .collection("admins")
      .findOne({ username });
    if (existingAdmin) {
      return Response.json(
        {
          success: false,
          message: "Admin already exists",
        },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("admins").insertOne({
      username,
      password: hashedPassword,
      createdAt: new Date(),
    });
    return Response.json({
      success: true,
      message: "Admin created successfully!",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "Failed to create admin",
        error: error.message,
      },
      { status: 500 }
    );
  }
}