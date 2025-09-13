import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Thương hiệu',
  description: 'Đại lý chính thức các thương hiệu thiết bị âm thanh hàng đầu: Sony, JBL, Bose, Audio-Technica, Shure và nhiều thương hiệu uy tín khác.',
  keywords: [
    'thương hiệu âm thanh',
    'Sony audio',
    'JBL chính hãng',
    'Bose Vietnam',
    'Audio-Technica',
    'Shure microphone',
    'đại lý chính thức'
  ]
})

export default function BrandsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
