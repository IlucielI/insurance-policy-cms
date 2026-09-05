'use client'

import { useState } from 'react'
import Link from 'next/link'
import { salesReportData, claimsReportData, financialReportData } from '@/lib/utils/mockData'
import { exportToPDF, exportToExcel, formatCurrency, formatNumber, type ReportData } from '@/lib/utils/exportUtils'

type ReportType = 'sales' | 'claims' | 'financial'

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('sales')
  const [dateFrom, setDateFrom] = useState('2026-01-01')
  const [dateTo, setDateTo] = useState('2026-09-04')

  const getReportData = (): { data: any[], columns: string[], title: string } => {
    switch (selectedReport) {
      case 'sales':
        return {
          title: 'Sales Report',
          data: salesReportData,
          columns: ['ID', 'Product', 'Customer', 'Premium', 'Sum Assured', 'Status', 'Date']
        }
      case 'claims':
        return {
          title: 'Claims Report',
          data: claimsReportData,
          columns: ['ID', 'Policy Number', 'Customer', 'Amount', 'Status', 'Date', 'Type']
        }
      case 'financial':
        return {
          title: 'Financial Report',
          data: financialReportData,
          columns: ['Month', 'Total Premium', 'Total Claims', 'Net Revenue', 'Policies Sold']
        }
      default:
        return { title: '', data: [], columns: [] }
    }
  }

  const getSummary = () => {
    const { data } = getReportData()
    
    switch (selectedReport) {
      case 'sales':
        const totalPremium = data.reduce((sum, item) => sum + item.premium, 0)
        const totalSumAssured = data.reduce((sum, item) => sum + item.sum_assured, 0)
        return {
          'Total Records': data.length,
          'Total Premium': formatCurrency(totalPremium),
          'Total Sum Assured': formatCurrency(totalSumAssured),
          'Active Policies': data.filter(d => d.status === 'Active').length
        }
      case 'claims':
        const totalClaimAmount = data.reduce((sum, item) => sum + item.claim_amount, 0)
        return {
          'Total Claims': data.length,
          'Total Amount': formatCurrency(totalClaimAmount),
          'Approved': data.filter(d => d.status === 'Approved').length,
          'Pending': data.filter(d => d.status === 'Pending').length,
          'Rejected': data.filter(d => d.status === 'Rejected').length
        }
      case 'financial':
        const totalRevenue = data.reduce((sum, item) => sum + item.net_revenue, 0)
        const totalPolicies = data.reduce((sum, item) => sum + item.policies_sold, 0)
        return {
          'Total Net Revenue': formatCurrency(totalRevenue),
          'Total Policies Sold': totalPolicies,
          'Average Monthly Revenue': formatCurrency(totalRevenue / data.length)
        }
      default:
        return {}
    }
  }

  const handleExportPDF = () => {
    const { data, columns, title } = getReportData()
    const reportData: ReportData = {
      title,
      data,
      columns,
      summary: getSummary()
    }
    exportToPDF(reportData)
  }

  const handleExportExcel = () => {
    const { data, columns, title } = getReportData()
    const reportData: ReportData = {
      title,
      data,
      columns,
      summary: getSummary()
    }
    exportToExcel(reportData)
  }

  const renderTable = () => {
    const { data, columns } = getReportData()

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.slice(0, 20).map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {selectedReport === 'sales' && (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.product}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(row.premium)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(row.sum_assured)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        row.status === 'Active' ? 'bg-green-100 text-green-800' :
                        row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{row.sale_date}</td>
                  </>
                )}
                {selectedReport === 'claims' && (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.policy_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(row.claim_amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        row.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        row.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{row.claim_date}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.type}</td>
                  </>
                )}
                {selectedReport === 'financial' && (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-900">{row.month}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(row.total_premium)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(row.total_claims)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(row.net_revenue)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatNumber(row.policies_sold)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const summary = getSummary()

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
            <Link href="/dashboard/reports" className="text-blue-600 font-medium">
              Reports
            </Link>
            <Link href="/dashboard/analytics" className="text-gray-700 hover:text-blue-600">
              Analytics
            </Link>
            <Link href="/dashboard/settings" className="text-gray-700 hover:text-blue-600">
              Settings
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Reports Dashboard</h1>
          <p className="text-gray-600">Generate and export standard reports</p>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value as ReportType)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sales">Sales Report</option>
                <option value="claims">Claims Report</option>
                <option value="financial">Financial Report</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleExportPDF}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {Object.entries(summary).map(([key, value]) => (
            <div key={key} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="text-sm text-gray-600 mb-1">{key}</div>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </div>
          ))}
        </div>

        {/* Report Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">{getReportData().title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Period: {dateFrom} to {dateTo}
            </p>
          </div>
          {renderTable()}
          <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-600">
            Showing 20 of {getReportData().data.length} records
          </div>
        </div>
      </div>
    </div>
  )
}
