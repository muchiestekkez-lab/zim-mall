import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/layout/Sidebar'
import { NoSubscriptionBanner } from '@/components/seller/SubscriptionGate'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || (session.user.role !== 'SELLER' && session.user.role !== 'ADMIN')) {
    redirect('/login?callbackUrl=/dashboard')
  }

  const store = await prisma.store.findUnique({
    where: { sellerId: session.user.id },
    include: {
      subscription: { select: { status: true, plan: true, endDate: true } },
    },
  })

  const hasActiveSubscription =
    store?.subscription?.status === 'ACTIVE' &&
    (!store.subscription.endDate || new Date(store.subscription.endDate) > new Date())

  // Block access to all dashboard pages except /subscription for unsubscribed sellers
  if (store && !hasActiveSubscription) {
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || ''
    if (!pathname.startsWith('/dashboard/subscription')) {
      redirect('/dashboard/subscription')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile nav */}
      <div className="lg:hidden mb-4">
        <div className="flex overflow-x-auto gap-1 scrollbar-hide pb-2">
          {[
            { label: 'Overview', href: '/dashboard', locked: !hasActiveSubscription },
            { label: 'Store', href: '/dashboard/store', locked: !hasActiveSubscription },
            { label: 'Products', href: '/dashboard/products', locked: !hasActiveSubscription },
            { label: 'Subscription', href: '/dashboard/subscription', locked: false },
          ].map((item) => (
            <a
              key={item.href}
              href={item.locked ? '/dashboard/subscription' : item.href}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium border rounded-lg ${
                item.locked
                  ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {item.locked ? '🔒 ' : ''}{item.label}
            </a>
          ))}
        </div>
      </div>

      {store && !hasActiveSubscription && (
        <NoSubscriptionBanner className="mb-6" />
      )}

      <div className="flex gap-8">
        <Sidebar storeName={store?.name} hasActiveSubscription={hasActiveSubscription} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
