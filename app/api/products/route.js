import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const filter = {};
    if (search) {
      filter.$or = [
        {
          productName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          productKeyword: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
        {
          brand: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }
    if (category) {
      filter.category = {$regex: `^${category}$`, $options: "i",};
    }
    const products = await db.collection("products").find(filter).sort({ _id: -1 }).toArray();
    const result = products.map((product) => {
      let images = [];
      if (Array.isArray(product.images)) {
        images = product.images.filter(
          (image) => typeof image === "string" && image.trim() !== "");
      }
      const productName = product.productName || "";
      const productKeyword = product.productKeyword || "";
      const productCategory = product.category || "";
      const brand = product.brand || "";
      const price = Number(product.price || 0);
      const offerPrice = Number(product.offerPrice || 0);
      const stockStatus = product.stockStatus || "";
      return {
        _id: product._id.toString(),
        productName,
        productKeyword,
        category: productCategory,
        brand,
        price,
        offerPrice,
        stockStatus,
        images,
      };
    });
    return NextResponse.json({
      success: true,
      products: result,
    });
  } catch (error) {
    console.error("Products API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load products",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}