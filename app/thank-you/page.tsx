import { CheckCircle, Truck, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-lg text-gray-600 mb-4">
            Your order has been placed successfully
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3 text-gray-700">
            <Truck className="h-5 w-5 text-blue-500" />
            <span>We'll deliver to your address soon</span>
          </div>
          <div className="text-sm text-gray-500">
            Pay only when you receive your order at your doorstep
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Link>
          <p className="text-xs text-gray-400">
            For any questions, contact us at customer service
          </p>
        </div>
      </div>
    </main>
  )
}