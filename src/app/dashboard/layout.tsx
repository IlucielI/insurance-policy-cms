'use client'

import DashboardSidebar from '@/components/DashboardSidebar'
import DarkModeToggle from '@/components/ui/DarkModeToggle'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        {/* Top bar with dark mode toggle */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="flex items-center justify-end">
            <DarkModeToggle />
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}
