import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/contact',
  title: 'Đặt lịch trải nghiệm — Tiến Đạt Audio',
  description: 'Đặt lịch nghe thử và nhận tư vấn phối ghép tại Tiến Đạt Audio, 264 Phan Đình Phùng, Quảng Ngãi. Hotline 0934995657.',
  keywords: [
    'tư vấn âm thanh Quảng Ngãi',
    'showroom âm thanh Quảng Ngãi',
    'nghe thử loa Quảng Ngãi',
    'lắp đặt âm thanh Quảng Ngãi',
    'Tiến Đạt Audio',
  ]
})

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
