import { cn } from '@/lib/utils'
import ProductCard from './ProductCard'
import EmptyState from '../ui/EmptyState'
import { Package } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  location: string
  condition: 'NEW' | 'USED'
  isFeatured: boolean
  deliveryType: 'DELIVERY' | 'PICKUP' | 'BOTH'
  store: {
    id: string
    name: string
    isVerified: boolean
    slug: string
  }
  reviews?: { rating: number }[]
  _count?: { reviews: number }
}

interface ProductGridProps {
  products: Product[]
  className?: string
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: {
    label: string
    href: string
  }
}

export function ProductGrid({
  products,
  className,
  emptyTitle = 'No products found',
  emptyDescription = 'Check back later or try different search terms.',
  emptyAction,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        icon={<Package className="h-8 w-8" />}
        action={emptyAction}
      />
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="aspect-square skeleton" />
          <div className="p-3 space-y-2">
            <div className="h-4 skeleton rounded w-3/4" />
            <div className="h-5 skeleton rounded w-1/2" />
            <div className="h-3 skeleton rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductGrid
