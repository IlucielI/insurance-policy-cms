'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTranslations } from 'next-intl'
import LanguageSwitcher from './LanguageSwitcher'

interface NavItem {
  label: string
  href: string
  icon: string
  requiredRoles?: string[]
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const { hasRole, isSuperAdmin, isUnderwriter, isClaimsOfficer, isFinance } = useAuth()
  const t = useTranslations()

  const navItems: NavItem[] = [
    { label: t('nav.dashboard'), href: '/dashboard', icon: '📊' },
    { label: t('nav.applications'), href: '/dashboard/applications', icon: '📋', requiredRoles: ['super_admin', 'underwriter'] },
    { label: t('nav.underwriting'), href: '/dashboard/underwriting', icon: '🔍', requiredRoles: ['super_admin', 'underwriter'] },
    { label: t('nav.products'), href: '/dashboard/products', icon: '📦', requiredRoles: ['super_admin'] },
    { label: t('nav.claims'), href: '/dashboard/claims', icon: '📝', requiredRoles: ['super_admin', 'claims_officer'] },
    { label: t('nav.customers'), href: '/dashboard/customers', icon: '👥', requiredRoles: ['super_admin'] },
    { label: t('nav.billing'), href: '/dashboard/billing', icon: '💰', requiredRoles: ['super_admin', 'finance'] },
    { label: t('nav.analytics'), href: '/dashboard/analytics', icon: '📈' },
    { label: t('nav.aiReview'), href: '/dashboard/ai-review', icon: '🤖', requiredRoles: ['super_admin', 'underwriter'] },
    { label: t('nav.reports'), href: '/dashboard/reports', icon: '📄' },
    { label: t('nav.settings'), href: '/dashboard/settings', icon: '⚙️', requiredRoles: ['super_admin'] },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const getRoleBadge = () => {
    if (isSuperAdmin) return { label: t('auth.roles.superAdmin'), color: 'bg-red-100 text-red-700' }
    if (isUnderwriter) return { label: t('auth.roles.underwriter'), color: 'bg-blue-100 text-blue-700' }
    if (isClaimsOfficer) return { label: t('auth.roles.claimsOfficer'), color: 'bg-amber-100 text-amber-700' }
    if (isFinance) return { label: t('auth.roles.finance'), color: 'bg-emerald-100 text-emerald-700' }
    return { label: t('auth.roles.user'), color: 'bg-gray-100 text-gray-700' }
  }

  const roleBadge = getRoleBadge()

  return (
    <aside className="w-64 bg-white border-r min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <Link href="/dashboard" className="text-xl font-bold text-blue-600">
          🏢 {t('sidebar.logo')}
        </Link>
      </div>

      {/* Role indicator & Language Switcher */}
      <div className="px-6 py-3 border-b bg-gray-50 space-y-2">
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${roleBadge.color}`}>
          {t('sidebar.roleBadge')} {roleBadge.label}
        </span>
        <div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Hide items user doesn't have permission for
          if (item.requiredRoles && item.requiredRoles.length > 0) {
            if (!hasRole(...item.requiredRoles)) return null
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-gray-400 text-center">
          {t('sidebar.version')}
        </div>
      </div>
    </aside>
  )
}
