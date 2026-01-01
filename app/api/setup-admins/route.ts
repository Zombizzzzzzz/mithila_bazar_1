import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    // Create admins table
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Seed admin users
    await sql`
      INSERT INTO admins (email, password_hash) VALUES
      ('siddhantdahal@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
      ('yashwantsah@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
      ('himanshu@mithibazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK')
      ON CONFLICT (email) DO NOTHING
    `

    return NextResponse.json({
      success: true,
      message: 'Admin setup complete! You can now login.',
      credentials: {
        emails: ['siddhantdahal@mithilabazar.auth', 'yashwantsah@mithilabazar.auth', 'himanshu@mithibazar.auth'],
        password: 'matkarlala@345'
      }
    })
  } catch (error) {
    console.error('Error setting up admins:', error)
    return NextResponse.json({ error: 'Failed to setup admins: ' + error.message }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Create admins table
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Seed admin users
    await sql`
      INSERT INTO admins (email, password_hash) VALUES
      ('siddhantdahal@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
      ('yashwantsah@mithilabazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK'),
      ('himanshu@mithibazar.auth', '$2b$10$Dv1mCPtvguCPrYOqLR.lDeR4EYK0aeSNAOpnnWxwsm5A9afryS1YK')
      ON CONFLICT (email) DO NOTHING
    `

    return NextResponse.json({ success: true, message: 'Admin setup complete' })
  } catch (error) {
    console.error('Error setting up admins:', error)
    return NextResponse.json({ error: 'Failed to setup admins' }, { status: 500 })
  }
}