'use client'

import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react'

type RecordItem = {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  logo?: string
  logoDark?: string
  logoLight?: string
  country?: string
  website?: string
  featured?: boolean
  sortOrder?: number
}

export default function AdminTaxonomyManager({ kind }: { kind: 'categories' | 'brands' }) {
  const [items, setItems] = useState<RecordItem[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [logo, setLogo] = useState('')
  const [logoDark, setLogoDark] = useState('')
  const [logoLight, setLogoLight] = useState('')
  const [editingItem, setEditingItem] = useState<RecordItem | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const label = kind === 'categories' ? 'Danh mục' : 'Thương hiệu'

  const load = useCallback(async () => { setLoading(true); const response = await fetch(`/api/admin/${kind}`); if (response.ok) setItems(await response.json()); setLoading(false) }, [kind])
  useEffect(() => { void load() }, [load])
  function resetForm() { setEditingId(null); setEditingItem(null); setName(''); setDescription(''); setLogo(''); setLogoDark(''); setLogoLight('') }
  function startEdit(item: RecordItem) {
    setEditingId(item.id)
    setEditingItem(item)
    setName(item.name)
    setDescription(item.description || '')
    setLogo(item.logo || '')
    setLogoDark(item.logoDark || '')
    setLogoLight(item.logoLight || '')
    setMessage('')
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const isEditing = Boolean(editingId)
    const response = await fetch(`/api/admin/${kind}`, { method: isEditing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
      name,
      description,
      ...(kind === 'brands' ? {
        logo,
        logoDark,
        logoLight,
        ...(editingItem?.country ? { country: editingItem.country } : {}),
        ...(editingItem?.website ? { website: editingItem.website } : {}),
        ...(editingItem?.featured !== undefined ? { featured: editingItem.featured } : {}),
        ...(editingItem?.sortOrder !== undefined ? { sortOrder: editingItem.sortOrder } : {}),
      } : {}),
      ...(editingId ? { id: editingId } : {}),
    }) })
    const data = await response.json() as { error?: string }
    if (!response.ok) setMessage(data.error || 'Không thể lưu')
    else { resetForm(); setMessage(isEditing ? 'Đã cập nhật' : 'Đã lưu'); await load() }
    setSaving(false)
  }
  async function remove(id: string) { if (!window.confirm(`Xóa ${label.toLowerCase()} này?`)) return; const response = await fetch(`/api/admin/${kind}?id=${encodeURIComponent(id)}`, { method: 'DELETE' }); if (response.ok) await load(); else setMessage('Không thể xóa') }

  return <div className="mx-auto max-w-[1200px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="sonic-label">Catalog / {kind}</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.06em]">{label}.</h1></div><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Làm mới</button></div><form onSubmit={save} className="sonic-panel mt-8 grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-[1fr_1.5fr_1fr_1fr_auto]"><input required value={name} onChange={(event) => setName(event.target.value)} className="sonic-input" placeholder={`Tên ${label.toLowerCase()}`} /><input value={description} onChange={(event) => setDescription(event.target.value)} className="sonic-input" placeholder="Mô tả ngắn" />{kind === 'brands' && <><input value={logo} onChange={(event) => setLogo(event.target.value)} className="sonic-input" placeholder="Logo mặc định (URL)" /><input value={logoDark} onChange={(event) => setLogoDark(event.target.value)} className="sonic-input" placeholder="Logo nền tối (URL)" /><input value={logoLight} onChange={(event) => setLogoLight(event.target.value)} className="sonic-input" placeholder="Logo nền sáng (URL)" /></>}<div className="flex gap-2"><button disabled={saving} type="submit" className="sonic-button sonic-button-gold">{editingId ? <Pencil size={15} /> : <Plus size={15} />} {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm'}</button>{editingId && <button type="button" onClick={resetForm} className="sonic-button sonic-button-ghost" aria-label="Hủy chỉnh sửa"><X size={15} /> Hủy</button>}</div></form>{message && <p className="mt-4 text-sm text-[#d4af37]">{message}</p>}<section className="sonic-panel mt-8 overflow-hidden">{loading ? <p className="p-6 text-sm text-[#858989]">Đang tải...</p> : items.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-5 last:border-0"><div><p className="font-bold text-[#e5e2e1]">{item.name}</p><p className="mt-1 text-xs text-[#707474]">/{item.slug} {item.description ? `· ${item.description}` : ''}</p></div><div className="flex items-center gap-3"><button type="button" onClick={() => startEdit(item)} className="text-[#707474] hover:text-[#d4af37]" aria-label={`Sửa ${item.name}`}><Pencil size={16} /></button><button type="button" onClick={() => void remove(item.id)} className="text-[#707474] hover:text-red-300" aria-label={`Xóa ${item.name}`}><Trash2 size={16} /></button></div></div>)}</section></div>
}
