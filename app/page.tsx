import Link from 'next/link'
import { Search, ArrowRight, Store, Package, ShieldCheck, Monitor, Shirt, Home, Car, Briefcase, Leaf, Heart, BookOpen } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import ProductGrid from '@/components/products/ProductGrid'

async function getFeaturedProducts() {
  try {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        isApproved: true,
        store: {
          isActive: true,
          subscription: { status: 'ACTIVE' },
        },
      },
      include: {
        store: {
          select: { id: true, name: true, isVerified: true, slug: true },
        },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    })
  } catch {
    return []
  }
}

async function getStats() {
  try {
    const [products, stores] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.store.count({ where: { isActive: true } }),
    ])
    return { products, stores }
  } catch {
    return { products: 0, stores: 0 }
  }
}

const categories = [
  { name: 'Electronics', slug: 'electronics', icon: Monitor, color: 'bg-blue-50 text-blue-600' },
  { name: 'Clothing', slug: 'clothing-fashion', icon: Shirt, color: 'bg-pink-50 text-pink-600' },
  { name: 'Home & Garden', slug: 'home-garden', icon: Home, color: 'bg-green-50 text-green-600' },
  { name: 'Vehicles', slug: 'vehicles', icon: Car, color: 'bg-orange-50 text-orange-600' },
  { name: 'Services', slug: 'services', icon: Briefcase, color: 'bg-purple-50 text-purple-600' },
  { name: 'Agriculture', slug: 'agriculture', icon: Leaf, color: 'bg-emerald-50 text-emerald-600' },
  { name: 'Health & Beauty', slug: 'health-beauty', icon: Heart, color: 'bg-rose-50 text-rose-600' },
  { name: 'Books & Education', slug: 'books-education', icon: BookOpen, color: 'bg-yellow-50 text-yellow-600' },
]

export default async function HomePage() {
  const [featuredProducts, stats] = await Promise.all([
    getFeaturedProducts(),
    getStats(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4">
              Zimbabwe&apos;s Premier{' '}
              <span className="text-brand-500">Online Marketplace</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
              Connect with local sellers across Zimbabwe. Buy and sell electronics, clothing,
              vehicles, services and more — all in one place.
            </p>

            {/* Search */}
            <form action="/search" className="flex flex-col sm:flex-row gap-2 max-w-xl mb-6 sm:mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  name="q"
                  type="search"
                  placeholder="Search for products or stores..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500">
              <span>
                <span className="font-semibold text-gray-900">{stats.products.toLocaleString()}</span> products listed
              </span>
              <span>
                <span className="font-semibold text-gray-900">{stats.stores.toLocaleString()}</span> verified sellers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Browse by Category</h2>
            <Link
              href="/search"
              className="text-sm text-brand-600 hover:text-brand-500 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Link
                  key={category.slug}
                  href={`/search?category=${category.slug}`}
                  className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-4 bg-white rounded-lg border border-gray-200 hover:border-brand-300 hover:shadow-sm transition-all group min-h-[80px] sm:min-h-0 justify-center"
                >
                  <div className={`p-2 sm:p-3 rounded-lg ${category.color}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 text-center group-hover:text-brand-600 transition-colors leading-tight">
                    {category.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
            <Link
              href="/search?sort=popular"
              className="text-sm text-brand-600 hover:text-brand-500 font-medium flex items-center gap-1"
            >
              See more <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <ProductGrid
            products={featuredProducts}
            emptyTitle="No products yet"
            emptyDescription="Be the first to list a product on ZIM MALL."
            emptyAction={{ label: 'Start Selling', href: '/signup?role=seller' }}
          />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">How ZIM MALL Works</h2>
            <p className="text-gray-500 mt-2">Simple, safe, and local</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Browse & Search',
                description:
                  'Find products across Zimbabwe from verified local sellers in your area or nationwide.',
                icon: Search,
              },
              {
                step: '2',
                title: 'Contact the Seller',
                description:
                  'Reach out directly via WhatsApp or phone. No middlemen, no fees — just direct communication.',
                icon: Package,
              },
              {
                step: '3',
                title: 'Buy with Confidence',
                description:
                  'Sellers are verified, reviews are real, and our team monitors listings for your safety.',
                icon: ShieldCheck,
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-brand-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-white border-2 border-brand-200 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm -mt-3 mb-4 shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="py-16 bg-brand-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <Store className="h-12 w-12 text-white/80 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Selling on ZIM MALL
            </h2>
            <p className="text-brand-100 mb-8">
              Reach thousands of buyers across Zimbabwe. Create your store in minutes.
              Plans starting at just $5/month.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup?role=seller"
                className="px-6 py-3 bg-white hover:bg-gray-50 text-brand-700 font-semibold rounded-lg transition-colors"
              >
                Open Your Store
              </Link>
              <Link
                href="/dashboard/subscription"
                className="px-6 py-3 border border-white/40 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
