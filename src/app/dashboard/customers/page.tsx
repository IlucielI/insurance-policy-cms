'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { downloadCustomersExcel } from '@/lib/api/reports'

interface Customer {
  id: string
  full_name: string
  email: string
  phone: string
  status: string
  kyc_status: string
  created_at: string
}

export default function CustomersListPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    kyc_status: 'all',
  })
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const limit = 12

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filters.status, filters.kyc_status])

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (debouncedSearch) params.append('search', debouncedSearch)
        if (filters.status !== 'all') params.append('status', filters.status)
        if (filters.kyc_status !== 'all') params.append('kyc_status', filters.kyc_status)
        params.append('page', page.toString())
        params.append('limit', limit.toString())

        const res = await fetch(`http://localhost:8080/api/v1/admin/customers?${params}`)
        const data = await res.json()
        setCustomers(data.data || [])
        setTotal(data.meta?.total || 0)
        setTotalPages(data.meta?.total_pages || 1)
      } catch {
        setError('Gagal mengambil data nasabah')
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [debouncedSearch, filters, page])

  const clearFilters = () => {
    setSearch('')
    setFilters({ status: 'all', kyc_status: 'all' })
    setShowFilters(false)
  }

  const hasActiveFilters = debouncedSearch || filters.status !== 'all' || filters.kyc_status !== 'all'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nasabah</h1>
        <button
          onClick={() => downloadCustomersExcel()}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 text-sm"
        >
          📥 Ekspor Excel
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Cari nama, email, atau telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm 
              focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors
            ${showFilters || hasActiveFilters 
              ? 'bg-blue-50 border-blue-200 text-blue-700' 
              : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          ⏬ Filter
          {hasActiveFilters && <span className="ml-1 h-2 w-2 rounded-full bg-blue-500" />}
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Hapus filter
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="all">Semua</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
                <option value="suspended">Ditangguhkan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status KYC
              </label>
              <select
                value={filters.kyc_status}
                onChange={(e) => setFilters({ ...filters, kyc_status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="all">Semua</option>
                <option value="verified">Terverifikasi</option>
                <option value="pending">Menunggu</option>
                <option value="unverified">Belum verifikasi</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{total} nasabah ditemukan</span>
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          Tidak ada nasabah ditemukan
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer) => (
              <Link
                key={customer.id}
                href={`/dashboard/customers/${customer.id}`}
                className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{customer.full_name}</h3>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${customer.status === 'active' ? 'bg-green-50 text-green-700' :
                        customer.status === 'inactive' ? 'bg-gray-50 text-gray-600' :
                        'bg-red-50 text-red-700'}`}
                  >
                    {customer.status === 'active' ? 'Aktif' :
                     customer.status === 'inactive' ? 'Nonaktif' : 'Ditangguhkan'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{customer.phone || '-'}</span>
                  <span
                    className={`inline-flex items-center gap-1
                      ${customer.kyc_status === 'verified' ? 'text-green-600' :
                        customer.kyc_status === 'pending' ? 'text-yellow-600' : 'text-gray-400'}`}
                  >
                    <span className={`h-2 w-2 rounded-full
                      ${customer.kyc_status === 'verified' ? 'bg-green-500' :
                        customer.kyc_status === 'pending' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                    {customer.kyc_status === 'verified' ? 'KYC OK' :
                     customer.kyc_status === 'pending' ? 'KYC Pending' : 'Belum KYC'}
                  </span>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  Terdaftar: {new Date(customer.created_at).toLocaleDateString('id-ID')}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Sebelumnya
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => {
                    // Add ellipsis
                    const prev = arr[idx - 1]
                    return (
                      <div key={p} className="flex items-center gap-1">
                        {prev && p - prev > 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium
                            ${page === p
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-200 hover:bg-gray-50'}`}
                        >
                          {p}
                        </button>
                      </div>
                    )
                  })}
              </div>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
