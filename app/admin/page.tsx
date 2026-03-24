import { prisma } from '@/lib/prisma'
import { StatCard } from '@/components/ui/Card'
import { Users, Package, Store, Flag, CreditCard, TrendingUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboardPage() {
  const [
    totalUsers,
    totalProducts,
    totalStores,
    pendingReports,
    activeSubscriptions,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.store.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ])

  const revenue = await prisma.subscription.aggregate({
    where: { status: 'ACTIVE' },
    _sum: { amount: true },
  })

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Overview</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={totalUsers} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Total Products" value={totalProducts} icon={<Package className="h-5 w-5" />} />
        <StatCard title="Active Stores" value={totalStores} icon={<Store className="h-5 w-5" />} />
        <StatCard
          title="Pending Reports"
          value={pendingReports}
          icon={<Flag className="h-5 w-5" />}
          description={pendingReports > 0 ? 'Require attention' : 'All clear'}
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions}
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(revenue._sum.amount || 0).toFixed(2)}`}
          icon={<TrendingUp className="h-5 w-5" />}
        />
      </div>

      {/* Recent Users */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Users</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name || 'No name'}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    user.role === 'ADMIN'
                      ? 'bg-gray-900 text-white'
                      : user.role === 'SELLER'
                      ? 'bg-brand-50 text-brand-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {user.role}
                </span>
                <span className="text-xs text-gray-400">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
