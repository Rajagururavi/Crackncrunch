import clientPromise from "@/lib/mongodb";
export async function GET() {
  try {
    const client = await clientPromise;
    await client.db("admin").command({ ping: 1 });
    return Response.json({
      success: true,
      message: "MongoDB connected successfully!",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: "MongoDB connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
}