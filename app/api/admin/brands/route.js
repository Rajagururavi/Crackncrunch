
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
  const fileName = `brands/brand-${Date.now()}-${safeName}`;

  const blob = await put(fileName, image, {
    access: "public",
  });

  return blob.url;
}

async function deleteImage(imageUrl) {
  if (!imageUrl) return;

  try {
    if (imageUrl.startsWith("https://")) {
      await del(imageUrl);
    }
  } catch (error) {
    console.error("BRAND IMAGE DELETE ERROR:", error);
  }
}

export async function GET() {
  try {
    const db = await getDatabase();

    const brands = await db
      .collection("brands")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return Response.json({
      success: true,
      brands,
    });
  } catch (error) {
    console.error("GET BRANDS ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to load brands",
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

    if (typeof name !== "string" || !name.trim()) {
      return Response.json(
        {
          success: false,
          message: "Brand name is required",
        },
        { status: 400 }
      );
    }

    if (!image || typeof image === "string" || image.size === 0) {
      return Response.json(
        {
          success: false,
          message: "Brand image is required",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const existingBrand = await db.collection("brands").findOne({
      name: name.trim(),
    });

    if (existingBrand) {
      return Response.json(
        {
          success: false,
          message: "Brand already exists",
        },
        { status: 409 }
      );
    }

    const imageUrl = await saveImage(image);

    if (!imageUrl) {
      return Response.json(
        {
          success: false,
          message: "Failed to upload brand image",
        },
        { status: 500 }
      );
    }

    try {
      const result = await db.collection("brands").insertOne({
        name: name.trim(),
        image: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return Response.json({
        success: true,
        message: "Brand added successfully",
        brand: {
          _id: result.insertedId,
          name: name.trim(),
          image: imageUrl,
        },
      });
    } catch (error) {
      await deleteImage(imageUrl);
      throw error;
    }
  } catch (error) {
    console.error("ADD BRAND ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to add brand",
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

    if (
      typeof id !== "string" ||
      !ObjectId.isValid(id) ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return Response.json(
        {
          success: false,
          message: "Valid brand ID and name are required",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const brand = await db.collection("brands").findOne({
      _id: new ObjectId(id),
    });

    if (!brand) {
      return Response.json(
        {
          success: false,
          message: "Brand not found",
        },
        { status: 404 }
      );
    }

    const duplicate = await db.collection("brands").findOne({
      name: name.trim(),
      _id: { $ne: new ObjectId(id) },
    });

    if (duplicate) {
      return Response.json(
        {
          success: false,
          message: "Brand already exists",
        },
        { status: 409 }
      );
    }

    const updateData = {
      name: name.trim(),
      updatedAt: new Date(),
    };

    let newImageUrl = null;

    if (image && typeof image !== "string" && image.size > 0) {
      newImageUrl = await saveImage(image);

      if (!newImageUrl) {
        return Response.json(
          {
            success: false,
            message: "Failed to upload new brand image",
          },
          { status: 500 }
        );
      }

      updateData.image = newImageUrl;
    }

    try {
      await db.collection("brands").updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );
    } catch (error) {
      if (newImageUrl) {
        await deleteImage(newImageUrl);
      }
      throw error;
    }

    // Delete the old image only after the database update succeeds.
    if (newImageUrl && brand.image) {
      await deleteImage(brand.image);
    }

    return Response.json({
      success: true,
      message: "Brand updated successfully",
    });
  } catch (error) {
    console.error("UPDATE BRAND ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to update brand",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (typeof id !== "string" || !ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Valid brand ID is required",
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const brand = await db.collection("brands").findOne({
      _id: new ObjectId(id),
    });

    if (!brand) {
      return Response.json(
        {
          success: false,
          message: "Brand not found",
        },
        { status: 404 }
      );
    }

    await db.collection("brands").deleteOne({
      _id: new ObjectId(id),
    });

    if (brand.image) {
      await deleteImage(brand.image);
    }

    return Response.json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    console.error("DELETE BRAND ERROR:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to delete brand",
      },
      { status: 500 }
    );
  }
}