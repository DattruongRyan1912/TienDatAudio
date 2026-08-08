import SonicAdminShell from '@/components/admin/SonicAdminShell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <SonicAdminShell>{children}</SonicAdminShell>
}

