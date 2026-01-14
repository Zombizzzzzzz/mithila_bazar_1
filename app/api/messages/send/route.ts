import { NextRequest, NextResponse } from 'next/server'
import { createMessage } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { product_id, message, admin_id, customer_id } = await request.json()

    if (!product_id || !message) {
      return NextResponse.json({ error: 'Product ID and message are required' }, { status: 400 })
    }

    let customerId: number
    let adminId: number | undefined
    let is_from_customer = true

    if (session?.user?.email) {
      // Customer sending message
      const { sql } = await import('@/lib/db')
      const customers = await sql`SELECT id FROM customers WHERE email = ${session.user.email} LIMIT 1`
      if (customers.length === 0) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      customerId = customers[0].id
    } else if (admin_id && customer_id) {
      // Admin sending message
      is_from_customer = false
      adminId = parseInt(admin_id)
      customerId = parseInt(customer_id)
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const newMessage = await createMessage({
      product_id: parseInt(product_id),
      customer_id: customerId,
      admin_id: adminId,
      message,
      is_from_customer
    })

    if (!newMessage) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: newMessage })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}