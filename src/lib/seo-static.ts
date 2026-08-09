// Static SEO configuration - auto-generated from data/seo.json
// This file is safe to import in both client and server environments

export interface SEOContent {
  id: string
  page: string
  title: string
  description: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  structuredData: Record<string, unknown>
  metaRobots: string
  canonicalUrl: string
  h1: string
  h2: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Static SEO data - updated from admin panel
const staticSEOData: Record<string, SEOContent> = {
  "/": {
    "id": "seo_home_1757702000000",
    "page": "/",
    "title": "Tiến Đạt Audio - Thiết bị âm thanh chuyên nghiệp",
    "description": "Chuyên cung cấp thiết bị âm thanh chất lượng cao: loa, tai nghe, micro, amply karaoke chính hãng. Giá tốt, chất lượng đảm bảo, giao hàng toàn quốc.",
    "keywords": [
      "thiết bị âm thanh",
      "loa bluetooth", 
      "tai nghe chính hãng",
      "micro karaoke",
      "amply karaoke",
      "âm thanh chuyên nghiệp",
      "Tiến Đạt Audio",
      "âm thanh quảng ngãi"
    ],
    "ogTitle": "Tiến Đạt Audio - Thiết bị âm thanh chuyên nghiệp",
    "ogDescription": "Chuyên cung cấp thiết bị âm thanh chất lượng cao: loa, tai nghe, micro, amply karaoke chính hãng. Giá tốt, chất lượng đảm bảo.",
    "ogImage": "/images/og-home.jpg",
    "structuredData": {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Tiến Đạt Audio",
      "description": "Chuyên cung cấp thiết bị âm thanh chất lượng cao",
      "url": "https://tien-dat-audio.vercel.app"
    },
    "metaRobots": "index,follow",
    "canonicalUrl": "https://tien-dat-audio.vercel.app",
    "h1": "Thiết bị âm thanh chuyên nghiệp - Tiến Đạt Audio",
    "h2": [
      "Sản phẩm nổi bật",
      "Danh mục sản phẩm", 
      "Thương hiệu uy tín",
      "Tại sao chọn Tiến Đạt Audio"
    ],
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-09-13T10:35:41.239Z"
  },
  "/products": {
    "id": "seo_products_1757702100000",
    "page": "/products",
    "title": "Sản phẩm - Thiết bị âm thanh chính hãng | Tiến Đạt Audio",
    "description": "Khám phá bộ sưu tập thiết bị âm thanh đa dạng: loa bluetooth, tai nghe không dây, micro karaoke, amply chuyên nghiệp với giá tốt nhất.",
    "keywords": [
      "sản phẩm âm thanh",
      "loa bluetooth chính hãng",
      "tai nghe không dây",
      "micro wireless",
      "thiết bị DJ",
      "âm thanh chuyên nghiệp"
    ],
    "ogTitle": "Sản phẩm thiết bị âm thanh chính hãng",
    "ogDescription": "Khám phá bộ sưu tập thiết bị âm thanh đa dạng với giá tốt nhất tại Tiến Đạt Audio.",
    "ogImage": "/images/og-products.jpg",
    "structuredData": {},
    "metaRobots": "index,follow",
    "canonicalUrl": "https://tien-dat-audio.vercel.app/products",
    "h1": "Sản phẩm thiết bị âm thanh chính hãng",
    "h2": [
      "Loa Bluetooth",
      "Tai nghe",
      "Micro Karaoke",
      "Amply",
      "Thiết bị DJ"
    ],
    "isActive": true,
    "createdAt": "2025-01-15T10:05:00Z",
    "updatedAt": "2025-01-15T10:05:00Z"
  }
}

// Helper function to get SEO data for a page
export function getSEODataForPage(pagePath: string): SEOContent | null {
  const seoData = staticSEOData[pagePath]
  return seoData && seoData.isActive ? seoData : null
}
