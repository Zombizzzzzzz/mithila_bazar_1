import { NextResponse } from 'next/server'
import { createOrder, incrementProductSales, getOrders } from '@/lib/db'

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

    // Create the order
    const order = await createOrder({
      product_id: parseInt(product_id),
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