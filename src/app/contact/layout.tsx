import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liên hệ - Tư vấn thiết bị âm thanh | Tiến Đạt Audio',
  description: 'Liên hệ với Tiến Đạt Audio để được tư vấn miễn phí về thiết bị âm thanh. Hotline: 0905123456. Showroom tại Đà Nẵng. Hỗ trợ 24/7.',
  keywords: [
    'liên hệ tiến đạt audio',
    'tư vấn thiết bị âm thanh', 
    'showroom audio đà nẵng',
    'hotline audio',
    'hỗ trợ kỹ thuật'
  ],
  openGraph: {
    title: 'Liên hệ Tiến Đạt Audio - Tư vấn thiết bị âm thanh',
    description: 'Liên hệ để được tư vấn miễn phí về thiết bị âm thanh chất lượng cao',
    type: 'website'
  },
  alternates: {
    canonical: '/contact'
  }
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
