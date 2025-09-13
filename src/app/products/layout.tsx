import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tất cả sản phẩm - Thiết bị âm thanh chính hãng | Tiến Đạt Audio',
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
  ],
  openGraph: {
    title: 'Tất cả sản phẩm thiết bị âm thanh chính hãng',
    description: 'Khám phá bộ sưu tập thiết bị âm thanh chất lượng cao với giá tốt nhất',
    type: 'website'
  },
  alternates: {
    canonical: '/products'
  }
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
