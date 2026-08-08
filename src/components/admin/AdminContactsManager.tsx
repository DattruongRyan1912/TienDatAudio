'use client'

import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'

type Lead = { id: string; name: string; phone: string; email?: string; interest?: string; budget?: string; message?: string; status?: string; createdAt: string }
const statuses = ['new', 'contacted', 'qualified', 'closed', 'archived']

export default function AdminContactsManager() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  async function load() { setLoading(true); const response = await fetch('/api/admin/contacts'); if (response.ok) { const data = await response.json() as { data: Lead[] }; setLeads(data.data) } else setMessage('MongoDB chưa sẵn sàng hoặc phiên đăng nhập đã hết hạn.'); setLoading(false) }
  useEffect(() => { void load() }, [])
  async function updateStatus(id: string, status: string) { const response = await fetch('/api/admin/contacts', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); if (response.ok) await load(); else setMessage('Không thể cập nhật trạng thái') }
  return <div className="mx-auto max-w-[1400px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="sonic-label">CRM / Inbound leads</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.06em]">Yêu cầu tư vấn.</h1><p className="mt-3 text-sm text-[#858989]">Lead gửi từ form website được lưu vào MongoDB.</p></div><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Làm mới</button></div>{message && <p className="mt-6 border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-200">{message}</p>}<section className="sonic-panel mt-8 overflow-hidden">{loading ? <p className="p-6 text-sm text-[#858989]">Đang tải yêu cầu...</p> : leads.length === 0 ? <p className="p-6 text-sm text-[#858989]">Chưa có yêu cầu tư vấn.</p> : leads.map((lead) => <div key={lead.id} className="grid gap-5 border-b border-white/10 px-5 py-5 last:border-0 md:grid-cols-[1fr_1.1fr_160px]"><div><p className="font-bold text-[#e5e2e1]">{lead.name}</p><a href={`tel:${lead.phone}`} className="mt-1 inline-block text-sm text-[#d4af37]">{lead.phone}</a>{lead.email && <p className="mt-1 text-xs text-[#858989]">{lead.email}</p>}</div><div><p className="text-sm text-[#c4c7c7]">{lead.interest || 'Chưa chọn nhu cầu'}{lead.budget ? ` · ${lead.budget}` : ''}</p>{lead.message && <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#858989]">{lead.message}</p>}<p className="mt-3 text-[0.62rem] uppercase tracking-[0.13em] text-[#606363]">{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(lead.createdAt))}</p></div><select value={lead.status || 'new'} onChange={(event) => void updateStatus(lead.id, event.target.value)} className="sonic-input h-10 self-start text-xs"><option disabled value="">Trạng thái</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></div>)}</section></div>
}

