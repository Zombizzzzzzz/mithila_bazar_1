import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('Login attempt for:', email)

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const admin = await authenticateAdmin(email, password)

    console.log('Authentication result:', admin ? 'SUCCESS' : 'FAILED')

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Return admin data (excluding password hash)
    const { password_hash, ...adminData } = admin

    return NextResponse.json({
      success: true,
      admin: adminData,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}