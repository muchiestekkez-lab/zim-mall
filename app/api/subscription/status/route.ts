import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const store = await prisma.store.findUnique({
      where: { sellerId: session.user.id },
      select: { id: true, name: true },
    })

    if (!store) {
      return NextResponse.json({ store: null, subscription: null })
    }

    const subscription = await prisma.subscription.findUnique({
      where: { storeId: store.id },
      select: { plan: true, status: true, startDate: true, endDate: true, amount: true },
    })

    return NextResponse.json({ store, subscription })
  } catch (error) {
    console.error('Subscription status error:', error)
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  }
}
