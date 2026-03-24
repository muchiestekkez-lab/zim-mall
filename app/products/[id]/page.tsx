'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin, Package, Truck, RotateCcw, Star, Flag, ChevronLeft, Eye,
  Calendar, Tag
} from 'lucide-react'
import { formatPrice, formatRelativeDate, cn, PAYMENT_METHODS } from '@/lib/utils'
import SellerCard from '@/components/seller/SellerCard'
import Button from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Textarea, Select } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { LoadingPage } from '@/components/ui/Spinner'
import ProductGrid from '@/components/products/ProductGrid'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  location: string
  deliveryType: 'DELIVERY' | 'PICKUP' | 'BOTH'
  condition: 'NEW' | 'USED'
  views: number
  isFeatured: boolean
  createdAt: string
  store: {
    id: string
    name: string
    slug: string
    logo: string | null
    location: string | null
    isVerified: boolean
    whatsapp: string | null
    phone: string | null
    createdAt: string
    subscription: { plan: 'STARTER' | 'BUSINESS' | 'PREMIUM'; status: string } | null
    _count: { products: number; reviews: number }
    reviews: { rating: number }[]
  }
  reviews: {
    id: string
    rating: number
    comment: string | null
    createdAt: string
    user: { name: string | null; image: string | null }
  }[]
  _count: { reviews: number }
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [similar, setSimilar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [reportSuccess, setReportSuccess] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`)
        if (!res.ok) return setLoading(false)
        const data = await res.json()
        setProduct(data.product)
        setSimilar(data.similar || [])
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleReport = async () => {
    if (!reportReason) return
    setReportSubmitting(true)
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason, description: reportDescription, productId: id }),
      })
      setReportSuccess(true)
    } finally {
      setReportSubmitting(false)
    }
  }

  if (loading) return <LoadingPage />
  if (!product) return notFound()

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
      : null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <Link href={`/search?category=${product.category}`} className="hover:text-gray-700 capitalize">
          {product.category.replace(/-/g, ' ')}
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Images + Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-square sm:aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {product.images[selectedImage] ? (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-300">
                  <Package className="h-20 w-20" />
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={cn(
                      'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                      selectedImage === i ? 'border-brand-500' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
              <button
                onClick={() => setShowReportModal(true)}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Report this listing"
              >
                <Flag className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>

              <div className="flex items-center gap-2">
                {product.condition === 'USED' ? (
                  <Badge variant="used" />
                ) : (
                  <span className="text-sm bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full text-xs font-medium">
                    New
                  </span>
                )}
                {product.isFeatured && <Badge variant="featured" />}
              </div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400" />
                {product.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="capitalize">{product.category.replace(/-/g, ' ')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {product.deliveryType === 'DELIVERY' ? (
                  <><Truck className="h-4 w-4 text-gray-400" /> Delivery available</>
                ) : product.deliveryType === 'PICKUP' ? (
                  <><RotateCcw className="h-4 w-4 text-gray-400" /> Pickup only</>
                ) : (
                  <><Truck className="h-4 w-4 text-gray-400" /> Delivery &amp; pickup</>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Eye className="h-4 w-4 text-gray-400" />
                {product.views} views
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4 text-gray-400" />
                {formatRelativeDate(product.createdAt)}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* Payment Methods */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Payment methods accepted
              </h3>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <span
                    key={m.id}
                    className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-full"
                  >
                    {m.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-semibold text-gray-900">Reviews</h2>
                {avgRating !== null && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-gray-900">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-500 text-sm">({product._count.reviews})</span>
                  </div>
                )}
              </div>

              {product.reviews.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {product.reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xs font-bold">
                          {review.user.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {review.user.name || 'Anonymous'}
                        </span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                'h-3 w-3',
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-200'
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatRelativeDate(review.createdAt)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 ml-9">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seller Card */}
        <div className="space-y-4">
          <SellerCard store={product.store} productName={product.name} />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <strong>Safety tip:</strong> Meet in a public place for transactions. Never share
            personal financial information.
          </div>
        </div>
      </div>

      {/* Similar Products */}
      {similar.length > 0 && (
        <section className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Similar Products</h2>
          <ProductGrid products={similar} />
        </section>
      )}

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false)
          setReportSuccess(false)
          setReportReason('')
          setReportDescription('')
        }}
        title="Report this listing"
        size="sm"
      >
        {reportSuccess ? (
          <div className="text-center py-4">
            <div className="text-brand-500 text-4xl mb-3">&#10003;</div>
            <p className="font-medium text-gray-900">Report submitted</p>
            <p className="text-sm text-gray-500 mt-1">Our team will review this listing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Select
              label="Reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              options={[
                { value: 'spam', label: 'Spam or misleading' },
                { value: 'prohibited', label: 'Prohibited item' },
                { value: 'fraud', label: 'Suspected fraud' },
                { value: 'wrong_category', label: 'Wrong category' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Select a reason"
              required
            />
            <Textarea
              label="Additional details"
              placeholder="Optional: provide more context"
              value={reportDescription}
              onChange={(e) => setReportDescription(e.target.value)}
              rows={3}
            />
            <Button
              fullWidth
              onClick={handleReport}
              loading={reportSubmitting}
              disabled={!reportReason}
              variant="danger"
            >
              Submit Report
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
