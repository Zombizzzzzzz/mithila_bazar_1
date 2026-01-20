import { neon } from "@neondatabase/serverless"

// Check if DATABASE_URL is available
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Please check your .env.local file.')
}

const sql = neon(databaseUrl)

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
  images: string[] | null
  videos: string[] | null
  features: any[] | null
  stock: number
  sales_count: number
  created_at: Date
  is_mithila_thing?: boolean
  color_variants?: { color: string; price: string | number; stock?: number }[]
  sizes?: { size: string; stock?: number }[] | string[]
}

export interface Order {
  id: number
  product_id: number
  customer_id?: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_city: string
  quantity: number
  total_amount: number
  order_status: string
  payment_method: string
  delivery_status?: string
  created_at: Date
  selected_variant?: any
  selected_size?: string
  product_name?: string
  product_slug?: string
  product_image?: string
}

export interface Review {
  id: number
  product_id: number
  order_id: number
  customer_id?: number
  customer_name: string
  customer_email?: string
  rating: number
  comment?: string
  created_at: Date
  updated_at: Date
}

export interface Message {
  id: number
  product_id: number
  customer_id: number
  admin_id?: number
  message: string
  is_from_customer: boolean
  is_read_by_admin: boolean
  is_read_by_customer: boolean
  created_at: Date
  updated_at: Date
}

export interface Customer {
  id: number
  email: string
  name: string | null
  image_url: string | null
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
      WHERE is_mithila_thing = true
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

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const products = await sql`
      SELECT * FROM products WHERE id = ${id} LIMIT 1
    `
    return products.length > 0 ? (products[0] as Product) : null
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
    return null
  }
}

