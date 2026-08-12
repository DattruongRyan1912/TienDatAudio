'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Play, RefreshCw } from 'lucide-react'
import type { AssistantEvaluationResult } from '@/modules/knowledge/domain/types'

type EvaluationRun = { runId: string; createdAt: string; total: number; passed: number; failed: number; results: AssistantEvaluationResult[] }

export default function AssistantEvaluationPanel() {
  const [results, setResults] = useState<AssistantEvaluationResult[]>([])
  const [mode, setMode] = useState<'deterministic' | 'full'>('deterministic')
  const [group, setGroup] = useState('')
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/assistant/evaluations')
    const result = await response.json() as { data?: AssistantEvaluationResult[]; code?: string }
    if (response.ok) setResults(result.data || [])
    else setMessage(result.code || 'Không thể tải evaluation.')
  }, [])
  useEffect(() => { void load() }, [load])

  const runs = useMemo(() => {
    const map = new Map<string, EvaluationRun>()
    for (const result of results) {
      const run = map.get(result.runId) || { runId: result.runId, createdAt: result.createdAt, total: 0, passed: 0, failed: 0, results: [] }
      run.total += 1
      if (result.passed) run.passed += 1
      else run.failed += 1
      run.results.push(result)
      map.set(result.runId, run)
    }
    return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [results])

  async function run() {
    setRunning(true)
    setMessage('')
    const response = await fetch('/api/admin/assistant/evaluations', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, ...(group ? { group } : {}) }),
    })
    const result = await response.json() as { data?: { summary: { total: number; passed: number; failed: number; passRate: number } }; code?: string }
    if (response.ok && result.data) {
      setMessage(`Đã chạy ${result.data.summary.total} case · pass ${result.data.summary.passed} · fail ${result.data.summary.failed}.`)
      await load()
    } else setMessage(result.code || 'Không thể chạy evaluation.')
    setRunning(false)
  }

  return <div><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="sonic-label">Golden dataset / 120 cases</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.05em]">Đánh giá regression.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--sonic-muted)]">Deterministic chạy toàn bộ không tốn model; Full giới hạn tối đa 20 case mỗi lượt để kiểm tra đường sinh câu trả lời thật.</p></div><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Làm mới</button></div>
    <section className="sonic-panel mt-7 grid gap-4 p-5 md:grid-cols-[220px_260px_auto]"><select value={mode} onChange={(event) => setMode(event.target.value as 'deterministic' | 'full')} className="sonic-input"><option value="deterministic">Deterministic · 120 case</option><option value="full">Full model · tối đa 20 case</option></select><select value={group} onChange={(event) => setGroup(event.target.value)} className="sonic-input"><option value="">Mọi nhóm</option><option value="business">Business exact facts</option><option value="product">Product live data</option><option value="knowledge">Knowledge retrieval</option><option value="troubleshooting">Troubleshooting</option><option value="recommendation">Advisor</option><option value="multi_turn">Multi-turn</option><option value="injection">Prompt injection</option><option value="failure">Failure modes</option></select><button disabled={running} type="button" onClick={() => void run()} className="sonic-button sonic-button-gold justify-self-start"><Play size={15} /> {running ? 'Đang chạy...' : 'Chạy evaluation'}</button></section>
    {message && <p className="mt-5 border border-[var(--sonic-gold)]/40 bg-[var(--sonic-gold)]/5 px-4 py-3 text-sm text-[var(--sonic-gold)]">{message}</p>}
    <section className="sonic-panel mt-6 overflow-hidden">{runs.length === 0 ? <p className="p-8 text-sm text-[var(--sonic-muted)]">Chưa có evaluation run.</p> : runs.slice(0, 20).map((run) => <details key={run.runId} className="border-b border-[var(--sonic-line)] p-5 last:border-0"><summary className="cursor-pointer list-none"><div className="grid gap-3 md:grid-cols-[1fr_140px_140px_120px]"><div><p className="font-bold">Run {run.runId.slice(0, 8)}</p><p className="mt-1 text-xs text-[var(--sonic-subtle)]">{new Date(run.createdAt).toLocaleString('vi-VN')}</p></div><span className="text-sm text-emerald-400">{run.passed} passed</span><span className={run.failed ? 'text-sm text-red-300' : 'text-sm text-[var(--sonic-muted)]'}>{run.failed} failed</span><span className="text-sm text-[var(--sonic-gold)]">{Math.round(run.passed / run.total * 100)}%</span></div></summary><div className="mt-5 grid gap-2">{run.results.filter((item) => !item.passed).map((item) => <div key={item.caseId} className="grid gap-2 border border-red-400/20 p-3 text-xs md:grid-cols-[180px_1fr_100px]"><span>{item.caseId}</span><span className="text-red-300">{item.violations.join(', ')}</span><span>{item.latencyMs} ms</span></div>)}{run.failed === 0 && <p className="text-sm text-emerald-400">Toàn bộ case trong run này đã qua.</p>}</div></details>)}</section>
  </div>
}
