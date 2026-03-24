'use client'

import { useState } from 'react'
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/paypal'

type PlanKey = 'STARTER' | 'BUSINESS' | 'PREMIUM'

interface PayPalCheckoutProps {
  plan: PlanKey
  storeId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function PayPalCheckout({ plan, storeId, onSuccess, onCancel }: PayPalCheckoutProps) {
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const planConfig = SUBSCRIPTION_PLANS[plan]

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
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
          <span className="text-gray-600">ZIM MALL {planConfig.name} Plan — 1 month</span>
          <span className="font-semibold">${planConfig.price}.00</span>
        </div>
        <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between font-medium">
          <span>Total (USD)</span>
          <span className="text-lg">${planConfig.price}.00</span>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Payment processed securely via PayPal. Pay with your PayPal account or any credit/debit card.
      </p>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
          currency: 'USD',
          intent: 'capture',
        }}
      >
        <PayPalButtons
          style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
          createOrder={async () => {
            setError(null)
            const res = await fetch('/api/subscription/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ plan, storeId }),
            })
            const data = await res.json()
            if (!res.ok || !data.orderId) {
              throw new Error(data.error || 'Failed to create order')
            }
            return data.orderId
          }}
          onApprove={async (data) => {
            const res = await fetch('/api/subscription/capture', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: data.orderID, storeId }),
            })
            const result = await res.json()
            if (!res.ok || !result.success) {
              setError(result.error || 'Payment capture failed. Please contact support.')
              return
            }
            setSuccess(true)
            onSuccess?.()
          }}
          onCancel={() => {
            setError('Payment was cancelled.')
            onCancel?.()
          }}
          onError={(err) => {
            console.error('PayPal error:', err)
            setError('PayPal encountered an error. Please try again.')
          }}
        />
      </PayPalScriptProvider>
    </div>
  )
}

export default PayPalCheckout
