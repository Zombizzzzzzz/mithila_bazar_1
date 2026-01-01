'use client'

import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck, MapPin, Phone, User, Package } from 'lucide-react'
import { toast } from 'sonner'

interface BuyNowFormProps {
  productId: number
  productName: string
  price: number
  stock: number
}

export function BuyNowForm({ productId, productName, price, stock }: BuyNowFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    delivery_address: '',
    delivery_city: '',
    quantity: 1
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      signIn()
      return
    }

    if (formData.quantity > stock) {
      toast.error('Not enough stock available')
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
          total_amount: price * formData.quantity
        }),
      })

      if (response.ok) {
        toast.success('Order placed successfully! We will deliver to your address.')
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Buy Now - Cash on Delivery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name" className="flex items-center gap-2">
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_phone" className="flex items-center gap-2">
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_address" className="flex items-center gap-2">
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_city">City</Label>
            <Input
              id="delivery_city"
              name="delivery_city"
              type="text"
              required
              value={formData.delivery_city}
              onChange={handleInputChange}
              placeholder="Enter your city"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              max={stock}
              required
              value={formData.quantity}
              onChange={handleInputChange}
            />
            <p className="text-sm text-muted-foreground">
              Available stock: {stock} | Total: रु {(price * formData.quantity).toFixed(2)}
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || stock === 0}
          >
            {isSubmitting ? (
              'Placing Order...'
            ) : stock === 0 ? (
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