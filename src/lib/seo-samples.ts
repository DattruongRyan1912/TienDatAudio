import { type ProductSEO } from '@/lib/data'

// Sample SEO data for products to demonstrate the system
export const sampleProductSEO: Record<string, ProductSEO> = {
  'loa-jbl-flip-6': {
    metaTitle: 'Loa JBL Flip 6 - Bluetooth Chống Nước IP67 | Tiến Đạt Audio',
    metaDescription: 'Loa JBL Flip 6 Bluetooth chống nước IP67, âm thanh stereo mạnh mẽ, pin 12h. ✓ Chính hãng ✓ Bảo hành 12 tháng ✓ Miễn phí ship. Giá từ 2,990,000đ',
    keywords: [
      'loa jbl flip 6',
      'loa bluetooth jbl',
      'loa chống nước',
      'loa di động',
      'jbl bluetooth speaker',
      'loa không dây'
    ],
    ogTitle: 'Loa JBL Flip 6 - Âm thanh đỉnh cao, chống nước hoàn hảo',
    ogDescription: 'Trải nghiệm âm thanh stereo sống động với JBL Flip 6. Chống nước IP67, pin 12h, kết nối Bluetooth 5.1.',
    ogImage: '/images/products/jbl-flip-6-og.jpg',
    canonicalUrl: '/product/loa-jbl-flip-6',
    noIndex: false,
    schemaMarkup: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Loa JBL Flip 6 Bluetooth Chống Nước',
      brand: 'JBL'
    }
  },
  'tai-nghe-sony-wh-1000xm5': {
    metaTitle: 'Tai Nghe Sony WH-1000XM5 - Chống Ồn Hàng Đầu | Tiến Đạt Audio',
    metaDescription: 'Tai nghe Sony WH-1000XM5 công nghệ chống ồn AI, âm thanh Hi-Res, pin 30h. ✓ Chính hãng Sony ✓ Bảo hành 12 tháng. Giá từ 8,490,000đ',
    keywords: [
      'tai nghe sony wh-1000xm5',
      'tai nghe chống ồn',
      'sony noise cancelling',
      'tai nghe bluetooth sony',
      'tai nghe hi-res',
      'tai nghe cao cấp'
    ],
    ogTitle: 'Sony WH-1000XM5 - Đỉnh cao công nghệ chống ồn',
    ogDescription: 'Tai nghe Sony WH-1000XM5 với AI Noise Cancelling, âm thanh Hi-Res Audio, thiết kế premium.',
    ogImage: '/images/products/sony-wh-1000xm5-og.jpg',
    canonicalUrl: '/product/tai-nghe-sony-wh-1000xm5',
    noIndex: false,
    schemaMarkup: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Tai Nghe Sony WH-1000XM5 Noise Cancelling',
      brand: 'Sony'
    }
  }
}

// SEO best practices for audio products
export const seoGuidelines = {
  metaTitle: {
    minLength: 10,
    maxLength: 60,
    optimal: 50,
    tips: [
      'Bao gồm tên sản phẩm và thương hiệu',
      'Thêm từ khóa chính (bluetooth, chống ồn, v.v.)',
      'Kết thúc với tên cửa hàng',
      'Tránh lặp từ khóa quá nhiều'
    ]
  },
  metaDescription: {
    minLength: 50,  // Giảm từ 120 xuống 50
    maxLength: 160,
    optimal: 130,   // Thêm độ dài tối ưu
    tips: [
      'Mô tả ngắn gọn tính năng chính (50+ ký tự)',
      'Tối ưu nhất là 120-160 ký tự',
      'Bao gồm ưu đại (✓ Chính hãng ✓ Bảo hành)',
      'Thêm thông tin giá cả',
      'Sử dụng call-to-action hấp dẫn',
      'Tránh duplicate với title'
    ]
  },
  keywords: {
    maxCount: 10,
    minCount: 1,
    optimal: 5,
    types: [
      'Tên sản phẩm chính xác',
      'Tên thương hiệu + loại sản phẩm',
      'Tính năng chính (bluetooth, chống nước)',
      'Từ khóa long-tail',
      'Từ khóa địa phương (nếu cần)'
    ]
  }
}

// Function to generate SEO-optimized content for audio products
export function generateAudioProductSEO(productName: string, brand: string, features: string[], price: number): Partial<ProductSEO> {
  const formattedPrice = price.toLocaleString('vi-VN')
  
  return {
    metaTitle: `${productName} - ${brand} ${features[0] || ''} | Tiến Đạt Audio`,
    metaDescription: `${productName} ${brand} ${features.slice(0, 2).join(', ')}. ✓ Chính hãng ✓ Bảo hành ✓ Miễn phí ship. Giá từ ${formattedPrice}đ`,
    keywords: [
      productName.toLowerCase(),
      `${brand.toLowerCase()} ${productName.split(' ')[0].toLowerCase()}`,
      ...features.map(f => f.toLowerCase()),
      'chính hãng',
      'audio equipment'
    ].slice(0, 8),
    ogTitle: `${productName} - ${features[0] || 'Chất lượng cao'}`,
    ogDescription: `Khám phá ${productName} với ${features.slice(0, 2).join(' và ')}. Chính hãng, bảo hành tốt.`
  }
}
