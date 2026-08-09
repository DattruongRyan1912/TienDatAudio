import AdminPostEditor from '@/components/admin/AdminPostEditor'

export default async function AdminPostEditorPage({ params }: { params: Promise<{ id: string }> }) {
  return <AdminPostEditor postId={(await params).id} />
}
