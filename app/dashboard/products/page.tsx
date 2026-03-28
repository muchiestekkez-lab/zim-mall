import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import { Plus, Package, Eye, Pencil } from 'lucide-react'
import EmptyState from '@/components/ui/EmptyState'
import DeleteProductButton from './DeleteProductButton'

export const metadata = { title: 'My Products' }

export default async function ProductsPage() {
  const session = await auth()
  if (!session) redirect('/login')

  let store = null
  try {
    store = await prisma.store.findUnique({
      where: { sellerId: session.user.id },
      include: { subscription: true },
    })
  } catch {
    redirect('/login')
  }

  const hasActiveSub = store?.subscription?.status === 'ACTIVE' &&
    (!store.subscription.endDate || new Date(store.subscription.endDate) > new Date())
  if (store && !hasActiveSub) redirect('/dashboard/subscription')

  if (!store) {
    redirect('/dashboard/store')
  }

  let products: any[] = []
  let subscription = null
  try {
    ;[products, subscription] = await Promise.all([
      prisma.product.findMany({ where: { storeId: store.id }, orderBy: { createdAt: 'desc' } }),
      prisma.subscription.findUnique({ where: { storeId: store.id } }),
    ])
  } catch {
    // DB error — show empty state rather than crashing
  }

  const maxProducts =
    subscription?.plan === 'PREMIUM'
      ? Infinity
      : subscription?.plan === 'BUSINESS'
      ? 100
      : subscription?.plan === 'STARTER'
      ? 20
      : 0

  const hasActiveSubscription =
    subscription?.status === 'ACTIVE' &&
    (!subscription.endDate || new Date(subscription.endDate) > new Date())

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {products.length} listed
            {hasActiveSubscription && maxProducts !== Infinity && (
              <> / {maxProducts} allowed</>
            )}
          </p>
        </div>
        {hasActiveSubscription && (
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to start selling on ZIM MALL."
          icon={<Package className="h-8 w-8" />}
          action={
            hasActiveSubscription
              ? { label: 'Add Your First Product', href: '/dashboard/products/new' }
              : { label: 'Get a Subscription', href: '/dashboard/subscription' }
          }
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">
                  Price
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">
                  Views
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 truncate max-w-[150px]">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-700">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Eye className="h-3.5 w-3.5" />
                      {product.views}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                        product.isActive && product.isApproved
                          ? 'bg-green-50 text-green-700'
                          : product.isApproved === false
                          ? 'bg-red-50 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {!product.isApproved ? 'Rejected' : product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/products/${product.id}`}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
