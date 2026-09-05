'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface RevenueData {
  month: string
  revenue: number
  payments: number
}

interface PaymentTrend {
  date: string
  amount: number
  count: number
}

export default function BillingDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  // Mock data
  const revenueByMonth: RevenueData[] = [
    { month: 'Jan', revenue: 45000000, payments: 38000000 },
    { month: 'Feb', revenue: 52000000, payments: 48000000 },
    { month: 'Mar', revenue: 48000000, payments: 45000000 },
    { month: 'Apr', revenue: 61000000, payments: 55000000 },
    { month: 'May', revenue: 55000000, payments: 52000000 },
    { month: 'Jun', revenue: 67000000, payments: 59000000 },
    { month: 'Jul', revenue: 72000000, payments: 65000000 },
    { month: 'Aug', revenue: 69000000, payments: 68000000 },
  ]

  const paymentTrends: PaymentTrend[] = [
    { date: '2026-08-01', amount: 15000000, count: 45 },
    { date: '2026-08-05', amount: 18000000, count: 52 },
    { date: '2026-08-10', amount: 22000000, count: 61 },
    { date: '2026-08-15', amount: 19000000, count: 58 },
    { date: '2026-08-20', amount: 25000000, count: 67 },
    { date: '2026-08-25', amount: 21000000, count: 55 },
    { date: '2026-08-30', amount: 23000000, count: 62 },
  ]

  const paymentMethodData = [
    { name: 'Bank Transfer', value: 45, color: '#3b82f6' },
    { name: 'Credit Card', value: 28, color: '#8b5cf6' },
    { name: 'E-Wallet', value: 18, color: '#10b981' },
    { name: 'Cash', value: 9, color: '#f59e0b' },
  ]

  const stats = {
    totalRevenue: 524000000,
    outstandingBalance: 89500000,
    paidThisMonth: 68000000,
    overdueAmount: 23400000,
    invoiceCount: 342,
    paidInvoices: 289,
    pendingInvoices: 38,
    overdueInvoices: 15,
    totalCommissions: 12800000,
    paidCommissions: 9600000,
    pendingCommissions: 3200000,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatShortCurrency = (amount: number) => {
    if (amount >= 1000000000) return `Rp${(amount / 1000000000).toFixed(1)}B`
    if (amount >= 1000000) return `Rp${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `Rp${(amount / 1000).toFixed(0)}K`
    return `Rp${amount}`
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
            <Link href="/dashboard/billing" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Billing Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg font-medium ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg font-medium ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-4 py-2 rounded-lg font-medium ${timeRange === 'quarter' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Quarter
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg font-medium ${timeRange === 'year' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-emerald-600 text-sm font-semibold">+12.5%</div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{formatShortCurrency(stats.totalRevenue)}</div>
            <div className="text-xs text-gray-500 mt-1">Lifetime total</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-600">Outstanding Balance</div>
              <div className="text-amber-600 text-sm font-semibold">17.1%</div>
            </div>
            <div className="text-3xl font-bold text-amber-600">{formatShortCurrency(stats.outstandingBalance)}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.pendingInvoices} pending invoices</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-600">Paid This Month</div>
              <div className="text-emerald-600 text-sm font-semibold">+8.3%</div>
            </div>
            <div className="text-3xl font-bold text-emerald-600">{formatShortCurrency(stats.paidThisMonth)}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.paidInvoices} paid invoices</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-2">
              <div className="text-sm text-gray-600">Overdue Amount</div>
              <div className="text-red-600 text-sm font-semibold">!</div>
            </div>
            <div className="text-3xl font-bold text-red-600">{formatShortCurrency(stats.overdueAmount)}</div>
            <div className="text-xs text-gray-500 mt-1">{stats.overdueInvoices} overdue invoices</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <Link href="/dashboard/billing/invoices" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center font-medium transition">
            📄 Invoices
          </Link>
          <Link href="/dashboard/billing/payments" className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg text-center font-medium transition">
            💳 Payments
          </Link>
          <Link href="/dashboard/billing/outstanding" className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-lg text-center font-medium transition">
            ⚠️ Outstanding
          </Link>
          <Link href="/dashboard/billing/commissions" className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center font-medium transition">
            💰 Commissions
          </Link>
          <button className="bg-gray-600 hover:bg-gray-700 text-white p-4 rounded-lg text-center font-medium transition">
            📊 Reports
          </button>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue vs Payments */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Revenue vs Payments</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatShortCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                <Bar dataKey="payments" fill="#10b981" name="Payments" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Payment Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Payment Trends (30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={paymentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).getDate().toString()} />
                <YAxis tickFormatter={(value) => formatShortCurrency(value)} />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))} 
                  labelFormatter={(label) => new Date(String(label)).toLocaleDateString('id-ID')}
                />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Amount" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Payment Methods */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Invoice Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Invoice Status</h2>
            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-gray-700">Paid</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{stats.paidInvoices}</div>
                  <div className="text-xs text-gray-500">84.5%</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-gray-700">Pending</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{stats.pendingInvoices}</div>
                  <div className="text-xs text-gray-500">11.1%</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-700">Overdue</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{stats.overdueInvoices}</div>
                  <div className="text-xs text-gray-500">4.4%</div>
                </div>
              </div>
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-gray-900">{stats.invoiceCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Commission Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Commission Summary</h2>
            <div className="space-y-4 mt-6">
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-700 mb-1">Total Commissions</div>
                <div className="text-2xl font-bold text-purple-900">{formatShortCurrency(stats.totalCommissions)}</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="text-sm text-emerald-700 mb-1">Paid Out</div>
                <div className="text-2xl font-bold text-emerald-900">{formatShortCurrency(stats.paidCommissions)}</div>
                <div className="text-xs text-emerald-600 mt-1">75% of total</div>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <div className="text-sm text-amber-700 mb-1">Pending</div>
                <div className="text-2xl font-bold text-amber-900">{formatShortCurrency(stats.pendingCommissions)}</div>
                <div className="text-xs text-amber-600 mt-1">25% of total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y">
            {[
              { type: 'payment', icon: '💳', title: 'Payment received', detail: 'Invoice #INV-2026-0892 - PT Jaya Abadi', amount: 2500000, time: '10 mins ago', positive: true },
              { type: 'invoice', icon: '📄', title: 'Invoice created', detail: 'Invoice #INV-2026-0893 - CV Mitra Sejahtera', amount: 1800000, time: '25 mins ago', positive: false },
              { type: 'overdue', icon: '⚠️', title: 'Invoice overdue', detail: 'Invoice #INV-2026-0756 - 15 days overdue', amount: 3200000, time: '1 hour ago', positive: false },
              { type: 'commission', icon: '💰', title: 'Commission paid', detail: 'Agent: Budi Santoso - August 2026', amount: 850000, time: '2 hours ago', positive: true },
              { type: 'payment', icon: '💳', title: 'Payment received', detail: 'Invoice #INV-2026-0891 - UD Karya Bersama', amount: 4500000, time: '3 hours ago', positive: true },
            ].map((activity, idx) => (
              <div key={idx} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <div className="text-2xl">{activity.icon}</div>
                  <div>
                    <div className="font-medium text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-600">{activity.detail}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${activity.positive ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {activity.positive ? '+' : ''}{formatCurrency(activity.amount)}
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t text-center">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              View All Activity →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
