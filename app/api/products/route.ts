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
    const { name, slug, description, price, category_id, image_url, images, videos, stock, is_mithila_thing, features, color_variants, sizes } = body

    if (!name || !slug || !description || !price || !category_id || stock === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO products (name, slug, description, price, category_id, image_url, images, videos, stock, is_mithila_thing, features, color_variants, sizes)
      VALUES (${name}, ${slug}, ${description}, ${price}, ${category_id}, ${image_url}, ${images || []}, ${videos || []}, ${stock}, ${is_mithila_thing || false}, ${JSON.stringify(features || [])}, ${color_variants ? JSON.stringify(color_variants) : null}, ${sizes ? JSON.stringify(sizes) : null})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to create product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, description, price, category_id, image_url, images, videos, stock, is_mithila_thing, features, color_variants, sizes } = body

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    const result = await sql`
      UPDATE products
      SET name = ${name}, description = ${description}, price = ${price}, category_id = ${category_id},
          image_url = ${image_url}, images = ${images || []}, videos = ${videos || []}, stock = ${stock},
          is_mithila_thing = ${is_mithila_thing || false}, features = ${JSON.stringify(features || [])}, color_variants = ${color_variants ? JSON.stringify(color_variants) : null}, sizes = ${sizes ? JSON.stringify(sizes) : null}
      WHERE id = ${id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to update product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}