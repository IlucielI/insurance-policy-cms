import type { Metadata } from 'next'
import './globals.css'
import AuthMiddleware from '@/components/AuthMiddleware'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import LocaleInitializer from '@/components/LocaleInitializer'

export const metadata: Metadata = {
  title: 'Insurance Admin CMS',
  description: 'Admin panel for insurance policy management',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const messages = await getMessages()

  return (
    <html lang="id">
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthMiddleware>
            <LocaleInitializer />
            {children}
          </AuthMiddleware>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
