import type { Metadata } from 'next'
import './globals.css'
import AuthMiddleware from '@/components/AuthMiddleware'

export const metadata: Metadata = {
  title: 'Insurance Admin CMS',
  description: 'Admin panel for insurance policy management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="antialiased">
        <AuthMiddleware>
          {children}
        </AuthMiddleware>
      </body>
    </html>
  )
}
