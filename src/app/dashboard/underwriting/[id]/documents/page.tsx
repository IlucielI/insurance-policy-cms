'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import FileUpload, { type UploadedFile } from '@/components/FileUpload'
import FileList, { type FileItem } from '@/components/FileList'
import FilePreviewModal from '@/components/FilePreviewModal'

// MinIO buckets - constants only, no client import
const BUCKETS = {
  DOCUMENTS: 'insurance-documents',
  CLAIMS: 'insurance-claims',
  IDENTITY: 'insurance-identity',
} as const

interface Document {
  id: string
  type: string
  name: string
  status: 'pending' | 'approved' | 'rejected' | 'needs_review'
  uploaded_at: string
  reviewed_at?: string
  reviewed_by?: string
  file_url: string
  file_size: number
  mime_type: string
  notes?: string
  verification_details?: {
    name_match: boolean
    date_valid: boolean
    signature_present: boolean
    quality_acceptable: boolean
  }
}

export default function DocumentVerificationPage() {
  const params = useParams()
  const applicationId = params?.id as string
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [notes, setNotes] = useState('')
  const [previewFile, setPreviewFile] = useState<{ name: string; type: string; url: string; size: number } | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [applicationId])

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/applications/${applicationId}/documents`)
      const data = await res.json()
      setDocuments(data.data || [])
    } catch (err) {
      console.error('Failed to fetch:', err)
      // Mock documents
      const mockDocs: Document[] = [
        {
          id: 'doc1',
          type: 'id_card',
          name: 'KTP - Budi Santoso.pdf',
          status: 'approved',
          uploaded_at: '2026-09-01T10:30:00Z',
          reviewed_at: '2026-09-02T14:20:00Z',
          reviewed_by: 'Admin User',
          file_url: '/docs/ktp.pdf',
          file_size: 245000,
          mime_type: 'application/pdf',
          notes: 'ID verified - all information matches',
          verification_details: {
            name_match: true,
            date_valid: true,
            signature_present: true,
            quality_acceptable: true
          }
        },
        {
          id: 'doc2',
          type: 'medical_report',
          name: 'Medical Checkup Report.pdf',
          status: 'needs_review',
          uploaded_at: '2026-09-01T10:35:00Z',
          file_url: '/docs/medical.pdf',
          file_size: 1800000,
          mime_type: 'application/pdf',
          verification_details: {
            name_match: true,
            date_valid: true,
            signature_present: true,
            quality_acceptable: false
          }
        },
        {
          id: 'doc3',
          type: 'income_proof',
          name: 'Salary Slip - August 2026.pdf',
          status: 'approved',
          uploaded_at: '2026-09-01T10:32:00Z',
          reviewed_at: '2026-09-02T14:25:00Z',
          reviewed_by: 'Admin User',
          file_url: '/docs/salary.pdf',
          file_size: 180000,
          mime_type: 'application/pdf',
          notes: 'Income verified',
          verification_details: {
            name_match: true,
            date_valid: true,
            signature_present: true,
            quality_acceptable: true
          }
        }
      ]
      setDocuments(mockDocs)
    }
  }

  const handleUploadComplete = async (uploadedFiles: UploadedFile[]) => {
    // Refresh document list after upload
    fetchDocuments()
    setShowUpload(false)
    alert(`${uploadedFiles.length} file berhasil diupload`)
  }

  const handleApproveDocument = async (docId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents/${docId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      alert('Document approved')
      fetchDocuments()
      setSelectedDoc(null)
      setNotes('')
    } catch (err) {
      console.error('Failed:', err)
      // Optimistic update
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'approved' as const } : d))
      setSelectedDoc(null)
      setNotes('')
      alert('Document approved')
    }
  }

  const handleRejectDocument = async (docId: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/documents/${docId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      })
      alert('Document rejected')
      fetchDocuments()
      setSelectedDoc(null)
      setNotes('')
    } catch (err) {
      console.error('Failed:', err)
      // Optimistic update
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'rejected' as const } : d))
      setSelectedDoc(null)
      setNotes('')
      alert('Document rejected')
    }
  }

  const handleDeleteFile = async (file: FileItem) => {
    // Delete file from documents
    setDocuments(prev => prev.filter(d => d.id !== file.id))
  }

  const handleDownloadFile = (file: FileItem) => {
    window.open(file.url, '_blank')
  }

  const handlePreviewFile = (file: FileItem) => {
    setPreviewFile({
      name: file.name,
      type: file.type,
      url: file.url,
      size: file.size
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-emerald-100 text-emerald-800',
      pending: 'bg-gray-100 text-gray-800',
      needs_review: 'bg-amber-100 text-amber-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    if (status === 'approved') {
      return (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    }
    if (status === 'rejected') {
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
    if (status === 'needs_review') {
      return (
        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    }
    return (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const fileItems: FileItem[] = documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    size: doc.file_size,
    type: doc.mime_type,
    url: doc.file_url,
    uploadedAt: doc.uploaded_at,
    status: doc.status
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-blue-600">
            Insurance Admin CMS
          </Link>
          <nav className="flex gap-4 items-center">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
            <Link href="/dashboard/underwriting" className="text-gray-600 hover:text-blue-600">Underwriting</Link>
            <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">A</div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/dashboard/underwriting" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              ← Kembali ke Underwriting
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Verifikasi Dokumen</h1>
            <p className="text-gray-600 mt-1">Application ID: {applicationId}</p>
          </div>

          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Dokumen
          </button>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Upload Dokumen Baru</h2>
            <FileUpload
              onUploadComplete={handleUploadComplete}
              bucket={BUCKETS.DOCUMENTS}
              path={`applications/${applicationId}`}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              maxSize={10}
              multiple={true}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Daftar Dokumen</h2>
              <FileList
                files={fileItems}
                onDelete={handleDeleteFile}
                onDownload={handleDownloadFile}
                onPreview={handlePreviewFile}
                showActions={true}
              />
            </div>
          </div>

          {/* Review Panel */}
          <div className="lg:col-span-1">
            {selectedDoc ? (
              <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
                <h3 className="text-lg font-semibold mb-4">Review Document</h3>
                
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm font-medium text-gray-700 mb-2">{selectedDoc.name}</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedDoc.status)}
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(selectedDoc.status)}`}>
                      {selectedDoc.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {selectedDoc.verification_details && (
                  <div className="mb-4 pb-4 border-b">
                    <h4 className="text-sm font-semibold mb-3">Verification Checklist</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Name matches', value: selectedDoc.verification_details.name_match },
                        { label: 'Date valid', value: selectedDoc.verification_details.date_valid },
                        { label: 'Signature present', value: selectedDoc.verification_details.signature_present },
                        { label: 'Quality OK', value: selectedDoc.verification_details.quality_acceptable }
                      ].map((check) => (
                        <div key={check.label} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{check.label}</span>
                          {check.value ? (
                            <span className="text-emerald-600 font-medium">✓</span>
                          ) : (
                            <span className="text-red-600 font-medium">✗</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedDoc.status === 'pending' || selectedDoc.status === 'needs_review') && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Add notes..."
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      ></textarea>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveDocument(selectedDoc.id)}
                        className="flex-1 px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectDocument(selectedDoc.id)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </>
                )}

                <button
                  onClick={() => setSelectedDoc(null)}
                  className="w-full mt-3 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 font-medium"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">Pilih dokumen untuk review</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  )
}
