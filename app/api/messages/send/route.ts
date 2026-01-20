import { NextRequest, NextResponse } from 'next/server'
import { createMessage } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    console.log('Send message API called')
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    const { product_id, message, admin_id, customer_id } = await request.json()
    console.log('Request data:', { product_id, message, admin_id, customer_id })

    if (!product_id || !message) {
      console.log('Missing product_id or message')
      return NextResponse.json({ error: 'Product ID and message are required' }, { status: 400 })
    }

    let customerId: number
    let adminId: number | undefined
    let is_from_customer = true

    if (session?.user?.email) {
      console.log('Customer sending message, email:', session.user.email)
      // Customer sending message
      const { sql } = await import('@/lib/db')
      const customers = await sql`SELECT id FROM customers WHERE email = ${session.user.email} LIMIT 1`
      console.log('Customer lookup result:', customers)
      if (customers.length === 0) {
        console.log('Customer not found')
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }
      customerId = customers[0].id
      console.log('Customer ID:', customerId)
    } else if (admin_id && customer_id) {
      console.log('Admin sending message')
      // Admin sending message
      is_from_customer = false
      adminId = parseInt(admin_id)
      customerId = parseInt(customer_id)
    } else {
      console.log('No authentication found')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    console.log('Creating message with data:', {
      product_id: parseInt(product_id),
      customer_id: customerId,
      admin_id: adminId,
      message,
      is_from_customer
    })
    const newMessage = await createMessage({
      product_id: parseInt(product_id),
      customer_id: customerId,
      admin_id: adminId,
      message,
      is_from_customer
    })

    console.log('Message creation result:', newMessage)

    if (!newMessage) {
      console.log('Message creation failed')
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    console.log('Message sent successfully')
    return NextResponse.json({ success: true, message: newMessage })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}