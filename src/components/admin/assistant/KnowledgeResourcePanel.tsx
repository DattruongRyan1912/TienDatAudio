'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, Check, History, Pencil, Plus, RefreshCw, RotateCcw, Save, Send, ShieldCheck, Sparkles, X } from 'lucide-react'
import type {
  CompatibilityAssessment,
  KnowledgeClaim,
  KnowledgeEntry,
  KnowledgeEntryRevision,
  KnowledgeResourceName,
  KnowledgeSource,
} from '@/modules/knowledge/domain/types'

type ResourceItem = KnowledgeEntry | KnowledgeSource | KnowledgeClaim | CompatibilityAssessment
type ProductOption = { id: string; name: string }

type FormDraft = {
  id: string
  version: number
  title: string
  slug: string
  type: string
  answerMarkdown: string
  aliases: string
  tags: string
  priority: string
  sourceIds: string[]
  validFrom: string
  expiresAt: string
  organization: string
  url: string
  retrievedAt: string
  subjectType: string
  subjectId: string
  subjectLabel: string
  predicate: string
  objectType: string
  objectId: string
  objectLabel: string
  objectValue: string
  reason: string
  confidence: string
  componentIds: string[]
  minM2: string
  maxM2: string
  useCases: string[]
  preferences: string
  verdict: string
}

const labels: Record<KnowledgeResourceName, { eyebrow: string; title: string; empty: string }> = {
  knowledge: { eyebrow: 'Curated answers', title: 'Kho trả lời đã duyệt', empty: 'Chưa có mục tri thức.' },
  sources: { eyebrow: 'Evidence registry', title: 'Nguồn bằng chứng', empty: 'Chưa có nguồn bằng chứng.' },
  claims: { eyebrow: 'Atomic facts', title: 'Claim có cấu trúc', empty: 'Chưa có claim.' },
  compatibility: { eyebrow: 'System advisor', title: 'Đánh giá phối ghép', empty: 'Chưa có đánh giá phối ghép.' },
}

function blankForm(): FormDraft {
  return {
    id: '', version: 1, title: '', slug: '', type: 'faq', answerMarkdown: '', aliases: '', tags: '', priority: '50', sourceIds: [], validFrom: '', expiresAt: '',
    organization: '', url: '', retrievedAt: '', subjectType: 'product', subjectId: '', subjectLabel: '', predicate: '', objectType: 'concept', objectId: '', objectLabel: '', objectValue: '', reason: '', confidence: '0.8',
    componentIds: [], minM2: '', maxM2: '', useCases: ['music'], preferences: '', verdict: 'conditional',
  }
}

function list(value: string) {
  return Array.from(new Set(value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)))
}

function dateInput(value?: string | null) {
  return value ? value.slice(0, 10) : ''
}

function itemToForm(item: ResourceItem): FormDraft {
  const form = blankForm()
  form.id = item.id
  form.version = item.version
  if ('title' in item) form.title = item.title
  if ('slug' in item) {
    form.slug = item.slug
    form.type = item.type
    form.answerMarkdown = item.answerMarkdown
    form.aliases = item.aliases.join(', ')
    form.tags = item.tags.join(', ')
    form.priority = String(item.priority)
    form.sourceIds = item.sourceIds
    form.validFrom = dateInput(item.validFrom)
    form.expiresAt = dateInput(item.expiresAt)
  } else if ('organization' in item) {
    form.type = item.type
    form.organization = item.organization
    form.url = item.url
    form.retrievedAt = dateInput(item.retrievedAt)
  } else if ('subject' in item) {
    form.subjectType = item.subject.type
    form.subjectId = item.subject.sourceId
    form.subjectLabel = item.subject.label
    form.predicate = item.predicate
    form.objectType = item.object.type
    form.objectId = item.object.sourceId || ''
    form.objectLabel = item.object.label
    form.objectValue = item.object.value || ''
    form.reason = item.reason
    form.sourceIds = item.sourceIds
    form.confidence = String(item.confidence)
    form.validFrom = dateInput(item.validFrom)
    form.expiresAt = dateInput(item.expiresAt)
  } else {
    form.componentIds = item.componentIds
    form.minM2 = item.room.minM2 === null ? '' : String(item.room.minM2)
    form.maxM2 = item.room.maxM2 === null ? '' : String(item.room.maxM2)
    form.useCases = item.useCases
    form.preferences = item.preferences.join(', ')
    form.verdict = item.verdict
    form.reason = item.reason
    form.sourceIds = item.sourceIds
    form.confidence = String(item.confidence)
  }
  return form
}

