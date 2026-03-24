import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: { id: string }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action } = body

    if (!['approve', 'reject', 'feature', 'unfeature'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    let updateData: any = {}

    if (action === 'approve') updateData.isApproved = true
    else if (action === 'reject') updateData.isApproved = false
    else if (action === 'feature') updateData.isFeatured = true
    else if (action === 'unfeature') updateData.isFeatured = false

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Admin product PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}
