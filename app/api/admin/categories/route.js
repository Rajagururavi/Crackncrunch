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
  const fileName = `categories/category-${Date.now()}-${safeName}`;
  const blob = await put(fileName, image, {access: "public",});
  return blob.url;
}
async function deleteImage(imageUrl) {
  if (!imageUrl) {
    return;
  }
  try {
    if (imageUrl.startsWith("https://")) {
      await del(imageUrl);
    }
  } catch (error) {
    console.log("CATEGORY IMAGE DELETE SKIPPED:", imageUrl, error);
  }
}
export async function GET() {
  try {
    const db = await getDatabase();
    const categories = await db.collection("categories").find({}).sort({ createdAt: -1 }).toArray();
    return Response.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to load categories",
      },
      { status: 500 }
    );
  }
}
export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const image = formData.get("image");
    if (!name || !name.trim()) {
      return Response.json(
        {
          success: false,
          message: "Category name is required",
        },
        { status: 400 }
      );
    }
    if (!image || typeof image === "string" || image.size === 0) {
      return Response.json(
        {
          success: false,
          message: "Category image is required",
        },
        { status: 400 }
      );
    }
    const db = await getDatabase();
    const existingCategory = await db.collection("categories").findOne({name: name.trim(),});
    if (existingCategory) {
      return Response.json(
        {
          success: false,
          message: "Category already exists",
        },
        { status: 409 }
      );
    }
    const imageUrl = await saveImage(image);
    if (!imageUrl) {
      return Response.json(
        {
          success: false,
          message: "Failed to upload category image",
        },
        { status: 500 }
      );
    }
    const result = await db.collection("categories").insertOne({
      name: name.trim(),
      image: imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json({
      success: true,
      message: "Category added successfully",
      category: {
        _id: result.insertedId,
        name: name.trim(),
        image: imageUrl,
      },
    });
  } catch (error) {
    console.error("ADD CATEGORY ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to add category",
      },
      { status: 500 }
    );
  }
}
export async function PUT(request) {
  try {
    const formData = await request.formData();
    const id = formData.get("id");
    const name = formData.get("name");
    const image = formData.get("image");
    if (!id || !name || !name.trim()) {
      return Response.json(
        {
          success: false,
          message: "Category data is required",
        },
        { status: 400 }
      );
    }
    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 }
      );
    }
    const db = await getDatabase();
    const category = await db.collection("categories").findOne({_id: new ObjectId(id),});
    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }
    const updateData = {
      name: name.trim(),
      updatedAt: new Date(),
    };
    if (image && typeof image !== "string" && image.size > 0) {
      const newImageUrl = await saveImage(image);
      if (!newImageUrl) {
        return Response.json(
          {
            success: false,
            message: "Failed to upload new image",
          },
          { status: 500 }
        );
      }
      updateData.image = newImageUrl;
      if (category.image && category.image.startsWith("https://")) {
        await deleteImage(category.image);
      }
    }
    await db.collection("categories").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: updateData,
      }
    );
    return Response.json({
      success: true,
      message: "Category updated successfully",
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to update category",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return Response.json(
        {
          success: false,
          message: "Category ID is required",
        },
        { status: 400 }
      );
    }
    if (!ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid category ID",
        },
        { status: 400 }
      );
    }
    const db = await getDatabase();
    const category = await db.collection("categories").findOne({_id: new ObjectId(id),});
    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }
    if (category.image && category.image.startsWith("https://")) {
      await deleteImage(category.image);
    }
    await db.collection("categories").deleteOne({_id: new ObjectId(id),});
    return Response.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Failed to delete category",
      },
      { status: 500 }
    );
  }
}