import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";
async function getDatabase() {
    const client = await clientPromise;
    return client.db("crackncrunch");
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
        if (!name || !name.trim()) {
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
        const existingBrand = await db.collection("brands").findOne({ name: name.trim(), });
        if (existingBrand) {
            return Response.json(
                {
                    success: false,
                    message: "Brand already exists",
                },
                { status: 409 }
            );
        }
        const uploadDir = path.join(
            process.cwd(),
            "public",
            "uploads",
            "brands"
        );
        await fs.mkdir(uploadDir, {
            recursive: true,
        });
        const extension = path.extname(image.name) || ".jpg";
        const fileName = "brand-" + Date.now() + extension;
        const filePath = path.join(
            uploadDir,
            fileName
        );
        const buffer = Buffer.from(
            await image.arrayBuffer()
        );
        await fs.writeFile(filePath, buffer);
        const imageUrl = "/uploads/brands/" + fileName;
        const result = await db
            .collection("brands")
            .insertOne({
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
        if (!id || !name || !name.trim()) {
            return Response.json(
                {
                    success: false,
                    message: "Brand data is required",
                },
                { status: 400 }
            );
        }
        const db = await getDatabase();
        const brand = await db
            .collection("brands")
            .findOne({
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
        const updateData = {
            name: name.trim(),
            updatedAt: new Date(),
        };
        if (image && typeof image !== "string" && image.size > 0) {
            const uploadDir = path.join(
                process.cwd(),
                "public",
                "uploads",
                "brands"
            );
            await fs.mkdir(uploadDir, {
                recursive: true,
            });
            const extension = path.extname(image.name) || ".jpg";
            const fileName = "brand-" + Date.now() + extension;
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
            updateData.image = "/uploads/brands/" + fileName;
            if (brand.image) {
                const oldImagePath = path.join(
                    process.cwd(),
                    "public",
                    brand.image
                );
                try {
                    await fs.unlink(oldImagePath);
                } catch {
                }
            }
        }
        await db
            .collection("brands")
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
            message: "Brand updated successfully",
        });
    } catch (error) {
        console.error("UPDATE BRAND ERROR:", error);
        return Response.json({
            success: false,
            message: "Failed to update brand",
        }, { status: 500 });
    }
}
export async function DELETE(request) {
    try {
        const { id } = await request.json();
        if (!id) {
            return Response.json(
                {
                    success: false,
                    message: "Brand ID is required",
                },
                { status: 400 }
            );
        }
        const db = await getDatabase();
        const brand = await db
            .collection("brands")
            .findOne({
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
        if (brand.image) {
            const imagePath = path.join(
                process.cwd(),
                "public",
                brand.image
            );
            try {
                await fs.unlink(imagePath);
            } catch {
            }
        }
        await db.collection("brands").deleteOne({_id: new ObjectId(id),});
        return Response.json({success: true, message: "Brand deleted successfully",});
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