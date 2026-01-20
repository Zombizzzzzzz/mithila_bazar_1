'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, MapPin, Phone, User, Package } from 'lucide-react'
import { toast } from 'sonner'

interface BuyNowFormProps {
  productId: number
  productName: string
  price: number
  stock: number
  selectedVariant?: { color: string; price: string | number } | null
  selectedSize?: string
  colorVariants?: { color: string; price: string | number; stock?: number }[]
  sizes?: { size: string; stock?: number }[] | string[]
  onOrderSuccess?: () => void
}

export function BuyNowForm({ productId, productName, price, stock, selectedVariant, selectedSize, colorVariants, sizes, onOrderSuccess }: BuyNowFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [freshProductData, setFreshProductData] = useState<{
    stock: number
    color_variants?: { color: string; price: string | number; stock?: number }[]
    sizes?: { size: string; stock?: number }[]
  } | null>(null)
  const [formSelectedVariant, setFormSelectedVariant] = useState<{ color: string; price: string | number; stock?: number } | null>(selectedVariant || null)
  const [formSelectedSize, setFormSelectedSize] = useState<string>(selectedSize || '')
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    delivery_city: '',
    quantity: 1
  })

  // Fetch fresh product data when component mounts
  useEffect(() => {
    const fetchFreshProductData = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        if (response.ok) {
          const product = await response.json()
          setFreshProductData({
            stock: product.stock,
            color_variants: product.color_variants?.map((v: any) => ({
              ...v,
              stock: typeof v.stock === 'number' ? v.stock : parseInt(String(v.stock || 0))
            })),
            sizes: product.sizes?.map((s: any) => {
              if (typeof s === 'string') {
                return { size: s, stock: product.stock }
              }
              return {
                ...s,
                stock: typeof s.stock === 'number' ? s.stock : parseInt(String(s.stock || 0))
              }
            })
          })
        }
      } catch (error) {
        console.error('Failed to fetch fresh product data:', error)
      }
    }

    fetchFreshProductData()
  }, [productId])

  const normalizedSizes = sizes?.map(s => {
    if (typeof s === 'string') {
      return { size: s, stock: stock }
    }
    return s
  }) || []

  const currentPrice = formSelectedVariant ? parseFloat(formSelectedVariant.price.toString()) : price
  const currentStock = freshProductData?.stock || stock
  const currentColorVariants = freshProductData?.color_variants || colorVariants
  const currentSizes = freshProductData?.sizes || normalizedSizes
  
  const availableStock = formSelectedVariant 
    ? (currentColorVariants?.find(v => v.color === formSelectedVariant.color)?.stock ?? currentStock)
    : formSelectedSize 
      ? (currentSizes?.find(s => (s as any).size === formSelectedSize)?.stock ?? currentStock)
      : currentStock

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      signIn()
      return
    }

    if (formData.quantity > availableStock) {
      toast.error('Not enough stock available for selected variant')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          ...formData,
          total_amount: currentPrice * formData.quantity,
          selected_variant: formSelectedVariant,
          selected_size: formSelectedSize
        }),
      })

      if (response.ok) {
        toast.success('Order placed successfully! We will deliver to your address.')
        onOrderSuccess?.()
        router.push('/thank-you')
      } else {
        toast.error('Failed to place order. Please try again.')
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto md:max-w-lg">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <Package className="h-5 w-5" />
          Buy Now - Cash on Delivery
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="customer_name" className="flex items-center gap-2 text-sm md:text-base">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="customer_name"
              name="customer_name"
              type="text"
              required
              value={formData.customer_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="text-sm md:text-base"
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="customer_phone" className="flex items-center gap-2 text-sm md:text-base">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="customer_phone"
              name="customer_phone"
              type="tel"
              required
              value={formData.customer_phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              className="text-sm md:text-base"
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="delivery_address" className="flex items-center gap-2 text-sm md:text-base">
              <MapPin className="h-4 w-4" />
              Delivery Address
            </Label>
            <Textarea
              id="delivery_address"
              name="delivery_address"
              required
              value={formData.delivery_address}
              onChange={handleInputChange}
              placeholder="Enter your complete delivery address"
              rows={3}
              className="text-sm md:text-base"
            />
          </div>

          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="delivery_city" className="text-sm md:text-base">City</Label>
            <Input
              id="delivery_city"
              name="delivery_city"
              type="text"
              required
              value={formData.delivery_city}
              onChange={handleInputChange}
              placeholder="Enter your city"
              className="text-sm md:text-base"
            />
          </div>

          {/* Color Variant Selection */}
          {currentColorVariants && currentColorVariants.length > 0 && (
            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="variant" className="text-sm md:text-base">Color Variant</Label>
              <Select value={formSelectedVariant?.color || ''} onValueChange={(value) => {
                const variant = currentColorVariants.find(v => v.color === value)
                setFormSelectedVariant(variant || null)
              }}>
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {currentColorVariants.map((variant) => (
                    <SelectItem key={variant.color} value={variant.color}>
                      {variant.color} - रु {parseFloat(variant.price.toString()).toFixed(2)} {variant.stock !== undefined ? `(${variant.stock} in stock)` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Size Selection */}
          {currentSizes && currentSizes.length > 0 && (
            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="size" className="text-sm md:text-base">Size</Label>
              <Select value={formSelectedSize} onValueChange={setFormSelectedSize}>
                <SelectTrigger className="text-sm md:text-base">
                  <SelectValue placeholder="Select a size" />
                </SelectTrigger>
                <SelectContent>
                  {currentSizes.map((size) => {
                    const sizeObj = typeof size === 'string' ? { size, stock: currentStock } : size as any
                    return (
                      <SelectItem key={sizeObj.size} value={sizeObj.size}>
                        {sizeObj.size} {sizeObj.stock !== undefined ? `(${sizeObj.stock} in stock)` : ''}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1 md:space-y-2">
            <Label htmlFor="quantity" className="text-sm md:text-base">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              max={availableStock}
              required
              value={formData.quantity}
              onChange={handleInputChange}
              className="text-sm md:text-base"
            />
            <p className="text-xs md:text-sm text-muted-foreground">
              Available stock: {availableStock} {formSelectedVariant ? `(for ${formSelectedVariant.color})` : formSelectedSize ? `(for size ${formSelectedSize})` : '(general)'} | Total: रु {(currentPrice * formData.quantity).toFixed(2)}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full text-sm md:text-base py-2 md:py-3"
            disabled={isSubmitting || availableStock === 0}
          >
            {isSubmitting ? (
              'Placing Order...'
            ) : availableStock === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <Truck className="mr-2 h-4 w-4" />
                Place Order - Cash on Delivery
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Pay only when you receive your order at your doorstep
          </p>
        </form>
      </CardContent>
    </Card>
  )
}