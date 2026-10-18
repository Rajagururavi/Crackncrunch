
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
          gst: 1,
          fssai: 1,
          address: 1,
          phone: 1,
          email: 1,
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
      contact: {
        fssaiLicenseNo: admin?.fssai || "",
        gstRegistrationNo: admin?.gst || "",
        address: admin?.address || "",
        phone: admin?.phone || "",
        email: admin?.email || "",
      },
    });
  } catch (error) {
    console.error("SITE SETTINGS ERROR:", error);

    return Response.json(
      {
        success: false,
        logo: "",
        contact: {},
      },
      { status: 500 }
    );
  }
}