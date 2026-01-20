import { NextRequest, NextResponse } from 'next/server'
import { getAllCustomerChats } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 })
    }

    const adminSession = authHeader.substring(7) // Remove 'Bearer ' prefix
    try {
      const adminData = JSON.parse(adminSession)
      if (!adminData.email) {
        return NextResponse.json({ error: 'Invalid admin session' }, { status: 401 })
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid admin session' }, { status: 401 })
    }

    const chats = await getAllCustomerChats()
    return NextResponse.json({ chats })
  } catch (error) {
    console.error('Get admin chats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}