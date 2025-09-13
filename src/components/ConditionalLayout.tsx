'use client'

import { usePathname } from 'next/navigation'
import HeaderResponsive from '@/components/HeaderResponsive'
import Footer from '@/components/Footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Check if current route is admin
  const isAdminRoute = pathname?.startsWith('/admin')
  
  // For admin routes, don't show header and footer
  if (isAdminRoute) {
    return <>{children}</>
  }
  
  // For non-admin routes, show header and footer
  return (
    <>
      <HeaderResponsive />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}
