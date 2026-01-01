import GoogleProvider from 'next-auth/providers/google'
import NextAuth, { NextAuthOptions } from 'next-auth'
import { sql } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      try {
        const email = user.email || null
        const name = user.name || null
        const image = user.image || null

        if (email) {
          await sql`
            INSERT INTO customers (email, name, image_url)
            VALUES (${email}, ${name}, ${image})
            ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, image_url = EXCLUDED.image_url
          `
        }
      } catch (err) {
        console.error('Error creating/updating customer during signIn:', err)
      }

      return true
    }
  }
}

export default NextAuth(authOptions)
import { NextRequest, NextResponse } from 'next/server'

export function checkAdminAuth(request: NextRequest) {
  // For API routes, check for admin session in headers or body
  // For page routes, this will be handled by client-side checks

  // You can implement more sophisticated session management here
  // For now, we'll rely on client-side localStorage checks

  return true // Allow access for now, client-side will handle auth
}

export function requireAdmin(request: NextRequest) {
  const isAuthenticated = checkAdminAuth(request)

  if (!isAuthenticated) {
    // For API routes
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For page routes, redirect to login
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return null // Allow access
}