'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SUBSCRIPTION_PLANS } from '@/lib/paypal'
import Button from '../ui/Button'

type PlanKey = 'STARTER' | 'BUSINESS' | 'PREMIUM'

interface PricingCardProps {
  plan: PlanKey
  currentPlan?: PlanKey | null
  onSelect: (plan: PlanKey) => void
  loading?: boolean
}

export function PricingCard({ plan, currentPlan, onSelect, loading }: PricingCardProps) {
  const config = SUBSCRIPTION_PLANS[plan]
  const isCurrentPlan = currentPlan === plan
  const isPremium = plan === 'PREMIUM'
  const isBusiness = plan === 'BUSINESS'

  return (
    <div
      className={cn(
        'relative border-2 rounded-xl p-6 flex flex-col',
        isPremium
          ? 'border-brand-500 shadow-lg'
          : isBusiness
          ? 'border-purple-300'
          : 'border-gray-200',
        isCurrentPlan && 'ring-2 ring-brand-500 ring-offset-2'
      )}
    >
      {/* Popular badge */}
      {isBusiness && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full">
            Popular
          </span>
        </div>
      )}

      {isPremium && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-brand-500 text-white text-xs font-medium px-3 py-1 rounded-full">
            Best Value
          </span>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-gray-900 text-white text-xs font-medium px-3 py-1 rounded-full">
            Current Plan
          </span>
        </div>
      )}

      {/* Plan info */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">{config.name}</h3>
        <div className="mt-2">
          <span className="text-4xl font-bold text-gray-900">${config.price}</span>
          <span className="text-gray-500 ml-1">/month</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {config.products === -1 ? 'Unlimited products' : `Up to ${config.products} products`}
        </p>
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {config.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <Check
              className={cn(
                'h-4 w-4 mt-0.5 flex-shrink-0',
                isPremium ? 'text-brand-500' : isBusiness ? 'text-purple-500' : 'text-gray-500'
              )}
            />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Button
        variant={isCurrentPlan ? 'secondary' : isPremium ? 'primary' : 'outline'}
        fullWidth
        onClick={() => !isCurrentPlan && onSelect(plan)}
        disabled={isCurrentPlan || loading}
        loading={loading}
      >
        {isCurrentPlan ? 'Current Plan' : `Choose ${config.name}`}
      </Button>
    </div>
  )
}

export default PricingCard
