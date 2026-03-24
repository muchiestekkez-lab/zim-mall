import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPayPalOrder, SUBSCRIPTION_PLANS } from '@/lib/paypal'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan, storeId } = await req.json()

    if (!['STARTER', 'BUSINESS', 'PREMIUM'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const store = await prisma.store.findFirst({
      where: { id: storeId, sellerId: session.user.id },
    })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]
    const orderId = await createPayPalOrder(
      planConfig.price,
      `ZIM MALL ${planConfig.name} Plan - 1 Month`
    )

    await prisma.subscription.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        plan: plan as any,
        status: 'PENDING',
        amount: planConfig.price,
        paypalOrderId: orderId,
      },
      update: {
        plan: plan as any,
        status: 'PENDING',
        amount: planConfig.price,
        paypalOrderId: orderId,
        paypalPayerId: null,
      },
    })

    return NextResponse.json({ orderId })
  } catch (error) {
    console.error('Subscription create error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
