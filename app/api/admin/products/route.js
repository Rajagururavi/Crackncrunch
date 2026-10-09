import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { put, del } from "@vercel/blob";
async function getDatabase() {
  const client = await clientPromise;
  return client.db("crackncrunch");
}
async function saveImage(image) {
  if (!image || typeof image === "string" || image.size === 0) {
    return null;
  }
  const safeName = image.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const fileName = `products/product-${Date.now()}-${safeName}`;
  const blob = await put(fileName, image, {access: "public",});
  return blob.url;
}
async function deleteImage(imageUrl) {
  if (!imageUrl) return;
  try {
    if (imageUrl.startsWith("https://")) {
      await del(imageUrl);
    }
  } catch (error) {
    console.log("PRODUCT IMAGE DELETE SKIPPED:", error);
  }
}
export async function GET() {
  try {
    const db = await getDatabase();
    const products = await db.collection("products").find({}).sort({ createdAt: -1 }).toArray();
    return Response.json({success: true, products,});
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to load products",
      },
      { status: 500 }
    );
  }
}
export async function POST(request) {
  try {
    const formData = await request.formData();
    const productName = formData.get("productName");
    const productKeyword = formData.get("productKeyword") || "";
    const category = formData.get("category");
    const brand = formData.get("brand");
    const description = formData.get("description") || "";
    const price = Number(formData.get("price"));
    const offerPrice = Number(formData.get("offerPrice") || 0);
    const stockStatus = formData.get("stockStatus") || "In Stock";
    const image1 = formData.get("image1");
    const image2 = formData.get("image2");
    const image3 = formData.get("image3");
    if (!productName || !productName.trim()) {
      return Response.json(
        { success: false, message: "Product name is required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(price) || price < 0) {
      return Response.json(
        { success: false, message: "Valid price is required" },
        { status: 400 }
      );
    }
    const db = await getDatabase();
    const images = [];
    for (const image of [image1, image2, image3]) {
      if (image && typeof image !== "string" && image.size > 0) {
        const url = await saveImage(image);
        if (url) images.push(url);
      }
    }
    const product = {
      productName: productName.trim(),
      productKeyword: String(productKeyword).trim(),
      category: category || "",
      brand: brand || "",
      description: String(description).trim(),
      price,
      offerPrice,
      stockStatus,
      images,
      image1: images[0] || "",
      image2: images[1] || "",
      image3: images[2] || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection("products").insertOne(product);
    return Response.json({
      success: true,
      message: "Product added successfully",
      product: {
        ...product,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("ADD PRODUCT ERROR:", error);
    return Response.json(
      { success: false, message: "Failed to add product" },
      { status: 500 }
    );
  }
}
export async function PUT(request) {
  try {
    const formData = await request.formData();
    const productId = formData.get("productId");
    if (!productId || !ObjectId.isValid(productId)) {
      return Response.json(
        { success: false, message: "Valid product ID is required" },
        { status: 400 }
      );
    }
    const db = await getDatabase();
    const collection = db.collection("products");
    const existingProduct = await collection.findOne({_id: new ObjectId(productId),});
    if (!existingProduct) {
      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    const productName = formData.get("productName");
    const productKeyword = formData.get("productKeyword") || "";
    const category = formData.get("category");
    const brand = formData.get("brand");
    const description = formData.get("description") || "";
    const price = Number(formData.get("price"));
    const offerPrice = Number(formData.get("offerPrice") || 0);
    const stockStatus = formData.get("stockStatus") || "In Stock";
    if (!productName || !productName.trim()) {
      return Response.json(
        { success: false, message: "Product name is required" },
        { status: 400 }
      );
    }
    if (!Number.isFinite(price) || price < 0) {
      return Response.json(
        { success: false, message: "Valid price is required" },
        { status: 400 }
      );
    }
    const updateData = {
      productName: productName.trim(),
      productKeyword: String(productKeyword).trim(),
      category: category || "",
      brand: brand || "",
      description: String(description).trim(),
      price,
      offerPrice,
      stockStatus,
      updatedAt: new Date(),
    };
    const imageFields = ["image1", "image2", "image3"];
    const oldImages = [
      existingProduct.image1 || existingProduct.images?.[0] || "",
      existingProduct.image2 || existingProduct.images?.[1] || "",
      existingProduct.image3 || existingProduct.images?.[2] || "",
    ];
    const newImages = [...oldImages];
    for (let i = 0; i < imageFields.length; i++) {
      const image = formData.get(imageFields[i]);
      if (image && typeof image !== "string" && image.size > 0) {
        const url = await saveImage(image);
        if (url) {
          newImages[i] = url;
          await deleteImage(oldImages[i]);
        }
      }
    }
    updateData.images = newImages.filter(Boolean);
    updateData.image1 = newImages[0] || "";
    updateData.image2 = newImages[1] || "";
    updateData.image3 = newImages[2] || "";
    await collection.updateOne(
      { _id: new ObjectId(productId) },
      { $set: updateData }
    );
    return Response.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    return Response.json(
      { success: false, message: "Failed to update product" },
      { status: 500 }
    );
  }
}
export async function DELETE(request) {
  try {
    const { productId } = await request.json();
    if (!productId || !ObjectId.isValid(productId)) {
      return Response.json(
        { success: false, message: "Valid product ID is required" },
        { status: 400 }
      );
    }
    const db = await getDatabase();
    const collection = db.collection("products");
    const product = await collection.findOne({_id: new ObjectId(productId),});
    if (!product) {
      return Response.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }
    const images = [
      ...(Array.isArray(product.images) ? product.images : []),
      product.image1,
      product.image2,
      product.image3,
    ];
    for (const image of new Set(images.filter(Boolean))) {
      await deleteImage(image);
    }
    await collection.deleteOne({_id: new ObjectId(productId),});
    return Response.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    return Response.json(
      { success: false, message: "Failed to delete product" },
      { status: 500 }
    );
  }
}