'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, ExternalLink, History, Link2, Plus, RefreshCw, Rocket, Save, Trash2 } from 'lucide-react'
import MarkdownContent from '@/components/content/MarkdownContent'
import type { ContentFAQ, ContentPost, ContentSEOResearch, PaginatedPosts, PostRevision, PostStatus } from '@/lib/content-types'
import type { Product } from '@/lib/data'
import { getContentChecklist } from '@/lib/content-seo'
import type { SEOConfig } from '@/lib/seo-types'
import { slugify } from '@/lib/slug'

type Suggestion = { postId: string; title: string; slug: string; anchorText: string; relevance: number }

function blankPost(): ContentPost {
  const now = new Date().toISOString()
  return {
    id: '', title: '', slug: '', excerpt: '', bodyMarkdown: '', category: 'Kiến thức âm thanh', tags: [], author: 'Tiến Đạt Audio', reviewer: '', featuredImage: '', gallery: [], primaryKeywordId: '', keywordIds: [], relatedProductIds: [], relatedPostIds: [], faqs: [],
    seo: { metaTitle: '', metaDescription: '', canonicalPath: '', ogTitle: '', ogDescription: '', ogImage: '', noIndex: false },
    seoResearch: { researchedAt: null, articleType: 'How-to', primaryKeyword: '', secondaryKeywords: [], semanticTerms: [], questionKeywords: [], longTailKeywords: [], commercialModifiers: [], entities: [], primaryIntent: '', secondaryIntent: '', serpObservations: [], cannibalizationNotes: [], clusterRole: 'unassigned', sourceCount: 0, sources: [], imagePlan: [] },
    status: 'draft', scheduledAt: null, publishedAt: null, archivedAt: null, createdAt: now, updatedAt: now, version: 1, readingTime: 1,
  }
}

