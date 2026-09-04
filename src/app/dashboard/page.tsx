'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0
  })

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/v1/admin/applications')
      const data = await res.json()
      
      const apps = data.data || []
      setApplications(apps)
      
      // Calculate stats
      const newStats = {
        total: apps.length,
        draft: apps.filter((a: Application) => a.status === 'draft').length,
        submitted: apps.filter((a: Application) => a.status === 'submitted').length,
        under_review: apps.filter((a: Application) => a.status === 'under_review').length,
        approved: apps.filter((a: Application) => a.status === 'approved').length,
        rejected: apps.filter((a: Application) => a.status === 'rejected').length
      }
      setStats(newStats)
    } catch (err) {
      console.error('Failed to fetch:', err)
      // Mock data for demo
      const mockApps: Application[] = [
        {
          id: '1',
          status: 'submitted',
          user_id: 'user1',
          product_id: 'prod1',
          premium_amount: 500000,
          sum_assured: 100000000,
          created_at: new Date().toISOString(),
          applicant_data: { full_name: 'John Doe', email: 'john@example.com' }
        },
        {
          id: '2',
          status: 'under_review',
          user_id: 'user2',
          product_id: 'prod2',
          premium_amount: 750000,
          sum_assured: 150000000,
          created_at: new Date().toISOString(),
          applicant_data: { full_name: 'Jane Smith', email: 'jane@example.com' }
        }
      ]
      setApplications(mockApps)
      setStats({
        total: 15,
        draft: 3,
        submitted: 5,
        under_review: 4,
        approved: 2,
        rejected: 1
      })
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-amber-100 text-amber-800',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            Insurance Admin
          </Link>
          <nav className="flex gap-6 items-center">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
              Dashboard
            </Link>
            <Link href="/applications" className="text-gray-700 hover:text-blue-600 font-medium">
              Applications
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium">
              Products
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                A
              </div>
              <span className="text-gray-700">Admin</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-500">{stats.draft}</div>
            <div className="text-sm text-gray-600">Draft</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.submitted}</div>
            <div className="text-sm text-gray-600">Submitted</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-amber-600">{stats.under_review}</div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sum Assured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {applications.slice(0, 10).map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {app.applicant_data?.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {app.applicant_data?.email || app.user_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(app.sum_assured)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(app.premium_amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/applications/${app.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t text-center">
            <Link href="/applications" className="text-blue-600 hover:text-blue-700 font-medium">
              View All Applications →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
