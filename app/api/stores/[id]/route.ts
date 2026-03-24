import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { storeSchema } from '@/lib/validations'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, context: Params) {
  const { id } = await context.params
  try {
    const store = await prisma.store.findFirst({
      where: { OR: [{ id: id }, { slug: id }] },
      include: {
        subscription: true,
        _count: { select: { products: true, reviews: true } },
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    return NextResponse.json({ store })
  } catch (error) {
    console.error('Store GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 })
  }
}

export async function PUT(req: Request, context: Params) {
  const { id } = await context.params
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = storeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const store = await prisma.store.findUnique({ where: { id: id } })

    if (!store || (store.sellerId !== session.user.id && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updated = await prisma.store.update({
      where: { id: id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        whatsapp: parsed.data.whatsapp || null,
        phone: parsed.data.phone || null,
        location: parsed.data.location,
        logo: (body.logo as string) || store.logo,
        banner: (body.banner as string) || store.banner,
      },
    })

    return NextResponse.json({ store: updated })
  } catch (error) {
    console.error('Store PUT error:', error)
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 })
  }
}
