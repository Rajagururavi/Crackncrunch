import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
const DB_NAME = "crackncrunch";
const COLLECTION_NAME = "wishlists";
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID required" },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const wishlist = await db.collection(COLLECTION_NAME).find({ userId: String(userId) }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json({
      success: true,
      wishlist,
    });
  } catch (error) {
    console.error("Wishlist GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}
export async function POST(request) {
  try {
    const body = await request.json();
    console.log("WISHLIST POST BODY:", body);
    const userId = body.userId;
    const productId = body.productId;
    if (!userId || !productId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID and Product ID required",
          received: {
            userId: userId ?? null,
            productId: productId ?? null,
          },
        },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const existing = await collection.findOne({
      userId: String(userId),
      productId: String(productId),
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Already in wishlist",
        wishlist: existing,
      });
    }
    const wishlistData = {
      userId: String(userId),
      productId: String(productId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await collection.insertOne(wishlistData);
    return NextResponse.json({
      success: true,
      message: "Product added to wishlist",
      wishlist: {_id: result.insertedId, ...wishlistData,},
    });
  } catch (error) {
    console.error("Wishlist POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Wishlist add failed" },
      { status: 500 }
    );
  }
}
export async function DELETE(request) {
  try {
    const body = await request.json();
    console.log("WISHLIST DELETE BODY:", body);
    const { userId, productId } = body;
    if (!userId || !productId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID and Product ID required",
        },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const result = await db.collection(COLLECTION_NAME).deleteOne({
      userId: String(userId),
      productId: String(productId),
    });
    return NextResponse.json({
      success: true,
      message: result.deletedCount > 0 ? "Product removed from wishlist" : "Product not found in wishlist",
    });
  } catch (error) {
    console.error("Wishlist DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Wishlist remove failed" },
      { status: 500 }
    );
  }
}