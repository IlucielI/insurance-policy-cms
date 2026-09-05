'use client'

import { useState, useEffect } from 'react'

interface UserClaims {
  user_id: string
  email: string
  roles: string[]
  exp?: number
  iat?: number
}

interface AuthState {
  user: UserClaims | null
  roles: string[]
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isUnderwriter: boolean
  isClaimsOfficer: boolean
  isFinance: boolean
  hasRole: (...roles: string[]) => boolean
  hasAnyRole: (...roles: string[]) => boolean
  loading: boolean
}

function parseJwt(token: string): UserClaims | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function useAuth(): AuthState {
  const [claims, setClaims] = useState<UserClaims | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAuth = () => {
      if (typeof window === 'undefined') return

      const token = localStorage.getItem('token')
      if (!token || token === 'demo-token') {
        // Demo/fallback: try to get from stored user
        try {
          const stored = localStorage.getItem('user')
          if (stored) {
            const user = JSON.parse(stored)
            setClaims({
              user_id: user.id || 'demo',
              email: user.email || 'demo@insurance.com',
              roles: user.roles || [user.role || 'super_admin'],
            })
          }
        } catch {
          // ignore
        }
        setLoading(false)
        return
      }

      const parsed = parseJwt(token)
      setClaims(parsed)
      setLoading(false)
    }

    loadAuth()

    // Listen for storage changes (login from another tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        loadAuth()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const roles = claims?.roles || []
  const hasRole = (...required: string[]): boolean =>
    required.some((r) => roles.includes(r))

  return {
    user: claims,
    roles,
    isAuthenticated: !!claims || (typeof window !== 'undefined' && !!localStorage.getItem('token')),
    isSuperAdmin: roles.includes('super_admin'),
    isUnderwriter: roles.includes('underwriter'),
    isClaimsOfficer: roles.includes('claims_officer'),
    isFinance: roles.includes('finance'),
    hasRole,
    hasAnyRole: hasRole,
    loading,
  }
}

export default useAuth
