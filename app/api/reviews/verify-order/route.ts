import { getOrderById, getReviewByOrderId } from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order_id, customer_name, product_id } = body

    if (!order_id || !customer_name || !product_id) {
      return NextResponse.json(
        { error: "Missing required fields", canReview: false },
        { status: 400 }
      )
    }

    // Check if order exists and belongs to the customer
    const order = await getOrderById(order_id)

    if (!order) {
      return NextResponse.json(
        { error: "Order not found", canReview: false, message: "Order not found. Please check your order ID." },
        { status: 404 }
      )
    }

    // Verify customer name matches
    if (order.customer_name.toLowerCase().trim() !== customer_name.toLowerCase().trim()) {
      return NextResponse.json(
        { error: "Customer name doesn't match order", canReview: false, message: "The name doesn't match this order." },
        { status: 403 }
      )
    }

    // Verify order is for the correct product
    if (order.product_id !== product_id) {
      return NextResponse.json(
        { error: "Order product doesn't match", canReview: false, message: "This order is not for the selected product." },
        { status: 403 }
      )
    }

    // Check if order has been delivered
    if (order.delivery_status !== 'delivered') {
      return NextResponse.json(
        { error: "Order not delivered", canReview: false, message: "You can only review orders that have been delivered." },
        { status: 403 }
      )
    }

    // Check if review already exists for this order
    const existingReview = await getReviewByOrderId(order_id)
    if (existingReview) {
      return NextResponse.json(
        { error: "Review already exists", canReview: false, message: "You have already submitted a review for this order." },
        { status: 409 }
      )
    }

    return NextResponse.json({
      canReview: true,
      message: "Order verified successfully. You can now leave your review."
    })

  } catch (error) {
    console.error("Failed to verify order:", error)
    return NextResponse.json(
      { error: "Failed to verify order", canReview: false },
      { status: 500 }
    )
  }
}