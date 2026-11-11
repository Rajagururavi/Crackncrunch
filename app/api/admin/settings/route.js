import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";
export async function GET() {
  try {
    const { getSession } = await import("@/lib/session");
    const session = await getSession();
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    let admin;
    if (session?.isLoggedIn && session?.adminId && ObjectId.isValid(session.adminId)) {
      admin = await db.collection("admins").findOne({
        _id: new ObjectId(session.adminId),
      });
    } else {
      admin = await db.collection("admins").findOne(
        {},
        {
          projection: {
            phone: 1,
            gst: 1,
            fssai: 1,
            address: 1,
            logo: 1,
          },
        }
      );
    }
    if (!admin) {
      return Response.json({
        success: true,
        settings: {
          phone: "",
          gst: "",
          fssai: "",
          address: "",
          logo: "",
          username: "",
          email: "",
        },
      });
    }
    return Response.json({
      success: true,
      settings: {
        phone: admin.phone || "",
        gst: admin.gst || "",
        fssai: admin.fssai || "",
        address: admin.address || "",
        logo: admin.logo || "",
        username: session?.isLoggedIn && session?.adminId ? admin.username || "" : "",
        email: session?.isLoggedIn && session?.adminId ? admin.email || "" : "",
      },
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return Response.json(
      { success: false, message: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
export async function PUT(request) {
  try {
    const { getSession } = await import("@/lib/session");
    const session = await getSession();
    if (!session.isLoggedIn || !session.adminId) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }
    if (!ObjectId.isValid(session.adminId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid admin session",
        },
        { status: 401 }
      );
    }
    const formData = await request.formData();
    const phone = formData.get("phone") || "";
    const gst = formData.get("gst") || "";
    const fssai = formData.get("fssai") || "";
    const address = formData.get("address") || "";
    const username = formData.get("username") || "";
    const email = formData.get("email") || "";
    const password = formData.get("password") || "";
    const logoFile = formData.get("logo");
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const admin = await db.collection("admins").findOne({
      _id: new ObjectId(session.adminId),
    });
    if (!admin) {
      return Response.json(
        {
          success: false,
          message: "Admin not found",
        },
        { status: 404 }
      );
    }
    const updateData = {
      phone,
      gst,
      fssai,
      address,
      username: username || admin.username,
      email,
      updatedAt: new Date(),
    };
    if (logoFile && typeof logoFile !== "string" && logoFile.size > 0) {
      if (!logoFile.type?.startsWith("image/")) {
        return Response.json(
          {
            success: false,
            message: "Please upload a valid image.",
          },
          { status: 400 }
        );
      }
      if (logoFile.size > 5 * 1024 * 1024) {
        return Response.json(
          {
            success: false,
            message: "Logo size must be less than 5MB.",
          },
          { status: 400 }
        );
      }
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, {
        recursive: true,
      });
      const extension = path.extname(logoFile.name || "") || ".png";
      const fileName = "logo-" + Date.now() + extension;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await logoFile.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      updateData.logo = "/uploads/" + fileName;
    }
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }
    await db.collection("admins").updateOne(
      {
        _id: admin._id,
      },
      {
        $set: updateData,
      }
    );
    session.username = updateData.username;
    await session.save();
    return Response.json({
      success: true,
      message: "Settings saved successfully!",
      logo: updateData.logo || admin.logo || "",
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to save settings",
      },
      { status: 500 }
    );
  }
}