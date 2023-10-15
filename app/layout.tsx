import React from 'react'

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

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
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
