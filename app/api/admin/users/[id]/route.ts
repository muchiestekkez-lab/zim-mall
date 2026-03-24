import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(req: Request, context: Params) {
  const { id } = await context.params
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { action } = body

    if (!['ban', 'unban', 'promote_admin', 'promote_seller', 'demote'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Prevent self-ban
    if (id === session.user.id && action === 'ban') {
      return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 })
    }

    let updateData: any = {}

    if (action === 'ban') updateData.isBanned = true
    else if (action === 'unban') updateData.isBanned = false
    else if (action === 'promote_admin') updateData.role = 'ADMIN'
    else if (action === 'promote_seller') updateData.role = 'SELLER'
    else if (action === 'demote') updateData.role = 'CUSTOMER'

    const user = await prisma.user.update({
      where: { id: id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isBanned: true },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Admin user PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
