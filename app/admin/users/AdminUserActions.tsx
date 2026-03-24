'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

interface AdminUserActionsProps {
  userId: string
  isBanned: boolean
}

export default function AdminUserActions({ userId, isBanned }: AdminUserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggleBan = async () => {
    setLoading(true)
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: isBanned ? 'unban' : 'ban' }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-end">
      <Button
        variant={isBanned ? 'outline' : 'danger'}
        size="sm"
        onClick={handleToggleBan}
        loading={loading}
      >
        {isBanned ? 'Unban' : 'Ban'}
      </Button>
    </div>
  )
}
