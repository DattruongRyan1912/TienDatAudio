import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/contact',
  title: 'Liên hệ',
  description: 'Liên hệ với Tiến Đạt Audio để được tư vấn miễn phí về thiết bị âm thanh. Hotline: 0905123456. Showroom tại Đà Nẵng. Hỗ trợ 24/7.',
  keywords: [
    'liên hệ tiến đạt audio',
    'tư vấn thiết bị âm thanh', 
    'showroom audio đà nẵng',
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
