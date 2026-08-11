'use client'

/* External preview/gallery URLs are user-selected and are intentionally rendered without next/image remote host configuration. */
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Check, ExternalLink, History, Plus, Rocket, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CloudinaryUpload from '@/components/CloudinaryUpload'
import SocialPostCard from '@/components/social/SocialPostCard'
import type { ContentPost } from '@/lib/content-types'
import type { Product } from '@/lib/data'
import { slugify } from '@/lib/slug'
import { applyNativeSocialGalleryImport, applyNativeSocialLinkImport } from '@/modules/social/domain/native-import'
import { resolveImportedSocialText } from '@/modules/social/domain/source-content'
import type { SocialGalleryScanResult, SocialLinkImportPreview, SocialLinkImportedAsset } from '@/modules/social/domain/link-preview'
import { detectFacebookBrowserExtension, scanFacebookGalleryWithBrowserExtension } from '@/modules/social/infrastructure/facebook-browser-extension'
import { buildImportedSocialSlug } from '@/modules/social/domain/slug'
import { SOCIAL_CATEGORIES, SOCIAL_MEDIA_TYPES, SOCIAL_POST_TYPES, type SocialMediaItem, type SocialPost, type SocialPostRevision } from '@/modules/social/domain/types'

function blankPost(): SocialPost {
  const now = new Date().toISOString()
  return {
    id: '', contentType: 'social', postType: 'native', title: '', slug: '', excerpt: '', text: '', category: SOCIAL_CATEGORIES[0], tags: [], mentions: [],
    author: { displayName: 'Tiến Đạt Audio', avatarUrl: '', verified: true }, media: [], links: [], facebookSourceUrl: '', facebookEmbedUrl: '', relatedProductIds: [], relatedArticleIds: [], relatedProjectIds: [],
    seo: { metaTitle: '', metaDescription: '', canonicalPath: '', ogTitle: '', ogDescription: '', ogImage: '', noIndex: false }, status: 'draft', scheduledAt: null, publishedAt: null, archivedAt: null, createdAt: now, updatedAt: now, version: 1,
  }
}

