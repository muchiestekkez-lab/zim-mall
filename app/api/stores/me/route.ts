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
      include: {
        subscription: true,
        _count: { select: { products: true } },
      },
    })

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Store ME error:', error)
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 })
  }
}
