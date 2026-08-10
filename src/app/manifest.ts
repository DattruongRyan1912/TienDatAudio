import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tiến Đạt Audio - Thiết bị âm thanh chuyên nghiệp',
    short_name: 'Tiến Đạt Audio',
    description: 'Chuyên cung cấp thiết bị âm thanh chất lượng cao - Loa, Ampli, Phụ kiện âm thanh chính hãng',
    start_url: '/',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#080808',
    icons: [
      {
        src: '/images/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['shopping', 'business', 'music'],
    lang: 'vi',
    dir: 'ltr',
    orientation: 'portrait-primary',
    prefer_related_applications: false,
  }
}
