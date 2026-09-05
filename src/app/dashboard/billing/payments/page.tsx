'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Payment {
  id: string
  paymentNumber: string
  invoiceNumber: string
  customerName: string
  amount: number
  method: 'bank_transfer' | 'credit_card' | 'e_wallet' | 'cash'
  status: 'completed' | 'pending' | 'failed' | 'reconciling'
  transactionId?: string
  paymentDate: string
  reconciled: boolean
}

export default function PaymentsPage() {
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [reconcileFilter, setReconcileFilter] = useState<string>('all')

  // Mock data
  const mockPayments: Payment[] = [
    { id: '1', paymentNumber: 'PAY-2026-0512', invoiceNumber: 'INV-2026-0895', customerName: 'PT Jaya Abadi', amount: 2500000, method: 'bank_transfer', status: 'completed', transactionId: 'TRX-BCA-20260904-1234', paymentDate: '2026-09-04T10:30:00Z', reconciled: true },
    { id: '2', paymentNumber: 'PAY-2026-0511', invoiceNumber: 'INV-2026-0893', customerName: 'UD Karya Bersama', amount: 4500000, method: 'bank_transfer', status: 'completed', transactionId: 'TRX-BNI-20260904-5678', paymentDate: '2026-09-04T09:15:00Z', reconciled: true },
    { id: '3', paymentNumber: 'PAY-2026-0510', invoiceNumber: 'INV-2026-0889', customerName: 'UD Harmoni', amount: 2800000, method: 'credit_card', status: 'completed', transactionId: 'TRX-CC-20260903-9012', paymentDate: '2026-09-03T14:20:00Z', reconciled: false },
    { id: '4', paymentNumber: 'PAY-2026-0509', invoiceNumber: 'INV-2026-0880', customerName: 'CV Gemilang Jaya', amount: 3200000, method: 'e_wallet', status: 'pending', transactionId: 'TRX-OVO-20260903-3456', paymentDate: '2026-09-03T16:45:00Z', reconciled: false },
    { id: '5', paymentNumber: 'PAY-2026-0508', invoiceNumber: 'INV-2026-0875', customerName: 'PT Sukses Mandiri', amount: 5600000, method: 'bank_transfer', status: 'reconciling', transactionId: 'TRX-MAN-20260903-7890', paymentDate: '2026-09-03T11:00:00Z', reconciled: false },
    { id: '6', paymentNumber: 'PAY-2026-0507', invoiceNumber: 'INV-2026-0870', customerName: 'UD Sejahtera', amount: 1800000, method: 'cash', status: 'completed', paymentDate: '2026-09-02T13:30:00Z', reconciled: true },
    { id: '7', paymentNumber: 'PAY-2026-0506', invoiceNumber: 'INV-2026-0865', customerName: 'PT Maju Bersama', amount: 7200000, method: 'bank_transfer', status: 'failed', transactionId: 'TRX-BRI-20260902-1111', paymentDate: '2026-09-02T10:15:00Z', reconciled: false },
  ]

  const [payments] = useState<Payment[]>(mockPayments)
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    amount: '',
    method: 'bank_transfer',
    transactionId: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const filteredPayments = payments.filter(pay => {
    const matchesSearch = pay.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pay.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pay.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (pay.transactionId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesMethod = methodFilter === 'all' || pay.method === methodFilter
    const matchesReconcile = reconcileFilter === 'all' || 
                            (reconcileFilter === 'reconciled' && pay.reconciled) ||
                            (reconcileFilter === 'unreconciled' && !pay.reconciled)
    return matchesSearch && matchesMethod && matchesReconcile
  })

  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    reconciled: payments.filter(p => p.reconciled).length,
    unreconciled: payments.filter(p => !p.reconciled).length,
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
      completed: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-amber-100 text-amber-800',
      failed: 'bg-red-100 text-red-800',
      reconciling: 'bg-blue-100 text-blue-800',
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  const getMethodLabel = (method: string) => {
    const labels = {
      bank_transfer: 'Bank Transfer',
      credit_card: 'Credit Card',
      e_wallet: 'E-Wallet',
      cash: 'Cash',
    }
    return labels[method as keyof typeof labels] || method
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle manual payment entry
    alert('Payment recorded successfully!')
    setShowManualEntry(false)
    setFormData({
      invoiceNumber: '',
      amount: '',
      method: 'bank_transfer',
      transactionId: '',
      paymentDate: new Date().toISOString().split('T')[0],
      notes: ''
    })
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
          <span className="text-gray-900 font-medium">Payments</span>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Payment Processing</h1>
          <button 
            onClick={() => setShowManualEntry(!showManualEntry)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            {showManualEntry ? 'Cancel' : '+ Record Payment'}
          </button>
        </div>

        {/* Manual Payment Entry Form */}
        {showManualEntry && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Manual Payment Entry</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="INV-2026-XXXX"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (IDR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={formData.method}
                    onChange={(e) => setFormData({...formData, method: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="e_wallet">E-Wallet</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    placeholder="Optional"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualEntry(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Total Payments</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500 mt-2">{formatCurrency(stats.totalAmount)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Completed</div>
            <div className="text-3xl font-bold text-emerald-600">{stats.completed}</div>
            <div className="text-xs text-emerald-600 mt-2">Successfully processed</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Reconciled</div>
            <div className="text-3xl font-bold text-blue-600">{stats.reconciled}</div>
            <div className="text-xs text-gray-500 mt-2">{stats.unreconciled} pending</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Failed</div>
            <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-xs text-red-600 mt-2">Requires attention</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Payment #, Invoice #, Transaction ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Methods</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="e_wallet">E-Wallet</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reconciliation</label>
                <select
                  value={reconcileFilter}
                  onChange={(e) => setReconcileFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="reconciled">Reconciled</option>
                  <option value="unreconciled">Unreconciled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{payment.paymentNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-medium">
                      {payment.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {getMethodLabel(payment.method)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-mono text-gray-600">
                        {payment.transactionId || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(payment.paymentDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(payment.status)}`}>
                          {payment.status.toUpperCase()}
                        </span>
                        {payment.reconciled && (
                          <div className="text-xs text-emerald-600">✓ Reconciled</div>
                        )}
                        {!payment.reconciled && payment.status === 'completed' && (
                          <div className="text-xs text-amber-600">⏱ Pending reconciliation</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium text-left">
                          View Details
                        </button>
                        {!payment.reconciled && payment.status === 'completed' && (
                          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium text-left">
                            Reconcile
                          </button>
                        )}
                        {payment.status === 'failed' && (
                          <button className="text-amber-600 hover:text-amber-700 text-sm font-medium text-left">
                            Retry
                          </button>
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
              Showing {filteredPayments.length} of {stats.total} payments
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
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
