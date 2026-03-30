import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    await prisma.subscription.updateMany({
      where: { storeId: 'cmn4ekcht0001jv04ao93oipp' },
      data: {
        status: 'ACTIVE',
        plan: 'PREMIUM',
        endDate: new Date('2099-12-31'),
      },
    })
    const count = await prisma.product.count({
      where: {
        isActive: true,
        store: { subscription: { status: 'ACTIVE' } },
      },
    })
    return NextResponse.json({ ok: true, fixed: true, plan: 'PREMIUM', visibleProducts: count })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
