'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import BulkActionBar, { type BulkAction } from '@/components/BulkActionBar'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

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
    age?: number
    occupation?: string
  }
  risk_score?: number
  priority?: 'high' | 'medium' | 'low'
  assigned_to?: string | null
}

export default function UnderwritingQueuePage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApps, setFilteredApps] = useState<Application[]>([])
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  })
  const [stats, setStats] = useState({
    pending: 0,
    in_review: 0,
    completed_today: 0,
    avg_time: '2.3 days'
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkProgress, setBulkProgress] = useState<{current: number; total: number} | null>(null)

  // Bulk actions config
  const bulkActions: BulkAction[] = useMemo(() => [
    {
      id: 'bulk-approve',
      label: 'Setujui Massal',
      confirmTitle: 'Konfirmasi Persetujuan Massal',
      confirmMessage: 'Yakin setujui {count} aplikasi? Aksi ini tidak bisa dibatalkan.',
      confirmLabel: 'Setujui',
    },
    {
      id: 'bulk-reject',
      label: 'Tolak Massal',
      confirmTitle: 'Konfirmasi Penolakan Massal',
      confirmMessage: 'Yakin tolak {count} aplikasi? Harap isi alasan penolakan.',
      confirmLabel: 'Tolak',
      danger: true,
    },
  ], [])

  // Bulk action handler
  const handleBulkAction = useCallback(async (
    actionId: string,
    ids: string[],
    notes?: string,
    rejectionReason?: string
  ) => {
    const status = actionId === 'bulk-approve' ? 'approved' : 'rejected'

    setBulkProgress({ current: 0, total: ids.length })

    const batchSize = 5
    const results: any[] = []

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize)
      const res = await fetch(`${API_BASE}/admin/applications/bulk-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: batch,
          status,
          underwriter_notes: notes || '',
          rejection_reason: rejectionReason || '',
        }),
      })
      const data = await res.json()
      results.push(...(data.results || []))
      setBulkProgress({ current: Math.min(i + batchSize, ids.length), total: ids.length })
    }

    setBulkProgress(null)

    const successCount = results.filter((r: any) => !r.error).length
    const failCount = results.filter((r: any) => r.error).length

    alert(`Selesai: ${successCount} berhasil, ${failCount} gagal.`)

    // Refresh list
    fetchApplications()
  }, [])

  // Selection helpers
  const allFilteredSelected = filteredApps.length > 0 && filteredApps.every(a => selectedIds.includes(a.id))

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredApps.map(a => a.id))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    fetchApplications()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [applications, filters])

  const fetchApplications = async () => {
    try {
      // Build query params from filters
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.priority !== 'all') params.append('priority', filters.priority)
      if (filters.search) params.append('search', filters.search)
      if (filters.dateFrom) params.append('date_from', filters.dateFrom)
      if (filters.dateTo) params.append('date_to', filters.dateTo)
      
      const res = await fetch(`http://localhost:8080/api/v1/admin/applications?${params.toString()}`)
      const data = await res.json()
      const apps = data.data || []
      
      // Enhance with underwriting data
      const enhanced = apps.map((app: Application) => ({
        ...app,
        risk_score: Math.floor(Math.random() * 100),
        priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low',
        assigned_to: Math.random() > 0.5 ? 'Current User' : null
      }))
      
      setApplications(enhanced)
      calculateStats(enhanced)
    } catch (err) {
      console.error('Failed to fetch:', err)
      // Mock data
      const mockApps: Application[] = [
        {
          id: 'APP-2026-001',
          status: 'submitted',
          user_id: 'user1',
          product_id: 'TERM-LIFE-500K',
          premium_amount: 500000,
          sum_assured: 100000000,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          applicant_data: { 
            full_name: 'Budi Santoso', 
            email: 'budi@example.com',
            age: 35,
            occupation: 'Software Engineer'
          },
          risk_score: 72,
          priority: 'high',
          assigned_to: 'Current User'
        },
        {
          id: 'APP-2026-002',
          status: 'under_review',
          user_id: 'user2',
          product_id: 'WHOLE-LIFE-1M',
          premium_amount: 750000,
          sum_assured: 200000000,
          created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          applicant_data: { 
            full_name: 'Siti Nurhaliza', 
            email: 'siti@example.com',
            age: 42,
            occupation: 'Doctor'
          },
          risk_score: 45,
          priority: 'medium',
          assigned_to: null
        },
        {
          id: 'APP-2026-003',
          status: 'submitted',
          user_id: 'user3',
          product_id: 'TERM-LIFE-300K',
          premium_amount: 300000,
          sum_assured: 75000000,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          applicant_data: { 
            full_name: 'Ahmad Wijaya', 
            email: 'ahmad@example.com',
            age: 28,
            occupation: 'Teacher'
          },
          risk_score: 85,
          priority: 'high',
          assigned_to: 'Current User'
        },
        {
          id: 'APP-2026-004',
          status: 'under_review',
          user_id: 'user4',
          product_id: 'CRITICAL-ILLNESS-500K',
          premium_amount: 600000,
          sum_assured: 150000000,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          applicant_data: { 
            full_name: 'Dewi Lestari', 
            email: 'dewi@example.com',
            age: 38,
            occupation: 'Architect'
          },
          risk_score: 58,
          priority: 'medium',
          assigned_to: null
        },
        {
          id: 'APP-2026-005',
          status: 'submitted',
          user_id: 'user5',
          product_id: 'TERM-LIFE-1M',
          premium_amount: 900000,
          sum_assured: 300000000,
          created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          applicant_data: { 
            full_name: 'Rudi Hartono', 
            email: 'rudi@example.com',
            age: 55,
            occupation: 'Pilot'
          },
          risk_score: 92,
          priority: 'high',
          assigned_to: null
        }
      ]
      setApplications(mockApps)
      calculateStats(mockApps)
    }
  }

  const calculateStats = (apps: Application[]) => {
    const pending = apps.filter(a => a.status === 'submitted').length
    const in_review = apps.filter(a => a.status === 'under_review').length
    const completed_today = Math.floor(Math.random() * 5) + 2
    
    setStats({
      pending,
      in_review,
      completed_today,
      avg_time: '2.3 days'
    })
  }

  const applyFilters = () => {
    let filtered = [...applications]
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status)
    }
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter(app => app.priority === filters.priority)
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(app => 
        app.id.toLowerCase().includes(search) ||
        app.applicant_data?.full_name?.toLowerCase().includes(search) ||
        app.applicant_data?.email?.toLowerCase().includes(search)
      )
    }
    
    if (filters.dateFrom) {
      filtered = filtered.filter(app => new Date(app.created_at) >= new Date(filters.dateFrom))
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(app => new Date(app.created_at) <= new Date(filters.dateTo))
    }
    
    setFilteredApps(filtered)
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50'
    if (score >= 50) return 'text-amber-600 bg-amber-50'
    return 'text-emerald-600 bg-emerald-50'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-amber-100 text-amber-800',
      low: 'bg-blue-100 text-blue-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
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

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24))
    return days === 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`
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
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link href="/dashboard/underwriting" className="text-blue-600 font-medium">
              Underwriting
            </Link>
            <Link href="/dashboard/applications" className="text-gray-700 hover:text-blue-600">
              Applications
            </Link>
            <Link href="/dashboard/products" className="text-gray-700 hover:text-blue-600">
              Products
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                U
              </div>
              <span className="text-gray-700">Underwriter</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Underwriting Queue</h1>
            <p className="text-gray-600">Review and process pending applications</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 font-medium">
              Export Report
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Bulk Actions
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Pending Review</div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
            <div className="text-xs text-gray-500 mt-1">Awaiting assignment</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">In Review</div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.in_review}</div>
            <div className="text-xs text-gray-500 mt-1">Being processed</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Completed Today</div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.completed_today}</div>
            <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Avg Processing Time</div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.avg_time}</div>
            <div className="text-xs text-gray-500 mt-1">Current month average</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select 
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Name, ID, email..."
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredApps.length} of {applications.length} applications
            </div>
            <button 
              onClick={() => setFilters({status: 'all', priority: 'all', search: '', dateFrom: '', dateTo: ''})}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <BulkActionBar
            selectedIds={selectedIds}
            totalItems={filteredApps.length}
            actions={bulkActions}
            onAction={handleBulkAction}
            onSelectAll={handleSelectAll}
            onClearSelection={() => setSelectedIds([])}
            progress={bulkProgress}
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sum Assured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(app.id)}
                        onChange={() => handleToggleSelect(app.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{app.id}</div>
                      {app.assigned_to && (
                        <div className="text-xs text-blue-600 mt-1">Assigned to you</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {app.applicant_data?.full_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Age {app.applicant_data?.age}, {app.applicant_data?.occupation}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{app.product_id}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(app.premium_amount)}/mo</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(app.sum_assured)}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(app.risk_score || 0)}`}>
                        {app.risk_score}/100
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(app.priority || 'low')}`}>
                        {app.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {getDaysAgo(app.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/underwriting/${app.id}`}
                        className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApps.length === 0 && (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No applications found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
