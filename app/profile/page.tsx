import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCustomerByEmail, getOrdersByCustomer } from '@/lib/db'
import Image from 'next/image'
import Link from 'next/link'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !session.user.email) {
    return (
      <main className="container mx-auto p-8">
        <h2 className="text-xl font-bold">Not signed in</h2>
        <p>Please sign in to view your profile and orders.</p>
      </main>
    )
  }

  const customer = await getCustomerByEmail(session.user.email)
  if (!customer) {
    return (
      <main className="container mx-auto p-8">
        <h2 className="text-xl font-bold">Profile not found</h2>
        <p>We couldn't find your customer profile.</p>
      </main>
    )
  }

  const orders = await getOrdersByCustomer(customer.id)

  return (
    <main className="container mx-auto p-8">
      <div className="flex items-center gap-6 mb-6">
        {customer.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={customer.image_url} alt={customer.name || ''} className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">{(customer.name || 'U').charAt(0)}</div>
        )}

        <div>
          <h1 className="text-2xl font-semibold">{customer.name || customer.email}</h1>
          <p className="text-sm text-muted-foreground">{customer.email}</p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold mb-4">Your Orders</h2>
        {orders.length === 0 ? (
          <p className="text-muted-foreground">You have no orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="p-4 border rounded-md">
                <div className="flex items-center gap-4">
                  {order.product_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={order.product_image} alt={order.product_name} className="h-16 w-16 object-cover rounded" />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded" />
                  )}

                  <div className="flex-1">
                    <Link href={`/product/${order.product_slug}`} className="font-medium">{order.product_name}</Link>
                    <div className="text-sm text-muted-foreground">Quantity: {order.quantity} • Total: रु {Number(order.total_amount).toFixed(2)}</div>
                    <div className="text-sm">Status: {order.order_status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
