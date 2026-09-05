'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import EmailPreviewModal from '@/components/EmailPreviewModal'
import BulkActionBar, { type BulkAction } from '@/components/BulkActionBar'
import { downloadClaimsExcel } from '@/lib/api/reports'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

interface Claim {
  id: string
  policy_number: string
  claimant_name: string
  claimant_email: string
  claim_type: 'accident' | 'illness' | 'death' | 'disability' | 'property'
  status: 'new' | 'under_investigation' | 'assigned' | 'pending_approval' | 'approved' | 'rejected' | 'paid' | 'partially_paid'
  incident_date: string
  filed_date: string
  claimed_amount: number
  approved_amount: number | null
  paid_amount: number | null
  priority: 'high' | 'medium' | 'low'
  fraud_score: number
  assigned_adjuster: string | null
  description: string
}

interface Stats {
  total: number
  new_claims: number
  investigating: number
  pending_approval: number
  approved: number
  rejected: number
  paid: number
  total_claimed: number
  total_paid: number
}

function generateMockClaims(): Claim[] {
  const types: Claim['claim_type'][] = ['accident', 'illness', 'death', 'disability', 'property']
  const statuses: Claim['status'][] = ['new', 'under_investigation', 'assigned', 'pending_approval', 'approved', 'rejected', 'paid', 'partially_paid']
  const priorities: Claim['priority'][] = ['high', 'medium', 'low']
  const adjusters = ['Ahmad Fauzi', 'Sarah Chen', 'Rudi Hermawan', 'Diana Putri', 'Bayu Nugroho', null]

  const claimants = [
    { name: 'Budi Santoso', email: 'budi@email.com' },
    { name: 'Siti Nurhaliza', email: 'siti@email.com' },
    { name: 'Ahmad Wijaya', email: 'ahmad@email.com' },
    { name: 'Dewi Lestari', email: 'dewi@email.com' },
    { name: 'Rudi Hartono', email: 'rudi@email.com' },
    { name: 'Mega Putri', email: 'mega@email.com' },
    { name: 'Hendra Gunawan', email: 'hendra@email.com' },
    { name: 'Lina Mariana', email: 'lina@email.com' },
    { name: 'Toni Supriadi', email: 'toni@email.com' },
    { name: 'Ratna Sari', email: 'ratna@email.com' },
    { name: 'Dimas Ardian', email: 'dimas@email.com' },
    { name: 'Fitri Handayani', email: 'fitri@email.com' },
    { name: 'Agus Salim', email: 'agus@email.com' },
    { name: 'Nina Kusuma', email: 'nina@email.com' },
    { name: 'Eko Prasetyo', email: 'eko@email.com' },
  ]

  const descriptions = [
    'Kecelakaan lalu lintas di Jl. Sudirman, mengalami patah tulang kaki kanan',
    'Diagnosa kanker stadium awal, membutuhkan perawatan intensif',
    'Meninggal dunia karena serangan jantung mendadak',
    'Cacat permanen akibat kecelakaan kerja di pabrik',
    'Kerusakan properti akibat banjir bandang',
    'Kecelakaan motor di jalan tol, luka ringan',
    'Rawat inap 7 hari karena demam berdarah',
    'Kehilangan anggota tubuh akibat kecelakaan industri',
    'Kerusakan rumah akibat gempa bumi',
    'Kecelakaan jatuh dari tangga, cedera tulang belakang',
    'Diagnosa diabetes komplikasi, perawatan jangka panjang',
    'Serangan jantung, membutuhkan operasi bypass',
    'Kecelakaan saat berolahraga, cedera lutut',
    'Kebakaran rumah, kehilangan seluruh harta benda',
    'Penyakit ginjal kronis, membutuhkan dialisis',
  ]

  return Array.from({ length: 25 }, (_, i) => {
    const status = statuses[i % statuses.length]
    const claimType = types[Math.floor(Math.random() * types.length)]
    const claimedAmount = Math.floor(Math.random() * 450_000_000) + 50_000_000
    const claimant = claimants[i % claimants.length]
    const adjuster = adjusters[Math.floor(Math.random() * adjusters.length)]

    const isApproved = ['approved', 'paid', 'partially_paid'].includes(status)
    const isPaid = ['paid', 'partially_paid'].includes(status)

    return {
      id: `CLM-2026-${String(i + 1).padStart(3, '0')}`,
      policy_number: `POL-${String(Math.floor(Math.random() * 999) + 1).padStart(6, '0')}`,
      claimant_name: claimant.name,
      claimant_email: claimant.email,
      claim_type: claimType,
      status,
      incident_date: new Date(Date.now() - (Math.random() * 60 + 1) * 24 * 60 * 60 * 1000).toISOString(),
      filed_date: new Date(Date.now() - (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000).toISOString(),
      claimed_amount: claimedAmount,
      approved_amount: isApproved ? Math.floor(claimedAmount * (0.7 + Math.random() * 0.3)) : null,
      paid_amount: isPaid ? Math.floor(claimedAmount * (0.5 + Math.random() * 0.5)) : null,
      priority: priorities[Math.floor(Math.random() * 3)],
      fraud_score: Math.floor(Math.random() * 100),
      assigned_adjuster: adjuster,
      description: descriptions[i % descriptions.length],
    }
  })
}

export default function ClaimsQueuePage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [filters, setFilters] = useState({
    status: 'all',
    claimType: 'all',
    priority: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  })
  const [sortField, setSortField] = useState<keyof Claim>('filed_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [emailSending, setEmailSending] = useState<Record<string, boolean>>({})
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewType, setPreviewType] = useState<"welcome" | "policy" | "claim" | "reset">("claim")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkProgress, setBulkProgress] = useState<{current: number; total: number} | null>(null)

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      // Build query params from filters
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.claimType !== 'all') params.append('claim_type', filters.claimType)
      if (filters.priority !== 'all') params.append('priority', filters.priority)
      if (filters.search) params.append('search', filters.search)
      if (filters.dateFrom) params.append('date_from', filters.dateFrom)
      if (filters.dateTo) params.append('date_to', filters.dateTo)
      if (filters.amountMin) params.append('amount_min', filters.amountMin)
      if (filters.amountMax) params.append('amount_max', filters.amountMax)
      
      const res = await fetch(`http://localhost:8080/api/v1/admin/claims?${params.toString()}`)
      const data = await res.json()
      setClaims(data.data || [])
    } catch {
      setClaims(generateMockClaims())
    }
  }

  const sendClaimStatusEmail = async (claimId: string, status: string, notes: string = '') => {
    setEmailSending(prev => ({ ...prev, [claimId]: true }))
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://insurance-app-api.bayuanugerah.my.id/api/v1'
      const res = await fetch(`${apiUrl}/admin/email/claim-status/${claimId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      })
      
      if (res.ok) {
        alert('✅ Email notifikasi claim berhasil dikirim!')
      } else {
        const data = await res.json()
        alert('❌ Gagal kirim email: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('❌ Error: ' + (err instanceof Error ? err.message : 'Network error'))
    } finally {
      setEmailSending(prev => ({ ...prev, [claimId]: false }))
    }
  }

  // Bulk actions config
  const bulkActions: BulkAction[] = useMemo(() => [
    {
      id: 'claim-bulk-status',
      label: 'Update Status Massal',
      confirmTitle: 'Konfirmasi Update Status',
      confirmMessage: 'Update status {count} klaim? Pilih status baru.',
      confirmLabel: 'Update',
      requireNotes: true,
      notesLabel: 'Status',
    },
    {
      id: 'bulk-email',
      label: 'Kirim Email Massal',
      confirmTitle: 'Konfirmasi Kirim Email',
      confirmMessage: 'Kirim email notifikasi untuk {count} klaim terpilih?',
      confirmLabel: 'Kirim',
    },
  ], [])

  // Bulk action handler for claims
  const handleBulkAction = useCallback(async (
    actionId: string,
    ids: string[],
    notes?: string,
    _rejectionReason?: string
  ) => {
    if (actionId === 'claim-bulk-status') {
      const newStatus = notes || 'pending_approval'
      setBulkProgress({ current: 0, total: ids.length })

      const batchSize = 5
      const results: any[] = []

      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize)
        const res = await fetch(`${API_BASE}/admin/claims/bulk-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: batch, status: newStatus, notes: '' }),
        })
        const data = await res.json()
        results.push(...(data.results || []))
        setBulkProgress({ current: Math.min(i + batchSize, ids.length), total: ids.length })
      }

      setBulkProgress(null)
      const successCount = results.filter((r: any) => !r.error).length
      const failCount = results.filter((r: any) => r.error).length
      alert(`Selesai: ${successCount} berhasil, ${failCount} gagal.`)
    }

    if (actionId === 'bulk-email') {
      setBulkProgress({ current: 0, total: ids.length })

      const batchSize = 5
      const results: any[] = []

      for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize)
        const res = await fetch(`${API_BASE}/admin/email/bulk-send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: batch, entity_type: 'claim', email_type: 'claim_status' }),
        })
        const data = await res.json()
        results.push(...(data.results || []))
        setBulkProgress({ current: Math.min(i + batchSize, ids.length), total: ids.length })
      }

      setBulkProgress(null)
      const successCount = results.filter((r: any) => !r.error).length
      const failCount = results.filter((r: any) => r.error).length
      alert(`Selesai: ${successCount} email terkirim, ${failCount} gagal.`)
    }

    // Refresh list
    fetchClaims()
  }, [])

  const stats = useMemo((): Stats => {
    return {
      total: claims.length,
      new_claims: claims.filter(c => c.status === 'new').length,
      investigating: claims.filter(c => c.status === 'under_investigation').length,
      pending_approval: claims.filter(c => c.status === 'pending_approval').length,
      approved: claims.filter(c => c.status === 'approved').length,
      rejected: claims.filter(c => c.status === 'rejected').length,
      paid: claims.filter(c => ['paid', 'partially_paid'].includes(c.status)).length,
      total_claimed: claims.reduce((sum, c) => sum + c.claimed_amount, 0),
      total_paid: claims.reduce((sum, c) => sum + (c.paid_amount || 0), 0),
    }
  }, [claims])

  const filteredClaims = useMemo(() => {
    let filtered = [...claims]

    if (filters.status !== 'all') {
      filtered = filtered.filter(c => c.status === filters.status)
    }
    if (filters.claimType !== 'all') {
      filtered = filtered.filter(c => c.claim_type === filters.claimType)
    }
    if (filters.priority !== 'all') {
      filtered = filtered.filter(c => c.priority === filters.priority)
    }
    if (filters.search) {
      const s = filters.search.toLowerCase()
      filtered = filtered.filter(c =>
        c.id.toLowerCase().includes(s) ||
        c.claimant_name.toLowerCase().includes(s) ||
        c.policy_number.toLowerCase().includes(s) ||
        c.claimant_email.toLowerCase().includes(s)
      )
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(c => new Date(c.filed_date) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(c => new Date(c.filed_date) <= new Date(filters.dateTo))
    }
    if (filters.amountMin) {
      filtered = filtered.filter(c => c.claimed_amount >= Number(filters.amountMin))
    }
    if (filters.amountMax) {
      filtered = filtered.filter(c => c.claimed_amount <= Number(filters.amountMax))
    }

    filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const comp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === 'asc' ? comp : -comp
    })

    return filtered
  }, [claims, filters, sortField, sortDir])

  // Selection helpers
  const allFilteredSelected = filteredClaims.length > 0 && filteredClaims.every(c => selectedIds.includes(c.id))

  const handleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredClaims.map(c => c.id))
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleSort = (field: keyof Claim) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const formatCurrency = (amount: number) =>
    'Rp ' + new Intl.NumberFormat('id-ID').format(amount)

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      under_investigation: 'bg-purple-100 text-purple-800',
      assigned: 'bg-indigo-100 text-indigo-800',
      pending_approval: 'bg-amber-100 text-amber-800',
      approved: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-teal-100 text-teal-800',
      partially_paid: 'bg-cyan-100 text-cyan-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-amber-100 text-amber-800',
      low: 'bg-gray-100 text-gray-800',
    }
    return colors[priority] || colors.low
  }

  const getClaimTypeLabel = (type: string) =>
    type.charAt(0).toUpperCase() + type.slice(1)

  const getFraudColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50'
    if (score >= 40) return 'text-amber-600 bg-amber-50'
    return 'text-emerald-600 bg-emerald-50'
  }

  const getDaysAgo = (date: string) => {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  // Chart data
  const statusChartData = useMemo(() => {
    const statusCounts: Record<string, number> = {}
    claims.forEach(c => {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1
    })
    return statusCounts
  }, [claims])

  const maxStatusCount = Math.max(...Object.values(statusChartData), 1)

  const amountChartData = useMemo(() => {
    const bins = [0, 100_000_000, 200_000_000, 300_000_000, 400_000_000, 500_000_000]
    return bins.map((min, i) => ({
      label: i < bins.length - 1
        ? `${formatCurrency(min).replace('Rp ', '')} - ${formatCurrency(bins[i + 1]).replace('Rp ', '')}`
        : `${formatCurrency(min).replace('Rp ', '')}+`,
      count: claims.filter(c =>
        c.claimed_amount >= min && (i === bins.length - 1 || c.claimed_amount < bins[i + 1])
      ).length,
    }))
  }, [claims])

  const maxAmountCount = Math.max(...amountChartData.map(d => d.count), 1)

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
            <Link href="/dashboard/claims" className="text-blue-600 font-medium border-b-2 border-blue-600">
              Claims
            </Link>
            <Link href="/dashboard/underwriting" className="text-gray-700 hover:text-blue-600 font-medium">
              Underwriting
            </Link>
            <Link href="/dashboard/ai-review" className="text-gray-700 hover:text-blue-600 font-medium">
              AI Review
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

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manajemen Klaim</h1>
            <p className="text-gray-600 mt-1">Antrian & administrasi klaim asuransi</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => downloadClaimsExcel()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              📥 Ekspor Excel
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              + Klaim Baru (FNOL)
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900', bg: '' },
            { label: 'New', value: stats.new_claims, color: 'text-blue-600', bg: '' },
            { label: 'Investigating', value: stats.investigating, color: 'text-purple-600', bg: '' },
            { label: 'Pending Approv', value: stats.pending_approval, color: 'text-amber-600', bg: '' },
            { label: 'Approved', value: stats.approved, color: 'text-emerald-600', bg: '' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-600', bg: '' },
            { label: 'Paid', value: stats.paid, color: 'text-teal-600', bg: '' },
            { label: 'Total Claimed', value: formatCurrency(stats.total_claimed), color: 'text-gray-700', bg: '', small: true },
          ].map(stat => (
            <div key={stat.label} className="bg-white p-3 rounded-lg shadow-sm border text-center">
              <div className={`font-bold ${stat.small ? 'text-xs' : 'text-xl'} ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Claims by Status Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Claims by Status</h3>
            <div className="space-y-2">
              {Object.entries(statusChartData).map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-28 truncate">{getStatusLabel(status)}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${(count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-6 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amount Distribution Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Amount Distribution</h3>
            <div className="space-y-2">
              {amountChartData.map((bin, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-40 truncate">{bin.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(bin.count / maxAmountCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-6 text-right">{bin.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="under_investigation">Under Investigation</option>
                <option value="assigned">Assigned</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="paid">Paid</option>
                <option value="partially_paid">Partially Paid</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Claim Type</label>
              <select
                value={filters.claimType}
                onChange={e => setFilters(f => ({ ...f, claimType: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm"
              >
                <option value="all">All Types</option>
                <option value="accident">Accident</option>
                <option value="illness">Illness</option>
                <option value="death">Death</option>
                <option value="disability">Disability</option>
                <option value="property">Property</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
              <input
                type="text"
                placeholder="ID, name, policy..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Min Amount</label>
              <input
                type="number"
                placeholder="Rp"
                value={filters.amountMin}
                onChange={e => setFilters(f => ({ ...f, amountMin: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Amount</label>
              <input
                type="number"
                placeholder="Rp"
                value={filters.amountMax}
                onChange={e => setFilters(f => ({ ...f, amountMax: e.target.value }))}
                className="w-full px-2 py-1.5 border rounded text-sm"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredClaims.length} of {claims.length} claims
            </div>
            <button
              onClick={() => setFilters({
                status: 'all', claimType: 'all', priority: 'all',
                search: '', dateFrom: '', dateTo: '', amountMin: '', amountMax: '',
              })}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <BulkActionBar
            selectedIds={selectedIds}
            totalItems={filteredClaims.length}
            actions={bulkActions}
            onAction={handleBulkAction}
            onSelectAll={handleSelectAll}
            onClearSelection={() => setSelectedIds([])}
            progress={bulkProgress}
          />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  {[
                    { key: 'id', label: 'Claim ID' },
                    { key: 'claimant_name', label: 'Claimant' },
                    { key: 'claim_type', label: 'Type' },
                    { key: 'claimed_amount', label: 'Amount' },
                    { key: 'status', label: 'Status' },
                    { key: 'priority', label: 'Priority' },
                    { key: 'fraud_score', label: 'Fraud' },
                    { key: 'assigned_adjuster', label: 'Adjuster' },
                    { key: 'filed_date', label: 'Filed' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key as keyof Claim)}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 select-none"
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {sortField === col.key && (
                          <span className="text-blue-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredClaims.map(claim => (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(claim.id)}
                        onChange={() => handleToggleSelect(claim.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{claim.id}</div>
                      <div className="text-xs text-gray-500">{claim.policy_number}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-sm">{claim.claimant_name}</div>
                      <div className="text-xs text-gray-500">{claim.claimant_email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{getClaimTypeLabel(claim.claim_type)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(claim.claimed_amount)}</div>
                      {claim.approved_amount && claim.approved_amount !== claim.claimed_amount && (
                        <div className="text-xs text-amber-600">Approved: {formatCurrency(claim.approved_amount)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                        {getStatusLabel(claim.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(claim.priority)}`}>
                        {claim.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${getFraudColor(claim.fraud_score)}`}>
                        {claim.fraud_score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {claim.assigned_adjuster ? (
                        <span className="text-sm text-gray-700">{claim.assigned_adjuster}</span>
                      ) : (
                        <span className="text-xs text-amber-600 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {getDaysAgo(claim.filed_date)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        <Link
                          href={`/dashboard/claims/${claim.id}`}
                          className="inline-block px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors text-center"
                        >
                          Investigate
                        </Link>
                        
                        {/* Email notification for approved/rejected/paid claims */}
                        {(['approved', 'rejected', 'paid', 'partially_paid'].includes(claim.status)) && (
                          <button
                            onClick={() => sendClaimStatusEmail(claim.id, claim.status, '')}
                            disabled={emailSending[claim.id]}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {emailSending[claim.id] ? '⏳' : '📧'} Email
                          </button>
                        )}
                        
                        {/* Preview Button */}
                        <button
                          onClick={() => { setPreviewType('claim'); setPreviewOpen(true) }}
                          className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors border border-gray-300"
                        >
                          👁 Pratinjau
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredClaims.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No claims match current filters
            </div>
          )}
        </div>
      </div>

      {/* Email Preview Modal */}
      <EmailPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        templateType={previewType}
      />
    </div>
  )
}
