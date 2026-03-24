import { redirect } from 'next/navigation'
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Mobile nav */}
      <div className="lg:hidden mb-4">
        <div className="flex overflow-x-auto gap-1 scrollbar-hide pb-2">
          {[
            { label: 'Overview', href: '/dashboard' },
            { label: 'Store', href: '/dashboard/store' },
            { label: 'Products', href: '/dashboard/products' },
            { label: 'Subscription', href: '/dashboard/subscription' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex-shrink-0 px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {store && !hasActiveSubscription && (
        <NoSubscriptionBanner className="mb-6" />
      )}

      <div className="flex gap-8">
        <Sidebar storeName={store?.name} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
