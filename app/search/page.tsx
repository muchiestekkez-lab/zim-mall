import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import ProductGrid, { ProductGridSkeleton } from '@/components/products/ProductGrid'
import { CATEGORIES, ZIMBABWE_LOCATIONS } from '@/lib/utils'
import { SlidersHorizontal, Search } from 'lucide-react'

interface SearchParams {
  q?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  location?: string
  deliveryType?: string
  condition?: string
  sort?: string
  page?: string
}

interface SearchPageProps {
  searchParams: Promise<SearchParams>
}

const PAGE_SIZE = 24

async function searchProducts(params: SearchParams) {
  const {
    q,
    category,
    minPrice,
    maxPrice,
    location,
    deliveryType,
    condition,
    sort = 'newest',
    page = '1',
  } = params

  const skip = (parseInt(page) - 1) * PAGE_SIZE

  const where: any = {
    isActive: true,
    isApproved: true,
    store: {
      isActive: true,
      subscription: { status: 'ACTIVE' },
    },
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  if (category) where.category = category
  if (location && location !== 'Nationwide') where.location = location
  if (deliveryType) where.deliveryType = deliveryType
  if (condition) where.condition = condition

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }

  const orderBy: any =
    sort === 'price_asc'
      ? { price: 'asc' }
      : sort === 'price_desc'
      ? { price: 'desc' }
      : sort === 'popular'
      ? { views: 'desc' }
      : { createdAt: 'desc' }

  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          store: { select: { id: true, name: true, isVerified: true, slug: true } },
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip,
        take: PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ])
    return { products, total, pages: Math.ceil(total / PAGE_SIZE) }
  } catch {
    return { products: [], total: 0, pages: 0 }
  }
}

async function SearchResults({ searchParams }: { searchParams: SearchParams }) {
  const { products, total, pages } = await searchProducts(searchParams)
  const currentPage = parseInt(searchParams.page || '1')

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {total === 0 ? 'No results' : `${total.toLocaleString()} result${total !== 1 ? 's' : ''}`}
          {searchParams.q && ` for "${searchParams.q}"`}
        </p>
      </div>

      <ProductGrid
        products={products}
        emptyTitle={searchParams.q ? `No results for "${searchParams.q}"` : 'No products found'}
        emptyDescription="Try different keywords, category, or location."
      />

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <a
              href={`/search?${new URLSearchParams({ ...searchParams, page: String(currentPage - 1) }).toString()}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Previous
            </a>
          )}

          {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
            const pageNum = i + 1
            return (
              <a
                key={pageNum}
                href={`/search?${new URLSearchParams({ ...searchParams, page: String(pageNum) }).toString()}`}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  pageNum === currentPage
                    ? 'bg-brand-500 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </a>
            )
          })}

          {currentPage < pages && (
            <a
              href={`/search?${new URLSearchParams({ ...searchParams, page: String(currentPage + 1) }).toString()}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const currentCategory = CATEGORIES.find((c) => c.slug === params.category)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        {params.q ? (
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-400" />
            <h1 className="text-xl font-bold text-gray-900">
              Search: &ldquo;{params.q}&rdquo;
            </h1>
          </div>
        ) : currentCategory ? (
          <h1 className="text-xl font-bold text-gray-900">{currentCategory.name}</h1>
        ) : (
          <h1 className="text-xl font-bold text-gray-900">Browse Products</h1>
        )}
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <aside className="w-56 flex-shrink-0 hidden md:block">
          <form method="GET" action="/search" className="space-y-5">
            {params.q && (
              <input type="hidden" name="q" value={params.q} />
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </h3>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                Category
              </label>
              <select
                name="category"
                defaultValue={params.category || ''}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                Location
              </label>
              <select
                name="location"
                defaultValue={params.location || ''}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                <option value="">All locations</option>
                {ZIMBABWE_LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                Price Range (USD)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Min"
                  defaultValue={params.minPrice || ''}
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-gray-400 text-sm">–</span>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Max"
                  defaultValue={params.maxPrice || ''}
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                Condition
              </label>
              <select
                name="condition"
                defaultValue={params.condition || ''}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Any</option>
                <option value="NEW">New</option>
                <option value="USED">Used</option>
              </select>
            </div>

            {/* Delivery Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                Delivery
              </label>
              <select
                name="deliveryType"
                defaultValue={params.deliveryType || ''}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Any</option>
                <option value="DELIVERY">Delivery for a Fee</option>
                <option value="PICKUP">Pick Up Only</option>
                <option value="BOTH">Pick Up &amp; Delivery for a Fee</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                Sort by
              </label>
              <select
                name="sort"
                defaultValue={params.sort || 'newest'}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Apply Filters
            </button>

            <a
              href="/search"
              className="block text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </a>
          </form>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <Suspense fallback={<ProductGridSkeleton count={PAGE_SIZE} />}>
            <SearchResults searchParams={params} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
