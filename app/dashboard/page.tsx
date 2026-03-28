import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Package, Eye, Store, CreditCard, Plus, ArrowRight, TrendingUp } from 'lucide-react'
import { StatCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatPrice, formatDate } from '@/lib/utils'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')

  let store = null
  try {
    store = await prisma.store.findUnique({
      where: { sellerId: session.user.id },
      include: {
        subscription: true,
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { _count: { select: { reviews: true } } },
        },
        _count: { select: { products: true, reviews: true } },
      },
    })
  } catch {
    redirect('/login')
  }

  const hasActiveSub = store?.subscription?.status === 'ACTIVE' &&
    (!store.subscription.endDate || new Date(store.subscription.endDate) > new Date())
  if (store && !hasActiveSub) redirect('/dashboard/subscription')

  if (!store) {
    return (
      <div className="text-center py-16">
        <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Set Up Your Store</h2>
        <p className="text-gray-500 mb-6">
          You haven&apos;t created your store yet. Set it up to start selling on ZIM MALL.
        </p>
        <Link
          href="/dashboard/store"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Your Store
        </Link>
      </div>
    )
  }

  let totalViews: { _sum: { views: number | null } } = { _sum: { views: null } }
  try {
    totalViews = await prisma.product.aggregate({
      where: { storeId: store.id },
      _sum: { views: true },
    })
  } catch {
    // non-critical, keep default zero
  }

  const hasActiveSubscription =
    store.subscription?.status === 'ACTIVE' &&
    (!store.subscription.endDate || new Date(store.subscription.endDate) > new Date())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Welcome back, {session.user.name?.split(' ')[0]}</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Products"
          value={store._count.products}
          icon={<Package className="h-5 w-5" />}
        />
        <StatCard
          title="Total Views"
          value={(totalViews._sum.views || 0).toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
        />
        <StatCard
          title="Reviews"
          value={store._count.reviews}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Subscription Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-400" />
            Subscription
          </h3>
          <Link href="/dashboard/subscription" className="text-sm text-brand-600 hover:text-brand-500 flex items-center gap-1">
            Manage <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {store.subscription ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge
                  variant={
                    store.subscription.plan === 'PREMIUM'
                      ? 'premium'
                      : store.subscription.plan === 'BUSINESS'
                      ? 'business'
                      : 'starter'
                  }
                >
                  {store.subscription.plan} Plan
                </Badge>
                <Badge variant={hasActiveSubscription ? 'active' : 'expired'}>
                  {store.subscription.status}
                </Badge>
              </div>
              {store.subscription.endDate && (
                <p className="text-sm text-gray-500">
                  {hasActiveSubscription ? 'Renews' : 'Expired'}{' '}
                  {formatDate(store.subscription.endDate)}
                </p>
              )}
            </div>
            {!hasActiveSubscription && (
              <Link
                href="/dashboard/subscription"
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Renew Now
              </Link>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">No active subscription</p>
            <Link
              href="/dashboard/subscription"
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Subscribe
            </Link>
          </div>
        )}
      </div>

      {/* Recent Products */}
      {store.products.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Products</h3>
            <Link href="/dashboard/products" className="text-sm text-brand-600 hover:text-brand-500 flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {store.products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{formatDate(product.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</p>
                  <p className="text-xs text-gray-400">{product.views} views</p>
                </div>
                <Link
                  href={`/dashboard/products/${product.id}/edit`}
                  className="text-xs text-brand-600 hover:text-brand-500 flex-shrink-0"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
