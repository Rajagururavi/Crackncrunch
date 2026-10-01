import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";

async function getDatabase() {
  const client = await clientPromise;
  return client.db("crackncrunch");
}

// GET - Get all categories
export async function GET() {
  try {
    const db = await getDatabase();

    const categories = await db
      .collection("categories")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

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

// POST - Add category
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

    // Check duplicate category
    const existingCategory = await db
      .collection("categories")
      .findOne({
        name: name.trim(),
      });

    if (existingCategory) {
      return Response.json(
        {
          success: false,
          message: "Category already exists",
        },
        { status: 409 }
      );
    }

    // Create upload folder
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "categories"
    );

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    // Save image
    const extension = path.extname(image.name) || ".jpg";

    const fileName =
      "category-" +
      Date.now() +
      extension;

    const filePath = path.join(
      uploadDir,
      fileName
    );

    const buffer = Buffer.from(
      await image.arrayBuffer()
    );

    await fs.writeFile(filePath, buffer);

    const imageUrl =
      "/uploads/categories/" + fileName;

    // Save category
    const result = await db
      .collection("categories")
      .insertOne({
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

// PUT - Edit category
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

    const db = await getDatabase();

    const category = await db
      .collection("categories")
      .findOne({
        _id: new ObjectId(id),
      });

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

    // If new image selected
    if (
      image &&
      typeof image !== "string" &&
      image.size > 0
    ) {
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "categories"
      );

      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      const extension =
        path.extname(image.name) || ".jpg";

      const fileName =
        "category-" +
        Date.now() +
        extension;

      const filePath = path.join(
        uploadDir,
        fileName
      );

      const buffer = Buffer.from(
        await image.arrayBuffer()
      );

      await fs.writeFile(
        filePath,
        buffer
      );

      updateData.image =
        "/uploads/categories/" + fileName;

      // Delete old image
      if (category.image) {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          category.image
        );

        try {
          await fs.unlink(oldImagePath);
        } catch {
          // Old image may not exist
        }
      }
    }

    await db
      .collection("categories")
      .updateOne(
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

// DELETE - Delete category
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

    const db = await getDatabase();

    const category = await db
      .collection("categories")
      .findOne({
        _id: new ObjectId(id),
      });

    if (!category) {
      return Response.json(
        {
          success: false,
          message: "Category not found",
        },
        { status: 404 }
      );
    }

    // Delete image from uploads folder
    if (category.image) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        category.image
      );

      try {
        await fs.unlink(imagePath);
      } catch {
        // Image may not exist
      }
    }

    await db
      .collection("categories")
      .deleteOne({
        _id: new ObjectId(id),
      });

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