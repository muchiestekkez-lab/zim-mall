'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function AdminReportActions({ reportId }: { reportId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'reviewed' | 'resolved') => {
    setLoading(true)
    try {
      await fetch(`/api/admin/reports/${reportId}`, {
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
    <div className="flex gap-2 flex-shrink-0">
      <Button variant="secondary" size="sm" onClick={() => handleAction('reviewed')} loading={loading}>
        Review
      </Button>
      <Button variant="primary" size="sm" onClick={() => handleAction('resolved')} loading={loading}>
        Resolve
      </Button>
    </div>
  )
}
