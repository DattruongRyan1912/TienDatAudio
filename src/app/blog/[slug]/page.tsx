import { permanentRedirect } from 'next/navigation'

export default async function LegacyBlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  permanentRedirect(`/kien-thuc/${slug}`)
}
