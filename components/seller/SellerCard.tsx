import Link from 'next/link'
import Image from 'next/image'
import { Phone, MessageCircle, MapPin, Star, CheckCircle, Calendar } from 'lucide-react'
import { cn, formatDate, getWhatsAppUrl, getInitials } from '@/lib/utils'
import { Badge } from '../ui/Badge'

interface SellerCardProps {
  store: {
    id: string
    name: string
    slug: string
    logo: string | null
    location: string | null
    isVerified: boolean
    whatsapp: string | null
    phone: string | null
    createdAt: Date | string
    subscription?: {
      plan: 'STARTER' | 'BUSINESS' | 'PREMIUM'
      status: string
    } | null
    _count?: {
      products: number
      reviews: number
    }
    reviews?: { rating: number }[]
  }
  productName?: string
  className?: string
}

export function SellerCard({ store, productName, className }: SellerCardProps) {
  const avgRating =
    store.reviews && store.reviews.length > 0
      ? store.reviews.reduce((acc, r) => acc + r.rating, 0) / store.reviews.length
      : null

  const whatsappMessage = productName
    ? `Hi! I'm interested in your product: ${productName}`
    : `Hi! I found your store on ZIM MALL`

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg p-5', className)}>
      <div className="flex items-start gap-3 mb-4">
        {/* Logo */}
        <Link href={`/sellers/${store.id}`} className="flex-shrink-0">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-brand-50 flex items-center justify-center border border-gray-200">
            {store.logo ? (
              <Image
                src={store.logo}
                alt={store.name}
                width={56}
                height={56}
                className="object-cover"
              />
            ) : (
              <span className="text-brand-600 font-bold text-lg">
                {getInitials(store.name)}
              </span>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/sellers/${store.id}`}
            className="font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-1"
          >
            {store.name}
          </Link>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {store.isVerified && <Badge variant="verified" />}
            {store.subscription && (
              <Badge
                variant={
                  store.subscription.plan === 'PREMIUM'
                    ? 'premium'
                    : store.subscription.plan === 'BUSINESS'
                    ? 'business'
                    : 'starter'
                }
              />
            )}
          </div>

          {store.location && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin className="h-3 w-3" />
              {store.location}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
        {store._count?.products !== undefined && (
          <span>{store._count.products} products</span>
        )}
        {avgRating !== null && (
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span>{avgRating.toFixed(1)}</span>
            {store._count?.reviews ? (
              <span className="text-gray-400">({store._count.reviews})</span>
            ) : null}
          </div>
        )}
        <div className="flex items-center gap-1 text-xs">
          <Calendar className="h-3 w-3" />
          Since {new Date(store.createdAt).getFullYear()}
        </div>
      </div>

      {/* Trust message */}
      <div className="mb-4 text-xs text-gray-500">
        {store.isVerified ? (
          <div className="flex items-center gap-1 text-brand-600 font-medium">
            <CheckCircle className="h-3.5 w-3.5" />
            Verified seller — identity confirmed
          </div>
        ) : (
          <span>New seller — contact via WhatsApp for safety</span>
        )}
      </div>

      {/* CTA Buttons */}
      <div className="space-y-2">
        {store.whatsapp && (
          <a
            href={getWhatsAppUrl(store.whatsapp, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] hover:bg-[#22c55e] text-white font-medium text-sm rounded-lg transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </a>
        )}

        {store.phone && (
          <a
            href={`tel:${store.phone}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg transition-colors"
          >
            <Phone className="h-4 w-4" />
            Call Seller
          </a>
        )}

        <Link
          href={`/sellers/${store.id}`}
          className="flex items-center justify-center w-full py-2.5 text-brand-600 hover:text-brand-700 text-sm font-medium hover:bg-brand-50 rounded-lg transition-colors"
        >
          View All Products
        </Link>
      </div>
    </div>
  )
}

export default SellerCard
