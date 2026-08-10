import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/contact',
  title: 'Đặt lịch trải nghiệm — Tiến Đạt Audio',
  description: 'Đặt lịch nghe thử và nhận tư vấn phối ghép tại Tiến Đạt Audio, 264 Phan Đình Phùng, Quảng Ngãi. Hotline 0934995657.',
  keywords: [
    'liên hệ tiến đạt audio',
    'tư vấn thiết bị âm thanh', 
    'showroom audio quảng ngãi',
    'hotline audio',
    'hỗ trợ kỹ thuật'
  ]
})

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
