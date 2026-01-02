import { NextResponse } from 'next/server'
import { createOrder, incrementProductSales, getOrders, getCustomerByEmail, sql } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const customer = await getCustomerByEmail(session.user.email)
    if (!customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 403 })
    }

    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    // Verify the order belongs to the customer
    const orders = await sql`
      SELECT * FROM orders WHERE id = ${orderId} AND customer_id = ${customer.id}
    `

    if (orders.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order status
    await sql`
      UPDATE orders SET order_status = ${status} WHERE id = ${orderId}
    `

    return NextResponse.json({ success: true, message: 'Order status updated successfully' })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const customer = await getCustomerByEmail(session.user.email)
    if (!customer) {
      return NextResponse.json({ error: 'Customer profile not found' }, { status: 403 })
    }

    const body = await request.json()
    const {
      product_id,
      customer_name,
      customer_phone,
      delivery_address,
      delivery_city,
      quantity,
      total_amount
    } = body

    // Validate required fields
    if (!product_id || !customer_name || !customer_phone || !delivery_address || !delivery_city || !quantity || !total_amount) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Create the order associated with customer
    const order = await createOrder({
      product_id: parseInt(product_id),
      customer_id: customer.id,
      customer_name,
      customer_phone,
      delivery_address,
      delivery_city,
      quantity: parseInt(quantity),
      total_amount: parseFloat(total_amount)
    })

    if (!order) {
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Increment product sales count
    await incrementProductSales(parseInt(product_id), parseInt(quantity))

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      order
    })
  } catch (error) {
    console.error('Error creating order:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to create order: ' + errorMessage }, { status: 500 })
  }
}