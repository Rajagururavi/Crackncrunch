import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return Response.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const reviews = await db.collection("reviews").find({ productId }).sort({ createdAt: -1 }).toArray();
    const formattedReviews = reviews.map((item) => ({
      _id: item._id.toString(),
      productId: item.productId,
      customerName: item.customerName,
      rating: item.rating,
      review: item.review,
      createdAt: item.createdAt,
    }));
    return Response.json({
      success: true,
      reviews: formattedReviews,
    });
  } catch (error) {
    console.error("GET PRODUCT REVIEWS ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Unable to fetch reviews.",
      },
      { status: 500 }
    );
  }
}
export async function POST(request) {
  try {
    const body = await request.json();
    const productId = String(body.productId || "").trim();
    const customerName = String(body.customerName || "").trim();
    const rating = Number(body.rating);
    const review = String(body.review || "").trim();
    if (!productId) {
      return Response.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }
    if (customerName.length < 2 || customerName.length > 60) {
      return Response.json(
        {
          success: false,
          message: "Name must be between 2 and 60 characters.",
        },
        { status: 400 }
      );
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return Response.json(
        {
          success: false,
          message: "Please select a valid rating.",
        },
        { status: 400 }
      );
    }
    if (review.length < 5 || review.length > 1000) {
      return Response.json(
        {
          success: false,
          message: "Review must be between 5 and 1000 characters.",
        },
        { status: 400 }
      );
    }
    const client = await clientPromise;
    const db = client.db("crackncrunch");
    const reviewData = {
      productId,
      customerName,
      rating,
      review,
      createdAt: new Date(),
    };
    const result = await db.collection("reviews").insertOne(reviewData);
    const savedReview = {
      _id: result.insertedId.toString(),
      ...reviewData,
    };
    return Response.json(
      {
        success: true,
        message: "Review submitted successfully.",
        review: savedReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST PRODUCT REVIEW ERROR:", error);
    return Response.json(
      {
        success: false,
        message: "Unable to submit review. Please try again.",
      },
      { status: 500 }
    );
  }
}