function toLocalDateTime(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export default function AdminPostEditor({ postId }: { postId: string }) {
  const router = useRouter()
  const isNew = postId === 'new'
  const [post, setPost] = useState<ContentPost | null>(isNew ? blankPost() : null)
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [config, setConfig] = useState<SEOConfig | null>(null)
  const [revisions, setRevisions] = useState<PostRevision[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [message, setMessage] = useState('')
  const [conflict, setConflict] = useState<ContentPost | null>(null)
  const changeSequence = useRef(0)

  const loadSupportingData = useCallback(async () => {
    const requests: Promise<Response>[] = [
      fetch('/api/admin/posts?limit=100'),
      fetch('/api/admin/products'),
      fetch('/api/admin/seo/strategy'),
    ]
    if (!isNew) requests.push(fetch(`/api/admin/posts/${postId}`), fetch(`/api/admin/posts/${postId}/revisions`), fetch(`/api/admin/posts/${postId}/suggestions`))
    try {
      const responses = await Promise.all(requests)
      const payloads = await Promise.all(responses.map((response) => response.json())) as Array<Record<string, unknown>>
      if (!responses[0].ok || !responses[1].ok || !responses[2].ok) throw new Error('Không thể tải dữ liệu hỗ trợ editor')
      setPosts((payloads[0].data as PaginatedPosts).items)
      setProducts(payloads[1] as unknown as Product[])
      setConfig(payloads[2].data as SEOConfig)
      if (!isNew) {
        if (!responses[3].ok) throw new Error(String(payloads[3].message || 'Không tìm thấy bài viết'))
        setPost(payloads[3].data as ContentPost)
        setRevisions((payloads[4].data as PostRevision[]) || [])
        setSuggestions((payloads[5].data as Suggestion[]) || [])
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể tải editor')
    } finally {
      setLoading(false)
    }
  }, [isNew, postId])

  useEffect(() => { void loadSupportingData() }, [loadSupportingData])

  function change(mutator: (current: ContentPost) => ContentPost) {
    changeSequence.current += 1
    setDirty(true)
    setPost((current) => current ? mutator(current) : current)
  }

  function update<K extends keyof ContentPost>(field: K, value: ContentPost[K]) {
    change((current) => ({ ...current, [field]: value }))
  }

  function updateSEO<K extends keyof ContentPost['seo']>(field: K, value: ContentPost['seo'][K]) {
    change((current) => ({ ...current, seo: { ...current.seo, [field]: value } }))
  }

  function updateSEOResearch<K extends keyof ContentSEOResearch>(field: K, value: ContentSEOResearch[K]) {
    change((current) => ({ ...current, seoResearch: { ...current.seoResearch, [field]: value } }))
  }

  function listValue(value: string) {
    return Array.from(new Set(value.split(',').map((item) => item.trim()).filter(Boolean)))
  }

  function lineValue(value: string) {
    return Array.from(new Set(value.split('\n').map((item) => item.trim()).filter(Boolean)))
  }

  const persist = useCallback(async (silent = false): Promise<ContentPost | null> => {
    if (!post || saving) return post
    if (!post.title.trim()) {
      if (!silent) setMessage('Nhập tiêu đề trước khi lưu')
      return null
    }
    setSaving(true)
    if (!silent) setMessage('')
    const sequence = changeSequence.current
    try {
      const response = await fetch(isNew ? '/api/admin/posts' : `/api/admin/posts/${post.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? { post } : { post, version: post.version }),
      })
      const result = await response.json() as { data?: ContentPost; message?: string; current?: ContentPost }
      if (response.status === 409 && result.current) {
        setConflict(result.current)
        throw new Error(result.message || 'Bài viết đã thay đổi ở phiên khác')
      }
      if (!response.ok || !result.data) throw new Error(result.message || 'Không thể lưu bài viết')
      const saved = result.data
      setPost((current) => sequence === changeSequence.current ? saved : current ? { ...current, version: saved.version, updatedAt: saved.updatedAt } : saved)
      setDirty(sequence !== changeSequence.current)
      if (!silent) setMessage(isNew ? 'Đã tạo bài viết' : 'Đã lưu bài viết')
      if (isNew) router.replace(`/admin/posts/${saved.id}`)
      return saved
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể lưu bài viết')
      return null
    } finally {
      setSaving(false)
    }
  }, [isNew, post, router, saving])

  useEffect(() => {
    if (isNew || !dirty || !post?.id || conflict) return
    const timer = window.setTimeout(() => { void persist(true) }, 1600)
    return () => window.clearTimeout(timer)
  }, [conflict, dirty, isNew, persist, post?.id])

  async function publish() {
    const saved = dirty || isNew ? await persist(false) : post
    if (!saved) return
    setSaving(true)
    const response = await fetch(`/api/admin/posts/${saved.id}/publish`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: saved.version }),
    })
    const result = await response.json() as { data?: ContentPost; message?: string; current?: ContentPost }
    if (response.ok && result.data) {
      setPost(result.data)
      setDirty(false)
      setMessage('Đã xuất bản và làm mới sitemap, RSS, llms.txt')
    } else {
      if (result.current) setConflict(result.current)
      setMessage(result.message || 'Không thể xuất bản')
    }
    setSaving(false)
  }

  async function restore(revision: PostRevision) {
    if (!post || !window.confirm(`Khôi phục revision v${revision.version}?`)) return
    setSaving(true)
    const response = await fetch(`/api/admin/posts/${post.id}/restore`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revisionId: revision.id, version: post.version }),
    })
    const result = await response.json() as { data?: ContentPost; message?: string }
    if (response.ok && result.data) {
      setPost(result.data)
      setDirty(false)
      setMessage(`Đã khôi phục revision v${revision.version}`)
      void loadSupportingData()
    } else setMessage(result.message || 'Không thể khôi phục revision')
    setSaving(false)
  }

  function insertSuggestion(item: Suggestion) {
    if (!post) return
    change((current) => ({
      ...current,
      relatedPostIds: Array.from(new Set([...current.relatedPostIds, item.postId])),
      bodyMarkdown: `${current.bodyMarkdown.trim()}\n\nĐọc thêm: [${item.anchorText}](/kien-thuc/${item.slug})\n`,
    }))
  }

  function addFAQ() {
    update('faqs', [...(post?.faqs || []), { id: `faq-${Date.now()}`, question: '', answer: '' }])
  }

  function updateFAQ(id: string, field: keyof Pick<ContentFAQ, 'question' | 'answer'>, value: string) {
    update('faqs', (post?.faqs || []).map((faq) => faq.id === id ? { ...faq, [field]: value } : faq))
  }

  const primaryKeyword = config?.keywords.find((keyword) => keyword.id === post?.primaryKeywordId)
  const checklist = useMemo(() => post ? getContentChecklist(post, primaryKeyword) : [], [post, primaryKeyword])

  if (loading) return <div className="p-8 text-sm text-[#858989]">Đang tải editor...</div>
  if (!post) return <div className="sonic-panel p-8"><p className="text-red-200">{message || 'Không tìm thấy bài viết.'}</p><Link href="/admin/posts" className="sonic-button sonic-button-ghost mt-5">Về danh sách</Link></div>

  return <div className="mx-auto max-w-[1500px] pb-24">
    <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><Link href="/admin/posts" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#858989] hover:text-[#d4af37]"><ArrowLeft size={14} /> Bài viết</Link><h1 className="mt-4 text-3xl font-bold tracking-[-0.05em]">{isNew ? 'Bài viết mới' : post.title || 'Chưa đặt tiêu đề'}</h1><p className="mt-2 text-xs text-[#707474]">{dirty ? 'Có thay đổi chưa đồng bộ' : `Đã đồng bộ · version ${post.version}`} {saving ? '· Đang lưu...' : ''}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setTab(tab === 'write' ? 'preview' : 'write')} className="sonic-button sonic-button-ghost">{tab === 'write' ? 'Xem preview' : 'Tiếp tục viết'}</button>{post.id && <Link href={`/kien-thuc/preview/${post.id}`} target="_blank" className="sonic-button sonic-button-ghost"><ExternalLink size={15} /> Preview trang</Link>}<button type="button" disabled={saving} onClick={() => void persist(false)} className="sonic-button sonic-button-ghost"><Save size={15} /> Lưu</button><button type="button" disabled={saving} onClick={() => void publish()} className="sonic-button sonic-button-gold"><Rocket size={15} /> Xuất bản</button></div></header>

    {message && <p className="mt-5 border border-[#d4af37]/40 bg-[#d4af37]/5 px-4 py-3 text-sm text-[#d4af37]">{message}</p>}
    {conflict && <div className="mt-5 border border-red-300/30 bg-red-300/5 p-4 text-sm text-red-100"><p>Bản trên server đang ở version {conflict.version}. Tải lại bản server trước khi tiếp tục để tránh ghi đè.</p><button type="button" onClick={() => { setPost(conflict); setConflict(null); setDirty(false); setMessage('Đã tải bản mới nhất từ server') }} className="sonic-button sonic-button-ghost mt-3"><RefreshCw size={15} /> Dùng bản server</button></div>}

    <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <main className="space-y-6">
        <section className="sonic-panel p-6"><div className="grid gap-4"><label className="text-xs text-[#858989]">Tiêu đề<input value={post.title} onChange={(event) => change((current) => ({ ...current, title: event.target.value, slug: current.slug || slugify(event.target.value) }))} className="sonic-input mt-2 text-lg font-bold" /></label><label className="text-xs text-[#858989]">Slug<input value={post.slug} onChange={(event) => update('slug', slugify(event.target.value))} className="sonic-input mt-2" /></label><label className="text-xs text-[#858989]">Excerpt<textarea value={post.excerpt} maxLength={500} onChange={(event) => update('excerpt', event.target.value)} className="sonic-input mt-2 min-h-24" /><span className="mt-1 block text-right text-[0.65rem] text-[#606363]">{post.excerpt.length}/500</span></label></div></section>

        <section className="sonic-panel overflow-hidden"><div className="flex items-center justify-between border-b border-white/10 px-6 py-4"><div><p className="sonic-label">Markdown + GFM</p><h2 className="mt-2 font-bold">Nội dung</h2></div><div className="flex gap-2"><button type="button" onClick={() => setTab('write')} className={`px-3 py-2 text-xs ${tab === 'write' ? 'bg-[#d4af37] text-[#080808]' : 'text-[#858989]'}`}>Viết</button><button type="button" onClick={() => setTab('preview')} className={`px-3 py-2 text-xs ${tab === 'preview' ? 'bg-[#d4af37] text-[#080808]' : 'text-[#858989]'}`}>Preview</button></div></div>{tab === 'write' ? <textarea value={post.bodyMarkdown} onChange={(event) => update('bodyMarkdown', event.target.value)} className="min-h-[680px] w-full resize-y bg-[#0d0d0d] p-6 font-mono text-sm leading-7 text-[#d7d7d7] outline-none" placeholder="## Tiêu đề phần\n\nNội dung đã được xác minh..." /> : <MarkdownContent markdown={post.bodyMarkdown} className="min-h-[680px] p-6 md:p-10" />}</section>

        <section className="sonic-panel p-6"><div className="flex items-center justify-between"><div><p className="sonic-label">FAQ</p><h2 className="mt-2 font-bold">Câu hỏi hiển thị công khai</h2></div><button type="button" onClick={addFAQ} className="sonic-button sonic-button-ghost"><Plus size={15} /> Thêm FAQ</button></div><div className="mt-5 grid gap-4">{post.faqs.length === 0 ? <p className="text-sm text-[#707474]">Chưa có FAQ; schema FAQ chỉ xuất hiện khi phần này có nội dung công khai.</p> : post.faqs.map((faq) => <div key={faq.id} className="grid gap-3 border border-white/10 p-4"><div className="flex gap-3"><input value={faq.question} onChange={(event) => updateFAQ(faq.id, 'question', event.target.value)} className="sonic-input" placeholder="Câu hỏi" /><button type="button" onClick={() => update('faqs', post.faqs.filter((item) => item.id !== faq.id))} className="text-[#707474] hover:text-red-300" aria-label="Xóa FAQ"><Trash2 size={16} /></button></div><textarea value={faq.answer} onChange={(event) => updateFAQ(faq.id, 'answer', event.target.value)} className="sonic-input min-h-24" placeholder="Câu trả lời có thể kiểm chứng" /></div>)}</div></section>

        <section className="sonic-panel p-6"><p className="sonic-label">SEO metadata</p><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs text-[#858989]">Meta title<input value={post.seo.metaTitle} onChange={(event) => updateSEO('metaTitle', event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[#858989]">Canonical path<input value={post.seo.canonicalPath} onChange={(event) => updateSEO('canonicalPath', event.target.value)} className="sonic-input mt-2" placeholder={`/kien-thuc/${post.slug}`} /></label><label className="text-xs text-[#858989] md:col-span-2">Meta description<textarea value={post.seo.metaDescription} onChange={(event) => updateSEO('metaDescription', event.target.value)} className="sonic-input mt-2 min-h-24" /></label><label className="text-xs text-[#858989]">OG title<input value={post.seo.ogTitle} onChange={(event) => updateSEO('ogTitle', event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[#858989]">OG image<input value={post.seo.ogImage} onChange={(event) => updateSEO('ogImage', event.target.value)} className="sonic-input mt-2" /></label><label className="flex items-center gap-3 text-xs text-[#9ea2a2] md:col-span-2"><input type="checkbox" checked={post.seo.noIndex} onChange={(event) => updateSEO('noIndex', event.target.checked)} /> Noindex bài viết</label></div></section>

        <section className="sonic-panel p-6"><div className="flex items-start justify-between gap-4"><div><p className="sonic-label">SEO research / GEO-AIO</p><h2 className="mt-2 font-bold">Dữ liệu nghiên cứu nội bộ</h2><p className="mt-2 text-xs leading-5 text-[#707474]">Không phải meta keywords công khai. Dùng để ghi nhận intent, cluster, quan sát SERP và bằng chứng trước human gate.</p></div><span className="text-right text-[0.65rem] text-[#707474]">{post.seoResearch.sourceCount} nguồn<br />{post.seoResearch.researchedAt ? new Date(post.seoResearch.researchedAt).toLocaleDateString('vi-VN') : 'chưa nghiên cứu'}</span></div><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs text-[#858989]">Article type<select value={post.seoResearch.articleType} onChange={(event) => updateSEOResearch('articleType', event.target.value as ContentSEOResearch['articleType'])} className="sonic-input mt-2"><option>Definition</option><option>Technical Explanation</option><option>Troubleshooting</option><option>Comparison</option><option>Buying Guide</option><option>Setup Guide</option><option>How-to</option><option>Product Technology</option><option>System Design</option><option>Acoustic / Placement</option><option>Commercial Investigation</option><option>Case Study / Project</option><option>FAQ / Quick Answer</option><option>Glossary / Concept</option></select></label><label className="text-xs text-[#858989]">Primary keyword<input value={post.seoResearch.primaryKeyword} onChange={(event) => updateSEOResearch('primaryKeyword', event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[#858989]">Primary intent<input value={post.seoResearch.primaryIntent} onChange={(event) => updateSEOResearch('primaryIntent', event.target.value)} className="sonic-input mt-2" placeholder="informational / commercial / local" /></label><label className="text-xs text-[#858989]">Secondary intent<input value={post.seoResearch.secondaryIntent} onChange={(event) => updateSEOResearch('secondaryIntent', event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[#858989]">Cluster role<select value={post.seoResearch.clusterRole} onChange={(event) => updateSEOResearch('clusterRole', event.target.value as ContentSEOResearch['clusterRole'])} className="sonic-input mt-2"><option value="unassigned">Chưa gán</option><option value="pillar">Pillar</option><option value="supporting">Supporting</option><option value="angle">Angle</option></select></label><label className="text-xs text-[#858989] md:col-span-2">Secondary keywords — phân tách bằng dấu phẩy<input value={post.seoResearch.secondaryKeywords.join(', ')} onChange={(event) => updateSEOResearch('secondaryKeywords', listValue(event.target.value))} className="sonic-input mt-2" /></label><label className="text-xs text-[#858989] md:col-span-2">Semantic terms — phân tách bằng dấu phẩy<input value={post.seoResearch.semanticTerms.join(', ')} onChange={(event) => updateSEOResearch('semanticTerms', listValue(event.target.value))} className="sonic-input mt-2" /></label><label className="text-xs text-[#858989]">Question keywords — mỗi dòng một câu<textarea value={post.seoResearch.questionKeywords.join('\n')} onChange={(event) => updateSEOResearch('questionKeywords', lineValue(event.target.value))} className="sonic-input mt-2 min-h-28" /></label><label className="text-xs text-[#858989]">Long-tail keywords — mỗi dòng một cụm<textarea value={post.seoResearch.longTailKeywords.join('\n')} onChange={(event) => updateSEOResearch('longTailKeywords', lineValue(event.target.value))} className="sonic-input mt-2 min-h-28" /></label><label className="text-xs text-[#858989] md:col-span-2">SERP observations — mỗi dòng một quan sát<textarea value={post.seoResearch.serpObservations.join('\n')} onChange={(event) => updateSEOResearch('serpObservations', lineValue(event.target.value))} className="sonic-input mt-2 min-h-24" /></label><label className="text-xs text-[#858989] md:col-span-2">Cannibalization notes — mỗi dòng một ghi chú<textarea value={post.seoResearch.cannibalizationNotes.join('\n')} onChange={(event) => updateSEOResearch('cannibalizationNotes', lineValue(event.target.value))} className="sonic-input mt-2 min-h-24" /></label><label className="text-xs text-[#858989] md:col-span-2">Source URLs — mỗi dòng một URL<textarea value={post.seoResearch.sources.map((source) => source.url).join('\n')} onChange={(event) => { const urls = lineValue(event.target.value); const sources = urls.map((url) => { const existing = post.seoResearch.sources.find((source) => source.url === url); return existing || { url, title: url, publisher: '', tier: 3 as const, accessedAt: new Date().toISOString(), claimNotes: [] } }); change((current) => ({ ...current, seoResearch: { ...current.seoResearch, sources, sourceCount: sources.length } })) }} className="sonic-input mt-2 min-h-28" placeholder="https://..." /></label></div></section>
      </main>

      <aside className="space-y-6">
        <section className="sonic-panel p-5"><p className="sonic-label">Workflow</p><div className="mt-4 grid gap-4"><label className="text-xs text-[#858989]">Trạng thái<select value={post.status} onChange={(event) => update('status', event.target.value as PostStatus)} className="sonic-input mt-2"><option value="idea">Ý tưởng</option><option value="draft">Bản nháp</option><option value="review">Chờ duyệt</option><option value="scheduled">Hẹn giờ</option><option value="published">Đã xuất bản</option><option value="archived">Lưu trữ</option></select></label>{post.status === 'scheduled' && <label className="text-xs text-[#858989]">Thời điểm xuất bản<input type="datetime-local" value={toLocalDateTime(post.scheduledAt)} onChange={(event) => update('scheduledAt', event.target.value ? new Date(event.target.value).toISOString() : null)} className="sonic-input mt-2" /></label>}<label className="text-xs text-[#858989]">Danh mục<input value={post.category} onChange={(event) => update('category', event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[#858989]">Tác giả<input value={post.author} onChange={(event) => update('author', event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[#858989]">Người duyệt<input value={post.reviewer} onChange={(event) => update('reviewer', event.target.value)} className="sonic-input mt-2" /></label></div></section>

        <section className="sonic-panel p-5"><p className="sonic-label">Media & taxonomy</p><div className="mt-4 grid gap-4"><label className="text-xs text-[#858989]">Featured image<input value={post.featuredImage} onChange={(event) => update('featuredImage', event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[#858989]">Gallery — mỗi dòng một URL<textarea value={post.gallery.join('\n')} onChange={(event) => update('gallery', event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))} className="sonic-input mt-2 min-h-24" /></label><label className="text-xs text-[#858989]">Tags — phân tách bằng dấu phẩy<input value={post.tags.join(', ')} onChange={(event) => update('tags', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} className="sonic-input mt-2" /></label></div></section>

        <section className="sonic-panel p-5"><p className="sonic-label">Keyword mapping</p><label className="mt-4 block text-xs text-[#858989]">Primary keyword<select value={post.primaryKeywordId} onChange={(event) => change((current) => ({ ...current, primaryKeywordId: event.target.value, keywordIds: Array.from(new Set([event.target.value, ...current.keywordIds].filter(Boolean))) }))} className="sonic-input mt-2"><option value="">Chưa gán</option>{config?.keywords.filter((keyword) => keyword.isActive).map((keyword) => <option key={keyword.id} value={keyword.id}>{keyword.term}</option>)}</select></label><label className="mt-4 block text-xs text-[#858989]">Secondary keywords<select multiple value={post.keywordIds} onChange={(event) => update('keywordIds', Array.from(event.target.selectedOptions, (option) => option.value))} className="sonic-input mt-2 min-h-36">{config?.keywords.filter((keyword) => keyword.isActive).map((keyword) => <option key={keyword.id} value={keyword.id}>{keyword.term}</option>)}</select></label></section>

        <section className="sonic-panel p-5"><p className="sonic-label">Relations</p><label className="mt-4 block text-xs text-[#858989]">Sản phẩm liên quan<select multiple value={post.relatedProductIds} onChange={(event) => update('relatedProductIds', Array.from(event.target.selectedOptions, (option) => option.value))} className="sonic-input mt-2 min-h-36">{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><label className="mt-4 block text-xs text-[#858989]">Bài liên quan<select multiple value={post.relatedPostIds} onChange={(event) => update('relatedPostIds', Array.from(event.target.selectedOptions, (option) => option.value))} className="sonic-input mt-2 min-h-36">{posts.filter((item) => item.id !== post.id).map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>{suggestions.length > 0 && <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs font-bold text-[#c4c7c7]">Gợi ý internal link</p><div className="mt-3 grid gap-2">{suggestions.map((item) => <button type="button" key={item.postId} onClick={() => insertSuggestion(item)} className="flex items-start gap-2 border border-white/10 p-3 text-left text-xs text-[#9ea2a2] hover:border-[#d4af37]/50"><Link2 size={14} className="mt-0.5 shrink-0 text-[#d4af37]" /><span>{item.title}<small className="mt-1 block text-[#606363]">Anchor: {item.anchorText}</small></span></button>)}</div></div>}</section>

        <section className="sonic-panel p-5"><p className="sonic-label">Editorial checklist</p><div className="mt-4 grid gap-3">{checklist.map((item) => <div key={item.id} className="flex items-start gap-3 text-xs leading-5"><span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${item.pass ? 'bg-emerald-400 text-[#080808]' : 'border border-white/20 text-transparent'}`}>{item.pass && <Check size={11} />}</span><span className={item.pass ? 'text-[#c4c7c7]' : 'text-[#707474]'}>{item.label}</span></div>)}</div><p className="mt-4 text-[0.65rem] leading-5 text-[#606363]">Checklist là kiểm tra biên tập minh bạch, không phải điểm xếp hạng giả lập.</p></section>

        {!isNew && <section className="sonic-panel p-5"><div className="flex items-center gap-2"><History size={16} className="text-[#d4af37]" /><p className="sonic-label">Revision history</p></div><div className="mt-4 grid gap-3">{revisions.length === 0 ? <p className="text-xs text-[#707474]">Revision được tạo khi publish, cập nhật bài đã publish hoặc restore.</p> : revisions.map((revision) => <div key={revision.id} className="border border-white/10 p-3"><p className="text-xs font-bold">v{revision.version} · {revision.reason}</p><p className="mt-1 text-[0.65rem] text-[#707474]">{new Date(revision.createdAt).toLocaleString('vi-VN')} · {revision.actor}</p><button type="button" disabled={saving} onClick={() => void restore(revision)} className="mt-2 text-xs font-bold text-[#d4af37]">Khôi phục</button></div>)}</div></section>}
      </aside>
    </div>
  </div>
}
