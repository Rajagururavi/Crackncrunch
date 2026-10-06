import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("crackncrunch");

    const admin = await db.collection("admins").findOne(
      {},
      {
        projection: {
          logo: 1,
        },
      }
    );

    let logo = admin?.logo || "";

    if (
      logo &&
      !logo.startsWith("/") &&
      !logo.startsWith("http://") &&
      !logo.startsWith("https://")
    ) {
      logo = `/uploads/${logo}`;
    }

    return Response.json({
      success: true,
      logo,
    });
  } catch (error) {
    console.error("SITE SETTINGS ERROR:", error);

    return Response.json(
      {
        success: false,
        logo: "",
      },
      { status: 500 }
    );
  }
}