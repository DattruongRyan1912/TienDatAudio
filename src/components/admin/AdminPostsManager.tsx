'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, ExternalLink, FilePlus2, Pencil, RefreshCw, Rocket, Search } from 'lucide-react'
import type { ContentPost, PaginatedPosts, PostStatus } from '@/lib/content-types'
import type { SEOConfig } from '@/lib/seo-types'

const statuses: Array<PostStatus | 'all'> = ['all', 'idea', 'draft', 'review', 'scheduled', 'published', 'archived']
const statusLabels: Record<PostStatus, string> = {
  idea: 'Ý tưởng', draft: 'Bản nháp', review: 'Chờ duyệt', scheduled: 'Đã hẹn giờ', published: 'Đã xuất bản', archived: 'Lưu trữ',
}

export default function AdminPostsManager() {
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [config, setConfig] = useState<SEOConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PostStatus | 'all'>('all')
  const [keywordId, setKeywordId] = useState('')
  const [message, setMessage] = useState('')
  const [workingId, setWorkingId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setMessage('')
    try {
      const [postsResponse, seoResponse] = await Promise.all([
        fetch('/api/admin/posts?limit=100'),
        fetch('/api/admin/seo/strategy'),
      ])
      const [postsResult, seoResult] = await Promise.all([
        postsResponse.json() as Promise<{ success?: boolean; data?: PaginatedPosts; message?: string }>,
        seoResponse.json() as Promise<{ success?: boolean; data?: SEOConfig; message?: string }>,
      ])
      if (!postsResponse.ok || !postsResult.data) throw new Error(postsResult.message || 'Không thể tải bài viết')
      if (!seoResponse.ok || !seoResult.data) throw new Error(seoResult.message || 'Không thể tải keyword map')
      setPosts(postsResult.data.items)
      setConfig(seoResult.data)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể tải CMS')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const visiblePosts = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase('vi')
    return posts.filter((post) => {
      if (status !== 'all' && post.status !== status) return false
      if (keywordId && !post.keywordIds.includes(keywordId)) return false
      return !needle || [post.title, post.excerpt, post.category, ...post.tags].join(' ').toLocaleLowerCase('vi').includes(needle)
    })
  }, [keywordId, posts, search, status])

  async function mutate(post: ContentPost, action: 'publish' | 'archive') {
    if (action === 'archive' && !window.confirm(`Đưa “${post.title}” vào lưu trữ?`)) return
    setWorkingId(post.id)
    setMessage('')
    const response = await fetch(`/api/admin/posts/${post.id}${action === 'publish' ? '/publish' : ''}`, {
      method: action === 'publish' ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: post.version }),
    })
    const result = await response.json() as { message?: string }
    if (!response.ok) setMessage(result.message || 'Không thể cập nhật bài viết')
    else await load()
    setWorkingId('')
  }

  async function createFromKeyword() {
    if (!keywordId) return
    setWorkingId('keyword')
    const response = await fetch('/api/admin/posts/from-keyword', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keywordId }),
    })
    const result = await response.json() as { data?: ContentPost; message?: string }
    if (response.ok && result.data) window.location.href = `/admin/posts/${result.data.id}`
    else setMessage(result.message || 'Không thể tạo draft từ keyword')
    setWorkingId('')
  }

  const counts = Object.fromEntries(statuses.slice(1).map((item) => [item, posts.filter((post) => post.status === item).length]))

  return <div className="mx-auto max-w-[1400px] pb-20">
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="sonic-label">Content / Editorial workflow</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.06em]">Bài viết.</h1><p className="mt-3 text-sm leading-6 text-[#858989]">Quản lý ý tưởng → biên tập → duyệt → hẹn giờ → xuất bản, có revision và chống ghi đè.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Làm mới</button><Link href="/admin/posts/new" className="sonic-button sonic-button-gold"><FilePlus2 size={15} /> Viết bài</Link></div></header>

    {message && <p className="mt-6 border border-red-300/30 bg-red-300/5 px-4 py-3 text-sm text-red-200">{message}</p>}

    <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{statuses.slice(1).map((item) => <button type="button" key={item} onClick={() => setStatus(item)} className={`border p-4 text-left transition ${status === item ? 'border-[#d4af37] bg-[#d4af37]/5' : 'border-white/10 bg-[#0d0d0d]'}`}><p className="text-2xl font-bold">{counts[item]}</p><p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-[#858989]">{statusLabels[item as PostStatus]}</p></button>)}</div>

    <section className="sonic-panel mt-6 p-5"><div className="grid gap-3 lg:grid-cols-[1fr_180px_260px_auto]"><div className="relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#707474]" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="sonic-input sonic-input-with-leading-icon" placeholder="Tìm theo tiêu đề, excerpt, tag..." /></div><select value={status} onChange={(event) => setStatus(event.target.value as PostStatus | 'all')} className="sonic-input"><option value="all">Mọi trạng thái</option>{statuses.slice(1).map((item) => <option key={item} value={item}>{statusLabels[item as PostStatus]}</option>)}</select><select value={keywordId} onChange={(event) => setKeywordId(event.target.value)} className="sonic-input"><option value="">Mọi keyword</option>{config?.keywords.map((keyword) => <option key={keyword.id} value={keyword.id}>{keyword.term}</option>)}</select><button type="button" disabled={!keywordId || workingId === 'keyword'} onClick={() => void createFromKeyword()} className="sonic-button sonic-button-ghost">Tạo draft từ keyword</button></div></section>

    <section className="sonic-panel mt-6 overflow-hidden"><div className="hidden grid-cols-[1fr_150px_140px_120px_150px] gap-4 border-b border-white/10 px-5 py-4 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#707474] md:grid"><span>Bài viết</span><span>Workflow</span><span>Keyword chính</span><span>Cập nhật</span><span className="text-right">Thao tác</span></div>
      {loading ? <p className="px-5 py-12 text-sm text-[#858989]">Đang tải content...</p> : visiblePosts.length === 0 ? <p className="px-5 py-12 text-sm text-[#858989]">Không có bài viết phù hợp.</p> : visiblePosts.map((post) => {
        const keyword = config?.keywords.find((item) => item.id === post.primaryKeywordId)
        return <article key={post.id} className="grid gap-4 border-b border-white/10 px-5 py-5 last:border-0 md:grid-cols-[1fr_150px_140px_120px_150px] md:items-center"><div><p className="font-bold text-[#e5e2e1]">{post.title}</p><p className="mt-1 line-clamp-1 text-xs text-[#707474]">/{post.slug} · v{post.version}</p></div><div><span className="inline-flex border border-white/15 px-2 py-1 text-[0.65rem] uppercase tracking-[0.1em] text-[#c4c7c7]">{statusLabels[post.status]}</span>{post.scheduledAt && <p className="mt-2 text-[0.65rem] text-[#707474]">{new Date(post.scheduledAt).toLocaleString('vi-VN')}</p>}</div><p className="text-xs leading-5 text-[#9ea2a2]">{keyword?.term || 'Chưa gán'}</p><p className="text-xs text-[#858989]">{new Date(post.updatedAt).toLocaleDateString('vi-VN')}</p><div className="flex items-center justify-end gap-3"><Link href={`/admin/posts/${post.id}`} className="text-[#858989] hover:text-[#d4af37]" aria-label={`Sửa ${post.title}`}><Pencil size={16} /></Link>{post.status === 'published' && <Link href={`/kien-thuc/${post.slug}`} target="_blank" className="text-[#858989] hover:text-[#d4af37]" aria-label={`Xem ${post.title}`}><ExternalLink size={16} /></Link>}{!['published', 'archived'].includes(post.status) && <button type="button" disabled={workingId === post.id} onClick={() => void mutate(post, 'publish')} className="text-[#858989] hover:text-emerald-300" aria-label={`Xuất bản ${post.title}`}><Rocket size={16} /></button>}{post.status !== 'archived' && <button type="button" disabled={workingId === post.id} onClick={() => void mutate(post, 'archive')} className="text-[#858989] hover:text-red-300" aria-label={`Lưu trữ ${post.title}`}><Archive size={16} /></button>}</div></article>
      })}
    </section>
  </div>
}
