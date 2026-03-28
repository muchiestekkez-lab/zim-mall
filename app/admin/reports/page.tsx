import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { Flag } from 'lucide-react'
import AdminReportActions from './AdminReportActions'

export const metadata = { title: 'Reports — Admin' }

export default async function AdminReportsPage() {
  let reports: any[] = []
  try {
    reports = await prisma.report.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        reporter: { select: { name: true, email: true } },
        product: { select: { name: true, id: true } },
      },
      take: 100,
    })
  } catch {
    // DB error — show empty list rather than crashing
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-sm text-gray-500 mt-1">
            {reports.filter((r) => r.status === 'PENDING').length} pending
          </p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Flag className="h-10 w-10 mx-auto mb-3" />
          <p>No reports yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`bg-white border rounded-lg p-4 ${
                report.status === 'PENDING'
                  ? 'border-orange-200 bg-orange-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        report.status === 'PENDING'
                          ? 'bg-orange-100 text-orange-700'
                          : report.status === 'RESOLVED'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {report.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {report.reason.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {report.product && (
                    <p className="text-sm text-gray-600">
                      Product:{' '}
                      <a
                        href={`/products/${report.product.id}`}
                        className="text-brand-600 hover:underline"
                      >
                        {report.product.name}
                      </a>
                    </p>
                  )}

                  {report.description && (
                    <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>
                      By: {report.reporter.name || report.reporter.email}
                    </span>
                    <span>{formatDate(report.createdAt)}</span>
                  </div>
                </div>

                {report.status === 'PENDING' && (
                  <AdminReportActions reportId={report.id} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
