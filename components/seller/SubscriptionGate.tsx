import Link from 'next/link'
import { Lock, ArrowRight } from 'lucide-react'
import Button from '../ui/Button'

interface SubscriptionGateProps {
  hasActiveSubscription: boolean
  children: React.ReactNode
  feature?: string
}

export function SubscriptionGate({
  hasActiveSubscription,
  children,
  feature,
}: SubscriptionGateProps) {
  if (hasActiveSubscription) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none select-none blur-sm opacity-50">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg">
        <div className="text-center p-6 max-w-sm">
          <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-brand-500" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Subscription Required</h3>
          <p className="text-sm text-gray-500 mb-4">
            {feature
              ? `You need an active subscription to access ${feature}.`
              : 'You need an active subscription to access this feature.'}
          </p>
          <Link href="/dashboard/subscription">
            <Button>
              View Plans
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

interface NoSubscriptionBannerProps {
  className?: string
}

export function NoSubscriptionBanner({ className }: NoSubscriptionBannerProps) {
  return (
    <div
      className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Lock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-yellow-800">No active subscription</p>
          <p className="text-xs text-yellow-700 mt-0.5">
            Subscribe to list products and grow your business on ZIM MALL.
          </p>
        </div>
      </div>
      <Link href="/dashboard/subscription" className="flex-shrink-0">
        <Button size="sm">
          Subscribe Now
        </Button>
      </Link>
    </div>
  )
}

export default SubscriptionGate
