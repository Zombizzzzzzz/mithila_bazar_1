import { getReviewsByProductId, createReview, getReviewByOrderId, getOrderById } from "@/lib/db"
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
    const { product_id, order_id, customer_name, customer_email, rating, comment } = body

    if (!product_id || !order_id || !customer_name || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Verify order exists and belongs to customer
    const order = await getOrderById(order_id)
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Verify customer name matches
    if (order.customer_name.toLowerCase().trim() !== customer_name.toLowerCase().trim()) {
      return NextResponse.json({ error: "Customer name doesn't match order" }, { status: 403 })
    }

    // Verify order is for the correct product
    if (order.product_id !== product_id) {
      return NextResponse.json({ error: "Order product doesn't match" }, { status: 403 })
    }

    // Verify order has been delivered
    if (order.delivery_status !== 'delivered') {
      return NextResponse.json({ error: "Order not delivered yet" }, { status: 403 })
    }

    // Check if review already exists for this order
    const existingReview = await getReviewByOrderId(order_id)
    if (existingReview) {
      return NextResponse.json({ error: "Review already exists for this order" }, { status: 409 })
    }

    const review = await createReview({
      product_id,
      order_id,
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