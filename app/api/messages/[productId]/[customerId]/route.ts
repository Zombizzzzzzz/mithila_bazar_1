import { NextRequest, NextResponse } from 'next/server'
import { getMessagesForProductAndCustomer, markMessagesAsRead } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; customerId: string }> }
) {
  try {
    const { productId, customerId } = await params
    const session = await getServerSession(authOptions)

    // Check if user is authorized (either the customer or an admin)
    let isAuthorized = false
    let isAdmin = false

    if (session?.user?.email) {
      // Check if this is the customer
      const { sql } = await import('@/lib/db')
      const customers = await sql`SELECT id FROM customers WHERE email = ${session.user.email} LIMIT 1`
      if (customers.length > 0 && customers[0].id === parseInt(customerId)) {
        isAuthorized = true
      }
    }

    // Check if admin (simplified check - in production you'd want better admin auth)
    const adminSession = request.cookies.get('admin_session')?.value
    if (adminSession) {
      try {
        const adminData = JSON.parse(adminSession)
        if (adminData.email) {
          isAuthorized = true
          isAdmin = true
        }
      } catch (e) {
        // Invalid admin session
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await getMessagesForProductAndCustomer(
      parseInt(productId),
      parseInt(customerId)
    )

    // Mark messages as read
    await markMessagesAsRead(parseInt(productId), parseInt(customerId), isAdmin)

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}