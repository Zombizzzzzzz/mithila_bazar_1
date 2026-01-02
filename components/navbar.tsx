"use client"

import Link from "next/link"
import { useTheme } from "./theme-provider"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import ClientAuth from '@/components/auth/client-auth'

export function Navbar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="font-serif text-xl font-bold text-primary-foreground">MB</span>
          </div>
          <span className="hidden font-serif text-2xl font-bold tracking-tight md:block">
            Mithila <span className="text-primary">Bazar</span>
          </span>
        </Link>

        {/* Navigation Links - Hidden on mobile, shown on md+ */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/customer-service"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Customer Service
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            About Us
          </Link>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>

        {/* Mobile-only theme toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ClientAuth />
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </nav>
  )
}
