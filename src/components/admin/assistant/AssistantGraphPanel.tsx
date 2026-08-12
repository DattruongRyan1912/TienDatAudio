'use client'

import { useEffect, useState } from 'react'
import { Network, RefreshCw, RotateCw, ShieldCheck } from 'lucide-react'

type GraphHealth = { enabled: boolean; available: boolean; database: string; latencyMs: number; errorCode: string }
type GraphVerification = {
  available: boolean
  healthy: boolean
  generatedAt: string
  mongoCounts: Record<string, number>
  graphCounts: Record<string, number>
  drift: Record<string, number>
  relationCounts: Record<string, number>
  graphRelationCounts: Record<string, number>
  relationDrift: Record<string, number>
  missingNodes: number
  unexpectedNodes: number
  hashMismatches: number
  errorCode: string
}

export default function AssistantGraphPanel() {
  const [health, setHealth] = useState<GraphHealth | null>(null)
  const [verification, setVerification] = useState<GraphVerification | null>(null)
  const [working, setWorking] = useState('')
  const [message, setMessage] = useState('')

  async function load() {
    const response = await fetch('/api/admin/assistant/graph')
    const result = await response.json() as { data?: GraphHealth }
    if (response.ok) setHealth(result.data || null)
  }
  useEffect(() => { void load() }, [])

  async function action(value: 'verify' | 'sync' | 'rebuild') {
    if (value === 'rebuild' && !window.confirm('Rebuild sẽ thay toàn bộ projection do ứng dụng sở hữu trong Neo4j. MongoDB vẫn là source of truth. Tiếp tục?')) return
    setWorking(value)
    setMessage('')
    const response = await fetch('/api/admin/assistant/graph', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: value, ...(value === 'rebuild' ? { confirmation: 'REBUILD_PROJECTION' } : {}) }) })
    const result = await response.json() as { data?: GraphVerification | { verification?: GraphVerification; processed?: number }; code?: string }
    if (response.ok && result.data) {
      const data = result.data
      if ('verification' in data && data.verification) setVerification(data.verification)
      else if ('mongoCounts' in data) setVerification(data)
      setMessage(value === 'sync' && 'processed' in data ? `Đã xử lý ${data.processed || 0} outbox item.` : `Đã hoàn tất ${value}.`)
      await load()
    } else setMessage(result.code || 'Không thể thực hiện thao tác graph.')
    setWorking('')
  }

  return <div><div><p className="sonic-label">Optional projection / fail-soft</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.05em]">Knowledge Graph.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--sonic-muted)]">MongoDB luôn là source of truth. Graph chỉ được truy vấn bằng template cố định; khi Neo4j lỗi, trợ lý tự hạ cấp về MongoDB và deterministic retrieval.</p></div>
    <section className="sonic-panel mt-7 p-6"><div className="grid gap-5 md:grid-cols-4"><div><p className="sonic-label">Trạng thái</p><p className={`mt-3 text-xl font-bold ${health?.available ? 'text-emerald-400' : 'text-[var(--sonic-muted)]'}`}>{health?.available ? 'Sẵn sàng' : health?.enabled ? 'Không khả dụng' : 'Chưa cấu hình'}</p></div><div><p className="sonic-label">Database</p><p className="mt-3 text-xl font-bold">{health?.database || 'neo4j'}</p></div><div><p className="sonic-label">Latency</p><p className="mt-3 text-xl font-bold">{health?.latencyMs || 0} ms</p></div><div><p className="sonic-label">Mã trạng thái</p><p className="mt-3 text-sm text-[var(--sonic-muted)]">{health?.errorCode || 'OK'}</p></div></div><div className="mt-6 flex flex-wrap gap-2"><button disabled={Boolean(working)} onClick={() => void action('verify')} className="sonic-button sonic-button-ghost"><ShieldCheck size={15} /> Verify drift</button><button disabled={Boolean(working)} onClick={() => void action('sync')} className="sonic-button sonic-button-ghost"><RotateCw size={15} /> Sync outbox</button><button disabled={Boolean(working)} onClick={() => void action('rebuild')} className="sonic-button sonic-button-gold"><Network size={15} /> Rebuild projection</button><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Health</button></div></section>
    {message && <p className="mt-5 border border-[var(--sonic-gold)]/40 bg-[var(--sonic-gold)]/5 px-4 py-3 text-sm text-[var(--sonic-gold)]">{message}</p>}
    {verification && <section className="sonic-panel mt-6 overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--sonic-line)] p-5"><div><p className="sonic-label">Projection verification</p><h3 className={`mt-2 text-xl font-bold ${verification.healthy ? 'text-emerald-400' : 'text-red-300'}`}>{verification.healthy ? 'Không phát hiện drift' : verification.available ? 'Có drift cần xử lý' : 'Neo4j chưa khả dụng'}</h3></div><span className="text-xs text-[var(--sonic-subtle)]">{new Date(verification.generatedAt).toLocaleString('vi-VN')}</span></div>
      <div className="grid gap-px border-b border-[var(--sonic-line)] bg-[var(--sonic-line)] sm:grid-cols-3">{[['Missing nodes', verification.missingNodes], ['Unexpected nodes', verification.unexpectedNodes], ['Hash mismatch', verification.hashMismatches]].map(([label, value]) => <div key={String(label)} className="bg-[var(--sonic-surface)] p-5"><p className="text-2xl font-bold">{String(value)}</p><p className="mt-2 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--sonic-muted)]">{String(label)}</p></div>)}</div>
      <div className="border-b border-[var(--sonic-line)]"><p className="sonic-label px-5 pt-5">Nodes</p>{Object.keys(verification.mongoCounts).map((label) => <div key={label} className="grid grid-cols-4 border-b border-[var(--sonic-line)] px-5 py-3 text-sm last:border-0"><span>{label}</span><span>Mongo {verification.mongoCounts[label] || 0}</span><span>Graph {verification.graphCounts[label] || 0}</span><span className={(verification.drift[label] || 0) === 0 ? 'text-emerald-400' : 'text-red-300'}>Drift {verification.drift[label] || 0}</span></div>)}</div>
      <div><p className="sonic-label px-5 pt-5">Relationships</p>{Object.keys(verification.relationCounts || {}).map((type) => <div key={type} className="grid grid-cols-4 border-b border-[var(--sonic-line)] px-5 py-3 text-sm last:border-0"><span>{type}</span><span>Mongo {verification.relationCounts[type] || 0}</span><span>Graph {verification.graphRelationCounts?.[type] || 0}</span><span className={(verification.relationDrift?.[type] || 0) === 0 ? 'text-emerald-400' : 'text-red-300'}>Drift {verification.relationDrift?.[type] || 0}</span></div>)}</div>
    </section>}
  </div>
}
