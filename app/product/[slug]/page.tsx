import { getProductBySlug, getProducts } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Star, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  return (
    <main>
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
            <Image
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-6">
            <h1 className="font-serif text-4xl font-bold leading-tight text-foreground lg:text-5xl">{product.name}</h1>

            <div className="flex items-center gap-4">
              <span className="font-serif text-3xl font-bold text-foreground">${Number(product.price).toFixed(2)}</span>
            </div>

            <p className="text-lg leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
