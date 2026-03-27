'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Search,
  Menu,
  X,
  ShoppingBag,
  ChevronDown,
  Store,
  LayoutDashboard,
  LogOut,
  Shield,
  Download,
} from 'lucide-react'
import type { Session } from 'next-auth'

interface NavbarProps {
  session: Session | null
}

type BrowserType = 'chrome' | 'samsung' | 'ios' | 'other'

function getGuideSteps(browser: BrowserType) {
  if (browser === 'ios') {
    return [
      { step: '1', title: 'Tap the Share button', desc: 'The box with an arrow at the bottom of your Safari browser' },
      { step: '2', title: 'Tap "Add to Home Screen"', desc: 'Scroll the share menu to find it' },
      { step: '3', title: 'Tap "Add"', desc: 'ZIM MALL will appear on your home screen like an app' },
    ]
  }
  if (browser === 'samsung') {
    return [
      { step: '1', title: 'Tap the menu icon ☰ at the bottom', desc: 'This opens the Samsung Internet browser menu' },
      { step: '2', title: 'Tap "Add page to"', desc: 'Then select "Home screen"' },
      { step: '3', title: 'Tap "Add"', desc: 'ZIM MALL will appear on your home screen like an app' },
    ]
  }
  // Chrome or other Android
  return [
    { step: '1', title: 'Tap the 3 dots menu ⋮ at the top right', desc: 'This opens the Chrome browser menu' },
    { step: '2', title: 'Tap "Add to Home screen"', desc: 'You may also see "Install app"' },
    { step: '3', title: 'Tap "Add"', desc: 'ZIM MALL will appear on your home screen like an app' },
  ]
}

export default function Navbar({ session }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [installPrompt, setInstallPrompt] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [browser, setBrowser] = useState<BrowserType>('other')
  const [isMounted, setIsMounted] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsMounted(true)

    // Already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    // Detect browser
    const ua = navigator.userAgent
    if (/iphone|ipad|ipod/i.test(ua)) {
      setBrowser('ios')
    } else if (/SamsungBrowser/i.test(ua)) {
      setBrowser('samsung')
    } else if (/Chrome/i.test(ua) && !/Chromium/i.test(ua)) {
      setBrowser('chrome')
    } else {
      setBrowser('other')
    }

    const handler = (e: any) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = async () => {
    // Chrome with native prompt available — use it directly
    if (installPrompt) {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        setInstallPrompt(null)
        setInstalled(true)
      }
      return
    }
    // Everyone else — show the guide
    setShowGuide(true)
    setMobileOpen(false)
  }

  const handleSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const guideSteps = getGuideSteps(browser)
  const showInstallButton = isMounted && !installed

  return (
    <>
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
              {showInstallButton && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download App
                </button>
              )}
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

              {showInstallButton && (
                <>
                  <button
                    onClick={handleInstallClick}
                    className="flex items-center gap-2 w-full px-3 py-3 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg"
                  >
                    <Download className="h-4 w-4" />
                    Download App — Install on Your Phone
                  </button>
                  <hr className="my-2 border-gray-200" />
                </>
              )}

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

      {/* Install Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 text-lg">Install ZIM MALL</h3>
              <button onClick={() => setShowGuide(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Do these steps <span className="font-semibold text-gray-800">right now in your browser</span>, then ZIM MALL will be saved on your home screen:
            </p>
            <div className="space-y-4">
              {guideSteps.map(({ step, title, desc }) => (
                <div key={step} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-brand-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {step}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-800">
              After step 3, ZIM MALL will appear on your home screen like a normal app.
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="mt-4 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
