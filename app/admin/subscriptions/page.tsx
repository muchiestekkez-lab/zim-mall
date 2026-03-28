import { prisma } from '@/lib/prisma'
import { formatDate, formatPrice } from '@/lib/utils'
import { Badge, PlanBadge } from '@/components/ui/Badge'

export const metadata = { title: 'Subscriptions — Admin' }

export default async function AdminSubscriptionsPage() {
  let subscriptions: any[] = []
  try {
    subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        store: {
          include: { seller: { select: { name: true, email: true } } },
        },
      },
    })
  } catch {
    // DB error — show empty list rather than crashing
  }

  const totalRevenue = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((acc, s) => acc + s.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
          <p className="text-sm text-gray-500 mt-1">
            {subscriptions.filter((s) => s.status === 'ACTIVE').length} active —{' '}
            <span className="font-medium">{formatPrice(totalRevenue)}/mo revenue</span>
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Store / Seller</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Plan</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Expires</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{sub.store.name}</p>
                    <p className="text-xs text-gray-500">{sub.store.seller.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <PlanBadge plan={sub.plan} />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-700">
                    {formatPrice(sub.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        sub.status === 'ACTIVE'
                          ? 'active'
                          : sub.status === 'EXPIRED'
                          ? 'expired'
                          : sub.status === 'PENDING'
                          ? 'pending'
                          : 'default'
                      }
                    >
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">
                    {sub.endDate ? formatDate(sub.endDate) : '—'}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400">
                    {formatDate(sub.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
