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
  created_at: Date
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