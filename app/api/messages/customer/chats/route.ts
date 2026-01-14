import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get customer ID
    const customers = await sql`SELECT id FROM customers WHERE email = ${session.user.email} LIMIT 1`
    if (customers.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customerId = customers[0].id

    // Get chats for this customer
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
        COUNT(CASE WHEN m.is_from_customer = false AND m.is_read_by_customer = false THEN 1 END) as unread_count
      FROM messages m
      JOIN products p ON m.product_id = p.id
      JOIN customers c ON m.customer_id = c.id
      WHERE m.customer_id = ${customerId}
      GROUP BY m.product_id, m.customer_id, p.name, p.slug, c.name, c.email, m.message, m.created_at
      ORDER BY m.created_at DESC
    `

    return NextResponse.json({ chats })
  } catch (error) {
    console.error('Get customer chats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}