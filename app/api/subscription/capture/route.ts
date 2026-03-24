import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { capturePayPalOrder } from '@/lib/paypal'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { orderId, storeId } = await req.json()
    if (!orderId || !storeId) {
      return NextResponse.json({ error: 'Missing orderId or storeId' }, { status: 400 })
    }

    const { payerId, amount } = await capturePayPalOrder(orderId)

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    const subscription = await prisma.subscription.update({
      where: { storeId },
      data: {
        status: 'ACTIVE',
        paypalOrderId: orderId,
        paypalPayerId: payerId,
        amount,
        startDate,
        endDate,
      },
    })

    await prisma.store.update({
      where: { id: storeId },
      data: { isActive: true },
    })

    return NextResponse.json({ success: true, plan: subscription.plan })
  } catch (error) {
    console.error('Subscription capture error:', error)
    return NextResponse.json({ error: 'Payment capture failed' }, { status: 500 })
  }
}
