'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Customer {
  id: string
  full_name: string
  email: string
  phone: string
  date_of_birth: string
  age: number
  gender: string
  address: string
  city: string
  registration_date: string
  customer_status: string
  ltv: number
}

interface Policy {
  id: string
  product_name: string
  status: string
  sum_assured: number
  premium_amount: number
  start_date: string
  end_date: string
  payment_frequency: string
}

interface Claim {
  id: string
  policy_id: string
  claim_type: string
  claim_amount: number
  status: string
  filed_date: string
  resolution_date?: string
}

interface Communication {
  id: string
  type: string
  subject: string
  date: string
  status: string
  content: string
}

export default function Customer360Page() {
  const params = useParams()
  const customerId = params?.id as string
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'claims' | 'communications'>('overview')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [claims, setClaims] = useState<Claim[]>([])
  const [communications, setCommunications] = useState<Communication[]>([])

  useEffect(() => {
    fetchCustomerData()
  }, [customerId])

  const fetchCustomerData = async () => {
    try {
      const [customerRes, policiesRes, claimsRes, commsRes] = await Promise.all([
        fetch(`http://localhost:8080/api/v1/admin/customers/${customerId}`),
        fetch(`http://localhost:8080/api/v1/admin/customers/${customerId}/policies`),
        fetch(`http://localhost:8080/api/v1/admin/customers/${customerId}/claims`),
        fetch(`http://localhost:8080/api/v1/admin/customers/${customerId}/communications`)
      ])

      const customerData = await customerRes.json()
      const policiesData = await policiesRes.json()
      const claimsData = await claimsRes.json()
      const commsData = await commsRes.json()

      setCustomer(customerData.data)
      setPolicies(policiesData.data || [])
      setClaims(claimsData.data || [])
      setCommunications(commsData.data || [])
    } catch (err) {
      console.error('Failed to fetch:', err)
      // Mock data
      setCustomer({
        id: customerId,
        full_name: 'Budi Santoso',
        email: 'budi.santoso@example.com',
        phone: '+62 812-3456-7890',
        date_of_birth: '1989-03-15',
        age: 35,
        gender: 'Male',
        address: 'Jl. Sudirman No. 123, Jakarta',
        city: 'Jakarta',
        registration_date: '2024-01-15T10:30:00Z',
        customer_status: 'active',
        ltv: 45000000
      })

      setPolicies([
        {
          id: 'POL-2024-001',
          product_name: 'Term Life Insurance 10Y',
          status: 'active',
          sum_assured: 500000000,
          premium_amount: 450000,
          start_date: '2024-02-01',
          end_date: '2034-02-01',
          payment_frequency: 'monthly'
        },
        {
          id: 'POL-2025-089',
          product_name: 'Critical Illness Protection',
          status: 'active',
          sum_assured: 200000000,
          premium_amount: 350000,
          start_date: '2025-06-15',
          end_date: '2035-06-15',
          payment_frequency: 'monthly'
        }
      ])

      setClaims([
        {
          id: 'CLM-2026-045',
          policy_id: 'POL-2025-089',
          claim_type: 'Medical Expenses',
          claim_amount: 15000000,
          status: 'approved',
          filed_date: '2026-07-10',
          resolution_date: '2026-07-25'
        },
        {
          id: 'CLM-2026-112',
          policy_id: 'POL-2024-001',
          claim_type: 'Disability Benefit',
          claim_amount: 50000000,
          status: 'under_review',
          filed_date: '2026-08-28'
        }
      ])

      setCommunications([
        {
          id: 'COMM-001',
          type: 'email',
          subject: 'Policy Renewal Reminder',
          date: '2026-08-30T09:00:00Z',
          status: 'sent',
          content: 'Reminder: Your policy POL-2024-001 premium is due on September 1st.'
        },
        {
          id: 'COMM-002',
          type: 'phone',
          subject: 'Claim Status Inquiry',
          date: '2026-08-15T14:30:00Z',
          status: 'completed',
          content: 'Customer called to inquire about claim CLM-2026-112 status. Informed about underwriting review.'
        },
        {
          id: 'COMM-003',
          type: 'email',
          subject: 'New Application Submitted',
          date: '2026-09-01T10:30:00Z',
          status: 'sent',
          content: 'Thank you for your application. We have received your Term Life 500K application.'
        }
      ])
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-amber-100 text-amber-800',
      approved: 'bg-emerald-100 text-emerald-800',
      under_review: 'bg-amber-100 text-amber-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      completed: 'bg-emerald-100 text-emerald-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer data...</p>
        </div>
      </div>
    )
  }

  const stats = {
    active_policies: policies.filter(p => p.status === 'active').length,
    total_coverage: policies.reduce((sum, p) => sum + p.sum_assured, 0),
    monthly_premium: policies.reduce((sum, p) => sum + p.premium_amount, 0),
    total_claims: claims.length,
    pending_claims: claims.filter(c => c.status === 'under_review').length
  }

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
            <Link href="/dashboard/underwriting" className="text-blue-600 font-medium">
              Underwriting
            </Link>
            <Link href="/dashboard/applications" className="text-gray-700 hover:text-blue-600">
              Applications
            </Link>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                U
              </div>
              <span className="text-gray-700">Underwriter</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
              Dashboard
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/dashboard/customers" className="text-blue-600 hover:text-blue-700">
              Customers
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{customer.full_name}</span>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Customer Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                {customer.full_name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{customer.full_name}</h1>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {customer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {customer.city}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Customer since {new Date(customer.registration_date).toLocaleDateString('id-ID')}
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.customer_status)}`}>
                    {customer.customer_status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Lifetime Value</div>
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(customer.ltv)}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Active Policies</div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.active_policies}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border col-span-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Total Coverage</div>
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(stats.total_coverage)}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Monthly Premium</div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthly_premium)}</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-600">Total Claims</div>
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total_claims}</div>
            {stats.pending_claims > 0 && (
              <div className="text-xs text-amber-600 mt-1">{stats.pending_claims} pending</div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Overview', count: null },
                { id: 'policies', label: 'Policies', count: policies.length },
                { id: 'claims', label: 'Claims', count: claims.length },
                { id: 'communications', label: 'Communications', count: communications.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-6 py-4 font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">{tab.count}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Customer ID', value: customer.id },
                      { label: 'Full Name', value: customer.full_name },
                      { label: 'Email', value: customer.email },
                      { label: 'Phone', value: customer.phone },
                      { label: 'Date of Birth', value: new Date(customer.date_of_birth).toLocaleDateString('id-ID') },
                      { label: 'Age', value: `${customer.age} years` },
                      { label: 'Gender', value: customer.gender },
                      { label: 'Address', value: customer.address }
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-900 text-right">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Activity Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">New Application Submitted</div>
                        <div className="text-sm text-gray-600">Application APP-2026-001 for Term Life 500K</div>
                        <div className="text-xs text-gray-500 mt-1">September 1, 2026</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-amber-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Claim Filed</div>
                        <div className="text-sm text-gray-600">Disability benefit claim CLM-2026-112</div>
                        <div className="text-xs text-gray-500 mt-1">August 28, 2026</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-emerald-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Claim Approved</div>
                        <div className="text-sm text-gray-600">Medical expenses claim CLM-2026-045 approved</div>
                        <div className="text-xs text-gray-500 mt-1">July 25, 2026</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">New Policy Activated</div>
                        <div className="text-sm text-gray-600">Critical Illness Protection POL-2025-089</div>
                        <div className="text-xs text-gray-500 mt-1">June 15, 2025</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">First Policy Activated</div>
                        <div className="text-sm text-gray-600">Term Life Insurance POL-2024-001</div>
                        <div className="text-xs text-gray-500 mt-1">February 1, 2024</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Customer Registered</div>
                        <div className="text-sm text-gray-600">Account created</div>
                        <div className="text-xs text-gray-500 mt-1">January 15, 2024</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Policies Tab */}
            {activeTab === 'policies' && (
              <div className="space-y-4">
                {policies.map((policy) => (
                  <div key={policy.id} className="p-6 bg-gray-50 rounded-lg border hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-xl font-semibold text-gray-900">{policy.product_name}</h4>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(policy.status)}`}>
                            {policy.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">Policy ID: {policy.id}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(policy.sum_assured)}</div>
                        <div className="text-sm text-gray-600">Sum Assured</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Premium</div>
                        <div className="font-semibold text-gray-900">{formatCurrency(policy.premium_amount)}</div>
                        <div className="text-xs text-gray-500">{policy.payment_frequency}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Start Date</div>
                        <div className="font-semibold text-gray-900">{new Date(policy.start_date).toLocaleDateString('id-ID')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">End Date</div>
                        <div className="font-semibold text-gray-900">{new Date(policy.end_date).toLocaleDateString('id-ID')}</div>
                      </div>
                      <div className="text-right">
                        <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 text-sm font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Claims Tab */}
            {activeTab === 'claims' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Policy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filed Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{claim.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.policy_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{claim.claim_type}</td>
                        <td className="px-6 py-4 font-semibold text-gray-900">{formatCurrency(claim.claim_amount)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(claim.filed_date).toLocaleDateString('id-ID')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                            {claim.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Communications Tab */}
            {activeTab === 'communications' && (
              <div className="space-y-4">
                {communications.map((comm) => (
                  <div key={comm.id} className="p-6 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          comm.type === 'email' ? 'bg-blue-100' : 'bg-emerald-100'
                        }`}>
                          {comm.type === 'email' ? (
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{comm.subject}</div>
                          <div className="text-sm text-gray-600">
                            {comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} • {new Date(comm.date).toLocaleDateString('id-ID')} {new Date(comm.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(comm.status)}`}>
                        {comm.status}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{comm.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
