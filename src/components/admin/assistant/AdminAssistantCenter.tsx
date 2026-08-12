'use client'

import { useEffect, useState } from 'react'
import { Activity, BookOpen, Bot, BrainCircuit, Database, FlaskConical, GitBranch, MessageSquare, Network, RefreshCw, ShieldCheck } from 'lucide-react'
import type { KnowledgeResourceName } from '@/modules/knowledge/domain/types'
import AssistantConversationsPanel from './AssistantConversationsPanel'
import AssistantEvaluationPanel from './AssistantEvaluationPanel'
import AssistantGraphPanel from './AssistantGraphPanel'
import AssistantTestPanel from './AssistantTestPanel'
import KnowledgeResourcePanel from './KnowledgeResourcePanel'

type Tab = 'overview' | KnowledgeResourceName | 'test' | 'evaluations' | 'conversations' | 'graph'
type Overview = {
  rollout: string
  flags: { exactFacts: boolean; knowledge: boolean; advisor: boolean; conversations: boolean; graphMode: string }
  knowledge: { knowledge: number; sources: number; claims: number; compatibility: number; articleChunks: number; pendingGraphSync: number }
  conversations: { sessions: number; messages: number; feedback: number; helpful: number; unanswered: number }
  graph: { enabled: boolean; available: boolean; database: string; latencyMs: number; errorCode: string }
}

const tabs: Array<{ id: Tab; label: string; icon: typeof Bot }> = [
  { id: 'overview', label: 'Tổng quan', icon: Activity },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { id: 'sources', label: 'Nguồn', icon: Database },
  { id: 'claims', label: 'Claims / AI suggestions', icon: GitBranch },
  { id: 'compatibility', label: 'Phối ghép', icon: BrainCircuit },
  { id: 'test', label: 'Test console', icon: FlaskConical },
  { id: 'evaluations', label: 'Evaluations', icon: ShieldCheck },
  { id: 'conversations', label: 'Hội thoại', icon: MessageSquare },
  { id: 'graph', label: 'Graph', icon: Network },
]

function Flag({ label, enabled }: { label: string; enabled: boolean }) {
  return <span className={`border px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] ${enabled ? 'border-emerald-400/30 text-emerald-400' : 'border-[var(--sonic-line)] text-[var(--sonic-subtle)]'}`}>{label}: {enabled ? 'ON' : 'OFF'}</span>
}

function OverviewPanel({ data, reload }: { data: Overview | null; reload: () => void }) {
  if (!data) return <div className="sonic-panel p-8 text-sm text-[var(--sonic-muted)]">Đang tải tổng quan...</div>
  const cards = [
    ['Knowledge', data.knowledge.knowledge], ['Nguồn', data.knowledge.sources], ['Claims', data.knowledge.claims], ['Phối ghép', data.knowledge.compatibility],
    ['Article chunks', data.knowledge.articleChunks], ['Sessions', data.conversations.sessions], ['Câu trả lời', data.conversations.messages], ['Cần người hỗ trợ', data.conversations.unanswered],
  ]
  return <div><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="sonic-label">Assistant control plane</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.05em]">Trạng thái triển khai.</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--sonic-muted)]">Rollout hiện tại: <strong className="text-[var(--sonic-gold)]">{data.rollout}</strong>. Critical facts luôn đi đường deterministic, không qua model.</p></div><button type="button" onClick={reload} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Làm mới</button></div><div className="mt-6 flex flex-wrap gap-2"><Flag label="Exact facts" enabled={data.flags.exactFacts} /><Flag label="Knowledge" enabled={data.flags.knowledge} /><Flag label="Advisor" enabled={data.flags.advisor} /><Flag label="Conversations" enabled={data.flags.conversations} /><span className="border border-[var(--sonic-line)] px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--sonic-gold)]">Graph: {data.flags.graphMode}</span></div><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value]) => <div key={String(label)} className="sonic-panel p-5"><p className="text-3xl font-bold">{String(value)}</p><p className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-[var(--sonic-muted)]">{label}</p></div>)}</div><div className="mt-7 grid gap-5 lg:grid-cols-2"><section className="sonic-panel p-6"><p className="sonic-label">Evidence gates</p><h3 className="mt-3 text-xl font-bold">Không tự xuất bản tri thức AI.</h3><ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--sonic-muted)]"><li>• Knowledge chỉ public sau khi có nguồn verified và admin publish.</li><li>• Claim/phối ghép chỉ đi vào retrieval sau trạng thái verified.</li><li>• Giá, tồn kho và thông tin liên hệ luôn đọc live từ MongoDB.</li><li>• Grounding validator chặn số liệu và URL không có bằng chứng.</li></ul></section><section className="sonic-panel p-6"><p className="sonic-label">Graph projection</p><h3 className={`mt-3 text-xl font-bold ${data.graph.available ? 'text-emerald-400' : 'text-[var(--sonic-muted)]'}`}>{data.graph.available ? 'Neo4j đang sẵn sàng' : data.graph.enabled ? 'Neo4j đang lỗi — Mongo fallback hoạt động' : 'Neo4j chưa cấu hình — không ảnh hưởng chat'}</h3><p className="mt-4 text-sm leading-6 text-[var(--sonic-muted)]">Database {data.graph.database} · {data.graph.latencyMs} ms · pending outbox {data.knowledge.pendingGraphSync}.</p></section></div></div>
}

