import { cn } from '@/lib/utils'
import { CheckCircle, Star, Zap, Shield } from 'lucide-react'

type BadgeVariant =
  | 'verified'
  | 'new-seller'
  | 'starter'
  | 'business'
  | 'premium'
  | 'active'
  | 'expired'
  | 'pending'
  | 'featured'
  | 'used'
  | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children?: React.ReactNode
  className?: string
}

const variantConfig: Record<
  BadgeVariant,
  { classes: string; icon?: React.ReactNode; defaultLabel?: string }
> = {
  verified: {
    classes: 'bg-brand-50 text-brand-700 border border-brand-200',
    icon: <CheckCircle className="h-3 w-3" />,
    defaultLabel: 'Verified',
  },
  'new-seller': {
    classes: 'bg-blue-50 text-blue-700 border border-blue-200',
    defaultLabel: 'New Seller',
  },
  starter: {
    classes: 'bg-gray-100 text-gray-700 border border-gray-200',
    defaultLabel: 'Starter',
  },
  business: {
    classes: 'bg-purple-50 text-purple-700 border border-purple-200',
    icon: <Zap className="h-3 w-3" />,
    defaultLabel: 'Business',
  },
  premium: {
    classes: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    icon: <Star className="h-3 w-3 fill-yellow-500" />,
    defaultLabel: 'Premium',
  },
  active: {
    classes: 'bg-green-50 text-green-700 border border-green-200',
    defaultLabel: 'Active',
  },
  expired: {
    classes: 'bg-red-50 text-red-700 border border-red-200',
    defaultLabel: 'Expired',
  },
  pending: {
    classes: 'bg-orange-50 text-orange-700 border border-orange-200',
    defaultLabel: 'Pending',
  },
  featured: {
    classes: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    icon: <Star className="h-3 w-3 fill-yellow-500" />,
    defaultLabel: 'Featured',
  },
  used: {
    classes: 'bg-gray-100 text-gray-600 border border-gray-200',
    defaultLabel: 'Used',
  },
  default: {
    classes: 'bg-gray-100 text-gray-700 border border-gray-200',
  },
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  const config = variantConfig[variant]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
        config.classes,
        className
      )}
    >
      {config.icon}
      {children ?? config.defaultLabel}
    </span>
  )
}

export function VerifiedBadge({ className }: { className?: string }) {
  return <Badge variant="verified" className={className} />
}

export function PlanBadge({
  plan,
  className,
}: {
  plan: 'STARTER' | 'BUSINESS' | 'PREMIUM'
  className?: string
}) {
  const variantMap = {
    STARTER: 'starter',
    BUSINESS: 'business',
    PREMIUM: 'premium',
  } as const

  return <Badge variant={variantMap[plan]} className={className} />
}

export default Badge
