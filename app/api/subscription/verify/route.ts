import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { pollPayment } from '@/lib/paynow'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { pollUrl, storeId, plan } = body

    if (!pollUrl || !storeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const pollResult = await pollPayment(pollUrl)

    if (pollResult.paid) {
      // Activate subscription
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)

      await prisma.subscription.upsert({
        where: { storeId },
        create: {
          storeId,
          plan: plan || 'STARTER',
          status: 'ACTIVE',
          amount: pollResult.amount || 0,
          startDate,
          endDate,
        },
        update: {
          status: 'ACTIVE',
          plan: plan || 'STARTER',
          amount: pollResult.amount || 0,
          startDate,
          endDate,
        },
      })

      return NextResponse.json({ paid: true, status: 'ACTIVE' })
    }

    return NextResponse.json({
      paid: false,
      status: pollResult.status || 'PENDING',
      error: pollResult.error,
    })
  } catch (error) {
    console.error('Subscription verify error:', error)
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 })
  }
}

// Paynow result URL callback (GET)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const reference = searchParams.get('reference')
    const status = searchParams.get('status')
    const pollUrl = searchParams.get('pollurl')

    if (reference && pollUrl) {
      const subscription = await prisma.subscription.findFirst({
        where: { paynowReference: reference },
      })

      if (subscription && status === 'Paid') {
        const startDate = new Date()
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + 1)

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'ACTIVE', startDate, endDate },
        })
      }
    }

    return NextResponse.redirect(
      new URL('/dashboard/subscription', process.env.NEXTAUTH_URL || 'http://localhost:3000')
    )
  } catch (error) {
    console.error('Subscription verify GET error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/subscription', process.env.NEXTAUTH_URL || 'http://localhost:3000')
    )
  }
}
