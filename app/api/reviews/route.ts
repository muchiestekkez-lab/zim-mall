import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { reviewSchema } from '@/lib/validations'
import { moderateReview } from '@/lib/moderation'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      )
    }

    const { rating, comment, storeId, productId } = parsed.data

    if (!storeId && !productId) {
      return NextResponse.json(
        { error: 'Either storeId or productId is required' },
        { status: 400 }
      )
    }

    if (comment) {
      const modResult = moderateReview(comment)
      if (!modResult.safe) {
        return NextResponse.json(
          { error: modResult.reason || 'Review contains inappropriate content' },
          { status: 400 }
        )
      }
    }

    // Check if user already reviewed this product/store
    const existing = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        ...(storeId && { storeId }),
        ...(productId && { productId }),
      },
    })

    if (existing) {
      // Update existing review
      const review = await prisma.review.update({
        where: { id: existing.id },
        data: { rating, comment: comment || null },
      })
      return NextResponse.json({ review })
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment || null,
        userId: session.user.id,
        storeId: storeId || null,
        productId: productId || null,
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error('Review POST error:', error)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
