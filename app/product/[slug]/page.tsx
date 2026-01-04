'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getProductBySlug, getProducts, createOrder, incrementProductSales, getReviewsByProductId } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import { Star, ShoppingCart, Heart, Truck, MapPin, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BuyNowForm } from "@/components/buy-now-form"
import { ProductMediaGallery } from "@/components/product-media-gallery"
import { ReviewsDisplay } from "@/components/reviews-display"
import { ReviewForm } from "@/components/review-form"
import type { Product, Review } from "@/lib/db"

export default function ProductPage() {
  const { slug } = useParams() as { slug: string }
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productData = await getProductBySlug(slug)

        if (!productData) {
          notFound()
        }

        setProduct(productData)
        const reviewsData = await getReviewsByProductId(productData.id)
        setReviews(reviewsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchData()
    }
  }, [slug])

  const handleReviewSubmitted = () => {
    // Refresh reviews
    getReviewsByProductId(product?.id || 0).then(setReviews)
  }

  if (loading) {
    return (
      <main>
        <section className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </section>
      </main>
    )
  }

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

            <div className="text-sm text-muted-foreground">
              <span className="font-bold text-lg text-orange-600 bg-orange-50 px-2 py-1 rounded-md">{product.sales_count} sold</span>
            </div>

           
          </div>
        </div>
      </section>
         {/* Visual separator */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* Order Form and Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-20">
              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="font-semibold text-foreground mb-4 text-lg">Features:</h3>
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Order Form */}
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <BuyNowForm
                  productId={product.id}
                  productName={product.name}
                  price={product.price}
                  stock={product.stock}
                />
              </div>
            </div>
      {/* Reviews Section - moved up to reduce spacing */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">Customer Reviews</h2>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <ReviewsDisplay reviews={reviews} />
            </div>
            <div className="lg:col-span-2">
              <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
