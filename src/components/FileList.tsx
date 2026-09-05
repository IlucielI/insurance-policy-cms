'use client'

import { useState } from 'react'

export interface FileItem {
  id?: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
  status?: 'pending' | 'approved' | 'rejected' | 'needs_review'
}

interface FileListProps {
  files: FileItem[]
  onDelete?: (file: FileItem) => void
  onDownload?: (file: FileItem) => void
  onPreview?: (file: FileItem) => void
  showActions?: boolean
}

export default function FileList({
  files,
  onDelete,
  onDownload,
  onPreview,
  showActions = true,
}: FileListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      minute: '2-digit',
    })
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) {
      return (
        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z"/>
        </svg>
      )
    }
    if (type.includes('image')) {
      return (
        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3h12c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V4c0-.6.4-1 1-1zm0 13h12V4H4v12zm2-9l3 4 2-3 4 5H5l1-6z"/>
        </svg>
      )
    }
    if (type.includes('word') || type.includes('document')) {
      return (
        <svg className="w-8 h-8 text-blue-700" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 2h8l4 4v12H4V2zm8 0v4h4l-4-4zM6 8h8v1H6V8zm0 3h8v1H6v-1zm0 3h5v1H6v-1z"/>
        </svg>
      )
    }
    return (
      <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 2h8l4 4v12H4V2zm8 0v4h4l-4-4z"/>
      </svg>
    )
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      needs_review: 'bg-orange-100 text-orange-800',
    }

    const labels = {
      pending: 'Pending',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      needs_review: 'Perlu Review',
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const handleDelete = async (file: FileItem) => {
    if (!onDelete) return
    
    const confirmed = confirm(`Yakin ingin menghapus ${file.name}?`)
    if (!confirmed) return

    setDeletingId(file.id || file.name)
    try {
      await onDelete(file)
    } finally {
      setDeletingId(null)
    }
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm">Belum ada file</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {files.map((file, idx) => (
        <div
          key={file.id || idx}
          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
        >
          <div className="flex-shrink-0">
            {getFileIcon(file.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              {getStatusBadge(file.status)}
            </div>
            <p className="text-xs text-gray-500">
              {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
            </p>
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              {onPreview && (
                <button
                  onClick={() => onPreview(file)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                  title="Preview"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              )}

              {onDownload && (
                <button
                  onClick={() => onDownload(file)}
                  className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition"
                  title="Download"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              )}

              {onDelete && (
                <button
                  onClick={() => handleDelete(file)}
                  disabled={deletingId === (file.id || file.name)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                  title="Hapus"
                >
                  {deletingId === (file.id || file.name) ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
