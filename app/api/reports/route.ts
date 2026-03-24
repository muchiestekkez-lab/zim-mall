import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reportSchema } from '@/lib/validations'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = reportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { reason, description, productId, storeId, userId } = parsed.data

    // Rate limit: max 5 reports per user per day
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)

    const recentReports = await prisma.report.count({
      where: {
        reportedBy: session.user.id,
        createdAt: { gte: oneDayAgo },
      },
    })

    if (recentReports >= 5) {
      return NextResponse.json(
        { error: 'Report limit reached. You can submit up to 5 reports per day.' },
        { status: 429 }
      )
    }

    const report = await prisma.report.create({
      data: {
        reason,
        description: description || null,
        reportedBy: session.user.id,
        productId: productId || null,
        storeId: storeId || null,
        userId: userId || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ report }, { status: 201 })
  } catch (error) {
    console.error('Report POST error:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
