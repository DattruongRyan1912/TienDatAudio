'use client'

import { usePathname } from 'next/navigation'
import SonicHeader from '@/components/sonic/SonicHeader'
import SonicFooter from '@/components/sonic/SonicFooter'
import FloatingContact from '@/components/sonic/FloatingContact'
import type { BusinessProfile } from '@/lib/business-profile'
import AssistantWidget from '@/modules/assistant/presentation/AssistantWidget'

interface ConditionalLayoutProps {
  children: React.ReactNode
  profile: BusinessProfile
  assistantEnabled: boolean
}

export default function ConditionalLayout({ children, profile, assistantEnabled }: ConditionalLayoutProps) {
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
      <SonicHeader />
      <main>
        {children}
      </main>
      {assistantEnabled && <AssistantWidget />}
      <FloatingContact profile={profile} />
      <SonicFooter profile={profile} />
    </>
  )
}
