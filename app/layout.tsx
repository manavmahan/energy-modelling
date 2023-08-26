import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Suspense } from 'react'
import { TopNavigation } from '../components/top-navigation'
import Footer from '@/components/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Energy Modelling App',
  description: 'Created by Manav Mahan Singh (for research purposes only)',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-cyan-100" />
        <Suspense fallback="...">
          <TopNavigation />
        </Suspense>
        <main className="flex min-h-screen flex-col items-center justify-center">
          <Providers>
            {children}
          </Providers>
        </main>
        <Footer />
      </body>
    </html>
  )
}
