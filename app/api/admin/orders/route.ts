import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { orderId, status } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Get order details before updating
    const orderResult = await sql`
      SELECT o.*, p.color_variants, p.stock
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.id = ${orderId}
    `

    if (orderResult.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orderResult[0]

    // If status is changing to 'confirmed', decrease stock
    if (status === 'confirmed' && order.order_status !== 'confirmed') {
      if (order.selected_variant) {
        // Decrease stock for specific variant and total stock
        const variants = order.color_variants || []
        const updatedVariants = variants.map((v: any) => {
          if (v.color === order.selected_variant.color) {
            const currentStock = parseInt(v.stock?.toString() || '0')
            return { ...v, stock: Math.max(0, currentStock - order.quantity) }
          }
          return v
        })

        // Decrease total stock as well
        const currentTotalStock = parseInt(order.stock?.toString() || '0')
        const newTotalStock = Math.max(0, currentTotalStock - order.quantity)

        await sql`
          UPDATE products
          SET color_variants = ${JSON.stringify(updatedVariants)}, stock = ${newTotalStock}
          WHERE id = ${order.product_id}
        `
      } else {
        // Decrease general product stock
        const currentStock = parseInt(order.stock?.toString() || '0')
        const newStock = Math.max(0, currentStock - order.quantity)

        await sql`
          UPDATE products
          SET stock = ${newStock}
          WHERE id = ${order.product_id}
        `
      }
    }

    // Update order status
    await sql`
      UPDATE orders
      SET order_status = ${status},
          delivery_status = CASE WHEN ${status} = 'delivered' THEN 'delivered' ELSE delivery_status END
      WHERE id = ${orderId}
    `

    return NextResponse.json({ success: true, message: 'Order status updated successfully' })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}