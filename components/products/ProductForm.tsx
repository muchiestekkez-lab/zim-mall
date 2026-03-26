'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { X, Upload, Loader2 } from 'lucide-react'
import { productSchema, type ProductInput } from '@/lib/validations'
import { CATEGORIES, ZIMBABWE_LOCATIONS, PAYMENT_METHODS } from '@/lib/utils'
import { Input, Textarea, Select } from '../ui/Input'
import Button from '../ui/Button'

interface ProductFormProps {
  initialData?: Partial<ProductInput> & { id?: string }
  storeId: string
}

export function ProductForm({ initialData, storeId }: ProductFormProps) {
  const router = useRouter()
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [uploading, setUploading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const isEditing = !!initialData?.id

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || undefined,
      category: initialData?.category || '',
      location: initialData?.location || '',
      deliveryType: initialData?.deliveryType || 'BOTH',
      condition: initialData?.condition || 'NEW',
      stock: initialData?.stock ?? 1,
      images: initialData?.images || [],
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > 8) {
      setSubmitError('Maximum 8 images allowed')
      return
    }

    setUploading(true)
    setSubmitError(null)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'products')

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await res.json()
        return data.url as string
      })

      const urls = await Promise.all(uploadPromises)
      const newImages = [...images, ...urls]
      setImages(newImages)
      setValue('images', newImages, { shouldValidate: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    setValue('images', newImages, { shouldValidate: true })
  }

  const onSubmit = async (data: ProductInput) => {
    setSubmitError(null)

    try {
      const url = isEditing
        ? `/api/products/${initialData!.id}`
        : '/api/products'
      const method = isEditing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, storeId }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save product')
      }

      router.push('/dashboard/products')
      router.refresh()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {submitError}
        </div>
      )}

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images <span className="text-red-500">*</span>
          <span className="text-gray-400 font-normal ml-1">({images.length}/8)</span>
        </label>

        <div className="grid grid-cols-4 gap-3 mb-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
            >
              <Image
                src={url}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
                sizes="100px"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-white/90 hover:bg-white rounded-full p-0.5 shadow text-gray-600 hover:text-red-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 bg-brand-500 text-white text-xs px-1.5 py-0.5 rounded">
                  Main
                </span>
              )}
            </div>
          ))}

          {images.length < 8 && (
            <label
              className={`aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${uploading ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300 hover:border-brand-400 hover:bg-brand-50'}`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              ) : (
                <>
                  <Upload className="h-5 w-5 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Add Photo</span>
                </>
              )}
            </label>
          )}
        </div>

        {errors.images && (
          <p className="text-sm text-red-600">{errors.images.message}</p>
        )}
      </div>

      {/* Name */}
      <Input
        label="Product Name"
        placeholder="e.g. Samsung Galaxy S24 Ultra - 256GB"
        error={errors.name?.message}
        required
        {...register('name')}
      />

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="Describe your product in detail — condition, features, what's included, etc."
        rows={5}
        error={errors.description?.message}
        required
        {...register('description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Price */}
        <Input
          label="Price (USD)"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          error={errors.price?.message}
          required
          {...register('price', { valueAsNumber: true })}
        />

        {/* Stock */}
        <Input
          label="Stock Quantity"
          type="number"
          min="0"
          placeholder="1"
          error={errors.stock?.message}
          {...register('stock', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <Select
          label="Category"
          placeholder="Select a category"
          options={CATEGORIES.map((c) => ({ value: c.slug, label: c.name }))}
          error={errors.category?.message}
          required
          {...register('category')}
        />

        {/* Location */}
        <Select
          label="Location"
          placeholder="Select location"
          options={ZIMBABWE_LOCATIONS.map((l) => ({ value: l, label: l }))}
          error={errors.location?.message}
          required
          {...register('location')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Condition */}
        <Select
          label="Condition"
          options={[
            { value: 'NEW', label: 'New' },
            { value: 'USED', label: 'Used' },
          ]}
          error={errors.condition?.message}
          required
          {...register('condition')}
        />

        {/* Delivery */}
        <Select
          label="Delivery Type"
          options={[
            { value: 'BOTH', label: 'Pick Up & Delivery for a Fee' },
            { value: 'DELIVERY', label: 'Delivery for a Fee' },
            { value: 'PICKUP', label: 'Pick Up Only' },
          ]}
          error={errors.deliveryType?.message}
          required
          {...register('deliveryType')}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'List Product'}
        </Button>
      </div>
    </form>
  )
}

export default ProductForm
