import { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Tất cả sản phẩm',
  description: 'Khám phá bộ sưu tập thiết bị âm thanh chất lượng cao: Loa, Ampli, Phụ kiện âm thanh từ các thương hiệu uy tín như Sony, Yamaha, Denon với giá tốt nhất.',
  keywords: [
    'thiết bị âm thanh',
    'loa chính hãng',
    'ampli cao cấp',
    'phụ kiện âm thanh', 
    'Sony audio',
    'Yamaha audio',
    'Denon audio',
    'hifi audio',
    'home theater'
  ]
})

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
