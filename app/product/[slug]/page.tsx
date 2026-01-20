'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { getProductBySlug, getProducts, createOrder, incrementProductSales, getReviewsByProductId } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import { Star, ShoppingCart, Heart, Truck, MapPin, Phone, User, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BuyNowForm } from "@/components/buy-now-form"
import { ProductMediaGallery } from "@/components/product-media-gallery"
import { ReviewsDisplay } from "@/components/reviews-display"
import { ReviewForm } from "@/components/review-form"
import type { Product, Review } from "@/lib/db"

export default function ProductPage() {
  const { slug } = useParams() as { slug: string }
  const { data: session } = useSession()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<{ color: string; price: string | number } | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')

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

        // Set default selections
        if (productData.color_variants && productData.color_variants.length > 0) {
          setSelectedVariant(productData.color_variants[0])
        }
        if (productData.sizes && productData.sizes.length > 0) {
          const firstSize = productData.sizes[0]
          const sizeValue = typeof firstSize === 'string' ? firstSize : (firstSize as any).size
          setSelectedSize(sizeValue)
        }
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

  const currentPrice = selectedVariant ? parseFloat(selectedVariant.price.toString()) : (product ? parseFloat(product.price.toString()) : 0)
  const currentStock = selectedVariant ? 
    (product?.color_variants?.find(v => v.color === selectedVariant.color)?.stock ? 
      parseInt(product.color_variants.find(v => v.color === selectedVariant.color)!.stock!.toString()) : 
      product?.stock ?? 0) : 
    (product?.stock ?? 0)

  const handleReviewSubmitted = async () => {
    if (product) {
      const reviewsData = await getReviewsByProductId(product.id)
      setReviews(reviewsData)
    }
  }

  const handleOrderSuccess = async () => {
    // Refetch product data to get updated stock
    if (slug) {
      try {
        const productData = await getProductBySlug(slug)
        if (productData) {
          setProduct(productData)
        }
      } catch (error) {
        console.error('Error refreshing product data:', error)
      }
    }
  }

  const handleContactSeller = () => {
    if (!session) {
      // Redirect to home page with login prompt
      router.push('/?login=true&redirect=' + encodeURIComponent(`/chat?product=${product?.id || ''}`))
      return
    }

    if (!product) return

    // Redirect to chat page with product context
    router.push(`/chat?product=${product.id}`)
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
      <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:gap-12 lg:grid-cols-2">
          {/* Product Media Gallery */}
          <ProductMediaGallery
            imageUrl={product.image_url}
            images={product.images || []}
            videos={product.videos || []}
            productName={product.name}
          />

          {/* Product Details */}
          <div className="flex flex-col gap-4 md:gap-6">
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-foreground">{product.name}</h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <span className="font-serif text-2xl md:text-3xl font-bold text-foreground">रु {currentPrice.toFixed(2)}</span>
              <Badge variant="secondary" className="text-xs md:text-sm">
                {currentStock > 0 ? `${currentStock} in stock${selectedVariant ? ` (${selectedVariant.color})` : ''}` : 'Out of stock'}
              </Badge>
            </div>

            {/* Contact Seller Button */}
            <Button
              onClick={handleContactSeller}
              variant="outline"
              className="flex items-center gap-2 w-fit"
            >
              <MessageCircle className="h-4 w-4" />
              Contact Seller
            </Button>

            {/* Color Variants */}
            {product.color_variants && product.color_variants.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.color_variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        selectedVariant?.color === variant.color
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size, index) => {
                    const sizeObj = typeof size === 'string' ? { size, stock: product.stock } : (size as any)
                    const sizeValue = typeof size === 'string' ? size : sizeObj.size
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedSize(sizeValue)}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          selectedSize === sizeValue
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        title={sizeObj.stock !== undefined ? `${sizeObj.stock} in stock` : ''}
                      >
                        {sizeValue} {sizeObj.stock !== undefined && sizeObj.stock > 0 ? `(${sizeObj.stock})` : ''}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <p className="text-lg leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="text-sm text-muted-foreground">
              <span className="font-bold text-lg text-orange-600 bg-orange-50 px-2 py-1 rounded-md">{product.sales_count} sold</span>
            </div>

           
          </div>
        </div>
      </section>
         {/* Visual separator */}
            <div className="border-t border-gray-200 my-6 md:my-8"></div>

            {/* Order Form and Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-4 md:px-8 lg:px-20 py-8 md:py-12 lg:py-20">
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
                  price={currentPrice}
                  stock={currentStock}
                  selectedVariant={selectedVariant}
                  selectedSize={selectedSize}
                  colorVariants={product.color_variants?.map(v => ({ ...v, stock: typeof v.stock === 'number' ? v.stock : parseInt(String(v.stock || 0)) }))}
                  sizes={product.sizes}
                  onOrderSuccess={handleOrderSuccess}
                />
              </div>
            </div>
      {/* Reviews Section - moved up to reduce spacing */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 md:mb-8">Customer Reviews</h2>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 lg:gap-8">
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
