'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthMiddleware({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/login' || pathname === '/') return

    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')

      if (!token) {
        router.push('/login')
        return
      }

      // For demo token, allow access but ensure user role is set
      if (token === 'demo-token') {
        const user = localStorage.getItem('user')
        if (!user) {
          localStorage.setItem('user', JSON.stringify({
            email: 'demo@insurance.com',
            role: 'super_admin',
            roles: ['super_admin'],
            name: 'Demo Admin',
          }))
        }
      }
    }
  }, [pathname, router])

  return <>{children}</>
}
