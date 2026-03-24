import { Paynow } from 'paynow'

const paynow = new Paynow(
  process.env.PAYNOW_INTEGRATION_ID!,
  process.env.PAYNOW_INTEGRATION_KEY!
)

paynow.resultUrl = process.env.PAYNOW_RESULT_URL || 'http://localhost:3000/api/subscription/verify'
paynow.returnUrl = process.env.PAYNOW_RETURN_URL || 'http://localhost:3000/dashboard/subscription'

export interface PaynowPaymentResult {
  success: boolean
  redirectUrl?: string
  pollUrl?: string
  error?: string
}

export interface PaynowPollResult {
  paid: boolean
  reference?: string
  amount?: number
  status?: string
  error?: string
}

export async function createPayment(
  email: string,
  amount: number,
  reference: string,
  description: string
): Promise<PaynowPaymentResult> {
  try {
    const payment = paynow.createPayment(reference, email)
    payment.add(description, amount)

    const response = await paynow.send(payment)

    if (response.success) {
      return {
        success: true,
        redirectUrl: response.redirectUrl,
        pollUrl: response.pollUrl,
      }
    } else {
      return {
        success: false,
        error: response.error || 'Payment initiation failed',
      }
    }
  } catch (error) {
    console.error('Paynow createPayment error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Payment error occurred',
    }
  }
}

export async function pollPayment(pollUrl: string): Promise<PaynowPollResult> {
  try {
    const status = await paynow.pollTransaction(pollUrl)

    if (status.paid()) {
      return {
        paid: true,
        reference: status.reference,
        amount: parseFloat(status.amount),
        status: status.status,
      }
    }

    return {
      paid: false,
      status: status.status,
    }
  } catch (error) {
    console.error('Paynow pollPayment error:', error)
    return {
      paid: false,
      error: error instanceof Error ? error.message : 'Poll error occurred',
    }
  }
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
    products: -1, // unlimited
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

export default paynow
