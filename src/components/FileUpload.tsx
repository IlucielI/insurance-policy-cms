'use client'

import { useState, useRef } from 'react'

export interface UploadedFile {
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
}

interface FileUploadProps {
  onUploadComplete: (files: UploadedFile[]) => void
  bucket: string
  path?: string
  accept?: string
  maxSize?: number // in MB
  multiple?: boolean
  disabled?: boolean
}

export default function FileUpload({
  onUploadComplete,
  bucket,
  path = '',
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxSize = 10,
  multiple = false,
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    setError(null)
    setUploading(true)
    setProgress(0)

    try {
      const uploadedFiles: UploadedFile[] = []
      const totalFiles = selectedFiles.length

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File ${file.name} terlalu besar. Maksimal ${maxSize}MB`)
        }

        // Create FormData
        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', bucket)
        if (path) {
          formData.append('path', path)
        }

        // Upload to API endpoint
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload gagal')
        }

        const result = await response.json()
        uploadedFiles.push({
          name: result.fileName,
          size: result.fileSize,
          type: result.contentType,
          url: result.url,
          uploadedAt: new Date().toISOString(),
        })

        setProgress(Math.round(((i + 1) / totalFiles) * 100))
      }

      onUploadComplete(uploadedFiles)
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal')
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={uploading || disabled}
          className="hidden"
          id="file-upload"
        />
        
        {!uploading ? (
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-gray-600 mb-1">
                <span className="text-blue-600 font-medium">Klik untuk upload</span> atau drag & drop
              </p>
              <p className="text-xs text-gray-500">
                {accept.split(',').join(', ')} (maksimal {maxSize}MB)
              </p>
            </div>
          </label>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Uploading... {progress}%</p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  )
}
