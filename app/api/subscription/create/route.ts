import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPayment, SUBSCRIPTION_PLANS } from '@/lib/paynow'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { plan, storeId } = body

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
    const reference = `ZMMALL-${store.id.slice(0, 8).toUpperCase()}-${Date.now()}`

    const paymentResult = await createPayment(
      session.user.email!,
      planConfig.price,
      reference,
      `ZIM MALL ${planConfig.name} Plan - 1 Month`
    )

    if (!paymentResult.success) {
      return NextResponse.json(
        { error: paymentResult.error || 'Payment initiation failed' },
        { status: 500 }
      )
    }

    // Create/update subscription record with PENDING status
    await prisma.subscription.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        plan: plan as any,
        status: 'PENDING',
        amount: planConfig.price,
        paynowReference: reference,
        paynowPollUrl: paymentResult.pollUrl,
      },
      update: {
        plan: plan as any,
        status: 'PENDING',
        amount: planConfig.price,
        paynowReference: reference,
        paynowPollUrl: paymentResult.pollUrl,
      },
    })

    return NextResponse.json({
      redirectUrl: paymentResult.redirectUrl,
      pollUrl: paymentResult.pollUrl,
      reference,
    })
  } catch (error) {
    console.error('Subscription create error:', error)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
