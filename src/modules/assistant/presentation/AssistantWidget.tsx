'use client'

import Link from 'next/link'
import { Bot, ExternalLink, LoaderCircle, RotateCcw, Send, Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import type { AssistantAction, AssistantMessage, AssistantRecommendation, AssistantResponse, AssistantSource } from '../domain/types'

type DisplayMessage = AssistantMessage & {
  requestId?: string
  sources?: AssistantSource[]
  actions?: AssistantAction[]
  recommendations?: AssistantRecommendation[]
  followUpQuestions?: string[]
  feedback?: 'helpful' | 'unhelpful'
  feedbackError?: string
  failed?: boolean
}

const greeting: DisplayMessage = {
  role: 'assistant',
  content: 'Chào bạn, tôi có thể tìm sản phẩm, giải thích kiến thức âm thanh hoặc tư vấn cấu hình theo diện tích, nhu cầu và ngân sách.',
  followUpQuestions: ['Số điện thoại liên hệ là gì?', 'Tư vấn cấu hình cho phòng 20m²', 'Tìm bài viết về chống hú karaoke'],
}

function sourceLabel(source: AssistantSource) {
  const labels: Record<AssistantSource['type'], string> = {
    business: 'Cửa hàng', product: 'Sản phẩm', knowledge: 'Kho tri thức', article: 'Bài viết', claim: 'Claim', compatibility: 'Phối ghép',
  }
  return labels[source.type]
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<DisplayMessage[]>([greeting])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [negativeFeedback, setNegativeFeedback] = useState<{ index: number; reason: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
    function close(event: KeyboardEvent) { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading, negativeFeedback])

  async function ask(rawQuestion: string) {
    const question = rawQuestion.trim().slice(0, 600)
    if (!question || loading) return
    setMessages((current) => [...current, { role: 'user', content: question }])
    setInput('')
    setLoading(true)
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question }),
      })
      const payload = await response.json() as { success?: boolean; data?: AssistantResponse; message?: string }
      if (!response.ok || !payload.data) throw new Error(payload.message || 'Không thể kết nối trợ lý.')
      setMessages((current) => [...current, {
        role: 'assistant', content: payload.data!.answer, requestId: payload.data!.requestId,
        sources: payload.data!.sources, actions: payload.data!.actions, recommendations: payload.data!.recommendations,
        followUpQuestions: payload.data!.followUpQuestions,
      }])
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'Chưa thể trả lời lúc này.', failed: true }])
    } finally {
      setLoading(false)
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await ask(input)
  }

  async function sendFeedback(index: number, helpful: boolean, reason = '') {
    const message = messages[index]
    if (!message?.requestId || message.feedback) return
    const response = await fetch('/api/assistant/feedback', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: message.requestId, helpful, reason }),
    })
    const result = await response.json() as { message?: string }
    setMessages((current) => current.map((item, itemIndex) => itemIndex === index
      ? response.ok ? { ...item, feedback: helpful ? 'helpful' : 'unhelpful', feedbackError: undefined } : { ...item, feedbackError: result.message || 'Chưa thể lưu feedback.' }
      : item))
    if (response.ok) setNegativeFeedback(null)
  }

  async function resetConversation() {
    if (!window.confirm('Xóa hội thoại trợ lý đang lưu trên máy chủ và bắt đầu lại?')) return
    await fetch('/api/assistant/session', { method: 'DELETE' })
    setMessages([greeting])
    setNegativeFeedback(null)
  }

  return <div className="fixed bottom-5 left-4 z-40 md:bottom-8 md:left-7">
    {open && <section role="dialog" aria-label="Trợ lý tư vấn Tiến Đạt Audio" className="mb-3 flex h-[min(680px,calc(100vh-110px))] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden border border-[var(--sonic-line)] bg-[var(--sonic-surface)] shadow-2xl">
      <header className="flex items-center justify-between border-b border-[var(--sonic-line)] px-4 py-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center bg-[var(--sonic-gold)] text-[var(--sonic-button-text)]"><Sparkles size={17} /></span><div><p className="text-sm font-bold text-[var(--sonic-text)]">Trợ lý âm thanh</p><p className="text-[0.62rem] uppercase tracking-[0.12em] text-[var(--sonic-muted)]">Kho tri thức đã kiểm chứng</p></div></div><div className="flex items-center"><button type="button" onClick={() => void resetConversation()} className="flex h-9 w-9 items-center justify-center text-[var(--sonic-muted)] transition-colors hover:text-[var(--sonic-gold)]" aria-label="Xóa và bắt đầu lại hội thoại" title="Xóa và bắt đầu lại"><RotateCcw size={16} /></button><button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center text-[var(--sonic-muted)] transition-colors hover:text-[var(--sonic-text)]" aria-label="Đóng trợ lý"><X size={18} /></button></div></header>
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-10' : 'mr-4'}><div className={message.role === 'user' ? 'bg-[var(--sonic-gold)] px-4 py-3 text-sm leading-6 text-[var(--sonic-button-text)]' : `border px-4 py-3 text-sm leading-6 ${message.failed ? 'border-red-400/30 text-red-400' : 'border-[var(--sonic-line)] text-[var(--sonic-text)]'}`}><p className="whitespace-pre-wrap">{message.content}</p></div>
        {message.recommendations?.length ? <div className="mt-2 grid gap-2">{message.recommendations.map((item) => <Link key={item.productId} href={item.url} className="group border border-[var(--sonic-line)] p-3 transition-colors hover:border-[var(--sonic-gold)]"><div className="flex items-start justify-between gap-3"><p className="text-xs font-bold text-[var(--sonic-text)] group-hover:text-[var(--sonic-gold)]">{item.name}</p><span className="shrink-0 text-xs text-[var(--sonic-gold)]">{item.price ? new Intl.NumberFormat('vi-VN').format(item.price) + ' đ' : 'Liên hệ giá'}</span></div><p className="mt-2 line-clamp-2 text-[0.68rem] leading-5 text-[var(--sonic-muted)]">{item.reasons.join(' · ')}</p></Link>)}</div> : null}
        {message.sources?.length ? <div className="mt-2 grid gap-1.5">{message.sources.map((source) => source.url ? <Link key={`${source.type}-${source.id}`} href={source.url} className="flex items-start justify-between gap-3 border border-[var(--sonic-line)] px-3 py-2 text-xs text-[var(--sonic-muted)] transition-colors hover:border-[var(--sonic-gold)] hover:text-[var(--sonic-text)]"><span className="line-clamp-2"><strong className="text-[var(--sonic-gold)]">{sourceLabel(source)}</strong> · {source.title}</span><ExternalLink size={13} className="mt-0.5 shrink-0" /></Link> : <div key={`${source.type}-${source.id}`} className="border border-[var(--sonic-line)] px-3 py-2 text-xs text-[var(--sonic-muted)]"><strong className="text-[var(--sonic-gold)]">{sourceLabel(source)}</strong> · {source.title}</div>)}</div> : null}
        {message.actions?.length ? <div className="mt-2 flex flex-wrap gap-1.5">{message.actions.map((action) => action.href.startsWith('/') ? <Link key={`${action.type}-${action.href}`} href={action.href} className="border border-[var(--sonic-gold)] px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[var(--sonic-text)] transition-colors hover:bg-[var(--sonic-gold)] hover:text-[var(--sonic-button-text)]">{action.label}</Link> : <a key={`${action.type}-${action.href}`} href={action.href} target={action.href.startsWith('http') ? '_blank' : undefined} rel={action.href.startsWith('http') ? 'noreferrer' : undefined} className="border border-[var(--sonic-gold)] px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-[var(--sonic-text)] transition-colors hover:bg-[var(--sonic-gold)] hover:text-[var(--sonic-button-text)]">{action.label}</a>)}</div> : null}
        {message.followUpQuestions?.length ? <div className="mt-2 flex flex-wrap gap-1.5">{message.followUpQuestions.slice(0, 4).map((question) => <button type="button" key={question} disabled={loading} onClick={() => void ask(question)} className="border border-[var(--sonic-line)] px-3 py-2 text-left text-[0.68rem] leading-4 text-[var(--sonic-muted)] hover:border-[var(--sonic-gold)] hover:text-[var(--sonic-text)]">{question}</button>)}</div> : null}
        {message.requestId && !message.failed && <div className="mt-2"><div className="flex items-center gap-2 text-[0.65rem] text-[var(--sonic-muted)]"><span>Câu trả lời có hữu ích?</span><button type="button" disabled={Boolean(message.feedback)} onClick={() => void sendFeedback(index, true)} className={message.feedback === 'helpful' ? 'text-emerald-400' : 'hover:text-emerald-400'} aria-label="Câu trả lời hữu ích"><ThumbsUp size={14} /></button><button type="button" disabled={Boolean(message.feedback)} onClick={() => setNegativeFeedback({ index, reason: '' })} className={message.feedback === 'unhelpful' ? 'text-red-300' : 'hover:text-red-300'} aria-label="Câu trả lời chưa hữu ích"><ThumbsDown size={14} /></button>{message.feedback && <span className="text-[var(--sonic-subtle)]">Đã ghi nhận</span>}</div>{message.feedbackError && <p className="mt-1 text-[0.65rem] text-red-300">{message.feedbackError}</p>}</div>}
        {negativeFeedback?.index === index && <form onSubmit={(event) => { event.preventDefault(); void sendFeedback(index, false, negativeFeedback.reason) }} className="mt-2 flex gap-2"><input value={negativeFeedback.reason} onChange={(event) => setNegativeFeedback({ index, reason: event.target.value.slice(0, 500) })} className="sonic-input h-9 min-w-0 flex-1 text-xs" placeholder="Điều gì chưa đúng? (không bắt buộc)" /><button className="border border-[var(--sonic-gold)] px-3 text-[0.62rem] font-bold uppercase text-[var(--sonic-gold)]">Gửi</button></form>}
      </div>)}{loading && <div className="mr-12 flex items-center gap-2 border border-[var(--sonic-line)] px-4 py-3 text-sm text-[var(--sonic-muted)]"><LoaderCircle size={15} className="animate-spin" /> Đang kiểm tra nguồn...</div>}<div ref={endRef} /></div>
      <form onSubmit={submit} className="border-t border-[var(--sonic-line)] p-3"><div className="flex gap-2"><input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={600} disabled={loading} className="sonic-input min-w-0 flex-1" placeholder="Ví dụ: phòng 20m² nên chọn loa gì?" aria-label="Câu hỏi dành cho trợ lý" /><button type="submit" disabled={loading || !input.trim()} className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--sonic-gold)] text-[var(--sonic-button-text)] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Gửi câu hỏi"><Send size={17} /></button></div><p className="mt-2 text-[0.62rem] leading-4 text-[var(--sonic-muted)]">Tin nhắn được lưu ẩn danh có thời hạn để giữ ngữ cảnh; email/số điện thoại được che. AI có thể nhầm, hãy xác nhận giá và tồn kho với nhân viên.</p></form>
    </section>}
    <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Đóng trợ lý tư vấn' : 'Mở trợ lý tư vấn'} className="flex h-12 items-center gap-2 border border-[var(--sonic-gold)] bg-[var(--sonic-surface)] px-4 text-xs font-bold uppercase tracking-[0.1em] text-[var(--sonic-text)] shadow-[0_0_20px_var(--sonic-gold-soft)] transition-transform hover:-translate-y-1"><Bot size={17} className="text-[var(--sonic-gold)]" /> <span className="hidden sm:inline">Hỏi trợ lý</span></button>
  </div>
}
