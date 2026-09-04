'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Application {
  id: string
  application_number: string
  product_name: string
  applicant_name: string
  email: string
  phone: string
  premium_amount: number
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
      const response = await fetch(`${apiUrl}/admin/applications`)
      
      if (response.ok) {
        const data = await response.json()
        setApplications(data.data || [])
      } else {
        // Mock data fallback
        setApplications(generateMockApplications())
      }
    } catch (err) {
      setApplications(generateMockApplications())
    } finally {
      setLoading(false)
    }
  }

  const generateMockApplications = (): Application[] => {
    const statuses: Application['status'][] = ['draft', 'submitted', 'under_review', 'approved', 'rejected']
    const products = ['Asuransi Jiwa Premium', 'Asuransi Kesehatan Plus', 'Asuransi Kendaraan']
    const names = ['Budi Santoso', 'Siti Aminah', 'Rudi Hartono', 'Dewi Lestari', 'Ahmad Fauzi', 'Maya Kusuma']
    
    return Array.from({ length: 12 }, (_, i) => ({
      id: `app-${i + 1}`,
      application_number: `APP-2026-${String(i + 1).padStart(4, '0')}`,
      product_name: products[i % products.length],
      applicant_name: names[i % names.length],
      email: `${names[i % names.length].toLowerCase().replace(' ', '.')}@example.com`,
      phone: `08${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
      premium_amount: [500000, 750000, 1000000, 1500000][Math.floor(Math.random() * 4)],
      status: statuses[i % statuses.length],
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString()
    }))
  }

  const updateStatus = async (id: string, newStatus: Application['status']) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
      await fetch(`${apiUrl}/admin/applications/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status: newStatus, updated_at: new Date().toISOString() } : app)
      )
    } catch (err) {
      // Optimistic update on error
      setApplications(prev => 
        prev.map(app => app.id === id ? { ...app, status: newStatus, updated_at: new Date().toISOString() } : app)
      )
    }
  }

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700'
      case 'submitted': return 'bg-blue-100 text-blue-700'
      case 'under_review': return 'bg-yellow-100 text-yellow-700'
      case 'approved': return 'bg-green-100 text-green-700'
      case 'rejected': return 'bg-red-100 text-red-700'
    }
  }

  const getStatusLabel = (status: Application['status']) => {
    switch (status) {
      case 'draft': return 'Draft'
      case 'submitted': return 'Diajukan'
      case 'under_review': return 'Sedang Direview'
      case 'approved': return 'Disetujui'
      case 'rejected': return 'Ditolak'
    }
  }

  const columns: { key: Application['status'] | 'all'; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'submitted', label: 'Diajukan' },
    { key: 'under_review', label: 'Review' },
    { key: 'approved', label: 'Disetujui' },
    { key: 'rejected', label: 'Ditolak' }
  ]

  const getFilteredApplications = () => {
    if (filter === 'all') return applications
    return applications.filter(app => app.status === filter)
  }

  const onDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('applicationId', appId)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const onDrop = (e: React.DragEvent, status: Application['status']) => {
    e.preventDefault()
    const appId = e.dataTransfer.getData('applicationId')
    updateStatus(appId, status)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat aplikasi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            Insurance Admin CMS
          </Link>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
            <Link href="/dashboard/products" className="text-gray-600 hover:text-blue-600">Products</Link>
            <Link href="/dashboard/applications" className="text-blue-600 font-semibold">Applications</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Kelola Pengajuan</h1>
          <div className="flex gap-2">
            {columns.map(col => (
              <button
                key={col.key}
                onClick={() => setFilter(col.key)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === col.key 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.slice(1).map(column => {
            const columnApps = applications.filter(app => app.status === column.key)
            
            return (
              <div 
                key={column.key}
                className="bg-gray-100 rounded-lg p-4"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, column.key as Application['status'])}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-700">{column.label}</h3>
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
                    {columnApps.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnApps.map(app => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, app.id)}
                      className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-gray-500">{app.application_number}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </div>

                      <h4 className="font-semibold mb-1">{app.applicant_name}</h4>
                      <p className="text-sm text-gray-600 mb-2">{app.product_name}</p>

                      <div className="text-sm space-y-1 mb-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Premi</span>
                          <span className="font-medium">Rp {app.premium_amount.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Diajukan</span>
                          <span className="text-gray-700">{formatDate(app.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {app.status === 'submitted' && (
                          <button
                            onClick={() => updateStatus(app.id, 'under_review')}
                            className="flex-1 text-xs bg-yellow-600 text-white py-1 rounded hover:bg-yellow-700 transition"
                          >
                            Review
                          </button>
                        )}
                        {app.status === 'under_review' && (
                          <>
                            <button
                              onClick={() => updateStatus(app.id, 'approved')}
                              className="flex-1 text-xs bg-green-600 text-white py-1 rounded hover:bg-green-700 transition"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'rejected')}
                              className="flex-1 text-xs bg-red-600 text-white py-1 rounded hover:bg-red-700 transition"
                            >
                              Tolak
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {columnApps.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      Tidak ada pengajuan
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* List View (ketika filter "Semua") */}
        {filter === 'all' && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Semua Pengajuan</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Aplikasi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                        {app.application_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.applicant_name}</div>
                        <div className="text-sm text-gray-500">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{app.product_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        Rp {app.premium_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(app.status)}`}>
                          {getStatusLabel(app.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(app.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
