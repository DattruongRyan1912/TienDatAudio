import { ImageResponse } from 'next/og'
import { getBusinessProfile } from '@/lib/business-profile'
import { getContentPostBySlug } from '@/lib/content-repository'

export const runtime = 'nodejs'
export const alt = 'Bài viết kiến thức âm thanh từ Tiến Đạt Audio'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, profile] = await Promise.all([getContentPostBySlug(slug, true), getBusinessProfile()])
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#080808', color: '#e5e2e1', padding: '72px', fontFamily: 'sans-serif' }}><div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4af37', fontSize: 24, letterSpacing: 5, textTransform: 'uppercase' }}><span>{profile.name}</span><span>Kiến thức âm thanh</span></div><div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1000 }}><div style={{ color: '#d4af37', fontSize: 24, marginBottom: 28 }}>{post?.category || 'Journal'}</div><div style={{ fontSize: 64, fontWeight: 750, lineHeight: 1.08, letterSpacing: -3 }}>{post?.title || profile.description}</div></div><div style={{ display: 'flex', justifyContent: 'space-between', color: '#858989', fontSize: 22 }}><span>{profile.address.addressLocality}</span><span>{profile.siteUrl.replace(/^https?:\/\//, '')}</span></div></div>, size)
}
