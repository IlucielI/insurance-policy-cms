'use client'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

/**
 * Download billing statement PDF for a given invoice ID.
 * Opens the PDF in a new tab for user to save/print.
 */
export async function downloadBillingPDF(invoiceId: string): Promise<void> {
  try {
    const url = `${API_BASE}/reports/billing/${invoiceId}/pdf`
    window.open(url, '_blank')
  } catch (error) {
    console.error('Gagal mengunduh PDF tagihan:', error)
    alert('Gagal mengunduh laporan tagihan.')
  }
}

/**
 * Download claims report Excel.
 * Uses direct download via anchor element.
 */
export async function downloadClaimsExcel(status?: string, claimType?: string): Promise<void> {
  try {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (claimType) params.set('claim_type', claimType)
    const url = `${API_BASE}/reports/claims/excel?${params.toString()}`
    triggerDownload(url, 'laporan-klaim.xlsx')
  } catch (error) {
    console.error('Gagal mengunduh laporan klaim:', error)
    alert('Gagal mengunduh laporan klaim.')
  }
}

/**
 * Download customer list Excel.
 */
export async function downloadCustomersExcel(): Promise<void> {
  try {
    const url = `${API_BASE}/reports/customers/excel`
    triggerDownload(url, 'daftar-pelanggan.xlsx')
  } catch (error) {
    console.error('Gagal mengunduh daftar pelanggan:', error)
    alert('Gagal mengunduh daftar pelanggan.')
  }
}

/**
 * Download analytics summary Excel.
 */
export async function downloadAnalyticsExcel(): Promise<void> {
  try {
    const url = `${API_BASE}/reports/analytics/excel`
    triggerDownload(url, 'ringkasan-analitik.xlsx')
  } catch (error) {
    console.error('Gagal mengunduh ringkasan analitik:', error)
    alert('Gagal mengunduh ringkasan analitik.')
  }
}

/**
 * Trigger browser download via hidden anchor.
 */
function triggerDownload(url: string, filename: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
