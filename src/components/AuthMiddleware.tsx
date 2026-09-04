'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthMiddleware({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/login') return

    // Check if user is authenticated
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      
      if (!token) {
        // Redirect to login if not authenticated
        router.push('/login')
      }
    }
  }, [pathname, router])

  return <>{children}</>
}
