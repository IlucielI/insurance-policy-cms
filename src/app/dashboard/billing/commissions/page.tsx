'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Commission {
  id: string
  agentId: string
  agentName: string
  agentEmail: string
  period: string
  totalPolicies: number
  totalPremium: number
  commissionRate: number
  commissionAmount: number
  status: 'calculated' | 'approved' | 'paid' | 'hold'
  paidDate?: string
  calculatedDate: string
}

interface AgentPerformance {
  agentName: string
  policies: number
  commission: number
}

export default function CommissionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('2026-08')
  const [selectedCommissions, setSelectedCommissions] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'statements'>('list')

  // Mock data
  const mockCommissions: Commission[] = [
    { id: '1', agentId: 'AGT-001', agentName: 'Budi Santoso', agentEmail: 'budi.santoso@agent.com', period: '2026-08', totalPolicies: 12, totalPremium: 45000000, commissionRate: 10, commissionAmount: 4500000, status: 'paid', paidDate: '2026-09-01', calculatedDate: '2026-08-31' },
    { id: '2', agentId: 'AGT-002', agentName: 'Siti Rahayu', agentEmail: 'siti.rahayu@agent.com', period: '2026-08', totalPolicies: 18, totalPremium: 67000000, commissionRate: 12, commissionAmount: 8040000, status: 'approved', calculatedDate: '2026-08-31' },
    { id: '3', agentId: 'AGT-003', agentName: 'Ahmad Wijaya', agentEmail: 'ahmad.wijaya@agent.com', period: '2026-08', totalPolicies: 9, totalPremium: 32000000, commissionRate: 10, commissionAmount: 3200000, status: 'approved', calculatedDate: '2026-08-31' },
    { id: '4', agentId: 'AGT-004', agentName: 'Dewi Lestari', agentEmail: 'dewi.lestari@agent.com', period: '2026-08', totalPolicies: 15, totalPremium: 58000000, commissionRate: 11, commissionAmount: 6380000, status: 'calculated', calculatedDate: '2026-08-31' },
    { id: '5', agentId: 'AGT-005', agentName: 'Rudi Hermawan', agentEmail: 'rudi.hermawan@agent.com', period: '2026-08', totalPolicies: 7, totalPremium: 25000000, commissionRate: 9, commissionAmount: 2250000, status: 'calculated', calculatedDate: '2026-08-31' },
    { id: '6', agentId: 'AGT-001', agentName: 'Budi Santoso', agentEmail: 'budi.santoso@agent.com', period: '2026-07', totalPolicies: 10, totalPremium: 38000000, commissionRate: 10, commissionAmount: 3800000, status: 'paid', paidDate: '2026-08-01', calculatedDate: '2026-07-31' },
    { id: '7', agentId: 'AGT-002', agentName: 'Siti Rahayu', agentEmail: 'siti.rahayu@agent.com', period: '2026-07', totalPolicies: 16, totalPremium: 62000000, commissionRate: 12, commissionAmount: 7440000, status: 'paid', paidDate: '2026-08-01', calculatedDate: '2026-07-31' },
    { id: '8', agentId: 'AGT-006', agentName: 'Eko Prasetyo', agentEmail: 'eko.prasetyo@agent.com', period: '2026-08', totalPolicies: 5, totalPremium: 18000000, commissionRate: 8, commissionAmount: 1440000, status: 'hold', calculatedDate: '2026-08-31' },
  ]

  const [commissions] = useState<Commission[]>(mockCommissions)

  const monthlyTrend = [
    { month: 'Mar', amount: 18500000, agents: 12 },
    { month: 'Apr', amount: 22000000, agents: 14 },
    { month: 'May', amount: 19800000, agents: 13 },
    { month: 'Jun', amount: 24500000, agents: 15 },
    { month: 'Jul', amount: 26300000, agents: 16 },
    { month: 'Aug', amount: 25810000, agents: 18 },
  ]

  const topAgents: AgentPerformance[] = [
    { agentName: 'Siti Rahayu', policies: 18, commission: 8040000 },
    { agentName: 'Dewi Lestari', policies: 15, commission: 6380000 },
    { agentName: 'Budi Santoso', policies: 12, commission: 4500000 },
    { agentName: 'Ahmad Wijaya', policies: 9, commission: 3200000 },
    { agentName: 'Rudi Hermawan', policies: 7, commission: 2250000 },
  ]

  const filteredCommissions = commissions.filter(comm => {
    const matchesSearch = comm.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.agentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.agentEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || comm.status === statusFilter
    const matchesPeriod = periodFilter === 'all' || comm.period === periodFilter
    return matchesSearch && matchesStatus && matchesPeriod
  })

  const currentPeriodCommissions = commissions.filter(c => c.period === '2026-08')
  const stats = {
    totalCommissions: currentPeriodCommissions.reduce((sum, c) => sum + c.commissionAmount, 0),
    paidCommissions: currentPeriodCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0),
    pendingCommissions: currentPeriodCommissions.filter(c => c.status === 'approved' || c.status === 'calculated').reduce((sum, c) => sum + c.commissionAmount, 0),
    totalAgents: new Set(currentPeriodCommissions.map(c => c.agentId)).size,
    totalPolicies: currentPeriodCommissions.reduce((sum, c) => sum + c.totalPolicies, 0),
    avgCommissionRate: (currentPeriodCommissions.reduce((sum, c) => sum + c.commissionRate, 0) / currentPeriodCommissions.length).toFixed(1),
    calculated: currentPeriodCommissions.filter(c => c.status === 'calculated').length,
    approved: currentPeriodCommissions.filter(c => c.status === 'approved').length,
    paid: currentPeriodCommissions.filter(c => c.status === 'paid').length,
    hold: currentPeriodCommissions.filter(c => c.status === 'hold').length,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000) return `Rp${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `Rp${(amount / 1000).toFixed(0)}K`
    return `Rp${amount}`
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      calculated: 'bg-blue-100 text-blue-800',
      approved: 'bg-purple-100 text-purple-800',
      paid: 'bg-emerald-100 text-emerald-800',
      hold: 'bg-red-100 text-red-800',
    }
    return badges[status as keyof typeof badges] || badges.calculated
  }

  const toggleSelection = (id: string) => {
    setSelectedCommissions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const approveCommissions = () => {
    if (selectedCommissions.length === 0) {
      alert('Please select commissions first')
      return
    }
    alert(`Approved ${selectedCommissions.length} commission(s)`)
    setSelectedCommissions([])
  }

  const processPayment = () => {
    if (selectedCommissions.length === 0) {
      alert('Please select commissions first')
      return
    }
    const total = commissions
      .filter(c => selectedCommissions.includes(c.id))
      .reduce((sum, c) => sum + c.commissionAmount, 0)
    alert(`Processing payment for ${selectedCommissions.length} commission(s)\nTotal: ${formatCurrency(total)}`)
    setSelectedCommissions([])
  }

  const generateStatement = (agentId: string, agentName: string) => {
    alert(`Generating statement for ${agentName} (${agentId})`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            Insurance Admin
          </Link>
          <nav className="flex gap-6 items-center">
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
              Dashboard
            </Link>
            <Link href="/dashboard/billing" className="text-blue-600 font-medium">
              Billing
            </Link>
            <Link href="/dashboard/applications" className="text-gray-700 hover:text-blue-600 font-medium">
              Applications
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
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          {' > '}
          <Link href="/dashboard/billing" className="hover:text-blue-600">Billing</Link>
          {' > '}
          <span className="text-gray-900 font-medium">Commissions</span>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Commission Management</h1>
          <div className="flex gap-3">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition">
              📊 Run Calculation
            </button>
            {selectedCommissions.length > 0 && (
              <>
                <button
                  onClick={approveCommissions}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  ✓ Approve ({selectedCommissions.length})
                </button>
                <button
                  onClick={processPayment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  💳 Pay ({selectedCommissions.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Total Commissions (Aug 2026)</div>
            <div className="text-3xl font-bold text-purple-600">{formatShortCurrency(stats.totalCommissions)}</div>
            <div className="text-sm text-gray-500 mt-2">{stats.totalAgents} agents • {stats.totalPolicies} policies</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Paid Out</div>
            <div className="text-3xl font-bold text-emerald-600">{formatShortCurrency(stats.paidCommissions)}</div>
            <div className="text-xs text-emerald-600 mt-2">{stats.paid} statements paid</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Pending Payment</div>
            <div className="text-3xl font-bold text-amber-600">{formatShortCurrency(stats.pendingCommissions)}</div>
            <div className="text-xs text-amber-600 mt-2">{stats.approved + stats.calculated} pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Avg Commission Rate</div>
            <div className="text-3xl font-bold text-blue-600">{stats.avgCommissionRate}%</div>
            <div className="text-xs text-gray-500 mt-2">Across all agents</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Commission Trend (6 Months)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatShortCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={2} name="Commission Amount" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Agents */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Top Performers (August 2026)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topAgents} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => formatShortCurrency(value)} />
                <YAxis type="category" dataKey="agentName" width={100} style={{ fontSize: '12px' }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="commission" fill="#8b5cf6" name="Commission" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="grid md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Agent name, ID, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Periods</option>
                  <option value="2026-08">August 2026</option>
                  <option value="2026-07">July 2026</option>
                  <option value="2026-06">June 2026</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="calculated">Calculated</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('statements')}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${viewMode === 'statements' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Statements
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-blue-700">Calculated</div>
                <div className="text-2xl font-bold text-blue-900">{stats.calculated}</div>
              </div>
              <div className="text-2xl">📊</div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-purple-700">Approved</div>
                <div className="text-2xl font-bold text-purple-900">{stats.approved}</div>
              </div>
              <div className="text-2xl">✓</div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-emerald-700">Paid</div>
                <div className="text-2xl font-bold text-emerald-900">{stats.paid}</div>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-red-700">On Hold</div>
                <div className="text-2xl font-bold text-red-900">{stats.hold}</div>
              </div>
              <div className="text-2xl">⏸</div>
            </div>
          </div>
        </div>

        {/* Commissions Table */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input type="checkbox" className="w-4 h-4" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Agent</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Policies</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total Premium</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCommissions.map((commission) => (
                    <tr key={commission.id} className={`hover:bg-gray-50 ${selectedCommissions.includes(commission.id) ? 'bg-purple-50' : ''}`}>
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCommissions.includes(commission.id)}
                          onChange={() => toggleSelection(commission.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{commission.agentName}</div>
                        <div className="text-xs text-gray-600">{commission.agentId}</div>
                        <div className="text-xs text-gray-500">{commission.agentEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {commission.period}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-lg font-semibold text-gray-900">{commission.totalPolicies}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{formatCurrency(commission.totalPremium)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-purple-600">{commission.commissionRate}%</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-purple-900">{formatCurrency(commission.commissionAmount)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(commission.status)}`}>
                            {commission.status.toUpperCase()}
                          </span>
                          {commission.paidDate && (
                            <div className="text-xs text-emerald-600">
                              Paid: {new Date(commission.paidDate).toLocaleDateString('id-ID')}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => generateStatement(commission.agentId, commission.agentName)}
                            className="text-purple-600 hover:text-purple-700 text-sm font-medium text-left"
                          >
                            View Statement
                          </button>
                          {commission.status === 'calculated' && (
                            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium text-left">
                              Approve
                            </button>
                          )}
                          {commission.status === 'approved' && (
                            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium text-left">
                              Process Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statements View */}
        {viewMode === 'statements' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(new Set(filteredCommissions.map(c => c.agentId))).map(agentId => {
              const agentCommissions = filteredCommissions.filter(c => c.agentId === agentId)
              const agentName = agentCommissions[0]?.agentName
              const totalCommission = agentCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
              const totalPolicies = agentCommissions.reduce((sum, c) => sum + c.totalPolicies, 0)
              
              return (
                <div key={agentId} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition">
                  <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{agentName}</h3>
                        <div className="text-sm text-gray-600">{agentId}</div>
                      </div>
                      <div className="text-2xl">👤</div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Total Commission</div>
                      <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalCommission)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600">Periods</div>
                        <div className="text-lg font-semibold text-gray-900">{agentCommissions.length}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Policies</div>
                        <div className="text-lg font-semibold text-gray-900">{totalPolicies}</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      {agentCommissions.map(comm => (
                        <div key={comm.id} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="text-gray-700 font-medium">{comm.period}</span>
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusBadge(comm.status)}`}>
                              {comm.status}
                            </span>
                          </div>
                          <div className="font-semibold text-purple-600">{formatShortCurrency(comm.commissionAmount)}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => generateStatement(agentId, agentName)}
                      className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      Generate Full Statement
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
