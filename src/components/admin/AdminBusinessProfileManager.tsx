'use client'

import { useEffect, useState } from 'react'
import { MapPin, RefreshCw, Save } from 'lucide-react'
import type { BusinessProfile } from '@/lib/business-profile'

function lines(value: string[]) {
  return value.join('\n')
}

function splitLines(value: string) {
  return value.split('\n').map((item) => item.trim()).filter(Boolean)
}

export default function AdminBusinessProfileManager() {
  const [profile, setProfile] = useState<BusinessProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/business-profile')
      const result = await response.json() as { success?: boolean; data?: BusinessProfile; message?: string }
      if (!response.ok || !result.data) throw new Error(result.message || 'Không thể tải business profile')
      setProfile(result.data)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể tải business profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  function update<K extends keyof BusinessProfile>(field: K, value: BusinessProfile[K]) {
    setProfile((current) => current ? { ...current, [field]: value } : current)
  }

  function updateAddress<K extends keyof BusinessProfile['address']>(field: K, value: string) {
    setProfile((current) => current ? { ...current, address: { ...current.address, [field]: value } } : current)
  }

  async function save() {
    if (!profile || saving) return
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/business-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      const result = await response.json() as { success?: boolean; data?: BusinessProfile; message?: string }
      if (!response.ok || !result.data) throw new Error(result.message || 'Không thể lưu business profile')
      setProfile(result.data)
      setMessage('Đã đồng bộ NAP cho footer, contact, schema và llms.txt')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Không thể lưu business profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="sonic-panel mt-8 p-6 text-sm text-[#858989]">Đang tải business profile...</div>
  if (!profile) return <div className="sonic-panel mt-8 p-6"><p className="text-sm text-red-200">{message}</p><button type="button" onClick={() => void load()} className="sonic-button sonic-button-ghost mt-4"><RefreshCw size={15} /> Thử lại</button></div>

  return <section className="sonic-panel mt-8 p-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div className="flex items-start gap-4"><MapPin size={20} className="mt-1 shrink-0 text-[#d4af37]" /><div><h2 className="text-xl font-bold">Business profile / NAP</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#858989]">Nguồn duy nhất cho tên, địa chỉ, điện thoại, giờ mở cửa, tọa độ, social, footer, contact, LocalBusiness schema và AI-readable output.</p></div></div>
      <button type="button" onClick={() => void save()} disabled={saving} className="sonic-button sonic-button-gold"><Save size={15} /> {saving ? 'Đang lưu...' : 'Lưu profile'}</button>
    </div>
    {message && <p className="mt-5 border border-[#d4af37]/40 bg-[#d4af37]/5 px-4 py-3 text-sm text-[#d4af37]">{message}</p>}
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      <label className="text-xs text-[#858989]">Tên doanh nghiệp<input value={profile.name} onChange={(event) => update('name', event.target.value)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989]">Tên thay thế<input value={profile.alternateName} onChange={(event) => update('alternateName', event.target.value)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989] md:col-span-2">Mô tả thực thể<textarea value={profile.description} onChange={(event) => update('description', event.target.value)} className="sonic-input mt-2 min-h-24" /></label>
      <label className="text-xs text-[#858989]">Website canonical<input value={profile.siteUrl} onChange={(event) => update('siteUrl', event.target.value)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989]">Logo URL<input value={profile.logo} onChange={(event) => update('logo', event.target.value)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989]">Điện thoại<input value={profile.phone} onChange={(event) => update('phone', event.target.value)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989]">Email<input type="email" value={profile.email} onChange={(event) => update('email', event.target.value)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989] md:col-span-2">Địa chỉ hiển thị<textarea value={profile.address.formatted} onChange={(event) => updateAddress('formatted', event.target.value)} className="sonic-input mt-2 min-h-20" /></label>
      <label className="text-xs text-[#858989]">Số nhà / đường<input value={profile.address.streetAddress} onChange={(event) => updateAddress('streetAddress', event.target.value)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989]">Thành phố / địa phương<input value={profile.address.addressLocality} onChange={(event) => updateAddress('addressLocality', event.target.value)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989]">Tỉnh / vùng<input value={profile.address.addressRegion} onChange={(event) => updateAddress('addressRegion', event.target.value)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989]">Mã quốc gia<input value={profile.address.addressCountry} maxLength={2} onChange={(event) => updateAddress('addressCountry', event.target.value)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989]">Vĩ độ<input type="number" step="any" value={profile.latitude ?? ''} onChange={(event) => update('latitude', event.target.value ? Number(event.target.value) : undefined)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989]">Kinh độ<input type="number" step="any" value={profile.longitude ?? ''} onChange={(event) => update('longitude', event.target.value ? Number(event.target.value) : undefined)} className="sonic-input mt-2" /></label>
      <label className="text-xs text-[#858989]">Giờ mở cửa — mỗi dòng một khung<textarea value={lines(profile.businessHours)} onChange={(event) => update('businessHours', splitLines(event.target.value))} className="sonic-input mt-2 min-h-24" /></label>
      <label className="text-xs text-[#858989]">Khu vực phục vụ — mỗi dòng một nơi<textarea value={lines(profile.areaServed)} onChange={(event) => update('areaServed', splitLines(event.target.value))} className="sonic-input mt-2 min-h-24" /></label>
      <label className="text-xs text-[#858989]">Dịch vụ — mỗi dòng một dịch vụ<textarea value={lines(profile.services)} onChange={(event) => update('services', splitLines(event.target.value))} className="sonic-input mt-2 min-h-32" /></label>
      <label className="text-xs text-[#858989]">Social URLs — mỗi dòng một URL<textarea value={lines(profile.socialLinks)} onChange={(event) => update('socialLinks', splitLines(event.target.value))} className="sonic-input mt-2 min-h-32" /></label>
      <label className="text-xs text-[#858989] md:col-span-2">Google Maps embed URL<textarea value={profile.mapEmbedUrl} onChange={(event) => update('mapEmbedUrl', event.target.value)} className="sonic-input mt-2 min-h-24" /></label>
      <label className="text-xs text-[#858989] md:col-span-2">Google Maps public URL<input value={profile.mapUrl} onChange={(event) => update('mapUrl', event.target.value)} className="sonic-input mt-2" /></label>
    </div>
  </section>
}
