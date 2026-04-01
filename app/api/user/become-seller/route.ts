import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const FREE_PROMO_LIMIT = 30

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role === 'SELLER' || session.user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Already a seller' }, { status: 400 })
    }

    const body = await req.json()
    const { name, description, location, whatsapp, phone } = body

    if (!name || !location) {
      return NextResponse.json({ error: 'Store name and location are required' }, { status: 400 })
    }

    // Count how many sellers have already received the free promo
    const promoUsed = await prisma.subscription.count({
      where: { paypalOrderId: 'FREE_PROMO_BUSINESS' },
    })

    const qualifiesForFreePromo = promoUsed < FREE_PROMO_LIMIT

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)

    const existing = await prisma.store.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    if (qualifiesForFreePromo) {
      // Upgrade role + create store + grant free Starter subscription — all in one transaction
      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { role: 'SELLER' },
        }),
        prisma.store.create({
          data: {
            sellerId: session.user.id,
            name,
            slug: finalSlug,
            description: description || '',
            location,
            whatsapp: whatsapp || null,
            phone: phone || null,
            isActive: true,
            subscription: {
              create: {
                plan: 'BUSINESS',
                status: 'ACTIVE',
                amount: 0,
                startDate,
                endDate,
                paypalOrderId: 'FREE_PROMO_BUSINESS',
              },
            },
          },
        }),
      ])

      return NextResponse.json({
        success: true,
        freePromo: true,
        promoNumber: promoUsed + 1,
        message: `You are one of our first ${FREE_PROMO_LIMIT} sellers! Enjoy 1 month FREE Business plan on us. Thank you for being an early supporter of ZIM MALL!`,
      })
    }

    // Regular signup — no free promo
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { role: 'SELLER' },
      }),
      prisma.store.create({
        data: {
          sellerId: session.user.id,
          name,
          slug: finalSlug,
          description: description || '',
          location,
          whatsapp: whatsapp || null,
          phone: phone || null,
          isActive: false,
        },
      }),
    ])

    return NextResponse.json({ success: true, freePromo: false })
  } catch (error) {
    console.error('Become seller error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
