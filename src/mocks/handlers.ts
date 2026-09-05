import { http, HttpResponse } from 'msw'

const API_URL = 'http://localhost:8080/api/v1'

export const handlers = [
  // Auth - Login
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as any
    
    if (body.email === 'admin@insurance.com' || body.email) {
      return HttpResponse.json({
        token: 'admin-token-123',
        user: {
          id: '1',
          email: body.email,
          name: 'Admin User',
          role: 'admin',
        },
        roles: ['super_admin'],
      })
    }
    
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
  }),

  // Applications - List
  http.get(`${API_URL}/applications`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          application_number: 'APP-2026-001',
          customer_name: 'John Doe',
          product_name: 'Asuransi Jiwa Premium',
          status: 'pending',
          created_at: '2026-09-01',
        },
      ],
      total: 1,
    })
  }),

  // Claims - List
  http.get(`${API_URL}/claims`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          claim_number: 'CLM-2026-001',
          policy_number: 'POL-2026-001',
          claim_type: 'Rawat Inap',
          amount_claimed: 5000000,
          status: 'submitted',
          created_at: '2026-09-01',
        },
      ],
      total: 1,
    })
  }),

  // Customers - List
  http.get(`${API_URL}/customers`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '08123456789',
          policies_count: 2,
        },
      ],
      total: 1,
    })
  }),

  // Products - List
  http.get(`${API_URL}/products`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'Asuransi Jiwa Premium',
          category: 'life',
          premium_min: 500000,
          premium_max: 5000000,
          active: true,
        },
      ],
      total: 1,
    })
  }),

  // Analytics
  http.get(`${API_URL}/analytics/dashboard`, () => {
    return HttpResponse.json({
      total_applications: 150,
      total_policies: 120,
      total_claims: 25,
      total_revenue: 50000000,
    })
  }),
]
