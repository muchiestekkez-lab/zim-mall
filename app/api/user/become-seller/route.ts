import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Already a seller
    if (session.user.role === 'SELLER' || session.user.role === 'ADMIN') {
      return NextResponse.json({ error: 'Already a seller' }, { status: 400 })
    }

    const body = await req.json()
    const { name, description, location, whatsapp, phone } = body

    if (!name || !location) {
      return NextResponse.json({ error: 'Store name and location are required' }, { status: 400 })
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 60)

    // Check slug uniqueness
    const existing = await prisma.store.findUnique({ where: { slug } })
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug

    // Upgrade role + create store in one transaction
    const [, store] = await prisma.$transaction([
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

    return NextResponse.json({ success: true, storeId: store.id })
  } catch (error) {
    console.error('Become seller error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
