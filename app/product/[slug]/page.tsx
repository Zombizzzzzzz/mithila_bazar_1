import { getProductBySlug, getProducts, createOrder, incrementProductSales } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import { Star, ShoppingCart, Heart, Truck, MapPin, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BuyNowForm } from "@/components/buy-now-form"
import { ProductMediaGallery } from "@/components/product-media-gallery"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic';

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
          {/* Product Media Gallery */}
          <ProductMediaGallery
            imageUrl={product.image_url}
            images={product.images || []}
            videos={product.videos || []}
            productName={product.name}
          />

          {/* Product Details */}
          <div className="flex flex-col gap-6">
            <h1 className="font-serif text-4xl font-bold leading-tight text-foreground lg:text-5xl">{product.name}</h1>

            <div className="flex items-center gap-4">
              <span className="font-serif text-3xl font-bold text-foreground">रु {Number(product.price).toFixed(2)}</span>
              <Badge variant="secondary" className="text-sm">
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </Badge>
            </div>

            <p className="text-lg leading-relaxed text-muted-foreground">{product.description}</p>

            {product.features && product.features.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              <span>{product.sales_count} sold</span>
            </div>

            <BuyNowForm
              productId={product.id}
              productName={product.name}
              price={product.price}
              stock={product.stock}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
