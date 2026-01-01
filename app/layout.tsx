import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { CategoryNav } from "@/components/category-nav"
import { Footer } from "@/components/footer"
import SessionProviderClient from '@/components/auth/session-provider-client'
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Mithila Bazar - Premium Shopping Experience",
  description:
    "Discover premium electronics, hand-made crafts, luxury watches, and fashion-forward clothing at Mithila Bazar",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/mb.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/mb.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans antialiased pb-20 md:pb-0`}>
        <SessionProviderClient>
          <ThemeProvider>
            <Navbar />
            <CategoryNav />
            {children}
            <Footer />
            <Analytics />
          </ThemeProvider>
        </SessionProviderClient>
      </body>
    </html>
  )
}
