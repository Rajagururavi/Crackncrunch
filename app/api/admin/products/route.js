import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
async function saveImage(image, index) {
  if (!image || image.size === 0) {
    return null;
  }
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, {recursive: true,});
  const fileName = `${Date.now()}-${index}-${image.name.replace(/[^a-zA-Z0-9.-]/g, "-")}`;
  const filePath = path.join(uploadDir, fileName);
  const bytes = await image.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));
  return `/uploads/products/${fileName}`;
}
async function deleteImage(imageUrl) {
  if (!imageUrl) {
    return;
  }
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      imageUrl
    );
    await unlink(filePath);
  } catch (error) {
    console.log("IMAGE DELETE SKIPPED:", imageUrl);
  }
}
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const products = await db.collection("products").find({}).sort({ createdAt: -1 }).toArray();
    return Response.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("PRODUCT GET ERROR:", error);
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
    const productKeyword = formData.get("productKeyword");
    const category = formData.get("category");
    const brand = formData.get("brand");
    const description = formData.get("description");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const stockStatus = formData.get("stockStatus");
    const image1 = formData.get("image1");
    const image2 = formData.get("image2");
    const image3 = formData.get("image3");
    if (!productName || !productKeyword || !category || !brand || !price || !stockStatus) {
      return Response.json(
        {
          success: false,
          message:"Please fill all required fields",
        },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const existingProduct = await db.collection("products").findOne({
        productName:productName.trim(),
    });
    if (existingProduct) {
      return Response.json(
        {
          success: false,
          message: "Product already exists",
        },
        { status: 409 }
      );
    }
    const images = [];
    const savedImage1 = await saveImage(image1, 1);
    const savedImage2 = await saveImage(image2, 2);
    const savedImage3 = await saveImage(image3, 3);
    if (savedImage1) {
      images.push(savedImage1);
    }
    if (savedImage2) {
      images.push(savedImage2);
    }
    if (savedImage3) {
      images.push(savedImage3);
    }
    const product = {
      productName: productName.trim(),
      productKeyword: productKeyword.trim(),
      category: category.trim(),
      brand: brand.trim(),
      description: description?.trim() || "",
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : null,
      stockStatus: stockStatus.trim(),
      images,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection("products").insertOne(product);
    return Response.json({
      success: true,
      message: "Product added successfully",
      productId: result.insertedId.toString(),
    });
  } catch (error) {
    console.error("PRODUCT INSERT ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to add product",
      },
      { status: 500 }
    );
  }
}
export async function PUT(request) {
  try {
    const formData = await request.formData();
    const productId = formData.get("productId");
    const productName = formData.get("productName");
    const productKeyword = formData.get("productKeyword");
    const category = formData.get("category");
    const brand = formData.get("brand");
    const description = formData.get("description");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const stockStatus = formData.get("stockStatus");
    const image1 = formData.get("image1");
    const image2 = formData.get("image2");
    const image3 = formData.get("image3");
    if (!productId || !productName || !productKeyword || !category || !brand || !price || !stockStatus) {
      return Response.json(
        {
          success: false,
          message: "Please fill all required fields",
        },
        { status: 400 }
      );
    }
    if (!ObjectId.isValid(productId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const existingProduct = await db.collection("products").findOne({_id: new ObjectId(productId), });
    if (!existingProduct) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }
    const updateData = {
      productName: productName.trim(),
      productKeyword: productKeyword.trim(),
      category: category.trim(),
      brand: brand.trim(),
      description: description?.trim() || "",
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice): null,
      stockStatus: stockStatus.trim(),
      updatedAt: new Date(),
    };
    let newImages = [...(existingProduct.images || []), ];
    const newImage1 = await saveImage(image1, 1);
    const newImage2 = await saveImage(image2, 2);
    const newImage3 = await saveImage(image3, 3);
    if (newImage1) {
      if (newImages[0]) {
        await deleteImage(newImages[0]);
      }
      newImages[0] = newImage1;
    }
    if (newImage2) {
      if (newImages[1]) {
        await deleteImage(newImages[1]);
      }
      newImages[1] = newImage2;
    }
    if (newImage3) {
      if (newImages[2]) {
        await deleteImage(newImages[2]);
      }
      newImages[2] = newImage3;
    }
    updateData.images = newImages;
    await db.collection("products").updateOne(
        {
          _id: new ObjectId(productId),
        },
        {
          $set: updateData,
        }
      );
    return Response.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error(
      "PRODUCT UPDATE ERROR:", error
    );
    return Response.json(
      {
        success: false,
        message: "Failed to update product",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(request) {
  try {
    const {productId,} = await request.json();
    if (!productId) {
      return Response.json(
        {
          success: false,
          message: "Product ID is required",
        },
        { status: 400 }
      );
    }
    if (!ObjectId.isValid(productId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const product = await db.collection("products").findOne({
        _id:new ObjectId(productId),
    });
    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }
    if (product.images) {
      for (const image of product.images) {
        await deleteImage(image);
      }
    }
    await db.collection("products").deleteOne({_id:new ObjectId(productId),});
    return Response.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("PRODUCT DELETE ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to delete product",
      },
      { status: 500 }
    );
  }
}