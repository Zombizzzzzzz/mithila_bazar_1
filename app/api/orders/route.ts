import { NextResponse } from 'next/server'
import { createOrder, incrementProductSales, getOrders, getCustomerByEmail } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const orders = await getOrders()
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Failed to fetch orders: ' + errorMessage }, { status: 500 })
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