import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/brands',
  title: 'Thương hiệu',
  description: 'Khám phá các thương hiệu âm thanh được Tiến Đạt Audio tuyển chọn: JBL, Sony, Bose, Pioneer và ARF.',
  keywords: [
    'thương hiệu âm thanh',
    'JBL chính hãng',
    'Sony audio',
    'Bose Vietnam',
    'Pioneer audio',
    'ARF audio',
    'phối ghép âm thanh'
  ]
})

export default function BrandsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
