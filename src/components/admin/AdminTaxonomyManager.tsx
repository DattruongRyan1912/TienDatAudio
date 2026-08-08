'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, RefreshCw, Trash2 } from 'lucide-react'

type RecordItem = { id: string; name: string; slug: string; description?: string; image?: string; logo?: string; country?: string }

export default function AdminTaxonomyManager({ kind }: { kind: 'categories' | 'brands' }) {
  const [items, setItems] = useState<RecordItem[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const label = kind === 'categories' ? 'Danh mục' : 'Thương hiệu'

  const load = useCallback(async () => { setLoading(true); const response = await fetch(`/api/admin/${kind}`); if (response.ok) setItems(await response.json()); setLoading(false) }, [kind])
  useEffect(() => { void load() }, [load])
  async function add(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setMessage(''); const response = await fetch(`/api/admin/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, description }) }); const data = await response.json() as { error?: string }; if (!response.ok) setMessage(data.error || 'Không thể lưu'); else { setName(''); setDescription(''); setMessage('Đã lưu'); await load() } }
  async function remove(id: string) { if (!window.confirm(`Xóa ${label.toLowerCase()} này?`)) return; const response = await fetch(`/api/admin/${kind}?id=${encodeURIComponent(id)}`, { method: 'DELETE' }); if (response.ok) await load(); else setMessage('Không thể xóa') }

  return <div className="mx-auto max-w-[1200px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="sonic-label">Catalog / {kind}</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.06em]">{label}.</h1></div><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Làm mới</button></div><form onSubmit={add} className="sonic-panel mt-8 grid gap-3 p-5 md:grid-cols-[1fr_1.5fr_auto]"><input required value={name} onChange={(event) => setName(event.target.value)} className="sonic-input" placeholder={`Tên ${label.toLowerCase()}`} /><input value={description} onChange={(event) => setDescription(event.target.value)} className="sonic-input" placeholder="Mô tả ngắn" /><button type="submit" className="sonic-button sonic-button-gold"><Plus size={15} /> Thêm</button></form>{message && <p className="mt-4 text-sm text-[#d4af37]">{message}</p>}<section className="sonic-panel mt-8 overflow-hidden">{loading ? <p className="p-6 text-sm text-[#858989]">Đang tải...</p> : items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-5 last:border-0"><div><p className="font-bold text-[#e5e2e1]">{item.name}</p><p className="mt-1 text-xs text-[#707474]">/{item.slug} {item.description ? `· ${item.description}` : ''}</p></div><button type="button" onClick={() => void remove(item.id)} className="text-[#707474] hover:text-red-300" aria-label={`Xóa ${item.name}`}><Trash2 size={16} /></button></div>)}</section></div>
}
