'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface AIReviewResult {
  application_id: string
  risk_score: number
  recommendation: 'approve' | 'reject' | 'review'
  reasoning: string
  red_flags: string[]
  green_flags: string[]
  confidence: number
}

function AIReviewContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('id')
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIReviewResult | null>(null)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)

  const runAIReview = async () => {
    if (!applicationId) {
      setError('Application ID required')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
      const res = await fetch(`${apiUrl}/admin/ai-review/${applicationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!res.ok) throw new Error('AI review failed')
      
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError('Gagal melakukan AI review. Pastikan backend sudah berjalan.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const applyRecommendation = async () => {
    if (!result) return

    setApplying(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
      const statusMap = {
        approve: 'approved',
        reject: 'rejected',
        review: 'under_review'
      }
      
      await fetch(`${apiUrl}/admin/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusMap[result.recommendation] })
      })

      alert(`Status berhasil diupdate: ${statusMap[result.recommendation]}`)
      router.push('/dashboard/applications')
    } catch (err) {
      alert('Gagal mengupdate status')
    } finally {
      setApplying(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-emerald-600'
    if (score < 70) return 'text-amber-600'
    return 'text-red-600'
  }

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low Risk'
    if (score < 70) return 'Medium Risk'
    return 'High Risk'
  }

  const getRecommendationColor = (rec: string) => {
    const colors = {
      approve: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      reject: 'bg-red-100 text-red-800 border-red-300',
      review: 'bg-amber-100 text-amber-800 border-amber-300'
    }
    return colors[rec as keyof typeof colors] || colors.review
  }

  const getRecommendationIcon = (rec: string) => {
    const icons = {
      approve: '✓',
      reject: '✗',
      review: '👁'
    }
    return icons[rec as keyof typeof icons] || '?'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/applications"
            className="text-indigo-600 hover:text-indigo-700 flex items-center gap-2 mb-4"
          >
            ← Kembali ke Applications
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            🤖 AI Application Review
          </h1>
          <p className="text-slate-600 mt-2">
            Analisis risiko dan rekomendasi otomatis menggunakan AI
          </p>
        </div>

        {/* Input Section */}
        {!result && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Application ID
                </label>
                <input
                  type="text"
                  value={applicationId || ''}
                  readOnly
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-slate-700"
                  placeholder="Application ID from URL"
                />
              </div>
              <button
                onClick={runAIReview}
                disabled={loading || !applicationId}
                className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⚙️</span> Analyzing...
                  </span>
                ) : (
                  '🚀 Run AI Review'
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6">
            {/* Risk Score Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">Risk Assessment</h2>
              
              <div className="grid grid-cols-3 gap-6">
                {/* Risk Score */}
                <div className="text-center">
                  <div className={`text-5xl font-bold ${getRiskColor(result.risk_score)}`}>
                    {result.risk_score}
                  </div>
                  <div className="text-sm text-slate-600 mt-2">{getRiskLabel(result.risk_score)}</div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                    <div
                      className={`h-2 rounded-full ${
                        result.risk_score < 30 ? 'bg-emerald-500' :
                        result.risk_score < 70 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.risk_score}%` }}
                    />
                  </div>
                </div>

                {/* Recommendation */}
                <div className="text-center">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-lg font-semibold ${getRecommendationColor(result.recommendation)}`}>
                    <span className="text-2xl">{getRecommendationIcon(result.recommendation)}</span>
                    {result.recommendation.toUpperCase()}
                  </div>
                  <div className="text-sm text-slate-600 mt-3">AI Recommendation</div>
                </div>

                {/* Confidence */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-indigo-600">
                    {Math.round(result.confidence * 100)}%
                  </div>
                  <div className="text-sm text-slate-600 mt-2">Confidence Level</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {result.confidence > 0.8 ? 'High' : result.confidence > 0.6 ? 'Medium' : 'Low'}
                  </div>
                </div>
              </div>
            </div>

            {/* Reasoning */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">AI Reasoning</h2>
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {result.reasoning}
                </div>
              </div>
            </div>

            {/* Flags */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Red Flags */}
              <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                  🚩 Red Flags ({result.red_flags.length})
                </h3>
                {result.red_flags.length > 0 ? (
                  <ul className="space-y-2">
                    {result.red_flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-red-700">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-red-600 italic">No red flags detected</p>
                )}
              </div>

              {/* Green Flags */}
              <div className="bg-emerald-50 rounded-xl border-2 border-emerald-200 p-6">
                <h3 className="text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                  ✅ Green Flags ({result.green_flags.length})
                </h3>
                {result.green_flags.length > 0 ? (
                  <ul className="space-y-2">
                    {result.green_flags.map((flag, i) => (
                      <li key={i} className="flex items-start gap-2 text-emerald-700">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-emerald-600 italic">No positive factors detected</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Apply AI Recommendation?</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    This will update the application status to: <strong>{result.recommendation}</strong>
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setResult(null)}
                    className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Review Again
                  </button>
                  <button
                    onClick={applyRecommendation}
                    disabled={applying}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 transition-colors"
                  >
                    {applying ? 'Applying...' : '✓ Apply Recommendation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AIReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <AIReviewContent />
    </Suspense>
  )
}
