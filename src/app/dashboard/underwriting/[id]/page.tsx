'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Application {
  id: string
  status: string
  user_id: string
  product_id: string
  premium_amount: number
  sum_assured: number
  created_at: string
  updated_at: string
  applicant_data: {
    full_name: string
    email: string
    phone: string
    date_of_birth: string
    age: number
    gender: string
    occupation: string
    annual_income: number
    address: string
    city: string
    postal_code: string
    marital_status: string
    smoker: boolean
    height_cm: number
    weight_kg: number
    bmi: number
  }
  medical_history: {
    existing_conditions: string[]
    medications: string[]
    surgeries: string[]
    family_history: string[]
    last_checkup: string
  }
  risk_assessment: {
    overall_score: number
    age_risk: number
    health_risk: number
    occupation_risk: number
    lifestyle_risk: number
    financial_risk: number
    recommendation: string
  }
  documents: {
    id_card: { status: string; uploaded_at: string }
    medical_report: { status: string; uploaded_at: string }
    income_proof: { status: string; uploaded_at: string }
  }
}

export default function UnderwritingDetailPage() {
  const params = useParams()
  const applicationId = params?.id as string
  const [application, setApplication] = useState<Application | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'medical' | 'risk' | 'documents'>('overview')
  const [notes, setNotes] = useState('')
  const [decision, setDecision] = useState('')

  useEffect(() => {
    fetchApplication()
  }, [applicationId])

  const fetchApplication = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/admin/applications/${applicationId}`)
      const data = await res.json()
      setApplication(data.data)
    } catch (err) {
      console.error('Failed to fetch:', err)
      // Mock detailed data
      const mockApp: Application = {
        id: applicationId,
        status: 'under_review',
        user_id: 'user1',
        product_id: 'TERM-LIFE-500K',
        premium_amount: 500000,
        sum_assured: 100000000,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
        applicant_data: {
          full_name: 'Budi Santoso',
          email: 'budi.santoso@example.com',
          phone: '+62 812-3456-7890',
          date_of_birth: '1989-03-15',
          age: 35,
          gender: 'Male',
          occupation: 'Software Engineer',
          annual_income: 180000000,
          address: 'Jl. Sudirman No. 123',
          city: 'Jakarta',
          postal_code: '12190',
          marital_status: 'Married',
          smoker: false,
          height_cm: 175,
          weight_kg: 72,
          bmi: 23.5
        },
        medical_history: {
          existing_conditions: ['Mild hypertension (controlled)'],
          medications: ['Amlodipine 5mg daily'],
          surgeries: ['Appendectomy (2015)'],
          family_history: ['Father: Diabetes Type 2', 'Mother: Hypertension'],
          last_checkup: '2026-07-15'
        },
        risk_assessment: {
          overall_score: 72,
          age_risk: 35,
          health_risk: 65,
          occupation_risk: 25,
          lifestyle_risk: 45,
          financial_risk: 20,
          recommendation: 'APPROVE with standard premium adjustment (+15%)'
        },
        documents: {
          id_card: { status: 'approved', uploaded_at: '2026-09-01T10:30:00Z' },
          medical_report: { status: 'pending', uploaded_at: '2026-09-01T10:35:00Z' },
          income_proof: { status: 'approved', uploaded_at: '2026-09-01T10:32:00Z' }
        }
      }
      setApplication(mockApp)
    }
  }

  const handleApprove = async () => {
    if (!confirm('Approve this application?')) return
    
    try {
      await fetch(`http://localhost:8080/api/v1/admin/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      alert('Application approved')
      fetchApplication()
    } catch (err) {
      console.error('Failed:', err)
      alert('Application approved (mock)')
    }
  }

  const handleReject = async () => {
    if (!confirm('Reject this application?')) return
    
    try {
      await fetch(`http://localhost:8080/api/v1/admin/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      alert('Application rejected')
      fetchApplication()
    } catch (err) {
      console.error('Failed:', err)
      alert('Application rejected (mock)')
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-emerald-600'
  }

  const getRiskBgColor = (score: number) => {
    if (score >= 80) return 'bg-red-50'
    if (score >= 50) return 'bg-amber-50'
    return 'bg-emerald-50'
  }

  const getDocStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-amber-100 text-amber-800',
      rejected: 'bg-red-100 text-red-800'
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

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
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
            <Link href="/dashboard/underwriting" className="text-blue-600 hover:text-blue-700">
              Underwriting Queue
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{application.id}</span>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{application.applicant_data.full_name}</h1>
              <div className="flex gap-4 text-sm text-gray-600">
                <span>Application ID: <span className="font-medium text-gray-900">{application.id}</span></span>
                <span>•</span>
                <span>Product: <span className="font-medium text-gray-900">{application.product_id}</span></span>
                <span>•</span>
                <span>Submitted: {new Date(application.created_at).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                href={`/dashboard/underwriting/${application.id}/documents`}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
              >
                View Documents
              </Link>
              <Link 
                href={`/dashboard/customers/${application.user_id}`}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 font-medium"
              >
                Customer 360
              </Link>
            </div>
          </div>

          {/* Risk Score Overview */}
          <div className="grid md:grid-cols-7 gap-4">
            <div className={`col-span-2 p-6 rounded-lg border-2 ${getRiskBgColor(application.risk_assessment.overall_score)}`}>
              <div className="text-sm font-medium text-gray-600 mb-2">Overall Risk Score</div>
              <div className={`text-5xl font-bold mb-2 ${getRiskColor(application.risk_assessment.overall_score)}`}>
                {application.risk_assessment.overall_score}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${application.risk_assessment.overall_score >= 80 ? 'bg-red-600' : application.risk_assessment.overall_score >= 50 ? 'bg-amber-600' : 'bg-emerald-600'}`}
                    style={{ width: `${application.risk_assessment.overall_score}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium text-gray-600">/ 100</span>
              </div>
            </div>

            <div className="col-span-5 grid grid-cols-5 gap-4">
              {[
                { label: 'Age', score: application.risk_assessment.age_risk },
                { label: 'Health', score: application.risk_assessment.health_risk },
                { label: 'Occupation', score: application.risk_assessment.occupation_risk },
                { label: 'Lifestyle', score: application.risk_assessment.lifestyle_risk },
                { label: 'Financial', score: application.risk_assessment.financial_risk }
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="text-xs font-medium text-gray-600 mb-2">{item.label}</div>
                  <div className={`text-2xl font-bold ${getRiskColor(item.score)}`}>
                    {item.score}
                  </div>
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${item.score >= 80 ? 'bg-red-600' : item.score >= 50 ? 'bg-amber-600' : 'bg-emerald-600'}`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-blue-900 mb-1">AI Recommendation</div>
                <div className="text-blue-800">{application.risk_assessment.recommendation}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b">
            <nav className="flex">
              {[
                { id: 'overview', label: 'Personal Info' },
                { id: 'medical', label: 'Medical History' },
                { id: 'risk', label: 'Risk Analysis' },
                { id: 'documents', label: 'Documents' }
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
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Full Name', value: application.applicant_data.full_name },
                      { label: 'Email', value: application.applicant_data.email },
                      { label: 'Phone', value: application.applicant_data.phone },
                      { label: 'Date of Birth', value: new Date(application.applicant_data.date_of_birth).toLocaleDateString('id-ID') },
                      { label: 'Age', value: `${application.applicant_data.age} years` },
                      { label: 'Gender', value: application.applicant_data.gender },
                      { label: 'Marital Status', value: application.applicant_data.marital_status }
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Professional & Financial</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Occupation', value: application.applicant_data.occupation },
                      { label: 'Annual Income', value: formatCurrency(application.applicant_data.annual_income) },
                      { label: 'Address', value: application.applicant_data.address },
                      { label: 'City', value: application.applicant_data.city },
                      { label: 'Postal Code', value: application.applicant_data.postal_code }
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold mt-6 mb-4">Health Metrics</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Height', value: `${application.applicant_data.height_cm} cm` },
                      { label: 'Weight', value: `${application.applicant_data.weight_kg} kg` },
                      { label: 'BMI', value: application.applicant_data.bmi.toFixed(1) },
                      { label: 'Smoker', value: application.applicant_data.smoker ? 'Yes' : 'No' }
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Medical Tab */}
            {activeTab === 'medical' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Existing Medical Conditions</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {application.medical_history.existing_conditions.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2">
                        {application.medical_history.existing_conditions.map((condition, idx) => (
                          <li key={idx} className="text-gray-700">{condition}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No existing conditions reported</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Current Medications</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {application.medical_history.medications.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2">
                        {application.medical_history.medications.map((med, idx) => (
                          <li key={idx} className="text-gray-700">{med}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No medications reported</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Past Surgeries</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {application.medical_history.surgeries.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2">
                        {application.medical_history.surgeries.map((surgery, idx) => (
                          <li key={idx} className="text-gray-700">{surgery}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No surgeries reported</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Family Medical History</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {application.medical_history.family_history.length > 0 ? (
                      <ul className="list-disc list-inside space-y-2">
                        {application.medical_history.family_history.map((history, idx) => (
                          <li key={idx} className="text-gray-700">{history}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No family history reported</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Last Medical Checkup</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{new Date(application.medical_history.last_checkup).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Analysis Tab */}
            {activeTab === 'risk' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Risk Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { 
                        label: 'Age Risk', 
                        score: application.risk_assessment.age_risk,
                        description: 'Based on actuarial tables and age-related mortality rates'
                      },
                      { 
                        label: 'Health Risk', 
                        score: application.risk_assessment.health_risk,
                        description: 'Assessed from medical history, BMI, existing conditions, and lifestyle'
                      },
                      { 
                        label: 'Occupation Risk', 
                        score: application.risk_assessment.occupation_risk,
                        description: 'Evaluated based on occupational hazards and risk classification'
                      },
                      { 
                        label: 'Lifestyle Risk', 
                        score: application.risk_assessment.lifestyle_risk,
                        description: 'Considers smoking status, exercise habits, and other lifestyle factors'
                      },
                      { 
                        label: 'Financial Risk', 
                        score: application.risk_assessment.financial_risk,
                        description: 'Analysis of income stability and premium affordability'
                      }
                    ].map((item) => (
                      <div key={item.label} className="bg-white p-4 rounded-lg border">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-900">{item.label}</span>
                          <span className={`text-2xl font-bold ${getRiskColor(item.score)}`}>{item.score}/100</span>
                        </div>
                        <div className="mb-3">
                          <div className="bg-gray-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full ${item.score >= 80 ? 'bg-red-600' : item.score >= 50 ? 'bg-amber-600' : 'bg-emerald-600'}`}
                              style={{ width: `${item.score}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">Coverage Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Requested Sum Assured</div>
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(application.sum_assured)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Monthly Premium</div>
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(application.premium_amount)}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Coverage Ratio</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {(application.sum_assured / application.applicant_data.annual_income).toFixed(1)}x
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Annual Income</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="text-sm text-gray-600 mb-1">Premium to Income</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {((application.premium_amount * 12 / application.applicant_data.annual_income) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Annual premium vs income</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                {Object.entries(application.documents).map(([docType, doc]) => (
                  <div key={docType} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{docType.replace('_', ' ').toUpperCase()}</div>
                        <div className="text-sm text-gray-500">
                          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDocStatusColor(doc.status)}`}>
                        {doc.status.toUpperCase()}
                      </span>
                      <button className="px-4 py-2 border rounded-lg hover:bg-white text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                ))}
                <div className="text-center py-8">
                  <Link
                    href={`/dashboard/underwriting/${application.id}/documents`}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All Documents →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decision Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold mb-4">Underwriting Decision</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Decision</label>
            <select 
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select decision...</option>
              <option value="approve">Approve - Standard Terms</option>
              <option value="approve_modified">Approve - Modified Terms</option>
              <option value="request_info">Request Additional Information</option>
              <option value="reject">Reject Application</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add underwriting notes, justification, or comments..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium"
            >
              Approve Application
            </button>
            <button
              onClick={handleReject}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Reject Application
            </button>
            <Link
              href="/dashboard/underwriting"
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 font-medium text-center"
            >
              Back to Queue
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
