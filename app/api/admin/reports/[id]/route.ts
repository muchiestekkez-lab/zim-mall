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

    if (!['reviewed', 'resolved'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const statusMap: Record<string, any> = {
      reviewed: 'REVIEWED',
      resolved: 'RESOLVED',
    }

    const report = await prisma.report.update({
      where: { id: params.id },
      data: { status: statusMap[action] },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Admin report PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 })
  }
}
