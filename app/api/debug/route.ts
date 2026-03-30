import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Activate the PENDING subscription so products are visible
    await prisma.subscription.updateMany({
      where: { status: 'PENDING' },
      data: { status: 'ACTIVE' },
    })
    const count = await prisma.product.count({
      where: {
        isActive: true,
        store: { subscription: { status: 'ACTIVE' } },
      },
    })
    return NextResponse.json({ ok: true, fixed: true, visibleProducts: count })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
