'use client'

import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Trash2, X } from 'lucide-react'
import type { Brand, Category, Product } from '@/lib/data'

type FormState = { name: string; category_id: string; brand_id: string; price: string; description: string }
const blank: FormState = { name: '', category_id: '', brand_id: '', price: '', description: '' }

export default function AdminProductsManager() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [form, setForm] = useState(blank)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([fetch('/api/admin/products'), fetch('/api/admin/categories'), fetch('/api/admin/brands')])
    if (productsResponse.ok) setProducts(await productsResponse.json())
    if (categoriesResponse.ok) setCategories(await categoriesResponse.json())
    if (brandsResponse.ok) setBrands(await brandsResponse.json())
    setLoading(false)
  }
  useEffect(() => { void load() }, [])

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    const response = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, price: Number(form.price), images: [], features: [], specifications: {}, inStock: true }) })
    const data = await response.json() as { error?: string }
    if (!response.ok) setMessage(data.error || 'Không thể tạo sản phẩm')
    else { setMessage('Đã thêm sản phẩm'); setForm(blank); setOpen(false); await load() }
    setSaving(false)
  }

  async function remove(id: string) {
    if (!window.confirm('Xóa sản phẩm này khỏi catalog?')) return
    const response = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (response.ok) await load()
    else setMessage('Không thể xóa sản phẩm')
  }

  return <div className="mx-auto max-w-[1400px]"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="sonic-label">Catalog / Products</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.06em]">Sản phẩm.</h1><p className="mt-3 text-sm text-[#858989]">Quản lý catalog từ MongoDB.</p></div><div className="flex gap-2"><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost"><RefreshCw size={15} /> Làm mới</button><button type="button" onClick={() => setOpen((value) => !value)} className="sonic-button sonic-button-gold"><Plus size={15} /> Thêm sản phẩm</button></div></div>{message && <p className="mt-6 border border-[#d4af37]/40 bg-[#d4af37]/5 px-4 py-3 text-sm text-[#d4af37]">{message}</p>}{open && <form onSubmit={create} className="sonic-panel mt-8 grid gap-4 p-6 md:grid-cols-2"><div className="flex items-center justify-between md:col-span-2"><div><p className="sonic-label">New record</p><h2 className="mt-2 text-xl font-bold">Thêm sản phẩm</h2></div><button type="button" onClick={() => setOpen(false)} className="text-[#858989] hover:text-[#e5e2e1]" aria-label="Đóng"><X size={18} /></button></div><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="sonic-input" placeholder="Tên sản phẩm" /><input required type="number" min="0" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="sonic-input" placeholder="Giá tham khảo" /><select required value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })} className="sonic-input"><option value="">Chọn danh mục</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select required value={form.brand_id} onChange={(event) => setForm({ ...form, brand_id: event.target.value })} className="sonic-input"><option value="">Chọn thương hiệu</option>{brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="sonic-input min-h-28 md:col-span-2" placeholder="Mô tả ngắn" /><button disabled={saving} type="submit" className="sonic-button sonic-button-gold md:col-span-2">{saving ? 'Đang lưu...' : 'Lưu vào MongoDB'}</button></form>}<section className="sonic-panel mt-8 overflow-hidden"><div className="grid grid-cols-[1fr_130px_100px_44px] gap-4 border-b border-white/10 px-5 py-4 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#707474] md:grid-cols-[1fr_160px_130px_100px_44px]"><span>Sản phẩm</span><span>Danh mục</span><span>Thương hiệu</span><span>Trạng thái</span><span /></div>{loading ? <p className="px-5 py-12 text-sm text-[#858989]">Đang tải catalog...</p> : products.length === 0 ? <p className="px-5 py-12 text-sm text-[#858989]">Chưa có sản phẩm.</p> : products.map((product) => <div key={product.id} className="grid grid-cols-[1fr_130px_100px_44px] items-center gap-4 border-b border-white/10 px-5 py-4 last:border-0 md:grid-cols-[1fr_160px_130px_100px_44px]"><div><p className="text-sm font-bold text-[#e5e2e1]">{product.name}</p><p className="mt-1 text-xs text-[#707474]">{product.price ? new Intl.NumberFormat('vi-VN').format(product.price) + ' đ' : 'Liên hệ'}</p></div><span className="truncate text-xs text-[#9ea2a2]">{product.category || product.category_id}</span><span className="truncate text-xs text-[#9ea2a2]">{product.brand || product.brand_id}</span><span className="text-xs text-emerald-300">{product.inStock ? 'Đang bán' : 'Tạm ẩn'}</span><button type="button" onClick={() => void remove(product.id)} className="text-[#707474] hover:text-red-300" aria-label={`Xóa ${product.name}`}><Trash2 size={15} /></button></div>)}</section></div>
}

