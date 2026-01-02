import { ProductCard } from "@/components/product-card"
import { getFeaturedProducts } from "@/lib/db"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { GSAPReveal } from "@/components/gsap-reveal" // Added GSAP reveal
import { GlobalSearch } from "@/components/global-search"

  export const dynamic = "force-dynamic";

import { getProducts } from "@/lib/db";


export default async function HomePage() {
  
   const products = await getProducts();
  
  const featuredProducts = await getFeaturedProducts(8)

  return (
    <main>
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <GSAPReveal>
          <div className="text-center">
            <h1 className="text-balance font-serif text-5xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
              Discover Premium
              <span className="block text-primary">Shopping Experience</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Curated collection of electronics, handcrafted treasures, luxury watches, and fashion-forward clothing
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="#search">Search Products</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </GSAPReveal>
      </section>

      {/* Global Search Section */}
      <section id="search" className="container mx-auto px-4 py-16 bg-muted/30">
        <GSAPReveal direction="up">
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl font-bold text-foreground">Find Your Perfect Item</h2>
            <p className="mt-3 text-lg text-muted-foreground">Search through our entire collection of premium products</p>
          </div>
        </GSAPReveal>

        <GSAPReveal>
          <GlobalSearch placeholder="Search electronics, hand-mades, watches, clothing..." />
        </GSAPReveal>
      </section>

      {/* Featured Products */}
      <section id="featured" className="container mx-auto px-4 py-16">
        <GSAPReveal direction="up">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-4xl font-bold text-foreground">Mithila Things</h2>
            <p className="mt-3 text-lg text-muted-foreground">Hand-picked premium items just for you</p>
          </div>
        </GSAPReveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {featuredProducts.map((product, index) => (
            <GSAPReveal key={product.id} delay={index * 0.1}>
              <ProductCard product={product} />
            </GSAPReveal>
          ))}
        </div>
      </section>
    </main>
  )
}
