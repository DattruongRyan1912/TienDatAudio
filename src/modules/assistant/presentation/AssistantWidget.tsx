'use client'

import Link from 'next/link'
import { Bot, ExternalLink, LoaderCircle, Send, Sparkles, X } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'
import type { AssistantMessage, AssistantSource } from '../domain/types'

type DisplayMessage = AssistantMessage & { sources?: AssistantSource[]; failed?: boolean }

const greeting: DisplayMessage = {
  role: 'assistant',
  content: 'Chào bạn, tôi có thể tìm sản phẩm, giải thích kiến thức âm thanh hoặc gợi ý cấu hình theo nhu cầu và ngân sách.',
}

export default function AssistantWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<DisplayMessage[]>([greeting])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
    function close(event: KeyboardEvent) { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [open])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const question = input.trim().slice(0, 600)
    if (!question || loading) return
    const nextMessages: DisplayMessage[] = [...messages, { role: 'user', content: question }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages.slice(-6).map(({ role, content }) => ({ role, content })) }),
      })
      const payload = await response.json() as { success?: boolean; data?: { answer: string; sources: AssistantSource[] }; message?: string }
      if (!response.ok || !payload.data) throw new Error(payload.message || 'Không thể kết nối trợ lý.')
      setMessages((current) => [...current, { role: 'assistant', content: payload.data!.answer, sources: payload.data!.sources }])
    } catch (error) {
      setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'Chưa thể trả lời lúc này.', failed: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-5 left-4 z-40 md:bottom-8 md:left-7">
      {open && (
        <section role="dialog" aria-label="Trợ lý tư vấn Tiến Đạt Audio" className="mb-3 flex h-[min(620px,calc(100vh-110px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden border border-[var(--sonic-line)] bg-[var(--sonic-surface)] shadow-2xl">
          <header className="flex items-center justify-between border-b border-[var(--sonic-line)] px-4 py-3">
            <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center bg-[var(--sonic-gold)] text-[var(--sonic-button-text)]"><Sparkles size={17} /></span><div><p className="text-sm font-bold text-[var(--sonic-text)]">Trợ lý âm thanh</p><p className="text-[0.62rem] uppercase tracking-[0.12em] text-[var(--sonic-muted)]">Dữ liệu Tiến Đạt Audio</p></div></div>
            <button type="button" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center text-[var(--sonic-muted)] transition-colors hover:text-[var(--sonic-text)]" aria-label="Đóng trợ lý"><X size={18} /></button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-10' : 'mr-5'}>
                <div className={message.role === 'user' ? 'bg-[var(--sonic-gold)] px-4 py-3 text-sm leading-6 text-[var(--sonic-button-text)]' : `border px-4 py-3 text-sm leading-6 ${message.failed ? 'border-red-400/30 text-red-400' : 'border-[var(--sonic-line)] text-[var(--sonic-text)]'}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.sources?.length ? <div className="mt-2 grid gap-1.5">{message.sources.map((source) => <Link key={`${source.type}-${source.id}`} href={source.url} className="flex items-start justify-between gap-3 border border-[var(--sonic-line)] px-3 py-2 text-xs text-[var(--sonic-muted)] transition-colors hover:border-[var(--sonic-gold)] hover:text-[var(--sonic-text)]"><span className="line-clamp-2"><strong className="text-[var(--sonic-gold)]">{source.type === 'product' ? 'Sản phẩm' : 'Kiến thức'}</strong> · {source.title}</span><ExternalLink size={13} className="mt-0.5 shrink-0" /></Link>)}</div> : null}
              </div>
            ))}
            {loading && <div className="mr-12 flex items-center gap-2 border border-[var(--sonic-line)] px-4 py-3 text-sm text-[var(--sonic-muted)]"><LoaderCircle size={15} className="animate-spin" /> Đang tìm trong kho nội dung...</div>}
            <div ref={endRef} />
          </div>

          <form onSubmit={submit} className="border-t border-[var(--sonic-line)] p-3">
            <div className="flex gap-2"><input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={600} disabled={loading} className="sonic-input min-w-0 flex-1" placeholder="Ví dụ: phòng 20m² nên chọn loa gì?" aria-label="Câu hỏi dành cho trợ lý" /><button type="submit" disabled={loading || !input.trim()} className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--sonic-gold)] text-[var(--sonic-button-text)] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Gửi câu hỏi"><Send size={17} /></button></div>
            <p className="mt-2 text-[0.62rem] leading-4 text-[var(--sonic-muted)]">AI có thể nhầm. Hãy xác nhận giá và tồn kho với nhân viên.</p>
          </form>
        </section>
      )}
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? 'Đóng trợ lý tư vấn' : 'Mở trợ lý tư vấn'} className="flex h-12 items-center gap-2 border border-[var(--sonic-gold)] bg-[var(--sonic-surface)] px-4 text-xs font-bold uppercase tracking-[0.1em] text-[var(--sonic-text)] shadow-[0_0_20px_var(--sonic-gold-soft)] transition-transform hover:-translate-y-1">
        <Bot size={17} className="text-[var(--sonic-gold)]" /> <span className="hidden sm:inline">Hỏi trợ lý</span>
      </button>
    </div>
  )
}
