import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const categories = await db
      .collection("categories")
      .find({})
      .toArray();
    const brands = await db
      .collection("brands")
      .find({})
      .toArray();
    const products = await db
      .collection("products")
      .find({})
      .toArray();
    const cleanCategories = categories.map((category) => ({
      ...category,
      _id: category._id.toString(),
    }));
    const cleanProducts = products.map((product) => {
      let images = [];
      if (Array.isArray(product.images)) {
        images = product.images.filter((image) => typeof image === "string" && image.trim() !== "" );
      }
      return {
        ...product,
        _id: product._id.toString(),
        productName: product.productName || "",
        productKeyword: product.productKeyword || "",
        category: product.category || "",
        brand: product.brand || "",
        description: product.description || "",
        price: Number(product.price || 0),
        offerPrice: Number(product.offerPrice || 0),
        stockStatus: product.stockStatus || "",
        images: images,
        createdAt: product.createdAt || null,
        updatedAt: product.updatedAt || null,
      };
    });
    const cleanBrands = brands.map((brand) => {
      const brandId = brand._id.toString();
      const brandName =
        brand.brandName ||
        brand.brand_name ||
        brand.brand ||
        brand.name ||
        brand.title ||
        "";
      const brandProducts = cleanProducts.filter((product) => {
        const productBrand = String(product.brand || "").trim().toLowerCase();
        const currentBrand = String(brandName || "").trim().toLowerCase();
        return productBrand === currentBrand;
      });
      return {
        ...brand,
        _id: brandId, 
        brandName: brandName,
        products: brandProducts,
      };
    });
    return NextResponse.json({
      success: true,
      categories: cleanCategories,
      brands: cleanBrands,
    });
  } catch (error) {
    console.error("Home API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load home page.",
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}