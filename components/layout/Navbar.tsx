'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Search,
  Menu,
  X,
  ShoppingBag,
  User,
  ChevronDown,
  Store,
  LayoutDashboard,
  LogOut,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Session } from 'next-auth'

interface NavbarProps {
  session: Session | null
}

export default function Navbar({ session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 sm:h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 font-bold text-lg sm:text-xl text-brand-600"
          >
            <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center flex-shrink-0">
              <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="hidden sm:block">ZIM MALL</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </form>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/search"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/search?sort=popular"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              Popular
            </Link>
          </nav>

          {/* Auth / User */}
          <div className="flex items-center gap-2">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                >
                  <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block max-w-24 truncate">
                    {session.user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                      </div>

                      {session.user?.role === 'ADMIN' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          Admin Panel
                        </Link>
                      )}

                      {(session.user?.role === 'SELLER' || session.user?.role === 'ADMIN') && (
                        <>
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                          </Link>
                          <Link
                            href="/dashboard/store"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <Store className="h-4 w-4" />
                            My Store
                          </Link>
                        </>
                      )}

                      {session.user?.role === 'CUSTOMER' && (
                        <Link
                          href="/become-seller"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-brand-600 font-medium hover:bg-brand-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Store className="h-4 w-4" />
                          Start Selling
                        </Link>
                      )}

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white shadow-lg">
          <nav className="px-4 py-3 space-y-1">
            <Link href="/search" className="flex items-center gap-2 px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMobileOpen(false)}>
              Browse All Products
            </Link>
            <Link href="/search?sort=popular" className="flex items-center gap-2 px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMobileOpen(false)}>
              Popular Items
            </Link>

            {session ? (
              <>
                <hr className="my-2 border-gray-200" />
                {session.user?.role === 'ADMIN' && (
                  <Link href="/admin" className="flex items-center gap-2 px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMobileOpen(false)}>
                    <Shield className="h-4 w-4" /> Admin Panel
                  </Link>
                )}
                {(session.user?.role === 'SELLER' || session.user?.role === 'ADMIN') && (
                  <>
                    <Link href="/dashboard" className="flex items-center gap-2 px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMobileOpen(false)}>
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link href="/dashboard/store" className="flex items-center gap-2 px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMobileOpen(false)}>
                      <Store className="h-4 w-4" /> My Store
                    </Link>
                  </>
                )}
                {session.user?.role === 'CUSTOMER' && (
                  <Link href="/become-seller" className="flex items-center gap-2 px-3 py-3 text-sm text-brand-600 font-medium hover:bg-brand-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                    <Store className="h-4 w-4" /> Start Selling
                  </Link>
                )}
                <hr className="my-2 border-gray-200" />
                <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </>
            ) : (
              <>
                <hr className="my-2 border-gray-200" />
                <Link href="/login" className="block px-3 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Log In
                </Link>
                <Link href="/signup" className="block px-3 py-3 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg text-center" onClick={() => setMobileOpen(false)}>
                  Sign Up Free
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
