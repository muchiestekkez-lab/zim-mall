'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AlertCircle } from 'lucide-react'
import PricingCard from '@/components/subscription/PricingCard'
import PayPalCheckout from '@/components/subscription/PayPalCheckout'
import { Modal } from '@/components/ui/Modal'
import { LoadingPage } from '@/components/ui/Spinner'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

type PlanKey = 'STARTER' | 'BUSINESS' | 'PREMIUM'

interface SubscriptionData {
  store: { id: string; name: string }
  subscription: {
    plan: PlanKey
    status: string
    startDate: string | null
    endDate: string | null
  } | null
}

export default function SubscriptionPage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null)

  const productLimitError = searchParams.get('error') === 'product_limit'

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/subscription/status')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSuccess = () => {
    setSelectedPlan(null)
    // Reload to get new subscription data
    window.location.reload()
  }

  if (loading) return <LoadingPage />

  const hasActiveSubscription =
    data?.subscription?.status === 'ACTIVE' &&
    data?.subscription?.endDate &&
    new Date(data.subscription.endDate) > new Date()

  return (
    <div>
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
        <p className="text-gray-500 text-sm mt-1">
          Choose a plan to list products and grow your business.
        </p>
      </div>

      {productLimitError && (
        <div className="mb-6 flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Product limit reached</p>
            <p>Upgrade your plan to list more products.</p>
          </div>
        </div>
      )}

      {/* Current Subscription */}
      {data?.subscription && (
        <div className="mb-8 bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Current Plan</h3>
          <div className="flex items-center gap-4 flex-wrap">
            <Badge
              variant={
                data.subscription.plan === 'PREMIUM'
                  ? 'premium'
                  : data.subscription.plan === 'BUSINESS'
                  ? 'business'
                  : 'starter'
              }
            >
              {data.subscription.plan}
            </Badge>
            <Badge variant={hasActiveSubscription ? 'active' : 'expired'}>
              {data.subscription.status}
            </Badge>
            {data.subscription.endDate && (
              <span className="text-sm text-gray-500">
                {hasActiveSubscription ? 'Valid until' : 'Expired on'}{' '}
                {formatDate(data.subscription.endDate)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {(['STARTER', 'BUSINESS', 'PREMIUM'] as PlanKey[]).map((plan) => (
          <PricingCard
            key={plan}
            plan={plan}
            currentPlan={hasActiveSubscription ? data?.subscription?.plan : null}
            onSelect={setSelectedPlan}
          />
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        All plans are monthly subscriptions. Payments are processed securely via PayPal.
        Cancel anytime — your plan stays active until the end of the billing period.
      </p>

      {/* Checkout Modal */}
      <Modal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        title="Complete Your Subscription"
        size="md"
      >
        {selectedPlan && data?.store && (
          <PayPalCheckout
            plan={selectedPlan}
            storeId={data.store.id}
            onSuccess={handleSuccess}
            onCancel={() => setSelectedPlan(null)}
          />
        )}
      </Modal>
    </div>
  )
}
