'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface AdminProductActionsProps {
  productId: string
  isApproved: boolean
}

export default function AdminProductActions({ productId, isApproved }: AdminProductActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-end gap-2">
      {!isApproved ? (
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleAction('approve')}
          loading={loading}
        >
          Approve
        </Button>
      ) : (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleAction('reject')}
          loading={loading}
        >
          Reject
        </Button>
      )}
    </div>
  )
}
