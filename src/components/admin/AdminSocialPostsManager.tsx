'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, ExternalLink, FilePlus2, Pencil, RefreshCw, Rocket, Search } from 'lucide-react'
import type { PostStatus } from '@/lib/content-types'
import type { PaginatedSocialPosts, SocialPost } from '@/modules/social/domain/types'
import { SOCIAL_CATEGORIES } from '@/modules/social/domain/types'

const statuses: Array<PostStatus | 'all'> = ['all', 'idea', 'draft', 'review', 'scheduled', 'published', 'archived']
const statusLabels: Record<PostStatus, string> = {
  idea: 'Ý tưởng',
  draft: 'Bản nháp',
  review: 'Chờ duyệt',
  scheduled: 'Đã hẹn giờ',
  published: 'Đã xuất bản',
  archived: 'Lưu trữ',
}

type ApiResult = { success?: boolean; data?: PaginatedSocialPosts; message?: string }

export default function AdminSocialPostsManager() {
  const [posts, setPosts] = useState<SocialPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PostStatus | 'all'>('all')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(30)
  const [message, setMessage] = useState('')
  const [workingId, setWorkingId] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setMessage('')
    try {
      const params = new URLSearchParams({ limit: String(limit), page: String(page) })
      if (search.trim()) params.set('search', search.trim())
      if (status !== 'all') params.set('status', status)
      if (category) params.set('category', category)
      const response = await fetch(`/api/admin/social-posts?${params.toString()}`)
      const result = await response.json() as ApiResult
      if (!response.ok || !result.data) throw new Error(result.message || 'Không thể tải Social Hub')
      setPosts(result.data.items)
      setTotal(result.data.total)
      setLimit(result.data.limit)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể tải Social Hub')
    } finally {
      setLoading(false)
    }
  }, [category, limit, page, search, status])

  useEffect(() => { void load() }, [load])

  const counts = useMemo(() => Object.fromEntries(statuses.slice(1).map((item) => [item, posts.filter((post) => post.status === item).length])), [posts])

  async function mutate(post: SocialPost, action: 'publish' | 'archive') {
    if (action === 'archive' && !window.confirm(`Đưa “${post.title}” vào lưu trữ?`)) return
    setWorkingId(post.id)
    setMessage('')
    try {
      const response = await fetch(`/api/admin/social-posts/${post.id}${action === 'publish' ? '/publish' : ''}`, {
        method: action === 'publish' ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version: post.version }),
      })
      const result = await response.json() as { message?: string }
      if (!response.ok) setMessage(result.message || 'Không thể cập nhật Social Post')
      else await load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể cập nhật Social Post')
    } finally {
      setWorkingId('')
    }
  }

  return <div className="mx-auto max-w-[1400px] pb-20">
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="sonic-label">Content / Social Hub</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.06em] text-[var(--sonic-text)]">Góc Audio.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--sonic-muted)]">Tạo native post, nhúng Facebook, gắn media, sản phẩm và metadata trước khi phân phối ra website.</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Làm mới</button><Link href="/admin/social-posts/new" className="sonic-button sonic-button-gold"><FilePlus2 size={15} /> Tạo Social Post</Link></div>
    </header>

    {message && <p className="mt-6 border border-red-300/30 bg-red-300/5 px-4 py-3 text-sm text-red-700 dark:text-red-200">{message}</p>}

    <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">{statuses.slice(1).map((item) => <button type="button" key={item} onClick={() => { setStatus(item); setPage(1) }} className={`border p-4 text-left transition ${status === item ? 'border-[var(--sonic-gold)] bg-[var(--sonic-gold-soft)]' : 'border-[var(--sonic-line)] bg-[var(--sonic-surface)]'}`}><p className="text-2xl font-bold text-[var(--sonic-text)]">{counts[item]}</p><p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-[var(--sonic-muted)]">{statusLabels[item as PostStatus]}</p></button>)}</div>

    <section className="sonic-panel mt-6 p-5"><div className="grid gap-3 lg:grid-cols-[1fr_180px_220px_auto]"><div className="relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sonic-subtle)]" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} className="sonic-input sonic-input-with-leading-icon" placeholder="Tìm tiêu đề, text, tag..." /></div><select value={status} onChange={(event) => { setStatus(event.target.value as PostStatus | 'all'); setPage(1) }} className="sonic-input"><option value="all">Mọi trạng thái</option>{statuses.slice(1).map((item) => <option key={item} value={item}>{statusLabels[item as PostStatus]}</option>)}</select><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1) }} className="sonic-input"><option value="">Mọi danh mục</option>{SOCIAL_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost">Lọc</button></div></section>

    <section className="sonic-panel mt-6 overflow-hidden"><div className="hidden grid-cols-[1fr_150px_140px_140px_150px] gap-4 border-b border-[var(--sonic-line)] px-5 py-4 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[var(--sonic-subtle)] md:grid"><span>Social Post</span><span>Workflow</span><span>Danh mục</span><span>Cập nhật</span><span className="text-right">Thao tác</span></div>
      {loading ? <p className="px-5 py-12 text-sm text-[var(--sonic-muted)]">Đang tải Social Hub...</p> : posts.length === 0 ? <div className="px-5 py-12"><p className="text-sm text-[var(--sonic-muted)]">Chưa có Social Post phù hợp.</p><Link href="/admin/social-posts/new" className="mt-4 inline-flex text-xs font-bold text-[var(--sonic-gold)]">Tạo bài đầu tiên →</Link></div> : posts.map((post) => <article key={post.id} className="grid gap-4 border-b border-[var(--sonic-line)] px-5 py-5 last:border-0 md:grid-cols-[1fr_150px_140px_140px_150px] md:items-center"><div><p className="font-bold text-[var(--sonic-text)]">{post.title}</p><p className="mt-1 line-clamp-1 text-xs text-[var(--sonic-subtle)]">/{post.slug} · {post.postType === 'facebook_embed' ? 'Facebook Embed' : 'Native'} · {post.media.length} media</p></div><div><span className="inline-flex border border-[var(--sonic-line)] px-2 py-1 text-[0.65rem] uppercase tracking-[0.1em] text-[var(--sonic-muted)]">{statusLabels[post.status]}</span>{post.scheduledAt && <p className="mt-2 text-[0.65rem] text-[var(--sonic-subtle)]">{new Date(post.scheduledAt).toLocaleString('vi-VN')}</p>}</div><p className="text-xs leading-5 text-[var(--sonic-muted)]">{post.category}</p><p className="text-xs text-[var(--sonic-subtle)]">{new Date(post.updatedAt).toLocaleDateString('vi-VN')}</p><div className="flex items-center justify-end gap-3"><Link href={`/admin/social-posts/${post.id}`} className="text-[var(--sonic-subtle)] hover:text-[var(--sonic-gold)]" aria-label={`Sửa ${post.title}`}><Pencil size={16} /></Link>{post.status === 'published' && <Link href={`/bai-viet/${post.slug}`} target="_blank" className="text-[var(--sonic-subtle)] hover:text-[var(--sonic-gold)]" aria-label={`Xem ${post.title}`}><ExternalLink size={16} /></Link>}{!['published', 'archived'].includes(post.status) && <button type="button" disabled={workingId === post.id} onClick={() => void mutate(post, 'publish')} className="text-[var(--sonic-subtle)] hover:text-emerald-500" aria-label={`Xuất bản ${post.title}`}><Rocket size={16} /></button>}{post.status !== 'archived' && <button type="button" disabled={workingId === post.id} onClick={() => void mutate(post, 'archive')} className="text-[var(--sonic-subtle)] hover:text-red-500" aria-label={`Lưu trữ ${post.title}`}><Archive size={16} /></button>}</div></article>)}
      {total > limit && <div className="flex items-center justify-between gap-4 border-t border-[var(--sonic-line)] px-5 py-4"><button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="text-xs font-bold text-[var(--sonic-gold)] disabled:opacity-40">← Trang trước</button><span className="text-xs text-[var(--sonic-subtle)]">{page} / {Math.ceil(total / limit)}</span><button type="button" disabled={page >= Math.ceil(total / limit) || loading} onClick={() => setPage((current) => current + 1)} className="text-xs font-bold text-[var(--sonic-gold)] disabled:opacity-40">Trang sau →</button></div>}
    </section>
  </div>
}
