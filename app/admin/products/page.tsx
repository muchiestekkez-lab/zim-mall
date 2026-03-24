import { prisma } from '@/lib/prisma'
import { formatPrice, formatDate } from '@/lib/utils'
import Image from 'next/image'
import { Package } from 'lucide-react'
import AdminProductActions from './AdminProductActions'

export const metadata = { title: 'Products — Admin' }

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      store: { select: { name: true, id: true } },
    },
    take: 100,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Products ({products.length})</h2>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Store</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
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
                          <div className="flex items-center justify-center h-full text-gray-300">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[150px]">{product.name}</p>
                        <p className="text-xs text-gray-400">{formatDate(product.createdAt)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-600">{product.store.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full w-fit ${
                          product.isApproved
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {product.isApproved ? 'Approved' : 'Rejected'}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full w-fit ${
                          product.isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <AdminProductActions
                      productId={product.id}
                      isApproved={product.isApproved}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