export async function getOrderById(orderId: number): Promise<Order | null> {
  try {
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${orderId} LIMIT 1
    `
    return orders.length > 0 ? (orders[0] as Order) : null
  } catch (error) {
    console.error("[v0] Error fetching order by ID:", error)
    return null
  }
}

export async function createOrder(orderData: {
  product_id: number
  customer_id?: number
  customer_name: string
  customer_phone: string
  delivery_address: string
  delivery_city: string
  quantity: number
  total_amount: number
  selected_variant?: any
  selected_size?: string
}): Promise<Order | null> {
  try {
    const orders = await sql`
      INSERT INTO orders (product_id, customer_id, customer_name, customer_phone, delivery_address, delivery_city, quantity, total_amount, selected_variant, selected_size)
      VALUES (
        ${orderData.product_id},
        ${orderData.customer_id ?? null},
        ${orderData.customer_name},
        ${orderData.customer_phone},
        ${orderData.delivery_address},
        ${orderData.delivery_city},
        ${orderData.quantity},
        ${orderData.total_amount},
        ${orderData.selected_variant ? JSON.stringify(orderData.selected_variant) : null},
        ${orderData.selected_size ?? null}
      )
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
        o.id,
        o.product_id,
        o.customer_id,
        o.customer_name,
        o.customer_phone,
        o.delivery_address,
        o.delivery_city,
        o.quantity,
        CAST(o.total_amount AS DECIMAL) as total_amount,
        o.order_status,
        o.payment_method,
        o.created_at,
        o.selected_variant,
        o.selected_size,
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

export async function getOrdersByCustomer(customerId: number): Promise<(Order & { product_name?: string; product_slug?: string; product_image?: string })[]> {
  try {
    const orders = await sql`
      SELECT
        o.id,
        o.product_id,
        o.customer_id,
        o.customer_name,
        o.customer_phone,
        o.delivery_address,
        o.delivery_city,
        o.quantity,
        CAST(o.total_amount AS DECIMAL) as total_amount,
        o.order_status,
        o.payment_method,
        o.created_at,
        o.selected_variant,
        o.selected_size,
        p.name as product_name,
        p.slug as product_slug,
        p.image_url as product_image
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.customer_id = ${customerId}
      ORDER BY o.created_at DESC
    `
    return orders as (Order & { product_name?: string; product_slug?: string; product_image?: string })[]
  } catch (error) {
    console.error("[v0] Error fetching customer orders:", error)
    return []
  }
}

export async function createOrUpdateCustomer(email: string, name?: string | null, image_url?: string | null): Promise<Customer | null> {
  try {
    const customers = await sql`
      INSERT INTO customers (email, name, image_url)
      VALUES (${email}, ${name ?? null}, ${image_url ?? null})
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url
      RETURNING *
    `
    return customers[0] as Customer
  } catch (error) {
    console.error('[v0] Error creating/updating customer:', error)
    return null
  }
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  try {
    const customers = await sql`
      SELECT * FROM customers WHERE email = ${email} LIMIT 1
    `
    return customers.length > 0 ? (customers[0] as Customer) : null
  } catch (error) {
    console.error('[v0] Error fetching customer by email:', error)
    return null
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

export async function getReviewsByProductId(productId: number): Promise<Review[]> {
  try {
    const reviews = await sql`
      SELECT * FROM reviews WHERE product_id = ${productId} ORDER BY created_at DESC
    `
    return reviews as Review[]
  } catch (error) {
    console.error("[v0] Error fetching reviews:", error)
    return []
  }
}

export async function getReviewByOrderId(orderId: number): Promise<Review | null> {
  try {
    const reviews = await sql`
      SELECT * FROM reviews WHERE order_id = ${orderId} LIMIT 1
    `
    return reviews.length > 0 ? (reviews[0] as Review) : null
  } catch (error) {
    console.error("[v0] Error fetching review by order:", error)
    return null
  }
}

export async function createReview(reviewData: {
  product_id: number
  order_id?: number
  customer_id?: number
  customer_name: string
  customer_email?: string
  rating: number
  comment?: string
}): Promise<Review | null> {
  try {
    const result = await sql`
      INSERT INTO reviews (product_id, order_id, customer_id, customer_name, customer_email, rating, comment)
      VALUES (${reviewData.product_id}, ${reviewData.order_id || null}, ${reviewData.customer_id || null}, ${reviewData.customer_name}, ${reviewData.customer_email || null}, ${reviewData.rating}, ${reviewData.comment || null})
      RETURNING *
    `
    return result[0] as Review
  } catch (error) {
    console.error("[v0] Error creating review:", error)
    return null
  }
}

export async function getAllReviews(): Promise<Review[]> {
  try {
    const reviews = await sql`
      SELECT r.*, p.name as product_name, p.slug as product_slug
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `
    return reviews as Review[]
  } catch (error) {
    console.error("[v0] Error fetching all reviews:", error)
    return []
  }
}

// Message functions
export async function createMessage(messageData: {
  product_id: number
  customer_id: number
  admin_id?: number
  message: string
  is_from_customer: boolean
}): Promise<Message | null> {
  try {
    const result = await sql`
      INSERT INTO messages (product_id, customer_id, admin_id, message, is_from_customer)
      VALUES (${messageData.product_id}, ${messageData.customer_id}, ${messageData.admin_id || null}, ${messageData.message}, ${messageData.is_from_customer})
      RETURNING *
    `
    return result[0] as Message
  } catch (error) {
    console.error("[v0] Error creating message:", error)
    return null
  }
}

export async function getMessagesForProductAndCustomer(productId: number, customerId: number): Promise<Message[]> {
  try {
    const messages = await sql`
      SELECT m.*, c.name as customer_name, a.email as admin_email
      FROM messages m
      LEFT JOIN customers c ON m.customer_id = c.id
      LEFT JOIN admins a ON m.admin_id = a.id
      WHERE m.product_id = ${productId} AND m.customer_id = ${customerId}
      ORDER BY m.created_at ASC
    `
    return messages as Message[]
  } catch (error) {
    console.error("[v0] Error fetching messages:", error)
    return []
  }
}

export async function getAllCustomerChats(): Promise<Array<{
  product_id: number
  customer_id: number
  product_name: string
  product_slug: string
  customer_name: string
  customer_email: string
  last_message: string
  last_message_time: Date
  unread_count: number
}>> {
  try {
    const chats = await sql`
      SELECT
        m.product_id,
        m.customer_id,
        p.name as product_name,
        p.slug as product_slug,
        c.name as customer_name,
        c.email as customer_email,
        m.message as last_message,
        m.created_at as last_message_time,
        COUNT(CASE WHEN m.is_from_customer = true AND m.is_read_by_admin = false THEN 1 END) as unread_count
      FROM messages m
      JOIN products p ON m.product_id = p.id
      JOIN customers c ON m.customer_id = c.id
      WHERE m.created_at = (
        SELECT MAX(created_at)
        FROM messages m2
        WHERE m2.product_id = m.product_id AND m2.customer_id = m.customer_id
      )
      GROUP BY m.product_id, m.customer_id, p.name, p.slug, c.name, c.email, m.message, m.created_at
      ORDER BY m.created_at DESC
    `
    return chats as any[]
  } catch (error) {
    console.error("[v0] Error fetching customer chats:", error)
    return []
  }
}

export async function markMessagesAsRead(productId: number, customerId: number, isAdmin: boolean): Promise<void> {
  try {
    if (isAdmin) {
      await sql`
        UPDATE messages
        SET is_read_by_admin = true, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ${productId} AND customer_id = ${customerId} AND is_from_customer = true
      `
    } else {
      await sql`
        UPDATE messages
        SET is_read_by_customer = true, updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ${productId} AND customer_id = ${customerId} AND is_from_customer = false
      `
    }
  } catch (error) {
    console.error("[v0] Error marking messages as read:", error)
  }
}

export async function updateOrderDeliveryStatus(orderId: number, status: string): Promise<boolean> {
  try {
    await sql`
      UPDATE orders SET delivery_status = ${status} WHERE id = ${orderId}
    `
    return true
  } catch (error) {
    console.error("[v0] Error updating delivery status:", error)
    return false
  }
}