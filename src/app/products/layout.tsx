import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/products',
  title: 'Thiết Bị Âm Thanh & Dàn Karaoke Quảng Ngãi — Tiến Đạt Audio',
  description: 'Cung cấp loa thùng, vang số chống hú, main công suất, amply karaoke chính hãng tại Quảng Ngãi. Trải nghiệm nghe thử âm thanh tại 264 Phan Đình Phùng. Hotline: 0934 995 657.',
  keywords: [
    'thiết bị âm thanh Quảng Ngãi',
    'dàn karaoke Quảng Ngãi',
    'loa Quảng Ngãi',
    'loa karaoke Quảng Ngãi',
    'vang số Quảng Ngãi',
    'cục đẩy công suất Quảng Ngãi',
    'Tiến Đạt Audio',
  ]
})

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
