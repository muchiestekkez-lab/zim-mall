import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations'
import { moderateProductListing } from '@/lib/moderation'
import { generateUniqueSlug } from '@/lib/utils'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const deliveryType = searchParams.get('deliveryType')
    const condition = searchParams.get('condition')
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '24')
    const skip = (page - 1) * limit

    const where: any = {
      isActive: true,
      isApproved: true,
      store: { isActive: true, subscription: { status: 'ACTIVE' } },
    }

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (category) where.category = category
    if (location) where.location = location
    if (deliveryType) where.deliveryType = deliveryType
    if (condition) where.condition = condition
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    const orderBy: any =
      sort === 'price_asc' ? { price: 'asc' }
      : sort === 'price_desc' ? { price: 'desc' }
      : sort === 'popular' ? { views: 'desc' }
      : { createdAt: 'desc' }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          store: { select: { id: true, name: true, isVerified: true, slug: true } },
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      page,
    })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'SELLER') {
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
      include: {
        subscription: true,
        _count: { select: { products: true } },
      },
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const hasActiveSubscription =
      store.subscription?.status === 'ACTIVE' &&
      (!store.subscription.endDate || new Date(store.subscription.endDate) > new Date())

    if (!hasActiveSubscription) {
      return NextResponse.json(
        { error: 'Active subscription required to list products' },
        { status: 403 }
      )
    }

    const maxProducts =
      store.subscription?.plan === 'PREMIUM'
        ? Infinity
        : store.subscription?.plan === 'BUSINESS'
        ? 100
        : 20

    if (store._count.products >= maxProducts) {
      return NextResponse.json(
        { error: `Product limit reached for your ${store.subscription?.plan} plan` },
        { status: 403 }
      )
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

    const slug = generateUniqueSlug(parsed.data.name)

    const product = await prisma.product.create({
      data: {
        ...parsed.data,
        slug,
        storeId: store.id,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Products POST error:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
