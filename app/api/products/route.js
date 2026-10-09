
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
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    const products = await db
      .collection("products")
      .find(filter)
      .sort({ _id: -1 })
      .toArray();

    const result = products.map((product) => {
      let images = [];

      if (Array.isArray(product.images)) {
        images = product.images.filter(
          (image) =>
            typeof image === "string" && image.trim() !== ""
        );
      }

      // Support older products that store images separately.
      if (images.length === 0) {
        images = [
          product.image1,
          product.image2,
          product.image3,
        ].filter(
          (image) =>
            typeof image === "string" && image.trim() !== ""
        );
      }

      // Read the description from supported field names.
      const description =
        product.description ??
        product.productDescription ??
        product.product_description ??
        product.product_description_html ??
        product.longDescription ??
        product.fullDescription ??
        "";

      return {
        _id: product._id.toString(),
        productName: product.productName || "",
        productKeyword: product.productKeyword || "",
        category: product.category || "",
        brand: product.brand || "",
        price: Number(product.price || 0),
        offerPrice: Number(product.offerPrice || 0),
        stockStatus: product.stockStatus || "",
        description,
        images,
        image1: product.image1 || "",
        image2: product.image2 || "",
        image3: product.image3 || "",
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