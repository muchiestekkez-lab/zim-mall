'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Store,
  CreditCard,
  BarChart2,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'My Store',
    href: '/dashboard/store',
    icon: Store,
  },
  {
    label: 'Products',
    href: '/dashboard/products',
    icon: Package,
  },
  {
    label: 'Subscription',
    href: '/dashboard/subscription',
    icon: CreditCard,
  },
]

interface SidebarProps {
  storeName?: string
}

export default function Sidebar({ storeName }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="sticky top-20">
        {storeName && (
          <div className="px-4 py-3 mb-4 bg-brand-50 rounded-lg border border-brand-100">
            <p className="text-xs text-brand-600 font-medium uppercase tracking-wide">
              Your Store
            </p>
            <p className="font-semibold text-gray-900 mt-0.5 truncate">{storeName}</p>
          </div>
        )}

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href, item.exact)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700 border border-brand-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon className={cn('h-4 w-4', active ? 'text-brand-600' : 'text-gray-400')} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Link
            href="/dashboard/products/new"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>
      </div>
    </aside>
  )
}
