import { getProducts } from "@/lib/db"
import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json(products)
  } catch (error) {
    console.error("Failed to fetch products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, slug, description, price, category_id, image_url } = body

    if (!name || !slug || !description || !price || !category_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO products (name, slug, description, price, category_id, image_url)
      VALUES (${name}, ${slug}, ${description}, ${price}, ${category_id}, ${image_url})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to create product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}