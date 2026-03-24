import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/products/ProductForm'

export const metadata = { title: 'Add Product' }

export default async function NewProductPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const store = await prisma.store.findUnique({
    where: { sellerId: session.user.id },
    include: {
      subscription: true,
      _count: { select: { products: true } },
    },
  })

  if (!store) redirect('/dashboard/store')

  const hasActiveSubscription =
    store.subscription?.status === 'ACTIVE' &&
    (!store.subscription.endDate || new Date(store.subscription.endDate) > new Date())

  if (!hasActiveSubscription) {
    redirect('/dashboard/subscription')
  }

  // Check product limits
  const maxProducts =
    store.subscription?.plan === 'PREMIUM'
      ? Infinity
      : store.subscription?.plan === 'BUSINESS'
      ? 100
      : 20

  if (store._count.products >= maxProducts) {
    redirect('/dashboard/subscription?error=product_limit')
  }

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-500 text-sm mt-1">
          List a product for buyers to discover on ZIM MALL.
        </p>
      </div>

      <ProductForm storeId={store.id} />
    </div>
  )
}
