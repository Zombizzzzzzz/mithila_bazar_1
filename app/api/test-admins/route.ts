import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const admins = await sql`
      SELECT id, email, created_at FROM admins
    `

    return NextResponse.json({
      success: true,
      admins: admins,
      count: admins.length
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 })
  }
}