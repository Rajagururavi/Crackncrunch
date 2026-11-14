import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    if (!query) {
      return NextResponse.json({
        success: true,
        products: [],
      });
    }
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const products = await db
      .collection("products")
      .find({
        $or: [
          {
            productName: {
              $regex: query,
              $options: "i",
            },
          },
          {
            productKeyword: {
              $regex: query,
              $options: "i",
            },
          },
          {
            category: {
              $regex: query,
              $options: "i",
            },
          },
          {
            brand: {
              $regex: query,
              $options: "i",
            },
          },
        ],
      })
      .limit(10).toArray();
    const result = products.map((product) => {
      let images = [];
      if (Array.isArray(product.images)) {
        images = product.images.filter(
          (image) =>
            typeof image === "string" &&
            image.trim() !== ""
        );
      }
      const productName = product.productName || "";
      const productKeyword = product.productKeyword || "";
      const price = Number(product.price || 0);
      const offerPrice = Number(product.offerPrice || 0);
      const category = product.category || "";
      const brand = product.brand || "";
      return {
        _id: product._id.toString(),
        productName,
        productKeyword,
        category,
        brand,
        price,
        offerPrice,
        images,
      };
    });
    return NextResponse.json({
      success: true,
      products: result,
    });
  } catch (error) {
    console.error("Product search error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Search failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}