function payload(resource: KnowledgeResourceName, form: FormDraft) {
  if (resource === 'knowledge') return {
    version: form.version, title: form.title, slug: form.slug, type: form.type, answerMarkdown: form.answerMarkdown,
    aliases: list(form.aliases), tags: list(form.tags), priority: Number(form.priority), sourceIds: form.sourceIds,
    validFrom: form.validFrom || null, expiresAt: form.expiresAt || null,
  }
  if (resource === 'sources') return {
    version: form.version, title: form.title, type: form.type, organization: form.organization, url: form.url,
    retrievedAt: form.retrievedAt || null,
  }
  if (resource === 'claims') return {
    version: form.version,
    subject: { type: form.subjectType, sourceId: form.subjectId, label: form.subjectLabel },
    predicate: form.predicate,
    object: { type: form.objectType, sourceId: form.objectId || null, label: form.objectLabel, value: form.objectValue || null },
    reason: form.reason, sourceIds: form.sourceIds, confidence: Number(form.confidence),
    validFrom: form.validFrom || null, expiresAt: form.expiresAt || null,
  }
  return {
    version: form.version, componentIds: form.componentIds,
    room: { minM2: form.minM2 === '' ? null : Number(form.minM2), maxM2: form.maxM2 === '' ? null : Number(form.maxM2) },
    useCases: form.useCases, preferences: list(form.preferences), verdict: form.verdict, reason: form.reason,
    sourceIds: form.sourceIds, confidence: Number(form.confidence),
  }
}

function statusOf(item: ResourceItem) {
  return item.reviewStatus
}

function itemTitle(item: ResourceItem) {
  if ('title' in item) return item.title
  if ('subject' in item) return `${item.subject.label} · ${item.predicate.replaceAll('_', ' ')} · ${item.object.label}`
  return `${item.componentIds.length} sản phẩm · ${item.useCases.join(', ')}`
}

function itemDescription(item: ResourceItem) {
  if ('answerMarkdown' in item) return item.answerMarkdown
  if ('organization' in item) return [item.organization, item.url].filter(Boolean).join(' · ')
  return item.reason
}

