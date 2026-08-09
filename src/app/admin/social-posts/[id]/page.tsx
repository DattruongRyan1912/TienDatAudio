import AdminSocialPostEditor from '@/components/admin/AdminSocialPostEditor'

export default async function AdminSocialPostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminSocialPostEditor postId={(await params).id} />
}
