'use client'

import { useEffect, useState } from 'react'
import { Globe2, Link2, MapPin, Pencil, Plus, RefreshCw, Save, Sparkles, Trash2 } from 'lucide-react'
import type { SEOConfig, SEOFAQ, SEOKeyword, SEOKeywordIntent, SEOKeywordPriority } from '@/lib/seo-types'

type KeywordDraft = Omit<SEOKeyword, 'id' | 'updatedAt'>

const emptyKeywordDraft: KeywordDraft = {
  term: '',
  intent: 'informational',
  targetPage: '/kien-thuc',
  cluster: 'general',
  priority: 'medium',
  notes: '',
  isActive: true,
}

const emptyFAQDraft: Omit<SEOFAQ, 'id'> = { question: '', answer: '' }

function splitList(value: string) {
  return value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean)
}

export default function SEOVisibilityManager() {
  const [config, setConfig] = useState<SEOConfig | null>(null)
  const [keywordDraft, setKeywordDraft] = useState<KeywordDraft>(emptyKeywordDraft)
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null)
  const [faqDraft, setFAQDraft] = useState(emptyFAQDraft)
  const [editingFAQId, setEditingFAQId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/seo/strategy')
      const result = await response.json() as { success?: boolean; data?: SEOConfig; message?: string }
      if (!response.ok || !result.success || !result.data) throw new Error(result.message || 'Không thể tải chiến lược SEO')
      setConfig(result.data)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể tải chiến lược SEO')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  function updateEntity<K extends keyof SEOConfig['entity']>(field: K, value: SEOConfig['entity'][K]) {
    setConfig((current) => current ? { ...current, entity: { ...current.entity, [field]: value } } : current)
  }

  function updateAI<K extends keyof SEOConfig['ai']>(field: K, value: SEOConfig['ai'][K]) {
    setConfig((current) => current ? { ...current, ai: { ...current.ai, [field]: value } } : current)
  }

  function resetKeywordForm() {
    setKeywordDraft(emptyKeywordDraft)
    setEditingKeywordId(null)
  }

  function submitKeyword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!config || !keywordDraft.term.trim()) return
    const nextKeyword: SEOKeyword = {
      ...keywordDraft,
      id: editingKeywordId || `keyword-${Date.now()}`,
      term: keywordDraft.term.trim(),
      updatedAt: new Date().toISOString(),
    }
    setConfig({
      ...config,
      keywords: editingKeywordId
        ? config.keywords.map((keyword) => keyword.id === editingKeywordId ? nextKeyword : keyword)
        : [nextKeyword, ...config.keywords],
    })
    resetKeywordForm()
  }

  function editKeyword(keyword: SEOKeyword) {
    setKeywordDraft({
      term: keyword.term,
      intent: keyword.intent,
      targetPage: keyword.targetPage,
      cluster: keyword.cluster,
      priority: keyword.priority,
      notes: keyword.notes,
      isActive: keyword.isActive,
    })
    setEditingKeywordId(keyword.id)
  }

  function removeKeyword(id: string) {
    setConfig((current) => current ? { ...current, keywords: current.keywords.filter((keyword) => keyword.id !== id) } : current)
    if (editingKeywordId === id) resetKeywordForm()
  }

  function resetFAQForm() {
    setFAQDraft(emptyFAQDraft)
    setEditingFAQId(null)
  }

  function submitFAQ(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!config || !faqDraft.question.trim() || !faqDraft.answer.trim()) return
    const nextFAQ: SEOFAQ = {
      ...faqDraft,
      id: editingFAQId || `faq-${Date.now()}`,
      question: faqDraft.question.trim(),
      answer: faqDraft.answer.trim(),
    }
    setConfig({
      ...config,
      ai: {
        ...config.ai,
        faqs: editingFAQId
          ? config.ai.faqs.map((faq) => faq.id === editingFAQId ? nextFAQ : faq)
          : [...config.ai.faqs, nextFAQ],
      },
    })
    resetFAQForm()
  }

  function editFAQ(faq: SEOFAQ) {
    setFAQDraft({ question: faq.question, answer: faq.answer })
    setEditingFAQId(faq.id)
  }

  function removeFAQ(id: string) {
    setConfig((current) => current ? { ...current, ai: { ...current.ai, faqs: current.ai.faqs.filter((faq) => faq.id !== id) } } : current)
    if (editingFAQId === id) resetFAQForm()
  }

  async function save() {
    if (!config || saving) return
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/seo/strategy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      const result = await response.json() as { success?: boolean; data?: SEOConfig; message?: string }
      if (!response.ok || !result.success || !result.data) throw new Error(result.message || 'Không thể lưu chiến lược SEO')
      setConfig(result.data)
      setMessage('Đã lưu keyword và cấu hình GEO/AIO')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể lưu chiến lược SEO')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-[1280px] p-8 text-sm text-[#858989]">Đang tải chiến lược SEO...</div>
  }

  if (!config) {
    return <div className="sonic-panel mx-auto max-w-[1280px] p-8"><p className="text-sm text-red-200">{message || 'Không thể tải chiến lược SEO.'}</p><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost mt-5"><RefreshCw size={15} /> Thử lại</button></div>
  }

  const activeKeywords = config.keywords.filter((keyword) => keyword.isActive).length

  return <div className="mx-auto max-w-[1280px] pb-20">
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="sonic-label">SEO / GEO / AIO</p>
        <h1 className="mt-4 text-4xl font-bold tracking-[-0.06em]">Keyword & AI visibility.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#858989]">Quản lý cụm từ khóa, thực thể địa phương và nguồn dữ liệu có cấu trúc để công cụ tìm kiếm và AI hiểu đúng Tiến Đạt Audio.</p>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Làm mới</button>
        <button type="button" onClick={() => void save()} disabled={saving} className="sonic-button sonic-button-gold"><Save size={15} /> {saving ? 'Đang lưu...' : 'Lưu chiến lược'}</button>
      </div>
    </header>

    {message && <p className="mt-6 border border-[#d4af37]/40 bg-[#d4af37]/5 px-4 py-3 text-sm text-[#d4af37]">{message}</p>}

    <div className="mt-8 grid gap-4 md:grid-cols-3">
      <div className="sonic-panel p-5"><Sparkles size={18} className="text-[#d4af37]" /><p className="mt-5 text-2xl font-bold">{activeKeywords}</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#858989]">Keyword đang dùng</p></div>
      <div className="sonic-panel p-5"><Globe2 size={18} className="text-[#d4af37]" /><p className="mt-5 text-2xl font-bold">{config.entity.areaServed.length}</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#858989]">Khu vực phục vụ</p></div>
      <div className="sonic-panel p-5"><Link2 size={18} className="text-[#d4af37]" /><p className="mt-5 text-2xl font-bold">/llms.txt</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#858989]">AI-readable endpoint</p></div>
    </div>

    <section className="sonic-panel mt-8 p-6">
      <div className="flex items-start gap-4"><Sparkles className="mt-1 shrink-0 text-[#d4af37]" size={20} /><div><h2 className="text-xl font-bold">Keyword map theo intent</h2><p className="mt-2 text-sm leading-6 text-[#858989]">Mỗi keyword nên có một mục đích và một trang đích. Ưu tiên nội dung giải đáp câu hỏi thật thay vì nhồi nhiều từ khóa vào cùng một trang.</p></div></div>
      <form onSubmit={submitKeyword} className="mt-6 grid gap-3 md:grid-cols-6">
        <input required value={keywordDraft.term} onChange={(event) => setKeywordDraft({ ...keywordDraft, term: event.target.value })} className="sonic-input md:col-span-2" placeholder="Keyword / câu hỏi" />
        <select value={keywordDraft.intent} onChange={(event) => setKeywordDraft({ ...keywordDraft, intent: event.target.value as SEOKeywordIntent })} className="sonic-input"><option value="transactional">Transactional</option><option value="commercial">Commercial</option><option value="informational">Informational</option><option value="local">Local</option><option value="navigational">Navigational</option></select>
        <input value={keywordDraft.targetPage} onChange={(event) => setKeywordDraft({ ...keywordDraft, targetPage: event.target.value })} className="sonic-input" placeholder="/trang-dich" />
        <input value={keywordDraft.cluster} onChange={(event) => setKeywordDraft({ ...keywordDraft, cluster: event.target.value })} className="sonic-input" placeholder="Cluster" />
        <select value={keywordDraft.priority} onChange={(event) => setKeywordDraft({ ...keywordDraft, priority: event.target.value as SEOKeywordPriority })} className="sonic-input"><option value="high">Ưu tiên cao</option><option value="medium">Ưu tiên vừa</option><option value="low">Ưu tiên thấp</option></select>
        <textarea value={keywordDraft.notes} onChange={(event) => setKeywordDraft({ ...keywordDraft, notes: event.target.value })} className="sonic-input min-h-20 md:col-span-5" placeholder="Ghi chú triển khai / nội dung cần viết" />
        <div className="flex items-start gap-2"><button type="submit" className="sonic-button sonic-button-gold">{editingKeywordId ? <Pencil size={15} /> : <Plus size={15} />} {editingKeywordId ? 'Cập nhật' : 'Thêm'}</button></div>
      </form>
      <div className="mt-3 flex items-center justify-between gap-4"><label className="flex items-center gap-2 text-xs text-[#9ea2a2]"><input type="checkbox" checked={keywordDraft.isActive} onChange={(event) => setKeywordDraft({ ...keywordDraft, isActive: event.target.checked })} /> Dùng keyword này trong AI-readable output</label>{editingKeywordId && <button type="button" onClick={resetKeywordForm} className="text-xs text-[#d4af37]">Hủy sửa keyword</button>}</div>
      <div className="mt-8 overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-white/10 text-[0.62rem] uppercase tracking-[0.14em] text-[#707474]"><tr><th className="pb-3 pr-4">Keyword</th><th className="pb-3 pr-4">Intent</th><th className="pb-3 pr-4">Cluster / page</th><th className="pb-3 pr-4">Ưu tiên</th><th className="pb-3 text-right">Thao tác</th></tr></thead><tbody>{config.keywords.map((keyword) => <tr key={keyword.id} className="border-b border-white/10 last:border-0"><td className="py-4 pr-4"><p className={`font-semibold ${keyword.isActive ? 'text-[#e5e2e1]' : 'text-[#707474] line-through'}`}>{keyword.term}</p>{keyword.notes && <p className="mt-1 max-w-sm text-xs leading-5 text-[#707474]">{keyword.notes}</p>}</td><td className="py-4 pr-4 text-xs text-[#9ea2a2]">{keyword.intent}</td><td className="py-4 pr-4 text-xs text-[#9ea2a2]">{keyword.cluster}<br /><span className="text-[#707474]">{keyword.targetPage}</span></td><td className="py-4 pr-4 text-xs text-[#d4af37]">{keyword.priority}</td><td className="py-4 text-right"><button type="button" onClick={() => editKeyword(keyword)} className="mr-3 text-[#707474] hover:text-[#d4af37]" aria-label={`Sửa keyword ${keyword.term}`}><Pencil size={15} /></button><button type="button" onClick={() => removeKeyword(keyword.id)} className="text-[#707474] hover:text-red-300" aria-label={`Xóa keyword ${keyword.term}`}><Trash2 size={15} /></button></td></tr>)}</tbody></table></div>
    </section>

    <section className="sonic-panel mt-8 p-6">
      <div className="flex items-start gap-4"><MapPin className="mt-1 shrink-0 text-[#d4af37]" size={20} /><div><h2 className="text-xl font-bold">Entity & local signals</h2><p className="mt-2 text-sm leading-6 text-[#858989]">Đây là thông tin định danh chính được dùng cho JSON-LD, local discovery và nội dung AI-readable. Chỉ nhập dữ liệu có thể kiểm chứng.</p></div></div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-xs text-[#858989]">Tên thực thể<input value={config.entity.name} onChange={(event) => updateEntity('name', event.target.value)} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[#858989]">Tên thay thế<input value={config.entity.alternateName} onChange={(event) => updateEntity('alternateName', event.target.value)} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[#858989] md:col-span-2">Mô tả định vị<textarea value={config.entity.description} onChange={(event) => updateEntity('description', event.target.value)} className="sonic-input mt-2 min-h-24" /></label>
        <label className="text-xs text-[#858989]">Website canonical<input value={config.entity.url} onChange={(event) => updateEntity('url', event.target.value)} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[#858989]">Logo URL<input value={config.entity.logo} onChange={(event) => updateEntity('logo', event.target.value)} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[#858989]">Điện thoại<input value={config.entity.phone} onChange={(event) => updateEntity('phone', event.target.value)} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[#858989]">Email<input value={config.entity.email} onChange={(event) => updateEntity('email', event.target.value)} className="sonic-input mt-2" /></label>
        <label className="text-xs text-[#858989] md:col-span-2">Địa chỉ<textarea value={config.entity.address} onChange={(event) => updateEntity('address', event.target.value)} className="sonic-input mt-2 min-h-20" /></label>
        <label className="text-xs text-[#858989]">Khu vực phục vụ<input value={config.entity.areaServed.join(', ')} onChange={(event) => updateEntity('areaServed', splitList(event.target.value))} className="sonic-input mt-2" placeholder="Quảng Ngãi, Miền Trung" /></label>
        <label className="text-xs text-[#858989]">Social / profile URLs<textarea value={config.entity.sameAs.join('\n')} onChange={(event) => updateEntity('sameAs', splitList(event.target.value))} className="sonic-input mt-2 min-h-20" /></label>
      </div>
    </section>

    <section className="sonic-panel mt-8 p-6">
      <div className="flex items-start gap-4"><Globe2 className="mt-1 shrink-0 text-[#d4af37]" size={20} /><div><h2 className="text-xl font-bold">GEO / AIO answer layer</h2><p className="mt-2 text-sm leading-6 text-[#858989]">Lớp này tạo `knowsAbout`, dịch vụ, facts, FAQ và `/llms.txt` để các hệ thống AI có nguồn rõ ràng khi tổng hợp câu trả lời.</p></div></div>
      <label className="mt-6 flex items-center gap-3 text-sm font-semibold text-[#e5e2e1]"><input type="checkbox" checked={config.ai.enabled} onChange={(event) => updateAI('enabled', event.target.checked)} /> Bật AI discovery signals</label>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-xs text-[#858989] md:col-span-2">Định vị trả lời<textarea value={config.ai.positioning} onChange={(event) => updateAI('positioning', event.target.value)} className="sonic-input mt-2 min-h-24" /></label>
        <label className="text-xs text-[#858989]">Entity facts — mỗi dòng một fact<textarea value={config.ai.entityFacts.join('\n')} onChange={(event) => updateAI('entityFacts', splitList(event.target.value))} className="sonic-input mt-2 min-h-32" /></label>
        <label className="text-xs text-[#858989]">Dịch vụ — mỗi dòng một dịch vụ<textarea value={config.ai.services.join('\n')} onChange={(event) => updateAI('services', splitList(event.target.value))} className="sonic-input mt-2 min-h-32" /></label>
        <label className="text-xs text-[#858989] md:col-span-2">Answer guidelines — mỗi dòng một nguyên tắc<textarea value={config.ai.answerGuidelines.join('\n')} onChange={(event) => updateAI('answerGuidelines', splitList(event.target.value))} className="sonic-input mt-2 min-h-28" /></label>
      </div>

      <div className="mt-8 border-t border-white/10 pt-6"><div className="flex items-center justify-between gap-4"><div><h3 className="font-bold">FAQ / câu hỏi tự nhiên</h3><p className="mt-1 text-xs text-[#707474]">Dùng cho `/llms.txt`; hãy đưa FAQ ra một trang công khai trước khi thêm FAQ schema.</p></div>{editingFAQId && <button type="button" onClick={resetFAQForm} className="text-xs text-[#d4af37]">Hủy sửa FAQ</button>}</div><form onSubmit={submitFAQ} className="mt-4 grid gap-3 md:grid-cols-2"><input required value={faqDraft.question} onChange={(event) => setFAQDraft({ ...faqDraft, question: event.target.value })} className="sonic-input" placeholder="Câu hỏi của khách hàng" /><textarea required value={faqDraft.answer} onChange={(event) => setFAQDraft({ ...faqDraft, answer: event.target.value })} className="sonic-input min-h-20" placeholder="Câu trả lời có thể kiểm chứng" /><button type="submit" className="sonic-button sonic-button-ghost md:col-span-2">{editingFAQId ? <><Pencil size={15} /> Cập nhật FAQ</> : <><Plus size={15} /> Thêm FAQ</>}</button></form><div className="mt-5 grid gap-3">{config.ai.faqs.map((faq) => <div key={faq.id} className="border border-white/10 p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-[#e5e2e1]">{faq.question}</p><p className="mt-2 text-sm leading-6 text-[#858989]">{faq.answer}</p></div><div className="flex shrink-0 gap-3"><button type="button" onClick={() => editFAQ(faq)} className="text-[#707474] hover:text-[#d4af37]" aria-label={`Sửa FAQ ${faq.question}`}><Pencil size={15} /></button><button type="button" onClick={() => removeFAQ(faq.id)} className="text-[#707474] hover:text-red-300" aria-label={`Xóa FAQ ${faq.question}`}><Trash2 size={15} /></button></div></div></div>)}</div></div>
    </section>

    <section className="mt-8 grid gap-4 md:grid-cols-2">
      <a href="/llms.txt" target="_blank" rel="noreferrer" className="sonic-panel flex items-center justify-between p-5 transition hover:border-[#d4af37]/50"><span><span className="sonic-label">Public endpoint</span><strong className="mt-2 block">Xem /llms.txt</strong></span><Link2 size={18} className="text-[#d4af37]" /></a>
      <div className="sonic-panel p-5"><span className="sonic-label">Output tự động</span><p className="mt-2 text-sm leading-6 text-[#858989]">JSON-LD động được chèn ở layout toàn site, còn keyword map chỉ đưa các keyword active vào `knowsAbout` và AI-readable brief.</p></div>
    </section>
  </div>
}
