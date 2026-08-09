import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { getContentPostById, listContentPosts } from '@/lib/content-repository'
import { suggestInternalLinks } from '@/lib/content-seo'
import { getSEOConfig } from '@/lib/seo-strategy'

type Context = { params: Promise<unknown> }

export async function GET(_request: Request, { params }: Context) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const id = String(((await params) as { id?: string }).id || '')
    const [post, posts, config] = await Promise.all([
      getContentPostById(id),
      listContentPosts({ limit: 500 }),
      getSEOConfig(),
    ])
    if (!post) return NextResponse.json({ success: false, message: 'Không tìm thấy bài viết' }, { status: 404 })
    const data = suggestInternalLinks(post, posts.items, config).map((item) => ({
      postId: item.post.id,
      title: item.post.title,
      slug: item.post.slug,
      anchorText: item.anchorText,
      relevance: item.relevance,
    }))
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('[admin/posts/suggestions]', error)
    return NextResponse.json({ success: false, message: 'Không thể tạo gợi ý liên kết' }, { status: 500 })
  }
}
