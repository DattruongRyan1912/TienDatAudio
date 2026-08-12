'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, Trash2, X } from 'lucide-react'

type Conversation = { id: string; constraints?: Record<string, unknown>; createdAt: string; updatedAt: string; expiresAt: string; messageCount: number; lastMessage?: string }
type ConversationDetail = { session: Conversation; messages: Array<{ id: string; requestId: string; role: 'user' | 'assistant'; content: string; intent: string; answerKind: string; confidence: number; needsHuman: boolean; latencyMs: number; createdAt: string }>; feedback: Array<{ id: string; requestId: string; helpful: boolean; reason: string; createdAt: string }> }

export default function AssistantConversationsPanel() {
  const [items, setItems] = useState<Conversation[]>([])
  const [detail, setDetail] = useState<ConversationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const response = await fetch('/api/admin/assistant/conversations?limit=100')
    const result = await response.json() as { data?: { items: Conversation[] }; code?: string }
    if (response.ok) setItems(result.data?.items || [])
    else setMessage(result.code || 'Không thể tải hội thoại.')
    setLoading(false)
  }, [])
  useEffect(() => { void load() }, [load])

  async function open(id: string) {
    const response = await fetch(`/api/admin/assistant/conversations?id=${encodeURIComponent(id)}`)
    const result = await response.json() as { data?: ConversationDetail; code?: string }
    if (response.ok && result.data) setDetail(result.data)
    else setMessage(result.code || 'Không thể tải chi tiết.')
  }

  async function remove(id: string) {
    if (!window.confirm('Xóa hội thoại ẩn danh và feedback liên quan? Hành động này không thể hoàn tác.')) return
    const response = await fetch(`/api/admin/assistant/conversations?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (response.ok) { setDetail(null); await load() }
    else setMessage('Không thể xóa hội thoại.')
  }

  return <div><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="sonic-label">Privacy-aware operations</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.05em]">Hội thoại ẩn danh.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--sonic-muted)]">Số điện thoại và email được che trước khi lưu; phiên tự hết hạn theo TTL. Admin có thể xóa toàn bộ một phiên.</p></div><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Làm mới</button></div>
    {message && <p className="mt-5 border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-300">{message}</p>}
    <section className="sonic-panel mt-7 overflow-hidden">{loading ? <p className="p-8 text-sm text-[var(--sonic-muted)]">Đang tải...</p> : items.length === 0 ? <p className="p-8 text-sm text-[var(--sonic-muted)]">Chưa có hội thoại được lưu.</p> : items.map((item) => <button type="button" key={item.id} onClick={() => void open(item.id)} className="grid w-full gap-3 border-b border-[var(--sonic-line)] p-5 text-left last:border-0 hover:bg-[var(--sonic-surface-raised)] md:grid-cols-[180px_1fr_120px_160px]"><span className="font-mono text-xs text-[var(--sonic-gold)]">{item.id.slice(0, 12)}</span><span className="truncate text-sm text-[var(--sonic-text)]">{item.lastMessage || 'Chưa có tin nhắn'}</span><span className="text-xs text-[var(--sonic-muted)]">{item.messageCount} tin</span><span className="text-xs text-[var(--sonic-subtle)]">{new Date(item.updatedAt).toLocaleString('vi-VN')}</span></button>)}</section>
    {detail && <div className="fixed inset-0 z-[80] flex justify-end bg-black/60"><button type="button" className="absolute inset-0" aria-label="Đóng" onClick={() => setDetail(null)} /><aside className="relative h-full w-full max-w-2xl overflow-y-auto bg-[var(--sonic-surface)] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="sonic-label">Conversation detail</p><h3 className="mt-3 font-mono text-lg">{detail.session.id}</h3></div><button type="button" onClick={() => setDetail(null)}><X /></button></div><pre className="mt-5 overflow-x-auto border border-[var(--sonic-line)] p-3 text-xs text-[var(--sonic-muted)]">{JSON.stringify(detail.session.constraints || {}, null, 2)}</pre><div className="mt-6 grid gap-3">{detail.messages.map((item) => <div key={item.id} className={`border p-4 ${item.role === 'user' ? 'border-[var(--sonic-line)]' : 'border-[var(--sonic-gold)]/30 bg-[var(--sonic-gold)]/5'}`}><div className="flex justify-between gap-3 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--sonic-subtle)]"><span>{item.role} · {item.intent} · {item.answerKind}</span><span>{item.latencyMs} ms</span></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--sonic-text)]">{item.content}</p>{detail.feedback.filter((feedback) => feedback.requestId === item.requestId).map((feedback) => <p key={feedback.id} className={`mt-3 text-xs ${feedback.helpful ? 'text-emerald-400' : 'text-red-300'}`}>Feedback: {feedback.helpful ? 'Hữu ích' : 'Chưa hữu ích'} {feedback.reason && `· ${feedback.reason}`}</p>)}</div>)}</div><button type="button" onClick={() => void remove(detail.session.id)} className="sonic-button sonic-button-ghost mt-6 text-red-300"><Trash2 size={15} /> Xóa phiên và dữ liệu liên quan</button></aside></div>}
  </div>
}