export default function AdminAssistantCenter() {
  const [tab, setTab] = useState<Tab>('overview')
  const [overview, setOverview] = useState<Overview | null>(null)
  const [message, setMessage] = useState('')

  async function loadOverview() {
    const response = await fetch('/api/admin/assistant/overview')
    const result = await response.json() as { data?: Overview; message?: string; code?: string }
    if (response.ok && result.data) setOverview(result.data)
    else setMessage(result.message || result.code || 'Không thể tải trạng thái assistant.')
  }
  useEffect(() => { void loadOverview() }, [])

  return <div className="mx-auto max-w-[1600px] pb-24"><header><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center border border-[var(--sonic-gold)] text-[var(--sonic-gold)]"><Bot size={22} /></span><div><p className="sonic-label">Knowledge Center / RAG / Advisor</p><h1 className="mt-2 text-4xl font-bold tracking-[-0.06em]">Audio Assistant.</h1></div></div><p className="mt-4 max-w-4xl text-sm leading-6 text-[var(--sonic-muted)]">Quản lý kho tri thức có audit, nguồn bằng chứng, claim, phối ghép, hội thoại, regression và projection graph trong một control plane.</p></header>{message && <p className="mt-6 border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-300">{message}</p>}<nav className="mt-8 flex gap-2 overflow-x-auto border-y border-[var(--sonic-line)] py-3" aria-label="Knowledge Center">{tabs.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setTab(id)} className={`flex shrink-0 items-center gap-2 px-4 py-3 text-[0.67rem] font-bold uppercase tracking-[0.1em] transition-colors ${tab === id ? 'bg-[var(--sonic-gold)] text-[#080808]' : 'text-[var(--sonic-muted)] hover:bg-[var(--sonic-surface-raised)] hover:text-[var(--sonic-text)]'}`}><Icon size={15} /> {label}</button>)}</nav><main className="mt-8">{tab === 'overview' && <OverviewPanel data={overview} reload={() => void loadOverview()} />}{(['knowledge', 'sources', 'claims', 'compatibility'] as KnowledgeResourceName[]).includes(tab as KnowledgeResourceName) && <KnowledgeResourcePanel key={tab} resource={tab as KnowledgeResourceName} />}{tab === 'test' && <AssistantTestPanel />}{tab === 'evaluations' && <AssistantEvaluationPanel />}{tab === 'conversations' && <AssistantConversationsPanel />}{tab === 'graph' && <AssistantGraphPanel />}</main></div>
}
