import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/about',
  title: 'Giới thiệu',
  description: 'Tiến Đạt Audio - Hơn 10 năm kinh nghiệm trong lĩnh vực thiết bị âm thanh. Cam kết cung cấp sản phẩm chính hãng, chất lượng cao với dịch vụ tốt nhất.',
  keywords: [
    'giới thiệu công ty',
    'Tiến Đạt Audio',
    'kinh nghiệm âm thanh',
    'chuyên gia thiết bị âm thanh',
    'lịch sử phát triển',
    'tầm nhìn sứ mệnh'
  ]
})

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
