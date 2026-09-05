'use client'

import { useState } from 'react'
import Link from 'next/link'

interface OutstandingInvoice {
  id: string
  invoiceNumber: string
  policyNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  amount: number
  dueDate: string
  daysOverdue: number
  lastReminderSent?: string
  reminderCount: number
  priority: 'high' | 'medium' | 'low'
}

export default function OutstandingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [showDunningModal, setShowDunningModal] = useState(false)

  // Mock data
  const mockOutstanding: OutstandingInvoice[] = [
    { id: '1', invoiceNumber: 'INV-2026-0756', policyNumber: 'POL-2026-1100', customerName: 'CV Sejahtera Mandiri', customerEmail: 'finance@sejahtera.co.id', customerPhone: '+62812-3456-7890', amount: 3200000, dueDate: '2026-08-20', daysOverdue: 15, lastReminderSent: '2026-09-01', reminderCount: 2, priority: 'high' },
    { id: '2', invoiceNumber: 'INV-2026-0755', policyNumber: 'POL-2026-1099', customerName: 'PT Maju Lancar', customerEmail: 'admin@majulancar.com', customerPhone: '+62811-2345-6789', amount: 5600000, dueDate: '2026-08-15', daysOverdue: 20, lastReminderSent: '2026-08-30', reminderCount: 3, priority: 'high' },
    { id: '3', invoiceNumber: 'INV-2026-0820', policyNumber: 'POL-2026-1150', customerName: 'UD Bahagia Sentosa', customerEmail: 'bahagia@sentosa.id', customerPhone: '+62813-4567-8901', amount: 2100000, dueDate: '2026-08-28', daysOverdue: 7, lastReminderSent: '2026-09-02', reminderCount: 1, priority: 'medium' },
    { id: '4', invoiceNumber: 'INV-2026-0830', policyNumber: 'POL-2026-1160', customerName: 'CV Gemilang Jaya', customerEmail: 'finance@gemilang.co.id', customerPhone: '+62814-5678-9012', amount: 4200000, dueDate: '2026-08-30', daysOverdue: 5, reminderCount: 1, priority: 'medium' },
    { id: '5', invoiceNumber: 'INV-2026-0845', policyNumber: 'POL-2026-1175', customerName: 'PT Berkah Mulia', customerEmail: 'admin@berkahmulia.com', customerPhone: '+62815-6789-0123', amount: 1800000, dueDate: '2026-09-01', daysOverdue: 3, reminderCount: 0, priority: 'low' },
    { id: '6', invoiceNumber: 'INV-2026-0700', policyNumber: 'POL-2026-1050', customerName: 'UD Karya Mandiri', customerEmail: 'karya@mandiri.id', customerPhone: '+62816-7890-1234', amount: 8900000, dueDate: '2026-08-10', daysOverdue: 25, lastReminderSent: '2026-08-28', reminderCount: 4, priority: 'high' },
    { id: '7', invoiceNumber: 'INV-2026-0850', policyNumber: 'POL-2026-1180', customerName: 'CV Sukses Bersama', customerEmail: 'finance@suksesbersama.co.id', customerPhone: '+62817-8901-2345', amount: 2950000, dueDate: '2026-09-02', daysOverdue: 2, reminderCount: 0, priority: 'low' },
  ]

  const [outstanding] = useState<OutstandingInvoice[]>(mockOutstanding)

  const filteredOutstanding = outstanding.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.policyNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || inv.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const stats = {
    total: outstanding.length,
    totalAmount: outstanding.reduce((sum, i) => sum + i.amount, 0),
    highPriority: outstanding.filter(i => i.priority === 'high').length,
    mediumPriority: outstanding.filter(i => i.priority === 'medium').length,
    lowPriority: outstanding.filter(i => i.priority === 'low').length,
    avgDaysOverdue: Math.round(outstanding.reduce((sum, i) => sum + i.daysOverdue, 0) / outstanding.length),
    over30Days: outstanding.filter(i => i.daysOverdue > 30).length,
    over60Days: outstanding.filter(i => i.daysOverdue > 60).length,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-amber-100 text-amber-800 border-amber-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    }
    return badges[priority as keyof typeof badges] || badges.low
  }

  const toggleSelection = (id: string) => {
    setSelectedInvoices(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedInvoices.length === filteredOutstanding.length) {
      setSelectedInvoices([])
    } else {
      setSelectedInvoices(filteredOutstanding.map(i => i.id))
    }
  }

  const sendReminder = (invoiceId: string) => {
    alert(`Reminder sent for invoice ${invoiceId}`)
  }

  const sendBulkReminders = () => {
    if (selectedInvoices.length === 0) {
      alert('Please select invoices first')
      return
    }
    alert(`Sending reminders to ${selectedInvoices.length} customers...`)
    setSelectedInvoices([])
  }

  const sendDunningNotice = () => {
    if (selectedInvoices.length === 0) {
      alert('Please select invoices first')
      return
    }
    setShowDunningModal(true)
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

      {/* Dunning Notice Modal */}
      {showDunningModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold text-red-600">Send Dunning Notice</h2>
              <p className="text-sm text-gray-600 mt-1">
                Final notice before legal action - {selectedInvoices.length} invoice(s) selected
              </p>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <span className="text-red-600 text-xl">⚠️</span>
                  <div>
                    <div className="font-semibold text-red-900">Warning: Serious Action</div>
                    <div className="text-sm text-red-700 mt-1">
                      Dunning notices are formal legal warnings. Only send if previous reminders have been ignored.
                      This may escalate to collection agency or legal proceedings.
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escalation Level
                  </label>
                  <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
                    <option>Level 1 - Final Warning (7 days to pay)</option>
                    <option>Level 2 - Pre-Legal Notice (3 days to pay)</option>
                    <option>Level 3 - Legal Action Initiated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Add context or special instructions..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="confirm-dunning" className="w-4 h-4" />
                  <label htmlFor="confirm-dunning" className="text-sm text-gray-700">
                    I confirm that all previous collection attempts have been exhausted
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    alert('Dunning notices sent successfully!')
                    setShowDunningModal(false)
                    setSelectedInvoices([])
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Send Dunning Notice
                </button>
                <button
                  onClick={() => setShowDunningModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          {' > '}
          <Link href="/dashboard/billing" className="hover:text-blue-600">Billing</Link>
          {' > '}
          <span className="text-gray-900 font-medium">Outstanding Balances</span>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Outstanding Balances</h1>
          <div className="flex gap-3">
            {selectedInvoices.length > 0 && (
              <>
                <button
                  onClick={sendBulkReminders}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  📧 Send Reminders ({selectedInvoices.length})
                </button>
                <button
                  onClick={sendDunningNotice}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  ⚠️ Dunning Notice ({selectedInvoices.length})
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Total Overdue</div>
            <div className="text-3xl font-bold text-red-600">{stats.total}</div>
            <div className="text-sm text-red-600 mt-2 font-semibold">{formatCurrency(stats.totalAmount)}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">High Priority</div>
            <div className="text-3xl font-bold text-red-600">{stats.highPriority}</div>
            <div className="text-xs text-gray-500 mt-2">&gt; 14 days overdue</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Avg Days Overdue</div>
            <div className="text-3xl font-bold text-amber-600">{stats.avgDaysOverdue}</div>
            <div className="text-xs text-gray-500 mt-2">Across all invoices</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-600 mb-1">Critical (&gt;30 days)</div>
            <div className="text-3xl font-bold text-red-600">{stats.over30Days}</div>
            <div className="text-xs text-red-600 mt-2">Immediate action needed</div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-red-700 font-medium">High Priority</div>
                <div className="text-2xl font-bold text-red-900 mt-1">{stats.highPriority} invoices</div>
              </div>
              <div className="text-3xl">🔴</div>
            </div>
            <div className="text-xs text-red-600 mt-2">&gt; 14 days overdue</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-amber-700 font-medium">Medium Priority</div>
                <div className="text-2xl font-bold text-amber-900 mt-1">{stats.mediumPriority} invoices</div>
              </div>
              <div className="text-3xl">🟡</div>
            </div>
            <div className="text-xs text-amber-600 mt-2">5-14 days overdue</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-blue-700 font-medium">Low Priority</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{stats.lowPriority} invoices</div>
              </div>
              <div className="text-3xl">🔵</div>
            </div>
            <div className="text-xs text-blue-600 mt-2">1-4 days overdue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Outstanding Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === filteredOutstanding.length && filteredOutstanding.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Days Overdue</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Reminders</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOutstanding.map((invoice) => (
                  <tr key={invoice.id} className={`hover:bg-gray-50 ${selectedInvoices.includes(invoice.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.id)}
                        onChange={() => toggleSelection(invoice.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">{invoice.policyNumber}</div>
                      <div className="text-xs text-gray-500">
                        Due: {new Date(invoice.dueDate).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{invoice.customerName}</div>
                      <div className="text-xs text-gray-600">{invoice.customerEmail}</div>
                      <div className="text-xs text-gray-600">{invoice.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-red-600">{formatCurrency(invoice.amount)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xl font-bold text-red-600">{invoice.daysOverdue}</div>
                      <div className="text-xs text-gray-500">days</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getPriorityBadge(invoice.priority)}`}>
                        {invoice.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{invoice.reminderCount} sent</div>
                      {invoice.lastReminderSent && (
                        <div className="text-xs text-gray-500">
                          Last: {new Date(invoice.lastReminderSent).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => sendReminder(invoice.id)}
                          className="text-amber-600 hover:text-amber-700 text-sm font-medium text-left"
                        >
                          Send Reminder
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium text-left">
                          View Invoice
                        </button>
                        <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium text-left">
                          Record Payment
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
