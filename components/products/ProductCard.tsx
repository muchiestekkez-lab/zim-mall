import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Package } from 'lucide-react'
import { cn, formatPrice, truncate } from '@/lib/utils'
import { Badge } from '../ui/Badge'

interface ProductCardProps {
  product: {
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
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : null

  const reviewCount = product._count?.reviews ?? product.reviews?.length ?? 0

  const mainImage = product.images[0] || '/placeholder-product.jpg'

  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        'group flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden',
        'hover:shadow-md hover:border-gray-300 transition-all duration-200',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.images[0] ? (
          <Image
            src={mainImage}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <Package className="h-12 w-12" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFeatured && (
            <span className="bg-yellow-500 text-white text-xs font-medium px-2 py-0.5 rounded">
              Featured
            </span>
          )}
          {product.condition === 'USED' && (
            <span className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded">
              Used
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>

        <p className="text-base font-bold text-gray-900 mb-2">
          {formatPrice(product.price)}
        </p>

        <div className="mt-auto space-y-1">
          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{product.location}</span>
          </div>

          {/* Store & Rating */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 truncate max-w-[60%]">
              {product.store.name}
              {product.store.isVerified && (
                <span className="ml-1 text-brand-600">&#10003;</span>
              )}
            </span>

            {avgRating !== null && (
              <div className="flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">
                  {avgRating.toFixed(1)}
                </span>
                {reviewCount > 0 && (
                  <span className="text-xs text-gray-400">({reviewCount})</span>
                )}
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="text-xs text-gray-400">
            {product.deliveryType === 'DELIVERY' && 'Delivery available'}
            {product.deliveryType === 'PICKUP' && 'Pickup only'}
            {product.deliveryType === 'BOTH' && 'Delivery & pickup'}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
