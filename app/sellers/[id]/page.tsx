import { notFound } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Star, Calendar, Package, MessageCircle, Phone, CheckCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDate, getWhatsAppUrl, getInitials } from '@/lib/utils'
import ProductGrid from '@/components/products/ProductGrid'
import { Badge, VerifiedBadge, PlanBadge } from '@/components/ui/Badge'

interface PageProps {
  params: { id: string }
}

async function getStore(id: string) {
  return prisma.store.findFirst({
    where: { OR: [{ id }, { slug: id }], isActive: true },
    include: {
      seller: { select: { createdAt: true } },
      subscription: { select: { plan: true, status: true } },
      products: {
        where: { isActive: true, isApproved: true },
        include: {
          store: { select: { id: true, name: true, isVerified: true, slug: true } },
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      },
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { products: true, reviews: true } },
    },
  })
}

export default async function SellerPage({ params }: PageProps) {
  const store = await getStore(params.id)
  if (!store) return notFound()

  const avgRating =
    store.reviews.length > 0
      ? store.reviews.reduce((acc, r) => acc + r.rating, 0) / store.reviews.length
      : null

  const hasActiveSubscription = store.subscription?.status === 'ACTIVE'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Store Header */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8">
        {/* Banner */}
        <div className="h-40 sm:h-56 bg-gray-100 relative">
          {store.banner ? (
            <Image src={store.banner} alt="" fill className="object-cover" sizes="100vw" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-brand-500/10 to-brand-500/5" />
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white shadow-md bg-white flex-shrink-0">
              {store.logo ? (
                <Image src={store.logo} alt={store.name} width={80} height={80} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-50 flex items-center justify-center">
                  <span className="text-brand-600 font-bold text-2xl">{getInitials(store.name)}</span>
                </div>
              )}
            </div>

            <div className="pt-6 flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-xl font-bold text-gray-900">{store.name}</h1>
                {store.isVerified && <VerifiedBadge />}
                {store.subscription && hasActiveSubscription && (
                  <PlanBadge plan={store.subscription.plan} />
                )}
              </div>

              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                {store.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {store.location}
                  </span>
                )}
                {avgRating !== null && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {avgRating.toFixed(1)} ({store._count.reviews} reviews)
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Package className="h-3.5 w-3.5" />
                  {store._count.products} products
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Member since {new Date(store.createdAt).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {store.description && (
            <p className="text-sm text-gray-600 mb-4 max-w-2xl">{store.description}</p>
          )}

          {/* Trust indicator */}
          {store.isVerified ? (
            <div className="flex items-center gap-2 text-sm text-brand-700 bg-brand-50 px-3 py-2 rounded-lg border border-brand-100 w-fit mb-4">
              <CheckCircle className="h-4 w-4" />
              Verified seller — identity confirmed by ZIM MALL
            </div>
          ) : (
            <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 w-fit mb-4">
              New seller — always contact via WhatsApp for your safety
            </div>
          )}

          {/* Contact Buttons */}
          <div className="flex gap-3 flex-wrap">
            {store.whatsapp && (
              <a
                href={getWhatsAppUrl(store.whatsapp, `Hi ${store.name}, I found your store on ZIM MALL`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#22c55e] text-white font-medium text-sm rounded-lg transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Chat on WhatsApp
              </a>
            )}
            {store.phone && (
              <a
                href={`tel:${store.phone}`}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Products ({store.products.length})
        </h2>
        <ProductGrid
          products={store.products}
          emptyTitle="No products listed yet"
          emptyDescription="This seller hasn't listed any products yet."
        />
      </div>

      {/* Reviews */}
      {store.reviews.length > 0 && (
        <section className="mt-10 pt-8 border-t border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Reviews ({store._count.reviews})
          </h2>
          <div className="space-y-4">
            {store.reviews.map((review) => (
              <div key={review.id} className="flex gap-3 border-b border-gray-100 pb-4">
                <div className="w-9 h-9 bg-brand-50 rounded-full flex items-center justify-center text-brand-700 font-bold flex-shrink-0">
                  {review.user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">
                      {review.user.name || 'Anonymous'}
                    </span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
