import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/products/ProductForm'

interface PageProps {
  params: { id: string }
}

export const metadata = { title: 'Edit Product' }

export default async function EditProductPage({ params }: PageProps) {
  const session = await auth()
  if (!session) redirect('/login')

  const store = await prisma.store.findUnique({
    where: { sellerId: session.user.id },
  })

  if (!store) redirect('/dashboard/store')

  const product = await prisma.product.findFirst({
    where: { id: params.id, storeId: store.id },
  })

  if (!product) notFound()

  return (
    <div className="max-w-2xl">
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-500 text-sm mt-1">Update your product listing.</p>
      </div>

      <ProductForm
        storeId={store.id}
        initialData={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          location: product.location,
          deliveryType: product.deliveryType,
          condition: product.condition,
          stock: product.stock,
          images: product.images,
        }}
      />
    </div>
  )
}
