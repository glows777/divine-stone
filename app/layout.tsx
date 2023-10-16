import React from 'react'

import { Toaster } from 'sonner'

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ConvexClientProvider } from '@/components/providers/convex-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Divine Stone',
  description: 'The connected workspace where better, faster, work happens',
  icons: {
    icon: [
      {
        media: '(prefers-color-scheme: light)',
        url: '/apple.svg',
        href: '/apple.svg',
      },
      {
        media: '(prefers-color-scheme: dark)',
        url: '/apple-fill.svg',
        href: '/apple-fill.svg',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="divine-stone-theme"
          >
            <Toaster position="bottom-center" />
            {children}
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