function MultiSelect({ label, value, options, onChange }: { label: string; value: string[]; options: Array<{ id: string; label: string }>; onChange: (next: string[]) => void }) {
  return <label className="text-xs text-[var(--sonic-muted)]">{label}<select multiple value={value} onChange={(event) => onChange(Array.from(event.target.selectedOptions, (option) => option.value))} className="sonic-input mt-2 min-h-32">{options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select><span className="mt-1 block text-[0.65rem] text-[var(--sonic-subtle)]">Giữ Cmd/Ctrl để chọn nhiều mục.</span></label>
}

export default function KnowledgeResourcePanel({ resource }: { resource: KnowledgeResourceName }) {
  const [items, setItems] = useState<ResourceItem[]>([])
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [form, setForm] = useState<FormDraft | null>(null)
  const [revisions, setRevisions] = useState<KnowledgeEntryRevision[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [suggestionText, setSuggestionText] = useState('')
  const [suggestionSourceIds, setSuggestionSourceIds] = useState<string[]>([])
  const copy = labels[resource]

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (search.trim()) params.set('search', search.trim())
    const response = await fetch(`/api/admin/assistant/knowledge/${resource}?${params}`)
    const result = await response.json() as { data?: { items: ResourceItem[] }; message?: string }
    if (response.ok && result.data) setItems(result.data.items)
    else setMessage(result.message || 'Không thể tải dữ liệu.')
    setLoading(false)
  }, [resource, search])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    void Promise.all([
      fetch('/api/admin/assistant/knowledge/sources?limit=100').then((response) => response.ok ? response.json() : null),
      fetch('/api/admin/products').then((response) => response.ok ? response.json() : null),
    ]).then(([sourceResult, productResult]) => {
      if (sourceResult?.data?.items) setSources(sourceResult.data.items as KnowledgeSource[])
      if (Array.isArray(productResult)) setProducts(productResult.map((item: ProductOption) => ({ id: item.id, name: item.name })))
    })
  }, [])

  const sourceOptions = useMemo(() => sources.map((source) => ({ id: source.id, label: `${source.title} · ${source.reviewStatus}` })), [sources])
  const productOptions = useMemo(() => products.map((product) => ({ id: product.id, label: product.name })), [products])

  async function edit(item: ResourceItem) {
    setForm(itemToForm(item))
    setMessage('')
    if (resource === 'knowledge') {
      const response = await fetch(`/api/admin/assistant/knowledge/knowledge/${item.id}/revisions`)
      const result = await response.json() as { data?: KnowledgeEntryRevision[] }
      setRevisions(response.ok ? result.data || [] : [])
    } else setRevisions([])
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!form || saving) return
    setSaving(true)
    setMessage('')
    const editing = Boolean(form.id)
    const response = await fetch(editing ? `/api/admin/assistant/knowledge/${resource}/${form.id}` : `/api/admin/assistant/knowledge/${resource}`, {
      method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload(resource, form)),
    })
    const result = await response.json() as { data?: ResourceItem; message?: string; code?: string }
    if (response.ok && result.data) {
      setMessage(editing ? 'Đã cập nhật bản ghi.' : 'Đã tạo bản ghi ở trạng thái an toàn để duyệt.')
      setForm(null)
      await load()
    } else setMessage(result.message || (result.code === 'VERSION_CONFLICT' ? 'Bản ghi đã thay đổi ở nơi khác. Hãy tải lại.' : 'Không thể lưu bản ghi.'))
    setSaving(false)
  }

  async function runAction(item: ResourceItem, action: string) {
    if (action === 'archive' && !window.confirm('Lưu trữ bản ghi này? Dữ liệu vẫn được giữ để audit.')) return
    setSaving(true)
    const response = await fetch(`/api/admin/assistant/knowledge/${resource}/${item.id}/action`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, version: item.version }),
    })
    const result = await response.json() as { message?: string; code?: string }
    setMessage(response.ok ? 'Đã cập nhật workflow.' : result.message || result.code || 'Không thể cập nhật workflow.')
    if (response.ok) { setForm(null); await load() }
    setSaving(false)
  }

  async function restore(revision: KnowledgeEntryRevision) {
    if (!form?.id || !window.confirm(`Khôi phục revision v${revision.version} về bản nháp?`)) return
    const response = await fetch(`/api/admin/assistant/knowledge/knowledge/${form.id}/restore`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revisionId: revision.id, version: form.version }),
    })
    const result = await response.json() as { data?: ResourceItem; message?: string }
    if (response.ok && result.data) { setMessage('Đã khôi phục revision thành bản nháp mới.'); setForm(itemToForm(result.data)); await load() }
    else setMessage(result.message || 'Không thể khôi phục revision.')
  }

  async function extractSuggestions() {
    if (saving) return
    setSaving(true)
    setMessage('')
    const response = await fetch('/api/admin/assistant/suggestions/extract', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: suggestionText, sourceIds: suggestionSourceIds }),
    })
    const result = await response.json() as { data?: { created: ResourceItem[]; rejected: string[] }; message?: string; code?: string }
    if (response.ok && result.data) {
      setMessage(`Đã tạo ${result.data.created.length} suggestion để người quản trị duyệt${result.data.rejected.length ? `; ${result.data.rejected.length} claim không hợp lệ đã bị loại` : ''}.`)
      setSuggestionText('')
      await load()
    } else setMessage(result.message || result.code || 'Không thể trích xuất suggestion.')
    setSaving(false)
  }

  function workflowButtons(item: ResourceItem) {
    const status = statusOf(item)
    if (resource === 'knowledge') return <>
      {status === 'draft' && <button onClick={() => void runAction(item, 'submit_review')} className="sonic-button sonic-button-ghost"><Send size={14} /> Gửi duyệt</button>}
      {status === 'review' && <button onClick={() => void runAction(item, 'publish')} className="sonic-button sonic-button-gold"><Check size={14} /> Xuất bản</button>}
      {status !== 'archived' && <button onClick={() => void runAction(item, 'archive')} className="sonic-button sonic-button-ghost"><Archive size={14} /> Lưu trữ</button>}
    </>
    return <>
      {(status === 'suggested' || status === 'rejected' || status === 'archived') && <button onClick={() => void runAction(item, 'review')} className="sonic-button sonic-button-ghost"><Send size={14} /> Đưa vào duyệt</button>}
      {status === 'review' && <><button onClick={() => void runAction(item, 'verify')} className="sonic-button sonic-button-gold"><ShieldCheck size={14} /> Xác minh</button><button onClick={() => void runAction(item, 'reject')} className="sonic-button sonic-button-ghost"><X size={14} /> Từ chối</button></>}
      {status === 'verified' && <button onClick={() => void runAction(item, 'archive')} className="sonic-button sonic-button-ghost"><Archive size={14} /> Lưu trữ</button>}
    </>
  }

  return <div>
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="sonic-label">{copy.eyebrow}</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.05em]">{copy.title}.</h2></div><div className="flex gap-2"><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Làm mới</button><button type="button" onClick={() => { setForm(blankForm()); setRevisions([]) }} className="sonic-button sonic-button-gold"><Plus size={15} /> Thêm mới</button></div></div>
    {message && <p className="mt-5 border border-[var(--sonic-gold)]/40 bg-[var(--sonic-gold)]/5 px-4 py-3 text-sm text-[var(--sonic-gold)]">{message}</p>}
    {resource === 'claims' && <section className="sonic-panel mt-6 p-6"><div className="flex items-start gap-3"><Sparkles className="mt-1 shrink-0 text-[var(--sonic-gold)]" size={19} /><div><p className="sonic-label">AI suggestion queue</p><h3 className="mt-2 text-xl font-bold">Trích xuất claim, không tự xác minh.</h3><p className="mt-2 text-xs leading-5 text-[var(--sonic-muted)]">Model chỉ tạo suggestion từ nội dung và nguồn bạn chọn. Mỗi claim vẫn phải qua Review → Verify; claim AI không bao giờ tự đi vào câu trả lời public.</p></div></div><div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]"><label className="text-xs text-[var(--sonic-muted)]">Nội dung nguồn<textarea value={suggestionText} onChange={(event) => setSuggestionText(event.target.value)} className="sonic-input mt-2 min-h-40" placeholder="Dán ghi chú kỹ thuật hoặc đoạn tài liệu cần trích xuất..." /></label><MultiSelect label="Nguồn bằng chứng đi kèm" value={suggestionSourceIds} options={sourceOptions} onChange={setSuggestionSourceIds} /></div><button type="button" disabled={saving || suggestionText.trim().length < 50 || suggestionSourceIds.length === 0} onClick={() => void extractSuggestions()} className="sonic-button sonic-button-gold mt-4"><Sparkles size={15} /> {saving ? 'Đang trích xuất...' : 'Tạo suggestion để duyệt'}</button></section>}
    <form className="sonic-panel mt-6 flex gap-3 p-4" onSubmit={(event) => { event.preventDefault(); void load() }}><input value={search} onChange={(event) => setSearch(event.target.value)} className="sonic-input" placeholder="Tìm trong kho tri thức..." /><button className="sonic-button sonic-button-ghost">Lọc</button></form>

    {form && <form onSubmit={save} className="sonic-panel mt-6 p-6"><div className="flex items-center justify-between"><div><p className="sonic-label">{form.id ? `Edit · v${form.version}` : 'New record'}</p><h3 className="mt-2 text-xl font-bold">{form.id ? 'Chỉnh sửa bản ghi' : 'Tạo bản ghi mới'}</h3></div><button type="button" onClick={() => setForm(null)} className="text-[var(--sonic-muted)]"><X size={19} /></button></div><div className="mt-6 grid gap-4 md:grid-cols-2">
      {resource === 'knowledge' && <>
        <label className="text-xs text-[var(--sonic-muted)]">Tiêu đề<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[var(--sonic-muted)]">Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[var(--sonic-muted)]">Loại<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="sonic-input mt-2"><option value="faq">FAQ</option><option value="policy">Policy</option><option value="service">Service</option><option value="guide">Guide</option></select></label>
        <label className="text-xs text-[var(--sonic-muted)]">Ưu tiên 0–100<input type="number" min="0" max="100" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[var(--sonic-muted)] md:col-span-2">Nội dung đã kiểm chứng<textarea required value={form.answerMarkdown} onChange={(event) => setForm({ ...form, answerMarkdown: event.target.value })} className="sonic-input mt-2 min-h-48 font-mono" /></label>
        <label className="text-xs text-[var(--sonic-muted)]">Aliases<input value={form.aliases} onChange={(event) => setForm({ ...form, aliases: event.target.value })} className="sonic-input mt-2" placeholder="cách hỏi khác, từ đồng nghĩa" /></label>
        <label className="text-xs text-[var(--sonic-muted)]">Tags<input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} className="sonic-input mt-2" /></label>
        <MultiSelect label="Nguồn verified bắt buộc trước khi publish" value={form.sourceIds} options={sourceOptions} onChange={(sourceIds) => setForm({ ...form, sourceIds })} />
        <div className="grid grid-cols-2 gap-3"><label className="text-xs text-[var(--sonic-muted)]">Hiệu lực từ<input type="date" value={form.validFrom} onChange={(event) => setForm({ ...form, validFrom: event.target.value })} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Hết hiệu lực<input type="date" value={form.expiresAt} onChange={(event) => setForm({ ...form, expiresAt: event.target.value })} className="sonic-input mt-2" /></label></div>
      </>}
      {resource === 'sources' && <>
        <label className="text-xs text-[var(--sonic-muted)]">Tên nguồn<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[var(--sonic-muted)]">Tổ chức<input value={form.organization} onChange={(event) => setForm({ ...form, organization: event.target.value })} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[var(--sonic-muted)]">Loại<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="sonic-input mt-2"><option value="manufacturer">Manufacturer</option><option value="official_documentation">Official documentation</option><option value="verified_internal">Verified internal</option><option value="expert_note">Expert note</option></select></label>
        <label className="text-xs text-[var(--sonic-muted)]">Ngày truy xuất<input type="date" value={form.retrievedAt} onChange={(event) => setForm({ ...form, retrievedAt: event.target.value })} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[var(--sonic-muted)] md:col-span-2">URL HTTPS<input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} className="sonic-input mt-2" placeholder="https://..." /></label>
      </>}
      {resource === 'claims' && <>
        <label className="text-xs text-[var(--sonic-muted)]">Subject type<input value={form.subjectType} onChange={(event) => setForm({ ...form, subjectType: event.target.value })} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Subject ID<input required value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Subject label<input required value={form.subjectLabel} onChange={(event) => setForm({ ...form, subjectLabel: event.target.value })} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Predicate<input required value={form.predicate} onChange={(event) => setForm({ ...form, predicate: event.target.value })} className="sonic-input mt-2" placeholder="compatible_with" /></label>
        <label className="text-xs text-[var(--sonic-muted)]">Object type<input value={form.objectType} onChange={(event) => setForm({ ...form, objectType: event.target.value })} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Object ID<input value={form.objectId} onChange={(event) => setForm({ ...form, objectId: event.target.value })} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Object label<input required value={form.objectLabel} onChange={(event) => setForm({ ...form, objectLabel: event.target.value })} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Object value<input value={form.objectValue} onChange={(event) => setForm({ ...form, objectValue: event.target.value })} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[var(--sonic-muted)] md:col-span-2">Lý do / claim text<textarea required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className="sonic-input mt-2 min-h-32" /></label><MultiSelect label="Nguồn verified" value={form.sourceIds} options={sourceOptions} onChange={(sourceIds) => setForm({ ...form, sourceIds })} /><label className="text-xs text-[var(--sonic-muted)]">Confidence<input type="number" min="0" max="1" step="0.05" value={form.confidence} onChange={(event) => setForm({ ...form, confidence: event.target.value })} className="sonic-input mt-2" /></label>
      </>}
      {resource === 'compatibility' && <>
        <MultiSelect label="Sản phẩm trong cấu hình" value={form.componentIds} options={productOptions} onChange={(componentIds) => setForm({ ...form, componentIds })} /><MultiSelect label="Nguồn verified" value={form.sourceIds} options={sourceOptions} onChange={(sourceIds) => setForm({ ...form, sourceIds })} />
        <div className="grid grid-cols-2 gap-3"><label className="text-xs text-[var(--sonic-muted)]">Phòng từ m²<input type="number" min="0" value={form.minM2} onChange={(event) => setForm({ ...form, minM2: event.target.value })} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Phòng đến m²<input type="number" min="0" value={form.maxM2} onChange={(event) => setForm({ ...form, maxM2: event.target.value })} className="sonic-input mt-2" /></label></div>
        <MultiSelect label="Use case" value={form.useCases} options={[{ id: 'music', label: 'Nghe nhạc' }, { id: 'karaoke', label: 'Karaoke' }, { id: 'cinema', label: 'Xem phim' }, { id: 'event', label: 'Sự kiện' }]} onChange={(useCases) => setForm({ ...form, useCases })} />
        <label className="text-xs text-[var(--sonic-muted)]">Verdict<select value={form.verdict} onChange={(event) => setForm({ ...form, verdict: event.target.value })} className="sonic-input mt-2"><option value="recommended">Recommended</option><option value="conditional">Conditional</option><option value="not_recommended">Not recommended</option></select></label>
        <label className="text-xs text-[var(--sonic-muted)]">Sở thích phù hợp<input value={form.preferences} onChange={(event) => setForm({ ...form, preferences: event.target.value })} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Confidence<input type="number" min="0" max="1" step="0.05" value={form.confidence} onChange={(event) => setForm({ ...form, confidence: event.target.value })} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[var(--sonic-muted)] md:col-span-2">Lý do kỹ thuật đã kiểm chứng<textarea required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className="sonic-input mt-2 min-h-32" /></label>
      </>}
    </div><div className="mt-5 flex flex-wrap gap-2"><button disabled={saving} className="sonic-button sonic-button-gold"><Save size={15} /> {saving ? 'Đang lưu...' : 'Lưu bản ghi'}</button>{form.id && items.find((item) => item.id === form.id) && workflowButtons(items.find((item) => item.id === form.id)!)}</div>
      {resource === 'knowledge' && revisions.length > 0 && <div className="mt-8 border-t border-[var(--sonic-line)] pt-5"><p className="sonic-label"><History size={14} className="mr-2 inline" /> Revision audit</p><div className="mt-3 flex flex-wrap gap-2">{revisions.map((revision) => <button type="button" key={revision.id} onClick={() => void restore(revision)} className="sonic-button sonic-button-ghost"><RotateCcw size={13} /> v{revision.version} · {revision.action}</button>)}</div></div>}
    </form>}

    <section className="sonic-panel mt-6 overflow-hidden">{loading ? <p className="p-8 text-sm text-[var(--sonic-muted)]">Đang tải...</p> : items.length === 0 ? <p className="p-8 text-sm text-[var(--sonic-muted)]">{copy.empty}</p> : items.map((item) => <div key={item.id} className="grid gap-4 border-b border-[var(--sonic-line)] p-5 last:border-0 lg:grid-cols-[1fr_140px_auto] lg:items-center"><div><div className="flex flex-wrap items-center gap-3"><h3 className="font-bold text-[var(--sonic-text)]">{itemTitle(item)}</h3><span className="border border-[var(--sonic-line)] px-2 py-1 text-[0.6rem] uppercase tracking-[0.12em] text-[var(--sonic-gold)]">{statusOf(item)}</span></div><p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-[var(--sonic-muted)]">{itemDescription(item)}</p><p className="mt-2 text-[0.62rem] text-[var(--sonic-subtle)]">v{item.version} · {new Date(item.updatedAt).toLocaleDateString('vi-VN')}</p></div><span className="text-xs text-[var(--sonic-muted)]">{resource === 'knowledge' && 'type' in item ? item.type : `${'sourceIds' in item ? item.sourceIds.length : 0} nguồn`}</span><div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={() => void edit(item)} className="sonic-button sonic-button-ghost"><Pencil size={14} /> Sửa</button>{workflowButtons(item)}</div></div>)}</section>
  </div>
}
