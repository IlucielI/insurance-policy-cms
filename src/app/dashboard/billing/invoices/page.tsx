'use client'

import { useState } from 'react'
import Link from 'next/link'
import { downloadBillingPDF } from '@/lib/api/reports'

interface Invoice {
  id: string
  invoiceNumber: string
  policyNumber: string
  customerName: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  dueDate: string
  paidDate?: string
  createdAt: string
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'quarter'>('month')

  // Mock data
  const mockInvoices: Invoice[] = [
    { id: '1', invoiceNumber: 'INV-2026-0895', policyNumber: 'POL-2026-1234', customerName: 'PT Jaya Abadi', amount: 2500000, status: 'paid', dueDate: '2026-09-10', paidDate: '2026-09-08', createdAt: '2026-08-25' },
    { id: '2', invoiceNumber: 'INV-2026-0894', policyNumber: 'POL-2026-1235', customerName: 'CV Mitra Sejahtera', amount: 1800000, status: 'pending', dueDate: '2026-09-12', createdAt: '2026-08-27' },
    { id: '3', invoiceNumber: 'INV-2026-0893', policyNumber: 'POL-2026-1236', customerName: 'UD Karya Bersama', amount: 4500000, status: 'paid', dueDate: '2026-09-05', paidDate: '2026-09-04', createdAt: '2026-08-20' },
    { id: '4', invoiceNumber: 'INV-2026-0892', policyNumber: 'POL-2026-1237', customerName: 'PT Berkah Jaya', amount: 3200000, status: 'pending', dueDate: '2026-09-15', createdAt: '2026-08-30' },
    { id: '5', invoiceNumber: 'INV-2026-0756', policyNumber: 'POL-2026-1100', customerName: 'CV Sejahtera Mandiri', amount: 3200000, status: 'overdue', dueDate: '2026-08-20', createdAt: '2026-07-25' },
    { id: '6', invoiceNumber: 'INV-2026-0755', policyNumber: 'POL-2026-1099', customerName: 'PT Maju Lancar', amount: 5600000, status: 'overdue', dueDate: '2026-08-15', createdAt: '2026-07-20' },
    { id: '7', invoiceNumber: 'INV-2026-0720', policyNumber: 'POL-2026-1050', customerName: 'UD Bahagia Sentosa', amount: 2100000, status: 'paid', dueDate: '2026-08-10', paidDate: '2026-08-09', createdAt: '2026-07-15' },
    { id: '8', invoiceNumber: 'INV-2026-0705', policyNumber: 'POL-2026-1045', customerName: 'CV Gemilang', amount: 1950000, status: 'cancelled', dueDate: '2026-08-08', createdAt: '2026-07-10' },
    { id: '9', invoiceNumber: 'INV-2026-0890', policyNumber: 'POL-2026-1238', customerName: 'PT Sukses Bersama', amount: 6700000, status: 'pending', dueDate: '2026-09-20', createdAt: '2026-09-01' },
    { id: '10', invoiceNumber: 'INV-2026-0889', policyNumber: 'POL-2026-1239', customerName: 'UD Harmoni', amount: 2800000, status: 'paid', dueDate: '2026-09-08', paidDate: '2026-09-07', createdAt: '2026-08-23' },
  ]

  const [invoices] = useState<Invoice[]>(mockInvoices)

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'paid').length,
    pending: invoices.filter(i => i.status === 'pending').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.amount, 0),
    paidAmount: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0),
    pendingAmount: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
    overdueAmount: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0),
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-amber-100 text-amber-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const getStatusIcon = (status: string) => {
    const icons = {
      paid: '✓',
      pending: '⏱',
      overdue: '⚠',
      cancelled: '✕',
    }
    return icons[status as keyof typeof icons] || '•'
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
          <span className="text-gray-900 font-medium">Invoices</span>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Invoices Management</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition">
            + Create Invoice
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Total Invoices</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500 mt-2">{formatCurrency(stats.totalAmount)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Paid</div>
            <div className="text-3xl font-bold text-emerald-600">{stats.paid}</div>
            <div className="text-sm text-emerald-600 mt-2">{formatCurrency(stats.paidAmount)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
            <div className="text-sm text-amber-600 mt-2">{formatCurrency(stats.pendingAmount)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Overdue</div>
            <div className="text-3xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-red-600 mt-2">{formatCurrency(stats.overdueAmount)}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Invoice #, Customer, Policy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Policy #</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(invoice.createdAt).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{invoice.customerName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.policyNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{formatCurrency(invoice.amount)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.dueDate).toLocaleDateString('id-ID')}
                      </div>
                      {invoice.paidDate && (
                        <div className="text-xs text-emerald-600">
                          Paid: {new Date(invoice.paidDate).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(invoice.status)}`}>
                        <span>{getStatusIcon(invoice.status)}</span>
                        {invoice.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Lihat
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                          onClick={() => downloadBillingPDF(invoice.id)}
                        >
                          Unduh PDF
                        </button>
                        {invoice.status === 'pending' && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                              Catat Pembayaran
                            </button>
                          </>
                        )}
                        {invoice.status === 'overdue' && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                              Kirim Pengingat
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {filteredInvoices.length} of {stats.total} invoices
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">2</button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">3</button>
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
