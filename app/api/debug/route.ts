import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [products, stores, subs] = await Promise.all([
      prisma.product.count(),
      prisma.store.findMany({ include: { subscription: true }, take: 10 }),
      prisma.subscription.findMany({ take: 10 }),
    ])
    return NextResponse.json({ ok: true, products, stores, subs })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
