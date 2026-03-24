import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { storeSchema } from '@/lib/validations'
import { slugify, generateUniqueSlug } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'SELLER') {
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

    const existing = await prisma.store.findUnique({
      where: { sellerId: session.user.id },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a store' },
        { status: 409 }
      )
    }

    const slug = generateUniqueSlug(parsed.data.name)

    const store = await prisma.store.create({
      data: {
        ...parsed.data,
        slug,
        sellerId: session.user.id,
      },
    })

    return NextResponse.json({ store }, { status: 201 })
  } catch (error) {
    console.error('Store POST error:', error)
    return NextResponse.json({ error: 'Failed to create store' }, { status: 500 })
  }
}
