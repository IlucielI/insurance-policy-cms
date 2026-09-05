// Analytics API client
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export interface SummaryStats {
  total_approved: number
  total_premium_ytd: number
  total_claims: number
  total_claims_paid: number
  active_policies: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  policy_count: number
}

export interface StatusCount {
  status: string
  count: number
}

export interface MonthlyGrowth {
  month: string
  new_policies: number
  premium: number
}

export interface ProductRank {
  product_name: string
  category: string
  application_count: number
  total_premium: number
}

export interface AnalyticsDashboard {
  summary: SummaryStats
  monthly_revenue: MonthlyRevenue[]
  claims_status: StatusCount[]
  policy_growth: MonthlyGrowth[]
  top_products: ProductRank[]
}

export async function fetchDashboardAnalytics(months: number = 12): Promise<AnalyticsDashboard> {
  const res = await fetch(`${API_BASE}/admin/analytics/dashboard?months=${months}`)
  if (!res.ok) {
    throw new Error(`Gagal memuat analytics: ${res.status}`)
  }
  const json = await res.json()
  return json.data
}

export async function fetchRevenue(months: number = 12) {
  const res = await fetch(`${API_BASE}/admin/analytics/revenue?months=${months}`)
  if (!res.ok) {
    throw new Error(`Gagal memuat revenue: ${res.status}`)
  }
  return res.json()
}

export async function fetchClaimsStatus() {
  const res = await fetch(`${API_BASE}/admin/analytics/claims`)
  if (!res.ok) {
    throw new Error(`Gagal memuat status klaim: ${res.status}`)
  }
  return res.json()
}

export async function fetchTopProducts() {
  const res = await fetch(`${API_BASE}/admin/analytics/products`)
  if (!res.ok) {
    throw new Error(`Gagal memuat produk: ${res.status}`)
  }
  return res.json()
}
