'use client'

import { useState } from 'react'
import { FlaskConical, Send } from 'lucide-react'
import type { AssistantAnswer, AssistantConversationConstraints } from '@/modules/assistant/domain/types'

export default function AssistantTestPanel() {
  const [question, setQuestion] = useState('Số điện thoại liên hệ của Tiến Đạt Audio là gì?')
  const [roomSize, setRoomSize] = useState('')
  const [budget, setBudget] = useState('')
  const [useCase, setUseCase] = useState('')
  const [answer, setAnswer] = useState<AssistantAnswer | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function run(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    const constraints: AssistantConversationConstraints = {}
    if (Number(roomSize) > 0) constraints.roomSizeM2 = Number(roomSize)
    if (Number(budget) > 0) constraints.budgetMax = Number(budget)
    if (useCase) constraints.useCases = [useCase as NonNullable<AssistantConversationConstraints['useCases']>[number]]
    const response = await fetch('/api/admin/assistant/test', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: question, constraints }),
    })
    const result = await response.json() as { data?: AssistantAnswer; message?: string; code?: string }
    if (response.ok && result.data) setAnswer(result.data)
    else setMessage(result.message || result.code || 'Không thể chạy test.')
    setLoading(false)
  }

  return <div>
    <div><p className="sonic-label">Grounded test console</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.05em]">Kiểm tra câu trả lời.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--sonic-muted)]">Console này hiển thị cả trace nội bộ. Widget public không nhận trace và không được tự cung cấp lịch sử hội thoại.</p></div>
    <form onSubmit={run} className="sonic-panel mt-7 p-6"><label className="text-xs text-[var(--sonic-muted)]">Câu hỏi<textarea required value={question} onChange={(event) => setQuestion(event.target.value)} className="sonic-input mt-2 min-h-28" /></label><div className="mt-4 grid gap-4 md:grid-cols-3"><label className="text-xs text-[var(--sonic-muted)]">Diện tích m²<input type="number" min="0" value={roomSize} onChange={(event) => setRoomSize(event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Ngân sách tối đa<input type="number" min="0" value={budget} onChange={(event) => setBudget(event.target.value)} className="sonic-input mt-2" /></label><label className="text-xs text-[var(--sonic-muted)]">Nhu cầu<select value={useCase} onChange={(event) => setUseCase(event.target.value)} className="sonic-input mt-2"><option value="">Tự nhận diện</option><option value="music">Nghe nhạc</option><option value="karaoke">Karaoke</option><option value="cinema">Xem phim</option><option value="event">Sự kiện</option></select></label></div><button disabled={loading} className="sonic-button sonic-button-gold mt-5"><Send size={15} /> {loading ? 'Đang kiểm tra...' : 'Chạy truy vấn'}</button></form>
    {message && <p className="mt-5 border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-300">{message}</p>}
    {answer && <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_380px]"><section className="sonic-panel p-6"><div className="flex flex-wrap gap-2"><span className="border border-[var(--sonic-line)] px-2 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--sonic-gold)]">{answer.intent}</span><span className="border border-[var(--sonic-line)] px-2 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--sonic-muted)]">{answer.answerKind}</span><span className="border border-[var(--sonic-line)] px-2 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--sonic-muted)]">confidence {Math.round(answer.confidence * 100)}%</span></div><p className="mt-6 whitespace-pre-wrap text-base leading-8 text-[var(--sonic-text)]">{answer.answer}</p>{answer.recommendations?.length ? <div className="mt-7 grid gap-3 md:grid-cols-2">{answer.recommendations.map((item) => <div key={item.productId} className="border border-[var(--sonic-line)] p-4"><p className="font-bold">{item.name}</p><p className="mt-2 text-sm text-[var(--sonic-gold)]">{item.price ? new Intl.NumberFormat('vi-VN').format(item.price) + ' đ' : 'Liên hệ giá'}</p><ul className="mt-3 list-disc pl-4 text-xs leading-5 text-[var(--sonic-muted)]">{item.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>)}</div> : null}<div className="mt-7 border-t border-[var(--sonic-line)] pt-5"><p className="sonic-label">Nguồn sử dụng</p>{answer.sources.length ? <div className="mt-3 grid gap-3">{answer.sources.map((source, index) => <div key={`${source.type}:${source.id}`} className="text-sm"><span className="font-bold text-[var(--sonic-gold)]">[{index + 1}]</span> {source.title}<small className="ml-2 text-[var(--sonic-subtle)]">{source.type} · authority {source.authority}</small></div>)}</div> : <p className="mt-3 text-sm text-[var(--sonic-muted)]">Exact/fallback path không cần nguồn retrieval.</p>}</div></section><aside className="sonic-panel p-5"><p className="sonic-label"><FlaskConical size={14} className="mr-2 inline" /> Execution trace</p><div className="mt-4 grid gap-3">{answer.trace?.stages.map((stage) => <div key={`${stage.name}:${stage.latencyMs}`} className="flex items-center justify-between gap-4 border-b border-[var(--sonic-line)] pb-3 text-xs"><span>{stage.name}<small className="ml-2 text-[var(--sonic-subtle)]">{stage.outcome}</small></span><span className="text-[var(--sonic-gold)]">{stage.latencyMs} ms</span></div>) || <p className="text-sm text-[var(--sonic-muted)]">Không có trace.</p>}</div>{answer.trace && <><p className="sonic-label mt-6">Grounding validator</p><p className={`mt-3 text-sm ${answer.trace.validator.passed ? 'text-emerald-400' : 'text-red-300'}`}>{answer.trace.validator.passed ? 'Passed' : answer.trace.validator.violations.join(', ')}</p><p className="sonic-label mt-6">Graph</p><p className="mt-3 text-sm text-[var(--sonic-muted)]">{answer.trace.graph.mode} · {answer.trace.graph.available ? 'available' : 'not used/unavailable'}</p></>}</aside></div>}
  </div>
}
