import { getReviewsByProductId, createReview, getReviewByOrderId } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const reviews = await getReviewsByProductId(parseInt(productId))
    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Failed to fetch reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { product_id, order_id, customer_id, customer_name, customer_email, rating, comment } = body

    if (!product_id || !customer_name || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // For now, allow multiple reviews per product from different customers
    // In the future, we could add duplicate checking based on customer info

    const review = await createReview({
      product_id,
      order_id,
      customer_id,
      customer_name,
      customer_email,
      rating,
      comment
    })

    if (!review) {
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error("Failed to create review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}