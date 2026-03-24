/**
 * PayPal Orders API v2 — server-side helpers
 */

const PAYPAL_BASE =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!
  const secret = process.env.PAYPAL_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${secret}`).toString('base64')

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error_description || 'Failed to get PayPal access token')
  return data.access_token
}

export async function createPayPalOrder(amount: number, description: string): Promise<string> {
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          description,
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
          },
        },
      ],
    }),
    cache: 'no-store',
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to create PayPal order')
  return data.id // orderId
}

export async function capturePayPalOrder(
  orderId: string
): Promise<{ payerId: string; amount: number }> {
  const token = await getAccessToken()

  const res = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  const data = await res.json()
  if (!res.ok || data.status !== 'COMPLETED') {
    throw new Error(data.message || 'PayPal capture failed')
  }

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0]
  const payerId = data.payer?.payer_id ?? ''
  const amount = parseFloat(capture?.amount?.value ?? '0')
  return { payerId, amount }
}

export const SUBSCRIPTION_PLANS = {
  STARTER: {
    name: 'Starter',
    price: 5,
    products: 20,
    features: [
      '20 product listings',
      'Basic store profile',
      'Customer contact via WhatsApp',
      'Standard search placement',
    ],
  },
  BUSINESS: {
    name: 'Business',
    price: 20,
    products: 100,
    features: [
      '100 product listings',
      'Featured listings',
      'Priority search placement',
      'Store analytics',
      'Customer contact via WhatsApp & Phone',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 50,
    products: -1,
    features: [
      'Unlimited product listings',
      'Verified seller badge',
      'Top search placement',
      'Advanced analytics',
      'Dedicated support',
      'Featured on homepage',
    ],
  },
} as const
