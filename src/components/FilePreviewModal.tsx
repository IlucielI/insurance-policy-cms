'use client'

import { useEffect, useState } from 'react'

interface FilePreviewModalProps {
  file: {
    name: string
    type: string
    url: string
    size: number
  } | null
  onClose: () => void
}

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!file) return null

  const isPDF = file.type.includes('pdf')
  const isImage = file.type.includes('image')
  const canPreview = isPDF || isImage

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{file.name}</h3>
            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <a
              href={file.url}
              download={file.name}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition"
              title="Download"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isPDF && (
            <iframe
              src={file.url}
              className="w-full h-full min-h-[600px] border rounded"
              title={file.name}
            />
          )}

          {isImage && !imageError && (
            <div className="flex items-center justify-center min-h-[400px]">
              <img
                src={file.url}
                alt={file.name}
                className="max-w-full max-h-[70vh] object-contain rounded"
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {(!canPreview || imageError) && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
              <svg className="w-20 h-20 mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 2h8l4 4v12H4V2zm8 0v4h4l-4-4z"/>
              </svg>
              <p className="text-lg font-medium mb-2">Preview tidak tersedia</p>
              <p className="text-sm mb-4">File ini tidak dapat di-preview di browser</p>
              <a
                href={file.url}
                download={file.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