function toLocalDateTime(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

type UploadResult = { public_id: string; secure_url: string; resource_type: string; format?: string; bytes?: number; width?: number; height?: number }
type GalleryScanResponse = SocialGalleryScanResult & { preview: SocialLinkImportPreview }

export default function AdminSocialPostEditor({ postId }: { postId: string }) {
  const router = useRouter()
  const isNew = postId === 'new'
  const [post, setPost] = useState<SocialPost | null>(isNew ? blankPost() : null)
  const [products, setProducts] = useState<Product[]>([])
  const [articles, setArticles] = useState<ContentPost[]>([])
  const [revisions, setRevisions] = useState<SocialPostRevision[]>([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const [message, setMessage] = useState('')
  const [conflict, setConflict] = useState<SocialPost | null>(null)
  const [mediaType, setMediaType] = useState<SocialMediaItem['type']>('image')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaAlt, setMediaAlt] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkDescription, setLinkDescription] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [sourcePreview, setSourcePreview] = useState<SocialLinkImportPreview | null>(null)
  const [sourceGallery, setSourceGallery] = useState<SocialGalleryScanResult | null>(null)
  const [sourcePostText, setSourcePostText] = useState('')
  const [selectedGalleryUrls, setSelectedGalleryUrls] = useState<string[]>([])
  const [sourceUploadedAssets, setSourceUploadedAssets] = useState<SocialLinkImportedAsset[]>([])
  const [sourceLoading, setSourceLoading] = useState(false)
  const [sourceImportLoading, setSourceImportLoading] = useState(false)
  const [sourceGalleryLoading, setSourceGalleryLoading] = useState(false)
  const [sourceGalleryImportLoading, setSourceGalleryImportLoading] = useState(false)
  const [browserBridgeAvailable, setBrowserBridgeAvailable] = useState<boolean | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const requests: Promise<Response>[] = [fetch('/api/admin/products'), fetch('/api/admin/posts?limit=100')]
      if (!isNew) requests.push(fetch(`/api/admin/social-posts/${postId}`), fetch(`/api/admin/social-posts/${postId}/revisions`))
      const responses = await Promise.all(requests)
      const payloads = await Promise.all(responses.map((response) => response.json() as Promise<unknown>))
      if (!responses[0].ok || !responses[1].ok) throw new Error('Không thể tải dữ liệu liên quan')
      setProducts(payloads[0] as Product[])
      const articlePayload = payloads[1] as { data?: { items?: ContentPost[] } }
      setArticles(articlePayload.data?.items || [])
      if (!isNew) {
        if (!responses[2]?.ok) throw new Error(String((payloads[2] as { message?: string }).message || 'Không tìm thấy Social Post'))
        setPost((payloads[2] as { data: SocialPost }).data)
        setRevisions(responses[3]?.ok ? ((payloads[3] as { data?: SocialPostRevision[] }).data || []) : [])
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể tải editor')
    } finally {
      setLoading(false)
    }
  }, [isNew, postId])

  useEffect(() => { void load() }, [load])

  useEffect(() => {
    let active = true
    const probe = () => {
      void detectFacebookBrowserExtension().then((available) => {
        if (active) setBrowserBridgeAvailable(available)
      })
    }
    probe()
    window.addEventListener('focus', probe)
    return () => {
      active = false
      window.removeEventListener('focus', probe)
    }
  }, [])

  function change(mutator: (current: SocialPost) => SocialPost) {
    setDirty(true)
    setPost((current) => current ? mutator(current) : current)
  }

  function update<K extends keyof SocialPost>(field: K, value: SocialPost[K]) {
    change((current) => ({ ...current, [field]: value }))
  }

  function updateSEO<K extends keyof SocialPost['seo']>(field: K, value: SocialPost['seo'][K]) {
    change((current) => ({ ...current, seo: { ...current.seo, [field]: value } }))
  }

  function updateAuthor<K extends keyof SocialPost['author']>(field: K, value: SocialPost['author'][K]) {
    change((current) => ({ ...current, author: { ...current.author, [field]: value } }))
  }

  const persist = useCallback(async (): Promise<SocialPost | null> => {
    if (!post || saving) return post
    if (!post.title.trim()) {
      setMessage('Nhập tiêu đề trước khi lưu')
      return null
    }
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(isNew ? '/api/admin/social-posts' : `/api/admin/social-posts/${post.id}`, {
        method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(isNew ? { post } : { post, version: post.version }),
      })
      const result = await response.json() as { data?: SocialPost; message?: string; current?: SocialPost }
      if (response.status === 409 && result.current) {
        setConflict(result.current)
        throw new Error(result.message || 'Social Post đã thay đổi ở phiên khác')
      }
      if (!response.ok || !result.data) throw new Error(result.message || 'Không thể lưu Social Post')
      setPost(result.data)
      setDirty(false)
      setMessage(isNew ? 'Đã tạo Social Post' : 'Đã lưu Social Post')
      if (isNew) router.replace(`/admin/social-posts/${result.data.id}`)
      return result.data
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể lưu Social Post')
      return null
    } finally {
      setSaving(false)
    }
  }, [isNew, post, router, saving])

  async function publish() {
    const saved = dirty || isNew ? await persist() : post
    if (!saved) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/social-posts/${saved.id}/publish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ version: saved.version }) })
      const result = await response.json() as { data?: SocialPost; message?: string; current?: SocialPost }
      if (!response.ok || !result.data) {
        if (result.current) setConflict(result.current)
        throw new Error(result.message || 'Không thể xuất bản Social Post')
      }
      setPost(result.data)
      setDirty(false)
      setMessage('Đã xuất bản và làm mới sitemap, RSS, llms.txt')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể xuất bản Social Post')
    } finally {
      setSaving(false)
    }
  }

  function addMedia() {
    if (!mediaUrl.trim()) return
    change((current) => ({ ...current, media: [...current.media, { id: `media-${Date.now()}`, type: mediaType, url: mediaUrl.trim(), thumbnailUrl: '', publicId: '', width: null, height: null, aspectRatio: null, alt: mediaAlt.trim() || 'Hình ảnh trong bài viết', order: current.media.length }] }))
    setMediaUrl('')
    setMediaAlt('')
  }

  function addUploaded(result: UploadResult) {
    const type: SocialMediaItem['type'] = result.resource_type === 'video' ? 'video' : 'image'
    const asset: SocialLinkImportedAsset = {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width || null,
      height: result.height || null,
      bytes: result.bytes || 0,
      format: result.format || '',
      alt: 'Media Social Hub',
    }
    change((current) => ({ ...current, media: [...current.media, { id: `media-${Date.now()}`, type, url: result.secure_url, thumbnailUrl: '', publicId: result.public_id, width: result.width || null, height: result.height || null, aspectRatio: result.width && result.height ? result.width / result.height : null, alt: 'Media Social Hub', order: current.media.length }] }))
    if (sourcePreview && type === 'image') {
      setSourceUploadedAssets((current) => current.some((item) => item.publicId === asset.publicId) ? current : [...current, asset])
    }
    setMessage('Đã thêm media từ Cloudinary')
  }

  function addLink() {
    if (!linkUrl.trim()) return
    try {
      const parsed = new URL(linkUrl.trim())
      change((current) => ({ ...current, links: [...current.links, { url: parsed.toString(), domain: parsed.hostname.replace(/^www\./, ''), title: linkTitle.trim() || parsed.hostname, description: linkDescription.trim(), imageUrl: '' }] }))
      setLinkUrl('')
      setLinkTitle('')
      setLinkDescription('')
    } catch {
      setMessage('URL liên kết không hợp lệ')
    }
  }

  async function previewSourceLink() {
    if (!sourceUrl.trim()) {
      setMessage('Hãy dán liên kết public trước')
      return
    }
    setSourceLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/social-posts/import/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      })
      const result = await response.json() as { data?: SocialLinkImportPreview; message?: string }
      if (!response.ok || !result.data) throw new Error(result.message || 'Không thể tạo preview liên kết')
      setSourceGallery(null)
      setSelectedGalleryUrls([])
      setSourceUploadedAssets([])
      setSourcePostText('')
      setSourcePreview(result.data)
    } catch (error) {
      setSourcePreview(null)
      setSourcePostText('')
      setMessage(error instanceof Error ? error.message : 'Không thể tạo preview liên kết')
    } finally {
      setSourceLoading(false)
    }
  }

  function clearSourceImport() {
    setSourcePreview(null)
    setSourceGallery(null)
    setSelectedGalleryUrls([])
    setSourceUploadedAssets([])
    setSourcePostText('')
    setSourceUrl('')
  }

  async function refreshBrowserBridge() {
    setBrowserBridgeAvailable(null)
    const available = await detectFacebookBrowserExtension()
    setBrowserBridgeAvailable(available)
    setMessage(available ? 'Chrome Bridge đã kết nối.' : 'Chưa tìm thấy Chrome Bridge. Cài hoặc reload extension rồi kiểm tra lại.')
  }

  async function scanSourceGallery(mode: 'public' | 'manual' | 'extension') {
    if (!sourcePreview || sourcePreview.kind !== 'facebook') return
    setSourceGalleryLoading(true)
    setMessage(mode === 'extension'
      ? 'Chrome Bridge đang mở bài Facebook bằng session hiện tại...'
      : mode === 'manual' ? 'Đang mở tab Facebook mới bằng CDP local...' : 'Đang quét gallery public...')
    try {
      if (mode === 'extension') {
        const data = await scanFacebookGalleryWithBrowserExtension(sourcePreview.sourceUrl)
        setBrowserBridgeAvailable(true)
        setSourceGallery(data)
        setSourcePostText(data.postText || '')
        setSelectedGalleryUrls(data.images.map((image) => image.imageUrl))
        setMessage(data.partialGallery
          ? `Chrome Bridge tìm thấy ${data.images.length} ảnh nhưng Facebook vẫn báo gallery chưa mở hết.`
          : `Chrome Bridge đã tìm thấy ${data.images.length} ảnh bằng session Chrome hiện tại.`)
        return
      }
      const response = await fetch('/api/admin/social-posts/import/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: sourcePreview.sourceUrl, mode }),
      })
      const result = await response.json() as { data?: GalleryScanResponse; message?: string }
      if (!response.ok || !result.data) throw new Error(result.message || 'Không thể quét gallery Facebook')
      setSourcePreview(result.data.preview)
      setSourceGallery(result.data)
      setSourcePostText(result.data.postText || '')
      setSelectedGalleryUrls(result.data.images.map((image) => image.imageUrl))
      const sessionMessage = result.data.sessionSource === 'local_storage_state'
        ? ' bằng session local'
        : result.data.sessionSource === 'cdp_browser' ? ' bằng session Chrome hiện tại' : ''
      setMessage(result.data.partialGallery
        ? `Đã tìm thấy ${result.data.images.length} ảnh${sessionMessage}. Facebook vẫn còn phần gallery chưa mở; hãy kiểm tra quyền truy cập hoặc đăng nhập lại trong Chrome rồi quét lại.`
        : `Đã tìm thấy ${result.data.images.length} ảnh trong gallery${sessionMessage}.`)
    } catch (error) {
      setSourceGallery(null)
      setSourcePostText('')
      setSelectedGalleryUrls([])
      const code = error instanceof Error ? error.message : ''
      if (mode === 'extension' && code === 'FACEBOOK_EXTENSION_UNAVAILABLE') setBrowserBridgeAvailable(false)
      const messages: Record<string, string> = {
        FACEBOOK_EXTENSION_UNAVAILABLE: 'Chrome Bridge chưa được cài, chưa reload hoặc không có quyền trên domain này.',
        FACEBOOK_EXTENSION_CONNECTION_FAILED: 'Không kết nối được Chrome Bridge. Hãy reload extension và trang admin.',
        FACEBOOK_EXTENSION_NAVIGATION_TIMEOUT: 'Facebook tải quá lâu trong tab extension. Hãy kiểm tra mạng rồi thử lại.',
        FACEBOOK_LOGIN_REQUIRED: 'Chrome hiện tại chưa đăng nhập Facebook hoặc không có quyền xem bài này.',
        FACEBOOK_GALLERY_NOT_FOUND: 'Không tìm thấy ảnh gallery trong bài Facebook.',
      }
      setMessage(messages[code] || code || 'Không thể quét gallery Facebook')
    } finally {
      setSourceGalleryLoading(false)
    }
  }

  function toggleGalleryImage(imageUrl: string) {
    setSelectedGalleryUrls((current) => current.includes(imageUrl) ? current.filter((item) => item !== imageUrl) : [...current, imageUrl])
  }

  function applyNativePreview(preview: SocialLinkImportPreview, asset?: SocialLinkImportedAsset, sourceText = sourcePostText) {
    change((current) => applyNativeSocialLinkImport(current, preview, asset, sourceText))
    clearSourceImport()
    setMessage(asset
      ? 'Đã lưu ảnh lên Cloudinary và chuyển thành Native Post. Bấm Lưu để ghi metadata vào MongoDB.'
      : 'Đã chèn Native Post từ metadata public. Hãy kiểm tra và bổ sung nội dung trước khi lưu.')
  }

  function applyNativeGalleryPreview(preview: SocialLinkImportPreview, assets: SocialLinkImportedAsset[], sourceText = sourcePostText) {
    change((current) => applyNativeSocialGalleryImport(current, preview, assets, sourceText))
    clearSourceImport()
    setMessage(`Đã lưu ${assets.length} ảnh lên Cloudinary và chuyển thành Native Post. Bấm Lưu để ghi metadata vào MongoDB.`)
  }

  function applyUploadedSourceImages() {
    if (!sourcePreview || sourceUploadedAssets.length === 0) return
    applyNativeGalleryPreview(sourcePreview, sourceUploadedAssets)
  }

  function applyFacebookEmbedPreview(preview: SocialLinkImportPreview, sourceText = sourcePostText) {
    const linkUrl = preview.sourceUrl
    const fallbackDescription = preview.description || `Liên kết public từ ${preview.domain}.`
    const link = { url: linkUrl, domain: preview.domain, title: preview.title, description: preview.description, imageUrl: preview.imageUrl }
    change((current) => ({
      ...current,
      ...(preview.kind === 'facebook' ? { postType: 'facebook_embed' as const, facebookSourceUrl: preview.sourceUrl, facebookEmbedUrl: preview.facebookEmbedUrl } : {}),
      title: current.title.trim() || preview.title,
      slug: buildImportedSocialSlug(current.slug, current.title, preview.title, preview.sourceUrl),
      excerpt: current.excerpt.trim() || fallbackDescription,
      text: resolveImportedSocialText({ currentText: current.text, sourceText, description: preview.description }),
      links: current.links.some((item) => item.url === link.url) ? current.links : [...current.links, link],
      seo: {
        ...current.seo,
        metaTitle: current.seo.metaTitle.trim() || preview.title,
        metaDescription: current.seo.metaDescription.trim() || fallbackDescription,
        ogImage: current.seo.ogImage.trim() || preview.imageUrl,
      },
    }))
    clearSourceImport()
    setMessage('Đã chèn Facebook source và official embed. Đây là fallback, hãy kiểm tra lại bài trước khi lưu.')
  }

  async function importSourceImage() {
    if (!sourcePreview?.imageUrl) {
      if (sourcePreview) applyNativePreview(sourcePreview)
      return
    }
    const preview = sourcePreview
    setSourceImportLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/social-posts/import/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: preview.sourceUrl }),
      })
      const result = await response.json() as { data?: { asset?: SocialLinkImportedAsset }; message?: string }
      if (!response.ok || !result.data?.asset) throw new Error(result.message || 'Không thể lưu ảnh từ liên kết')
      applyNativePreview(preview, result.data.asset)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể lưu ảnh từ liên kết')
    } finally {
      setSourceImportLoading(false)
    }
  }

  async function importSourceGallery() {
    if (!sourcePreview || !sourceGallery) return
    const images = sourceGallery.images.filter((image) => selectedGalleryUrls.includes(image.imageUrl))
    if (!images.length) {
      setMessage('Hãy chọn ít nhất một ảnh trong gallery')
      return
    }
    setSourceGalleryImportLoading(true)
    setMessage('Đang lưu gallery lên Cloudinary...')
    try {
      const response = await fetch('/api/admin/social-posts/import/gallery/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: sourcePreview.sourceUrl, images }),
      })
      const result = await response.json() as { data?: { assets?: SocialLinkImportedAsset[] }; message?: string }
      if (!response.ok || !result.data?.assets?.length) throw new Error(result.message || 'Không thể lưu gallery ảnh')
      applyNativeGalleryPreview(sourcePreview, result.data.assets)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể lưu gallery ảnh')
    } finally {
      setSourceGalleryImportLoading(false)
    }
  }

  async function restore(revision: SocialPostRevision) {
    if (!post || !window.confirm(`Khôi phục revision v${revision.version}?`)) return
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/social-posts/${post.id}/restore`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revisionId: revision.id, version: post.version }) })
      const result = await response.json() as { data?: SocialPost; message?: string }
      if (!response.ok || !result.data) throw new Error(result.message || 'Không thể khôi phục revision')
      setPost(result.data)
      setDirty(false)
      setMessage(`Đã khôi phục revision v${revision.version}`)
      void load()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể khôi phục revision')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-sm text-[var(--sonic-muted)]">Đang tải Social editor...</div>
  if (!post) return <div className="sonic-panel p-8"><p className="text-red-700 dark:text-red-200">{message || 'Không tìm thấy Social Post.'}</p><Link href="/admin/social-posts" className="sonic-button sonic-button-ghost mt-5">Về danh sách</Link></div>

  return <div className="mx-auto max-w-[1500px] pb-24">
    <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><Link href="/admin/social-posts" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--sonic-muted)] hover:text-[var(--sonic-gold)]"><ArrowLeft size={14} /> Góc Audio</Link><h1 className="mt-4 text-3xl font-bold tracking-[-0.05em] text-[var(--sonic-text)]">{isNew ? 'Social Post mới' : post.title || 'Chưa đặt tiêu đề'}</h1><p className="mt-2 text-xs text-[var(--sonic-subtle)]">{dirty ? 'Có thay đổi chưa lưu' : `Đã đồng bộ · version ${post.version}`} {saving ? '· Đang xử lý...' : ''}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setTab(tab === 'write' ? 'preview' : 'write')} className="sonic-button sonic-button-ghost">{tab === 'write' ? 'Xem preview' : 'Tiếp tục sửa'}</button>{post.id && <Link href={`/bai-viet/${post.slug}`} target="_blank" className="sonic-button sonic-button-ghost"><ExternalLink size={15} /> Xem trang</Link>}<button type="button" disabled={saving} onClick={() => void persist()} className="sonic-button sonic-button-ghost"><Save size={15} /> Lưu</button><button type="button" disabled={saving} onClick={() => void publish()} className="sonic-button sonic-button-gold"><Rocket size={15} /> Xuất bản</button></div></header>

    {message && <p className="mt-5 border border-[var(--sonic-gold)]/40 bg-[var(--sonic-gold-soft)] px-4 py-3 text-sm text-[var(--sonic-gold)]">{message}</p>}
    {conflict && <div className="mt-5 border border-red-300/30 bg-red-300/5 p-4 text-sm text-red-700 dark:text-red-100"><p>Bản trên server đang ở version {conflict.version}. Tải bản server trước khi tiếp tục để tránh ghi đè.</p><button type="button" onClick={() => { setPost(conflict); setConflict(null); setDirty(false); setMessage('Đã tải bản mới nhất từ server') }} className="sonic-button sonic-button-ghost mt-3">Dùng bản server</button></div>}

    {tab === 'preview' ? <div className="mx-auto mt-7 max-w-[760px]"><SocialPostCard post={post} relatedProducts={products.filter((product) => post.relatedProductIds.includes(product.id))} detail /></div> : <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <main className="space-y-6">
        <section className="sonic-panel border-[var(--sonic-gold)]/40 p-6">
          <div>
            <p className="sonic-label">Quick import</p>
            <h2 className="mt-2 font-bold text-[var(--sonic-text)]">Chèn từ liên kết public</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--sonic-muted)]">Dán link Facebook hoặc bài viết public để lấy nội dung, title, mô tả và ảnh. Chrome Bridge dùng session đang đăng nhập trên laptop, mở một tab quét gallery rồi tự đóng mà không gửi cookie/token lên server.</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void previewSourceLink() }} className="sonic-input flex-1" placeholder="https://www.facebook.com/story.php?..." aria-label="Liên kết public cần chèn" />
            <button type="button" disabled={sourceLoading || sourceImportLoading || sourceGalleryLoading || sourceGalleryImportLoading} onClick={() => void previewSourceLink()} className="sonic-button sonic-button-ghost">{sourceLoading ? 'Đang đọc...' : 'Lấy preview'}</button>
          </div>
          {sourcePreview && <div className="mt-5 border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-4">
            <div className="flex gap-4">
              {sourcePreview.imageUrl && <img src={sourcePreview.imageUrl} alt={sourcePreview.title} className="h-20 w-28 shrink-0 object-cover" />}
              <div className="min-w-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--sonic-subtle)]">{sourcePreview.domain} · {sourcePreview.kind === 'facebook' ? 'Facebook source' : 'Public Link'}</p>
                <p className="mt-2 font-bold text-[var(--sonic-text)]">{sourcePreview.title}</p>
                {sourcePreview.description && <p className="mt-1 text-sm leading-6 text-[var(--sonic-muted)]">{sourcePreview.description}</p>}
                <p className="mt-2 truncate text-xs text-[var(--sonic-subtle)]">{sourcePreview.sourceUrl}</p>
              </div>
            </div>
            {sourcePreview.warning && <p className="mt-3 text-xs leading-5 text-amber-700 dark:text-amber-200">{sourcePreview.warning}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={Boolean(sourceGallery) || sourceImportLoading || sourceGalleryLoading || sourceGalleryImportLoading} onClick={() => void importSourceImage()} className="sonic-button sonic-button-gold">{sourceImportLoading ? 'Đang lưu ảnh...' : sourcePreview.imageUrl ? 'Lưu ảnh thumbnail & chuyển Native' : 'Chèn Native'}</button>
              {sourcePreview.imageUrl && <button type="button" disabled={Boolean(sourceGallery) || sourceImportLoading || sourceGalleryLoading || sourceGalleryImportLoading} onClick={() => applyNativePreview(sourcePreview)} className="sonic-button sonic-button-ghost">Native không lưu ảnh</button>}
              {sourcePreview.kind === 'facebook' && <>
                <button type="button" disabled={browserBridgeAvailable !== true || sourceImportLoading || sourceGalleryLoading || sourceGalleryImportLoading} onClick={() => void scanSourceGallery('extension')} className="sonic-button sonic-button-gold">{sourceGalleryLoading ? 'Đang quét gallery...' : browserBridgeAvailable === true ? 'Chrome session · quét full gallery' : browserBridgeAvailable === null ? 'Đang kiểm tra Chrome Bridge...' : 'Cần cài Chrome Bridge'}</button>
                {process.env.NODE_ENV !== 'production' && <button type="button" disabled={sourceImportLoading || sourceGalleryLoading || sourceGalleryImportLoading} onClick={() => void scanSourceGallery('public')} className="sonic-button sonic-button-ghost">Quét gallery public · local</button>}
                {process.env.NODE_ENV !== 'production' && <button type="button" disabled={sourceImportLoading || sourceGalleryLoading || sourceGalleryImportLoading} onClick={() => void scanSourceGallery('manual')} className="sonic-button sonic-button-ghost">CDP local · quét gallery</button>}
                <button type="button" disabled={sourceImportLoading || sourceGalleryLoading || sourceGalleryImportLoading} onClick={() => applyFacebookEmbedPreview(sourcePreview)} className="sonic-button sonic-button-ghost">Dùng Facebook Embed</button>
              </>}
              {sourceUploadedAssets.length > 0 && <button type="button" disabled={sourceImportLoading || sourceGalleryLoading || sourceGalleryImportLoading} onClick={applyUploadedSourceImages} className="sonic-button sonic-button-gold">Gắn {sourceUploadedAssets.length} ảnh đã upload & chuyển Native</button>}
              <button type="button" disabled={sourceImportLoading || sourceGalleryLoading || sourceGalleryImportLoading} onClick={clearSourceImport} className="sonic-button sonic-button-ghost">Bỏ preview</button>
            </div>
            {sourcePreview.kind === 'facebook' && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-l-2 border-[var(--sonic-gold)] pl-3 text-xs leading-5 text-[var(--sonic-muted)]"><p>Chrome Bridge: <strong className={browserBridgeAvailable ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-200'}>{browserBridgeAvailable === true ? 'đã kết nối' : browserBridgeAvailable === null ? 'đang kiểm tra' : 'chưa kết nối'}</strong>. Extension chỉ trả gallery về tab này; sau khi chuyển Native, bấm <strong>Lưu</strong> ở đầu trang để ghi Social Post vào MongoDB.</p><button type="button" onClick={() => void refreshBrowserBridge()} className="text-xs font-bold text-[var(--sonic-gold)]">Kiểm tra lại</button></div>}
          </div>}
          {sourceGallery && <div className="mt-5 border border-[var(--sonic-gold)]/30 bg-[var(--sonic-surface)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="sonic-label">Facebook gallery · {sourceGallery.sessionSource === 'browser_session' ? 'Chrome Bridge' : sourceGallery.sessionSource === 'cdp_browser' ? 'session Chrome hiện tại' : sourceGallery.sessionSource === 'local_storage_state' ? 'session local' : sourceGallery.provider === 'manual_profile' ? 'profile tạm' : 'public browser'}</p>
                <p className="mt-2 text-sm text-[var(--sonic-muted)]">Đã tìm thấy {sourceGallery.images.length} ảnh · đang chọn {selectedGalleryUrls.length}</p>
                {sourcePostText && <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-[var(--sonic-text)]"><span className="font-bold">Nội dung đã đọc:</span> {sourcePostText}</p>}
              </div>
              {sourceGallery.partialGallery && <p className="max-w-md text-xs leading-5 text-amber-700 dark:text-amber-200">Facebook còn báo gallery chưa mở hết. Kiểm tra session/quyền truy cập trong Chrome rồi quét lại, hoặc chọn các ảnh hiện có.</p>}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {sourceGallery.images.map((image, index) => {
                const selected = selectedGalleryUrls.includes(image.imageUrl)
                return <button key={image.imageUrl} type="button" aria-pressed={selected} aria-label={`${selected ? 'Bỏ chọn' : 'Chọn'} ảnh ${index + 1}`} onClick={() => toggleGalleryImage(image.imageUrl)} className={`overflow-hidden border text-left transition ${selected ? 'border-[var(--sonic-gold)] ring-2 ring-[var(--sonic-gold)]/30' : 'border-[var(--sonic-line)] opacity-60 hover:opacity-100'}`}>
                  <img src={image.imageUrl} alt={image.label || `Ảnh ${index + 1}`} className="aspect-square w-full object-cover" />
                  <span className="block px-2 py-2 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[var(--sonic-muted)]">{selected ? 'Đã chọn' : 'Chọn'} · {index + 1}</span>
                </button>
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" disabled={sourceGalleryImportLoading || selectedGalleryUrls.length === 0} onClick={() => void importSourceGallery()} className="sonic-button sonic-button-gold">{sourceGalleryImportLoading ? 'Đang lưu gallery...' : `Upload ${selectedGalleryUrls.length} ảnh & chuyển Native`}</button>
              <button type="button" disabled={sourceGalleryImportLoading} onClick={() => { setSourceGallery(null); setSourcePostText(''); setSelectedGalleryUrls([]) }} className="sonic-button sonic-button-ghost">Bỏ gallery</button>
            </div>
          </div>}
        </section>
        <section className="sonic-panel p-6"><div className="grid gap-4"><label className="text-xs text-[var(--sonic-muted)]">Tiêu đề<input value={post.title} onChange={(event) => change((current) => ({ ...current, title: event.target.value, slug: current.slug || slugify(event.target.value) }))} className="sonic-input mt-2 text-lg font-bold" /></label><label className="text-xs text-[var(--sonic-muted)]">Slug<input value={post.slug} onChange={(event) => update('slug', slugify(event.target.value))} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Excerpt<textarea value={post.excerpt} maxLength={500} onChange={(event) => update('excerpt', event.target.value)} className="sonic-input mt-2 min-h-24" /><span className="mt-1 block text-right text-[0.65rem] text-[var(--sonic-subtle)]">{post.excerpt.length}/500</span></label></div></section>

        <section className="sonic-panel p-6"><div className="flex items-center justify-between"><div><p className="sonic-label">Native content</p><h2 className="mt-2 font-bold text-[var(--sonic-text)]">Nội dung Social</h2></div><span className="text-xs text-[var(--sonic-subtle)]">{post.text.length.toLocaleString('vi-VN')} ký tự</span></div><textarea value={post.text} onChange={(event) => update('text', event.target.value)} className="sonic-input mt-5 min-h-[360px] resize-y leading-7" placeholder="Viết nội dung đã được xác minh, có ngữ cảnh và lời kêu gọi hành động..." /></section>

        <section className="sonic-panel p-6"><div className="flex items-center justify-between"><div><p className="sonic-label">Media</p><h2 className="mt-2 font-bold text-[var(--sonic-text)]">Ảnh, video hoặc embed</h2></div><span className="text-xs text-[var(--sonic-subtle)]">{post.media.length}/50</span></div><div className="mt-5 grid gap-3 md:grid-cols-[140px_1fr_1fr_auto]"><select value={mediaType} onChange={(event) => setMediaType(event.target.value as SocialMediaItem['type'])} className="sonic-input">{SOCIAL_MEDIA_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}</select><input value={mediaUrl} onChange={(event) => setMediaUrl(event.target.value)} className="sonic-input" placeholder="URL media / YouTube / Facebook" /><input value={mediaAlt} onChange={(event) => setMediaAlt(event.target.value)} className="sonic-input" placeholder="Alt text" /><button type="button" onClick={addMedia} className="sonic-button sonic-button-ghost"><Plus size={15} /> Thêm</button></div><div className="mt-4 border border-dashed border-[var(--sonic-line)] p-4"><p className="text-xs text-[var(--sonic-muted)]">Upload trực tiếp vào Cloudinary — có thể chọn nhiều ảnh cùng lúc. Đây là luồng ổn định cho gallery từ Facebook cá nhân.</p><CloudinaryUpload accept="image" multiple type="social" folder="social" maxSize={50} onUploadComplete={addUploaded} onUploadError={setMessage} className="mt-3" /></div><div className="mt-5 grid gap-3">{post.media.length === 0 ? <p className="text-sm text-[var(--sonic-subtle)]">Chưa có media.</p> : post.media.map((media, index) => <div key={media.id} className="grid gap-3 border border-[var(--sonic-line)] p-3 md:grid-cols-[100px_100px_1fr_auto] md:items-center"><span className="text-xs font-bold uppercase text-[var(--sonic-gold)]">{index + 1} · {media.type}</span><input value={media.alt} onChange={(event) => change((current) => ({ ...current, media: current.media.map((item) => item.id === media.id ? { ...item, alt: event.target.value } : item) }))} className="sonic-input" placeholder="Alt text" /><input value={media.url} onChange={(event) => change((current) => ({ ...current, media: current.media.map((item) => item.id === media.id ? { ...item, url: event.target.value } : item) }))} className="sonic-input" /><button type="button" onClick={() => update('media', post.media.filter((item) => item.id !== media.id))} className="text-[var(--sonic-subtle)] hover:text-red-500" aria-label="Xóa media"><Trash2 size={16} /></button></div>)}</div></section>

        <section className="sonic-panel p-6"><div><p className="sonic-label">Link preview</p><h2 className="mt-2 font-bold text-[var(--sonic-text)]">Liên kết trong nội dung</h2></div><div className="mt-5 grid gap-3 md:grid-cols-3"><input value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} className="sonic-input" placeholder="https://..." /><input value={linkTitle} onChange={(event) => setLinkTitle(event.target.value)} className="sonic-input" placeholder="Tiêu đề card" /><input value={linkDescription} onChange={(event) => setLinkDescription(event.target.value)} className="sonic-input" placeholder="Mô tả ngắn" /></div><button type="button" onClick={addLink} className="sonic-button sonic-button-ghost mt-3"><Plus size={15} /> Thêm liên kết</button><div className="mt-4 grid gap-2">{post.links.map((link) => <div key={link.url} className="flex items-center justify-between gap-3 border border-[var(--sonic-line)] p-3 text-xs"><span className="min-w-0 truncate text-[var(--sonic-muted)]">{link.title} · {link.domain}</span><button type="button" onClick={() => update('links', post.links.filter((item) => item.url !== link.url))} className="text-[var(--sonic-subtle)] hover:text-red-500" aria-label={`Xóa link ${link.title}`}><Trash2 size={15} /></button></div>)}</div></section>

        <section className="sonic-panel p-6"><p className="sonic-label">SEO metadata</p><div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs text-[var(--sonic-muted)]">Meta title<input value={post.seo.metaTitle} onChange={(event) => updateSEO('metaTitle', event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Canonical path<input value={post.seo.canonicalPath} onChange={(event) => updateSEO('canonicalPath', event.target.value)} className="sonic-input mt-2" placeholder={`/bai-viet/${post.slug}`} /></label><label className="text-xs text-[var(--sonic-muted)] md:col-span-2">Meta description<textarea value={post.seo.metaDescription} onChange={(event) => updateSEO('metaDescription', event.target.value)} className="sonic-input mt-2 min-h-24" /></label><label className="text-xs text-[var(--sonic-muted)]">OG title<input value={post.seo.ogTitle} onChange={(event) => updateSEO('ogTitle', event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">OG image<input value={post.seo.ogImage} onChange={(event) => updateSEO('ogImage', event.target.value)} className="sonic-input mt-2" /></label><label className="flex items-center gap-3 text-xs text-[var(--sonic-muted)] md:col-span-2"><input type="checkbox" checked={post.seo.noIndex} onChange={(event) => updateSEO('noIndex', event.target.checked)} /> Noindex Social Post</label></div></section>
      </main>

      <aside className="space-y-6">
        <section className="sonic-panel p-5"><p className="sonic-label">Workflow</p><div className="mt-4 grid gap-4"><label className="text-xs text-[var(--sonic-muted)]">Loại nội dung<select value={post.postType} onChange={(event) => update('postType', event.target.value as SocialPost['postType'])} className="sonic-input mt-2">{SOCIAL_POST_TYPES.map((item) => <option key={item} value={item}>{item === 'native' ? 'Native post' : 'Facebook Embed'}</option>)}</select></label><label className="text-xs text-[var(--sonic-muted)]">Trạng thái<select value={post.status} onChange={(event) => update('status', event.target.value as SocialPost['status'])} className="sonic-input mt-2"><option value="idea">Ý tưởng</option><option value="draft">Bản nháp</option><option value="review">Chờ duyệt</option><option value="scheduled">Hẹn giờ</option><option value="published">Đã xuất bản</option><option value="archived">Lưu trữ</option></select></label>{post.status === 'scheduled' && <label className="text-xs text-[var(--sonic-muted)]">Thời điểm xuất bản<input type="datetime-local" value={toLocalDateTime(post.scheduledAt)} onChange={(event) => update('scheduledAt', event.target.value ? new Date(event.target.value).toISOString() : null)} className="sonic-input mt-2" /></label>}<label className="text-xs text-[var(--sonic-muted)]">Danh mục<select value={post.category} onChange={(event) => update('category', event.target.value)} className="sonic-input mt-2">{SOCIAL_CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="text-xs text-[var(--sonic-muted)]">Tags<input value={post.tags.join(', ')} onChange={(event) => update('tags', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} className="sonic-input mt-2" placeholder="loa bookshelf, showroom" /></label></div></section>

        <section className="sonic-panel p-5"><p className="sonic-label">Author & source</p><div className="mt-4 grid gap-4"><label className="text-xs text-[var(--sonic-muted)]">Tên tác giả<input value={post.author.displayName} onChange={(event) => updateAuthor('displayName', event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Avatar URL<input value={post.author.avatarUrl} onChange={(event) => updateAuthor('avatarUrl', event.target.value)} className="sonic-input mt-2" /></label><label className="flex items-center gap-3 text-xs text-[var(--sonic-muted)]"><input type="checkbox" checked={post.author.verified} onChange={(event) => updateAuthor('verified', event.target.checked)} /> Hiển thị verified</label><label className="text-xs text-[var(--sonic-muted)]">Facebook source URL<input value={post.facebookSourceUrl} onChange={(event) => update('facebookSourceUrl', event.target.value)} className="sonic-input mt-2" placeholder="https://www.facebook.com/..." /></label><label className="text-xs text-[var(--sonic-muted)]">Facebook embed URL<input value={post.facebookEmbedUrl} onChange={(event) => update('facebookEmbedUrl', event.target.value)} className="sonic-input mt-2" placeholder="https://www.facebook.com/plugins/post.php?..." /></label></div></section>

        <section className="sonic-panel p-5"><p className="sonic-label">Relations</p><label className="mt-4 block text-xs text-[var(--sonic-muted)]">Sản phẩm liên quan<select multiple value={post.relatedProductIds} onChange={(event) => update('relatedProductIds', Array.from(event.target.selectedOptions, (option) => option.value))} className="sonic-input mt-2 min-h-36">{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label><label className="mt-4 block text-xs text-[var(--sonic-muted)]">Bài kiến thức liên quan<select multiple value={post.relatedArticleIds} onChange={(event) => update('relatedArticleIds', Array.from(event.target.selectedOptions, (option) => option.value))} className="sonic-input mt-2 min-h-36">{articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}</select></label><p className="mt-3 text-[0.65rem] leading-5 text-[var(--sonic-subtle)]">Giữ Ctrl/Cmd để chọn nhiều quan hệ. Quan hệ giúp tăng internal link và chuyển đổi.</p></section>

        <section className="sonic-panel p-5"><p className="sonic-label">Revision history</p><div className="mt-4 grid gap-3">{revisions.length === 0 ? <p className="text-xs text-[var(--sonic-subtle)]">Revision được tạo khi publish, cập nhật bài đã publish hoặc restore.</p> : revisions.map((revision) => <div key={revision.id} className="border border-[var(--sonic-line)] p-3"><div className="flex items-center gap-2"><History size={14} className="text-[var(--sonic-gold)]" /><p className="text-xs font-bold text-[var(--sonic-text)]">v{revision.version} · {revision.reason}</p></div><p className="mt-1 text-[0.65rem] text-[var(--sonic-subtle)]">{new Date(revision.createdAt).toLocaleString('vi-VN')} · {revision.actor}</p><button type="button" disabled={saving} onClick={() => void restore(revision)} className="mt-2 text-xs font-bold text-[var(--sonic-gold)]">Khôi phục</button></div>)}</div></section>

        <section className="sonic-panel p-5"><p className="sonic-label">Publish checklist</p><div className="mt-4 grid gap-3 text-xs leading-5"><div className="flex gap-3"><Check size={15} className={post.title && post.excerpt ? 'text-emerald-500' : 'text-[var(--sonic-subtle)]'} /><span className="text-[var(--sonic-muted)]">Có title và excerpt rõ ngữ cảnh</span></div><div className="flex gap-3"><Check size={15} className={post.text || post.media.length ? 'text-emerald-500' : 'text-[var(--sonic-subtle)]'} /><span className="text-[var(--sonic-muted)]">Có nội dung hoặc media</span></div><div className="flex gap-3"><Check size={15} className={post.relatedProductIds.length ? 'text-emerald-500' : 'text-[var(--sonic-subtle)]'} /><span className="text-[var(--sonic-muted)]">Đã gắn thiết bị nếu bài có mục đích thương mại</span></div></div></section>
      </aside>
    </div>}
  </div>
}
