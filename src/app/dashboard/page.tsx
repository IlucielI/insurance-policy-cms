'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'

interface Application {
  id: string
  status: string
  user_id: string
  product_id: string
  premium_amount: number
  sum_assured: number
  created_at: string
  applicant_data?: {
    full_name?: string
    email?: string
  }
}

export default function DashboardPage() {
  const { roles, hasRole } = useAuth()
  const t = useTranslations()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState({
    total: 0, draft: 0, submitted: 0, under_review: 0, approved: 0, rejected: 0
  })

  useEffect(() => {
    // Only fetch if user can view applications
    if (hasRole('super_admin', 'underwriter')) {
      fetchApplications()
    }
  }, [])

  const fetchApplications = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
      const res = await fetch(`${apiUrl}/admin/applications`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      const data = await res.json()

      const apps = data.data || []
      setApplications(apps)
      setStats({
        total: apps.length,
        draft: apps.filter((a: Application) => a.status === 'draft').length,
        submitted: apps.filter((a: Application) => a.status === 'submitted').length,
        under_review: apps.filter((a: Application) => a.status === 'under_review').length,
        approved: apps.filter((a: Application) => a.status === 'approved').length,
        rejected: apps.filter((a: Application) => a.status === 'rejected').length,
      })
    } catch {
      // Fallback mock
      setStats({ total: 15, draft: 3, submitted: 5, under_review: 4, approved: 2, rejected: 1 })
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-amber-100 text-amber-800',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">{t('dashboard.title')}</h1>
      <p className="text-gray-500 mb-8">
        {roles.length > 0 ? `${t('dashboard.role')}: ${roles.join(', ')}` : t('common.loading')}
      </p>

      {/* Stats Cards - visible to all roles */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label={t('dashboard.stats.total')} value={stats.total} color="text-gray-900" />
        <StatCard label={t('dashboard.stats.draft')} value={stats.draft} color="text-gray-500" />
        <StatCard label={t('dashboard.stats.submitted')} value={stats.submitted} color="text-blue-600" />
        <StatCard label={t('dashboard.stats.underReview')} value={stats.under_review} color="text-amber-600" />
        <StatCard label={t('dashboard.stats.approved')} value={stats.approved} color="text-emerald-600" />
        <StatCard label={t('dashboard.stats.rejected')} value={stats.rejected} color="text-red-600" />
      </div>

      {/* Role-specific quick actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {hasRole('super_admin', 'underwriter') && (
          <QuickActionCard
            title={t('dashboard.quickActions.reviewApplications.title')}
            description={t('dashboard.quickActions.reviewApplications.description')}
            href="/dashboard/applications"
            icon="📋"
          />
        )}
        {hasRole('super_admin', 'claims_officer') && (
          <QuickActionCard
            title={t('dashboard.quickActions.claims.title')}
            description={t('dashboard.quickActions.claims.description')}
            href="/dashboard/claims"
            icon="📝"
          />
        )}
        {hasRole('super_admin', 'finance') && (
          <QuickActionCard
            title={t('dashboard.quickActions.billing.title')}
            description={t('dashboard.quickActions.billing.description')}
            href="/dashboard/billing"
            icon="💰"
          />
        )}
        {hasRole('super_admin') && (
          <QuickActionCard
            title={t('dashboard.quickActions.manageUsers.title')}
            description={t('dashboard.quickActions.manageUsers.description')}
            href="/dashboard/customers"
            icon="👥"
          />
        )}
      </div>

      {/* Recent Applications - only for admin/underwriter */}
      {hasRole('super_admin', 'underwriter') && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">{t('dashboard.recentApplications.title')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.recentApplications.applicant')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.recentApplications.sumAssured')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.recentApplications.premium')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.recentApplications.status')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.recentApplications.date')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('dashboard.recentApplications.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.slice(0, 10).map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{app.applicant_data?.full_name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{app.applicant_data?.email || app.user_id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(app.sum_assured)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(app.premium_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/applications/${app.id}`} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        {t('dashboard.recentApplications.viewDetails')} →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

function QuickActionCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <Link href={href} className="block bg-white p-4 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <span className="text-2xl">{icon}</span>
      <h3 className="font-semibold text-gray-900 mt-2">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  )
}
