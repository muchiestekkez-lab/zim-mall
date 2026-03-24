import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Link from 'next/link'
import {
  LayoutDashboard, Users, Package, Flag, CreditCard, Shield
} from 'lucide-react'

const adminNav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Reports', href: '/admin/reports', icon: Flag },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="p-2 bg-gray-900 rounded-lg">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
          <p className="text-xs text-gray-500">ZIM MALL Management</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 hidden md:block">
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <Icon className="h-4 w-4 text-gray-400" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden w-full">
          <div className="flex overflow-x-auto gap-1 pb-4 mb-4 scrollbar-hide">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-shrink-0 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
