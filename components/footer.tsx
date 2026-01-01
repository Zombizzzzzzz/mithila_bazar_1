import Link from 'next/link'
import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025 Mithila Bazar. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/customer-service"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Customer Service
            </Link>
            <Link
              href="/admin/login"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              title="Admin Login"
            >
              <Shield className="h-3 w-3" />
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}