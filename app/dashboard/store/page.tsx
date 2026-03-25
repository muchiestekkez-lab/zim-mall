'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Camera, Loader2 } from 'lucide-react'
import { storeSchema, type StoreInput } from '@/lib/validations'
import { ZIMBABWE_LOCATIONS, getInitials } from '@/lib/utils'
import { Input, Textarea, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { LoadingPage } from '@/components/ui/Spinner'

export default function StoreSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [store, setStore] = useState<any>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const [banner, setBanner] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<StoreInput>({
    resolver: zodResolver(storeSchema),
  })

  useEffect(() => {
    async function fetchStore() {
      try {
        const res = await fetch('/api/stores/me')
        if (res.ok) {
          const data = await res.json()
          // Gate: redirect if no active subscription
          const sub = data.store?.subscription
          const hasActiveSub = sub?.status === 'ACTIVE' &&
            (!sub.endDate || new Date(sub.endDate) > new Date())
          if (data.store && !hasActiveSub) {
            router.replace('/dashboard/subscription')
            return
          }
          setStore(data.store)
          setLogo(data.store?.logo || null)
          setBanner(data.store?.banner || null)
          if (data.store) {
            reset({
              name: data.store.name,
              description: data.store.description || '',
              whatsapp: data.store.whatsapp || '',
              phone: data.store.phone || '',
              location: data.store.location || '',
            })
          }
        }
      } finally {
        setLoading(false)
      }
    }
    fetchStore()
  }, [reset, router])

  const handleImageUpload = async (
    file: File,
    type: 'logo' | 'banner'
  ) => {
    const setter = type === 'logo' ? setUploadingLogo : setUploadingBanner
    setter(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', `stores/${type}s`)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()

      if (type === 'logo') setLogo(data.url)
      else setBanner(data.url)
    } catch {
      setSubmitError('Image upload failed. Please try again.')
    } finally {
      setter(false)
    }
  }

  const onSubmit = async (data: StoreInput) => {
    setSubmitError(null)
    setSuccess(false)

    try {
      const payload = { ...data, logo, banner }
      const url = store ? `/api/stores/${store.id}` : '/api/stores'
      const method = store ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save store')
      }

      const result = await res.json()
      setStore(result.store)
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (loading) return <LoadingPage />

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">
          {store ? 'Store Settings' : 'Create Your Store'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {store
            ? 'Update your store information visible to buyers.'
            : 'Set up your store to start selling on ZIM MALL.'}
        </p>
      </div>

      {submitError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Store saved successfully!
        </div>
      )}

      {/* Banner */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Store Banner</label>
        <div className="relative h-32 bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-brand-400 transition-colors">
          {banner ? (
            <Image src={banner} alt="Store banner" fill className="object-cover" sizes="600px" />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Click to upload banner (recommended: 1920x480)
            </div>
          )}
          <label className="absolute inset-0 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
              disabled={uploadingBanner}
            />
          </label>
          {uploadingBanner && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
            </div>
          )}
        </div>
      </div>

      {/* Logo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            {logo ? (
              <Image src={logo} alt="Store logo" fill className="object-cover" sizes="80px" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs font-medium">
                {store?.name ? getInitials(store.name) : 'LOGO'}
              </div>
            )}
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
              disabled={uploadingLogo}
            />
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors cursor-pointer">
              {uploadingLogo ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              Upload Logo
            </div>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Store Name"
          placeholder="e.g. Tech City Zimbabwe"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <Textarea
          label="Description"
          placeholder="Tell customers what you sell and what makes your store special..."
          rows={4}
          error={errors.description?.message}
          required
          {...register('description')}
        />

        <Select
          label="Location"
          options={ZIMBABWE_LOCATIONS.map((l) => ({ value: l, label: l }))}
          placeholder="Select your city"
          error={errors.location?.message}
          required
          {...register('location')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="WhatsApp Number"
            type="tel"
            placeholder="+263771234567"
            hint="Customers will contact you here"
            error={errors.whatsapp?.message}
            {...register('whatsapp')}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+263771234567"
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" loading={isSubmitting} size="lg">
            {store ? 'Save Changes' : 'Create Store'}
          </Button>
        </div>
      </form>
    </div>
  )
}
