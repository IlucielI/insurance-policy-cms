'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  AnalyticsDashboard,
  MonthlyRevenue,
  StatusCount,
  MonthlyGrowth,
  ProductRank,
  fetchDashboardAnalytics,
} from '@/lib/api/analytics'
import { downloadAnalyticsExcel } from '@/lib/api/reports'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

const STATUS_COLORS: Record<string, string> = {
  submitted: '#6366f1',
  under_review: '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
  paid: '#3b82f6',
  pending: '#f59e0b',
  success: '#10b981',
  failed: '#ef4444',
  expired: '#9ca3af',
  cancelled: '#ef4444',
  active: '#10b981',
  lapsed: '#9ca3af',
  surrendered: '#f59e0b',
  draft: '#9ca3af',
}

const PRODUCT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1']

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

function formatMonthLabel(isoMonth: string): string {
  const d = new Date(isoMonth)
  return d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
}

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || '#9ca3af'
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    submitted: 'Diajukan',
    under_review: 'Ditinjau',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    paid: 'Dibayar',
    pending: 'Menunggu',
    success: 'Sukses',
    failed: 'Gagal',
    expired: 'Kedaluwarsa',
    cancelled: 'Dibatalkan',
    active: 'Aktif',
    lapsed: 'Kedaluwarsa',
    surrendered: 'Dilepas',
    draft: 'Konsep',
  }
  return labels[status] || status.replace('_', ' ')
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState(12)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchDashboardAnalytics(timeRange)
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data analytics')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
              Insurance Admin
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="grid grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
                  <div className="h-64 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠</div>
          <h2 className="text-xl font-semibold mb-2">Gagal Memuat Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const s = data.summary
  const conversionRate = s.total_approved > 0 ? (s.total_approved / (s.total_approved + s.total_claims || 1)) * 100 : 0
  const claimRatio = s.total_premium_ytd > 0 ? (s.total_claims_paid / s.total_premium_ytd) * 100 : 0

  // Revenue chart data
  const revenueData = data.monthly_revenue.map((m: MonthlyRevenue) => ({
    bulan: formatMonthLabel(m.month),
    Pendapatan: m.revenue,
    Polis: m.policy_count,
  }))

  // Claims status chart data
  const claimsData = data.claims_status.map((c: StatusCount) => ({
    name: getStatusLabel(c.status),
    value: c.count,
    color: getStatusColor(c.status),
  }))

  // Policy growth chart data
  const growthData = data.policy_growth.map((g: MonthlyGrowth) => ({
    bulan: formatMonthLabel(g.month),
    'Polis Baru': g.new_policies,
    Premi: g.premium,
  }))

  // Top products chart data
  const productsData = data.top_products.map((p: ProductRank) => ({
    name: p.product_name,
    Kategori: p.category,
    'Jumlah Polis': p.application_count,
    'Total Premi': p.total_premium,
  }))

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
            <Link href="/dashboard/applications" className="text-gray-700 hover:text-blue-600 font-medium">
              Aplikasi
            </Link>
            <Link href="/dashboard/reports" className="text-gray-700 hover:text-blue-600 font-medium">
              Laporan
            </Link>
            <Link href="/dashboard/analytics" className="text-blue-600 font-medium">
              Analytics
            </Link>
            <Link href="/dashboard/settings" className="text-gray-700 hover:text-blue-600 font-medium">
              Pengaturan
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Metrik bisnis real-time dari data Postgres</p>
          </div>
          <div className="flex gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value={3}>3 Bulan</option>
              <option value={6}>6 Bulan</option>
              <option value={12}>12 Bulan</option>
              <option value={24}>24 Bulan</option>
            </select>
            <button
              onClick={() => downloadAnalyticsExcel()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              📥 Ekspor Excel
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Polis Disetujui</div>
            <div className="text-3xl font-bold text-gray-900">{formatNumber(s.total_approved)}</div>
            <div className="text-xs text-emerald-600 mt-2">
              {formatNumber(s.active_policies)} polis aktif
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-gray-500 mb-1">Premi Tahun Ini</div>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(s.total_premium_ytd)}</div>
            <div className="text-xs text-gray-400 mt-2">Total terkumpul</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-gray-500 mb-1">Tingkat Konversi</div>
            <div className="text-3xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mt-2">Aplikasi ke polis</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="text-sm font-medium text-gray-500 mb-1">Rasio Klaim</div>
            <div className="text-3xl font-bold text-gray-900">{claimRatio.toFixed(1)}%</div>
            <div className="text-xs text-gray-400 mt-2">Klaim vs premi</div>
          </div>
        </div>

        {/* Charts Row 1: Revenue + Top Products */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart — Line + Bar combo */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-1">Tren Pendapatan</h2>
            <p className="text-sm text-gray-500 mb-4">Pendapatan premi per bulan</p>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => {
                    if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}M`
                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}Jt`
                    return String(v)
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => String(v)}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === 'Pendapatan') return [formatCurrency(Number(value)), name]
                    return [formatNumber(Number(value)), name]
                  }}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Pendapatan" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Bar yAxisId="right" dataKey="Polis" fill="#10b981" radius={[4, 4, 0, 0]} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products — Horizontal Bar */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-1">Produk Teratas</h2>
            <p className="text-sm text-gray-500 mb-4">Berdasarkan jumlah polis terjual</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={productsData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === 'Total Premi') return [formatCurrency(Number(value)), name]
                    return [formatNumber(Number(value)), name]
                  }}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="Jumlah Polis" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2: Policy Growth + Claims Distribution */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Policy Growth — Area chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-1">Pertumbuhan Polis</h2>
            <p className="text-sm text-gray-500 mb-4">Polis baru per bulan</p>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="policyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="premiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => formatNumber(v)}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => {
                    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(0)}Jt`
                    return String(v)
                  }}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === 'Premi') return [formatCurrency(Number(value)), name]
                    return [formatNumber(Number(value)), name]
                  }}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="Polis Baru" stroke="#8b5cf6" fill="url(#policyGrad)" strokeWidth={2} />
                <Area yAxisId="right" type="monotone" dataKey="Premi" stroke="#10b981" fill="url(#premiGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Claims Status — Pie chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-1">Distribusi Status Klaim</h2>
            <p className="text-sm text-gray-500 mb-4">Total {formatNumber(s.total_claims)} klaim</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={claimsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {claimsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2">
              {claimsData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                  <span className="font-semibold text-gray-900 ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom summary cards */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold mb-4">Ringkasan Keuangan</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Premi (YTD)</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(s.total_premium_ytd)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Total Klaim Dibayar</div>
              <div className="text-2xl font-bold text-red-500">{formatCurrency(s.total_claims_paid)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Polis Aktif</div>
              <div className="text-2xl font-bold text-emerald-600">{formatNumber(s.active_policies)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Net Revenue</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(s.total_premium_ytd - s.total_claims_paid)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
