'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Store, CheckCircle } from 'lucide-react'
import { Input, Textarea, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ZIMBABWE_LOCATIONS } from '@/lib/utils'

export default function BecomeSellerPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Not logged in
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/become-seller')
    return null
  }

  // Already a seller
  if (session?.user?.role === 'SELLER' || session?.user?.role === 'ADMIN') {
    router.push('/dashboard')
    return null
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/user/become-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, location, whatsapp, phone }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }

      // Refresh session so role updates to SELLER
      await update({ role: 'SELLER' })
      router.push('/dashboard/subscription')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Open Your Store</h1>
          <p className="text-gray-500 mt-2">
            Signed in as <span className="font-medium text-gray-700">{session?.user?.email}</span>
          </p>
        </div>

        {/* What you get */}
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-brand-800 mb-2">What happens next:</p>
          <ul className="space-y-1">
            {[
              'Your account is upgraded to Seller',
              'Your store is created instantly',
              'Choose a subscription plan to go live',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-brand-700">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Store Details</h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Store Name"
              placeholder="e.g. Tech City Zimbabwe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Textarea
              label="Description"
              placeholder="Tell customers what you sell..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <Select
              label="Location"
              options={ZIMBABWE_LOCATIONS.map((l) => ({ value: l, label: l }))}
              placeholder="Select your city"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="WhatsApp"
                type="tel"
                placeholder="+263771234567"
                hint="Customers contact you here"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="+263771234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Button type="submit" fullWidth size="lg" loading={loading}>
              Create My Store
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already selling?{' '}
          <Link href="/dashboard" className="text-brand-600 hover:text-brand-500">
            Go to Dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}
