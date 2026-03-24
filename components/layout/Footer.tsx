import Link from 'next/link'
import { ShoppingBag, Mail, Phone } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl mb-4">
              <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              ZIM MALL
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Zimbabwe&apos;s trusted online marketplace. Buy and sell with confidence.
            </p>
            <div className="space-y-2">
              <a
                href="mailto:hello@zimmall.co.zw"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4" />
                hello@zimmall.co.zw
              </a>
              <a
                href="tel:+2637712345678"
                className="flex items-center gap-2 text-sm hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4" />
                +263 77 123 4567
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-white font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2">
              {[
                { label: 'Browse Products', href: '/search' },
                { label: 'Electronics', href: '/search?category=electronics' },
                { label: 'Clothing & Fashion', href: '/search?category=clothing-fashion' },
                { label: 'Vehicles', href: '/search?category=vehicles' },
                { label: 'Services', href: '/search?category=services' },
                { label: 'Agriculture', href: '/search?category=agriculture' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="text-white font-semibold mb-4">Sell on ZIM MALL</h3>
            <ul className="space-y-2">
              {[
                { label: 'Start Selling', href: '/signup?role=seller' },
                { label: 'Seller Dashboard', href: '/dashboard' },
                { label: 'Pricing Plans', href: '/dashboard/subscription' },
                { label: 'Seller Guide', href: '#' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {[
                { label: 'About Us', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Contact Us', href: '#' },
                { label: 'Report an Issue', href: '#' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} ZIM MALL. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Made in Zimbabwe
          </p>
        </div>
      </div>
    </footer>
  )
}
