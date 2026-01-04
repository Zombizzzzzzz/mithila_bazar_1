'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  productId: number
  onReviewSubmitted: () => void
}

export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim() || rating === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          order_id: null, // For now, allow reviews without order verification
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim() || undefined,
          rating,
          comment: comment.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit review')
      }

      onReviewSubmitted()
      setRating(0)
      setComment('')
      setCustomerName('')
      setCustomerEmail('')
      alert('Thank you for your review!')
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(error instanceof Error ? error.message : 'Failed to submit review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Write a Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium">Your Name *</Label>
              <input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-3 text-base border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
                placeholder="Enter your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail" className="text-sm font-medium">Email (Optional)</Label>
              <input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-3 text-base border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Rating *</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "h-7 w-7",
                      (hoverRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-200"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground self-center">
                {rating > 0 && `${rating} star${rating !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">Comment (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={6}
              className="resize-none text-base focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || rating === 0 || !customerName.trim()}
            className="w-full py-3 text-base font-medium"
            size="lg"
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}