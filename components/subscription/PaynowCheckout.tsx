'use client'

import { useState } from 'react'
import { ExternalLink, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import Button from '../ui/Button'
import { SUBSCRIPTION_PLANS } from '@/lib/paynow'

type PlanKey = 'STARTER' | 'BUSINESS' | 'PREMIUM'

interface PaynowCheckoutProps {
  plan: PlanKey
  storeId: string
  onSuccess?: () => void
  onCancel?: () => void
}

type CheckoutState = 'idle' | 'creating' | 'redirecting' | 'polling' | 'success' | 'failed'

export function PaynowCheckout({ plan, storeId, onSuccess, onCancel }: PaynowCheckoutProps) {
  const [state, setState] = useState<CheckoutState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [pollUrl, setPollUrl] = useState<string | null>(null)
  const planConfig = SUBSCRIPTION_PLANS[plan]

  const handlePayNow = async () => {
    setState('creating')
    setError(null)

    try {
      const res = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, storeId }),
      })

      const data = await res.json()

      if (!res.ok || !data.redirectUrl) {
        throw new Error(data.error || 'Failed to create payment')
      }

      setPollUrl(data.pollUrl)
      setState('redirecting')

      // Open Paynow in new tab
      window.open(data.redirectUrl, '_blank', 'noopener,noreferrer')

      // Start polling after short delay
      setTimeout(() => {
        setState('polling')
        startPolling(data.pollUrl)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment setup failed')
      setState('failed')
    }
  }

  const startPolling = async (url: string) => {
    let attempts = 0
    const maxAttempts = 20 // 2 minutes

    const poll = async () => {
      attempts++

      try {
        const res = await fetch('/api/subscription/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pollUrl: url, storeId, plan }),
        })

        const data = await res.json()

        if (data.paid) {
          setState('success')
          onSuccess?.()
          return
        }

        if (attempts < maxAttempts && data.status !== 'cancelled') {
          setTimeout(poll, 6000) // Poll every 6 seconds
        } else {
          setState('idle')
        }
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(poll, 6000)
        } else {
          setState('idle')
        }
      }
    }

    poll()
  }

  const handleManualCheck = async () => {
    if (!pollUrl) return
    setState('polling')

    try {
      const res = await fetch('/api/subscription/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollUrl, storeId, plan }),
      })

      const data = await res.json()

      if (data.paid) {
        setState('success')
        onSuccess?.()
      } else {
        setState('redirecting')
        setError('Payment not yet confirmed. Please complete payment on Paynow.')
      }
    } catch {
      setState('redirecting')
      setError('Could not check payment status. Please try again.')
    }
  }

  if (state === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-brand-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Confirmed!</h3>
        <p className="text-sm text-gray-500">
          Your {planConfig.name} plan is now active. You can start listing products.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Order Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            ZIM MALL {planConfig.name} Plan — 1 month
          </span>
          <span className="font-semibold">${planConfig.price}.00</span>
        </div>
        <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between font-medium">
          <span>Total (USD)</span>
          <span className="text-lg">${planConfig.price}.00</span>
        </div>
      </div>

      {/* Paynow Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Payment processed securely via Paynow Zimbabwe.</p>
        <p>Accepted: EcoCash, Mukuru, ZimSwitch, Bank Transfer.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Actions */}
      {state === 'idle' || state === 'failed' || state === 'creating' ? (
        <div className="flex gap-3">
          {onCancel && (
            <Button variant="secondary" onClick={onCancel} fullWidth>
              Cancel
            </Button>
          )}
          <Button onClick={handlePayNow} loading={state === 'creating'} fullWidth>
            Pay ${planConfig.price} via Paynow
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ) : state === 'redirecting' ? (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
            Paynow payment page opened in a new tab. Complete your payment there, then click
            below to confirm.
          </div>
          <Button onClick={handleManualCheck} fullWidth>
            I&apos;ve Completed Payment
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 text-gray-500 py-4">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-sm">Checking payment status...</span>
        </div>
      )}
    </div>
  )
}

export default PaynowCheckout
