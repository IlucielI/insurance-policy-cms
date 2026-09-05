// Mock data for reports and analytics

export const salesReportData = Array.from({ length: 50 }, (_, i) => ({
  id: `POL-${String(i + 1).padStart(5, '0')}`,
  product: ['Life Insurance', 'Health Insurance', 'Motor Insurance', 'Travel Insurance'][Math.floor(Math.random() * 4)],
  customer_name: `Customer ${i + 1}`,
  premium: Math.floor(Math.random() * 5000000) + 500000,
  sum_assured: Math.floor(Math.random() * 500000000) + 50000000,
  status: ['Active', 'Pending', 'Expired'][Math.floor(Math.random() * 3)],
  sale_date: new Date(2026, 8 - Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
  agent: `Agent ${Math.floor(Math.random() * 10) + 1}`
}));

export const claimsReportData = Array.from({ length: 40 }, (_, i) => ({
  id: `CLM-${String(i + 1).padStart(5, '0')}`,
  policy_number: `POL-${String(Math.floor(Math.random() * 100) + 1).padStart(5, '0')}`,
  customer_name: `Customer ${Math.floor(Math.random() * 50) + 1}`,
  claim_amount: Math.floor(Math.random() * 50000000) + 1000000,
  status: ['Approved', 'Pending', 'Rejected', 'Under Review'][Math.floor(Math.random() * 4)],
  claim_date: new Date(2026, 8 - Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
  type: ['Accident', 'Illness', 'Death', 'Disability'][Math.floor(Math.random() * 4)]
}));

export const financialReportData = Array.from({ length: 12 }, (_, i) => {
  const month = new Date(2025, i, 1);
  return {
    month: month.toLocaleDateString('id-ID', { year: 'numeric', month: 'long' }),
    total_premium: Math.floor(Math.random() * 500000000) + 100000000,
    total_claims: Math.floor(Math.random() * 200000000) + 50000000,
    net_revenue: 0,
    policies_sold: Math.floor(Math.random() * 200) + 50,
    active_policies: Math.floor(Math.random() * 1000) + 500
  };
}).map(item => ({
  ...item,
  net_revenue: item.total_premium - item.total_claims
}));

export const kpiData = {
  total_policies: 4523,
  active_policies: 3891,
  total_premium_ytd: 2450000000,
  total_claims_ytd: 890000000,
  conversion_rate: 68.5,
  claim_ratio: 36.3,
  customer_satisfaction: 4.6,
  policy_growth: 12.4
};

export const monthlyTrendData = Array.from({ length: 12 }, (_, i) => {
  const date = new Date(2025, i, 1);
  return {
    month: date.toLocaleDateString('id-ID', { month: 'short' }),
    policies: Math.floor(Math.random() * 200) + 100,
    premium: Math.floor(Math.random() * 400000000) + 150000000,
    claims: Math.floor(Math.random() * 150000000) + 50000000
  };
});

export const productDistributionData = [
  { name: 'Life Insurance', value: 45, color: '#3b82f6' },
  { name: 'Health Insurance', value: 30, color: '#10b981' },
  { name: 'Motor Insurance', value: 15, color: '#f59e0b' },
  { name: 'Travel Insurance', value: 10, color: '#ef4444' }
];

export const claimStatusData = [
  { name: 'Approved', value: 245, color: '#10b981' },
  { name: 'Pending', value: 89, color: '#f59e0b' },
  { name: 'Rejected', value: 34, color: '#ef4444' },
  { name: 'Under Review', value: 67, color: '#6366f1' }
];

export const usersData = Array.from({ length: 25 }, (_, i) => ({
  id: `USR-${String(i + 1).padStart(4, '0')}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@insurance.com`,
  role: ['Admin', 'Manager', 'Agent', 'Underwriter'][Math.floor(Math.random() * 4)],
  status: Math.random() > 0.2 ? 'Active' : 'Inactive',
  last_login: new Date(2026, 8, Math.floor(Math.random() * 4) + 1).toISOString(),
  created_at: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
}));

export const auditLogsData = Array.from({ length: 100 }, (_, i) => ({
  id: `LOG-${String(i + 1).padStart(6, '0')}`,
  user: `user${Math.floor(Math.random() * 25) + 1}@insurance.com`,
  action: ['Login', 'Logout', 'Create Policy', 'Update Policy', 'Approve Claim', 'Reject Claim', 'Update Settings'][Math.floor(Math.random() * 7)],
  resource: ['User', 'Policy', 'Claim', 'Settings', 'Report'][Math.floor(Math.random() * 5)],
  timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
  ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
  status: Math.random() > 0.1 ? 'Success' : 'Failed'
}));
