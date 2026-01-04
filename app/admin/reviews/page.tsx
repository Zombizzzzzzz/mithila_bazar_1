'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Review } from '@/lib/db'

export default function AdminReviewsPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const session = localStorage.getItem('admin_session')
    if (!session) {
      router.push('/admin/login')
      return
    }

    try {
      const adminData = JSON.parse(session)
      const loggedInAt = new Date(adminData.loggedInAt)
      const now = new Date()
      const hoursDiff = (now.getTime() - loggedInAt.getTime()) / (1000 * 60 * 60)

      if (hoursDiff > 24) {
        localStorage.removeItem('admin_session')
        router.push('/admin/login')
        return
      }

      loadReviews()
    } catch (error) {
      localStorage.removeItem('admin_session')
      router.push('/admin/login')
    }
  }

  const loadReviews = async () => {
    try {
      const response = await fetch('/api/admin/reviews')
      if (!response.ok) {
        throw new Error('Failed to fetch reviews')
      }
      const data = await response.json()
      setReviews(data)
    } catch (error) {
      console.error('Error loading reviews:', error)
      setError('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_session')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadReviews}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customer Reviews</h1>
          <div className="flex gap-4">
            <Link href="/admin/products">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                📦 Products
              </button>
            </Link>
            <Link href="/admin/orders">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">
                📋 Orders
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
            >
              <span>←</span>
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{(review as any).product_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Order #{review.order_id}</p>
                  </div>
                  <Badge variant="outline">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-1">{review.rating}/5</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{review.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {review.comment && (
                    <div>
                      <p className="text-sm font-medium mb-1">Review:</p>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/product/${(review as any).product_slug}`}>
                      <Button variant="outline" size="sm">
                        View Product
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}