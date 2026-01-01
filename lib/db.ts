import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export { sql }

export interface Admin {
  id: number
  email: string
  password_hash: string
  created_at: Date
}

export interface Product {
  id: number
  category_id: number
  name: string
  slug: string
  description: string
  price: number
  image_url: string
  features: any[] | null
  stock: number
  sales_count: number
  created_at: Date
}

export interface Order {
  id: number
  product_id: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_city: string
  quantity: number
  total_amount: number
  order_status: string
  payment_method: string
  created_at: Date
  product_name?: string
  product_slug?: string
  product_image?: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
}

export async function getCategories(): Promise<Category[]> {
  try {
    const categories = await sql`
      SELECT * FROM categories ORDER BY name ASC
    `
    return categories as Category[]
  } catch (error) {
    console.error("[v0] Error fetching categories:", error)
    return []
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const categories = await sql`
      SELECT * FROM categories WHERE slug = ${slug} LIMIT 1
    `
    return categories.length > 0 ? (categories[0] as Category) : null
  } catch (error) {
    console.error("[v0] Error fetching category:", error)
    return null
  }
}

export async function authenticateAdmin(email: string, password: string): Promise<Admin | null> {
  try {
    const admins = await sql`
      SELECT * FROM admins WHERE email = ${email} LIMIT 1
    `
    if (admins.length === 0) return null

    const admin = admins[0] as Admin

    // Import bcrypt dynamically to avoid issues
    const bcrypt = await import('bcryptjs')
    const isValidPassword = await bcrypt.compare(password, admin.password_hash)

    return isValidPassword ? admin : null
  } catch (error) {
    console.error("[v0] Error authenticating admin:", error)
    return null
  }
}

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  try {
    if (categorySlug) {
      const products = await sql`
        SELECT p.* FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE c.slug = ${categorySlug}
        ORDER BY p.created_at DESC
      `
      return products as Product[]
    }

    const products = await sql`
      SELECT * FROM products
      ORDER BY created_at DESC
    `
    return products as Product[]
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return []
  }
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  try {
    const products = await sql`
      SELECT * FROM products
      ORDER BY created_at DESC
      LIMIT ${limit}
    `
    return products as Product[]
  } catch (error) {
    console.error("[v0] Error fetching featured products:", error)
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const products = await sql`
      SELECT * FROM products WHERE slug = ${slug} LIMIT 1
    `
    return products.length > 0 ? (products[0] as Product) : null
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
    return null
  }
}

export async function createOrder(orderData: {
  product_id: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_city: string
  quantity: number
  total_amount: number
}): Promise<Order | null> {
  try {
    const orders = await sql`
      INSERT INTO orders (product_id, customer_name, customer_phone, delivery_address, delivery_city, quantity, total_amount)
      VALUES (${orderData.product_id}, ${orderData.customer_name}, ${orderData.customer_phone}, ${orderData.delivery_address}, ${orderData.delivery_city}, ${orderData.quantity}, ${orderData.total_amount})
      RETURNING *
    `
    return orders[0] as Order
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    return null
  }
}

export async function getOrders(): Promise<(Order & { product_name?: string; product_slug?: string; product_image?: string })[]> {
  try {
    const orders = await sql`
      SELECT
        o.*,
        p.name as product_name,
        p.slug as product_slug,
        p.image_url as product_image
      FROM orders o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
    `
    return orders as (Order & { product_name?: string; product_slug?: string; product_image?: string })[]
  } catch (error) {
    console.error("[v0] Error fetching orders:", error)
    return []
  }
}

export async function updateProductStock(productId: number, newStock: number): Promise<boolean> {
  try {
    await sql`
      UPDATE products SET stock = ${newStock} WHERE id = ${productId}
    `
    return true
  } catch (error) {
    console.error("[v0] Error updating product stock:", error)
    return false
  }
}

export async function incrementProductSales(productId: number, quantity: number): Promise<boolean> {
  try {
    await sql`
      UPDATE products SET sales_count = sales_count + ${quantity} WHERE id = ${productId}
    `
    return true
  } catch (error) {
    console.error("[v0] Error incrementing product sales:", error)
    return false
  }
}