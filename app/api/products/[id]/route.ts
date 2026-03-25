import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations'
import { moderateProductListing } from '@/lib/moderation'
import { generateUniqueSlug } from '@/lib/utils'
import { cookies } from 'next/headers'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, context: Params) {
  const { id } = await context.params
  try {
    const [product, session] = await Promise.all([
      prisma.product.findUnique({
        where: { id: id },
        include: {
          store: {
            include: {
              subscription: { select: { plan: true, status: true } },
              reviews: { select: { rating: true } },
              _count: { select: { products: true, reviews: true } },
            },
          },
          reviews: {
            include: {
              user: { select: { name: true, image: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
          _count: { select: { reviews: true } },
        },
      }),
      auth(),
    ])

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Only count views from real visitors:
    // - Skip if the viewer is the seller who owns this product
    // - Skip if the same visitor already viewed this product in the last hour (cookie)
    const isOwner = session?.user?.id && product.store.sellerId === session.user.id
    const cookieStore = await cookies()
    const viewedKey = `viewed_${id}`
    const alreadyViewed = cookieStore.get(viewedKey)

    if (!isOwner && !alreadyViewed) {
      await prisma.product.update({
        where: { id: id },
        data: { views: { increment: 1 } },
      })
    }

    // Get similar products
    const similar = await prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
        isActive: true,
        isApproved: true,
        store: { isActive: true, subscription: { status: 'ACTIVE' } },
      },
      include: {
        store: { select: { id: true, name: true, isVerified: true, slug: true } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
      take: 4,
    })

    const response = NextResponse.json({ product, similar })

    // Set a 1-hour cookie so repeated visits don't count
    if (!isOwner && !alreadyViewed) {
      response.cookies.set(`viewed_${id}`, '1', {
        maxAge: 60 * 60, // 1 hour
        httpOnly: true,
        sameSite: 'lax',
      })
    }

    return response
  } catch (error) {
    console.error('Product GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
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
    const parsed = productSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const store = await prisma.store.findUnique({
      where: { sellerId: session.user.id },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const existing = await prisma.product.findFirst({
      where: { id: id, storeId: store.id },
    })

    if (!existing && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Moderate content
    const modResult = moderateProductListing(
      parsed.data.name,
      parsed.data.description,
      parsed.data.category
    )

    if (!modResult.safe) {
      return NextResponse.json(
        { error: modResult.reason || 'Content violates community guidelines' },
        { status: 400 }
      )
    }

    const product = await prisma.product.update({
      where: { id: id },
      data: {
        ...parsed.data,
        slug: generateUniqueSlug(parsed.data.name),
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product PUT error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: Params) {
  const { id } = await context.params
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const store = await prisma.store.findUnique({
      where: { sellerId: session.user.id },
    })

    const product = await prisma.product.findFirst({
      where: {
        id: id,
        ...(session.user.role !== 'ADMIN' && store ? { storeId: store.id } : {}),
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    await prisma.product.delete({ where: { id: id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Product DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
