import { getAllReviews } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const reviews = await getAllReviews()
    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Failed to fetch reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}