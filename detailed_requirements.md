# YÊU CẦU CHI TIẾT DỰ ÁN WEBSITE TIẾN ĐẠT AUDIO

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Thông tin cơ bản
- **Tên dự án**: TienDat Audio - Website giới thiệu thiết bị âm thanh
- **Mục tiêu**: Xây dựng website bán hàng trực tuyến chuyên về thiết bị âm thanh
- **Đối tượng khách hàng**: 
  - Khách hàng cá nhân yêu thích âm thanh
  - Doanh nghiệp cần thiết bị âm thanh chuyên nghiệp
  - Studio âm thanh, phòng hát karaoke

### 1.2 Công nghệ triển khai
- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Database**: 
  - **Lựa chọn 1**: Vercel Postgres (Free tier: 60 hours compute/month)
  - **Lựa chọn 2**: Supabase (Free tier: 2 projects, 500MB database)
  - **Lựa chọn 3**: JSON files + Git (Hoàn toàn miễn phí, phù hợp cho sản phẩm ít thay đổi)
  - **Lựa chọn 4**: Turso (SQLite cloud, free tier generous)
- **Hosting**: Vercel (Free tier)
- **CMS**: JSON files hoặc Markdown files (miễn phí)

## 2. PHÂN TÍCH UI VÀ CHỨC NĂNG CHI TIẾT

### 2.1 Trang chủ (home.png)

#### Layout và Components:
1. **Header Navigation**
   - Logo Tiến Đạt Audio
   - Menu chính: Trang chủ, Sản phẩm, Giới thiệu, Liên hệ
   - Search bar
   - Shopping cart icon
   - Contact hotline

2. **Hero Section**
   - Slideshow banner với 3-5 hình ảnh sản phẩm nổi bật
   - Call-to-action buttons
   - Tự động chuyển slide sau 5 giây

3. **Featured Categories**
   - Grid layout hiển thị các danh mục chính:
     - Loa bluetooth
     - Amply karaoke
     - Micro không dây
     - Thiết bị DJ
   - Hover effect với zoom nhẹ

4. **Best Sellers Section**
   - Hiển thị 8 sản phẩm bán chạy nhất
   - Card layout với hình ảnh, tên, giá
   - Badge "Best Seller" hoặc "Hot"

5. **Why Choose Us**
   - 4 điểm mạnh chính với icon
   - Bảo hành chính hãng
   - Giao hàng toàn quốc
   - Tư vấn chuyên nghiệp
   - Giá cả cạnh tranh

#### Hướng triển khai:
```javascript
// Components cần tạo:
- HeroSlider.jsx
- CategoryGrid.jsx
- ProductCard.jsx
- BestSellers.jsx
- WhyChooseUs.jsx
```

### 2.2 Trang danh sách sản phẩm (show_list_product.png)

#### Layout và Components:
1. **Breadcrumb Navigation**
   - Trang chủ > Danh mục > Tên danh mục

2. **Filter Sidebar**
   - Filter theo danh mục
   - Filter theo thương hiệu
   - Filter theo khoảng giá (slider)
   - Filter theo tính năng đặc biệt
   - Button "Xóa bộ lọc"

3. **Product Grid**
   - Layout responsive: 4 cột desktop, 2 cột tablet, 1 cột mobile
   - Sort options: Giá tăng dần, giá giảm dần, mới nhất, bán chạy
   - View options: Grid view, List view
   - Pagination

4. **Product Card Design**
   - Hình ảnh sản phẩm với lazy loading
   - Badge sale percentage (nếu có)
   - Tên sản phẩm
   - Giá gốc và giá sale
   - Rating stars
   - Button "Xem chi tiết" và "Liên hệ"

#### Hướng triển khai:
```javascript
// API Routes cần tạo:
- /api/products (GET) - Lấy danh sách sản phẩm với filter
- /api/categories (GET) - Lấy danh sách danh mục
- /api/brands (GET) - Lấy danh sách thương hiệu

// Components:
- ProductFilter.jsx
- ProductGrid.jsx
- ProductSort.jsx
- Pagination.jsx
```

### 2.3 Trang chi tiết sản phẩm (detail_product_*.png)

#### Layout và Components:
1. **Product Gallery**
   - Main image display với zoom functionality
   - Thumbnail gallery bên dưới
   - 360° view (nếu có)
   - Video demo sản phẩm

2. **Product Information**
   - Tên sản phẩm và SKU
   - Rating và số lượng đánh giá
   - Giá và tình trạng hàng
   - Mô tả ngắn
   - Specifications table
   - Color/variant selector

3. **Action Buttons**
   - "Thêm vào giỏ hàng"
   - "Mua ngay"
   - "Yêu cầu tư vấn"
   - "So sánh sản phẩm"
   - Social share buttons

4. **Product Tabs**
   - Mô tả chi tiết
   - Thông số kỹ thuật
   - Hướng dẫn sử dụng
   - Đánh giá khách hàng
   - Chính sách bảo hành

5. **Related Products**
   - Sản phẩm tương tự
   - Sản phẩm cùng danh mục
   - Phụ kiện đi kèm

#### Hướng triển khai:
```javascript
// API Routes:
- /api/products/[id] (GET) - Chi tiết sản phẩm
- /api/products/[id]/related (GET) - Sản phẩm liên quan
- /api/reviews/[productId] (GET) - Đánh giá sản phẩm

// Components:
- ProductGallery.jsx
- ProductInfo.jsx
- ProductTabs.jsx
- RelatedProducts.jsx
- ReviewSection.jsx
```

### 2.4 Footer (footer.png)

#### Layout và Components:
1. **Company Info**
   - Logo và slogan
   - Địa chỉ cửa hàng
   - Số điện thoại, email
   - Giờ mở cửa

2. **Quick Links**
   - Về chúng tôi
   - Chính sách bảo hành
   - Hướng dẫn mua hàng
   - Chính sách đổi trả

3. **Product Categories**
   - Danh sách danh mục chính
   - Links đến trang sản phẩm

4. **Social Media**
   - Facebook, YouTube, Zalo
   - Newsletter subscription

## 3. TÍNH NĂNG NÂNG CAO

### 3.1 Tối ưu SEO
```javascript
// Next.js Metadata API
export const metadata = {
  title: 'Thiết bị âm thanh chuyên nghiệp - Tiến Đạt Audio',
  description: 'Chuyên cung cấp loa, amply, micro chất lượng cao...',
  keywords: 'loa bluetooth, amply karaoke, micro không dây',
}

// Structured Data (JSON-LD)
const productSchema = {
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": productName,
  "image": productImages,
  "description": productDescription,
  // ... other schema properties
}
```

### 3.2 Performance Optimization
- **Image Optimization**: Next.js Image component với lazy loading
- **Code Splitting**: Dynamic imports cho các components không cần thiết
- **Caching**: Redis cho API responses
- **CDN**: Sử dụng Vercel Edge Network

### 3.3 Analytics và Tracking
```javascript
// Google Analytics 4
- Page views tracking
- Product view events
- Add to cart events
- Contact form submissions

// Facebook Pixel
- Conversion tracking
- Retargeting campaigns
```

## 4. DATABASE ARCHITECTURE - OPTIMIZED FOR FREE HOSTING

### 4.1 Lựa chọn Database (theo mức độ ưu tiên)

#### Lựa chọn 1: JSON Files + Git (Hoàn toàn miễn phí)
```javascript
// Cấu trúc thư mục data
/data
  /products
    - speakers.json
    - amplifiers.json
    - microphones.json
  /categories.json
  /brands.json
  /settings.json

// Example: products/speakers.json
{
  "speakers": [
    {
      "id": "sp001",
      "name": "Loa JBL Partybox 110",
      "slug": "loa-jbl-partybox-110",
      "category": "loa-bluetooth",
      "brand": "jbl",
      "price": 4500000,
      "salePrice": 3800000,
      "images": [
        "/images/products/jbl-partybox-110-1.jpg",
        "/images/products/jbl-partybox-110-2.jpg"
      ],
      "specifications": {
        "power": "160W",
        "frequency": "45Hz - 18kHz",
        "connectivity": ["Bluetooth", "USB", "AUX"],
        "battery": "12 hours"
      },
      "description": "Loa JBL PartyBox 110 mang đến âm thanh...",
      "features": ["Đèn LED", "Chống nước IPX4", "Micro kèm theo"],
      "inStock": true,
      "featured": true,
      "bestseller": false,
      "createdAt": "2024-01-15",
      "updatedAt": "2024-03-01"
    }
  ]
}
```

#### Lựa chọn 2: Turso (SQLite Cloud - Free tier)
```javascript
// Free tier: 500 databases, 1GB storage, 1 billion rows read/month
// Perfect cho SQLite với sync cloud

// Install: npm install @libsql/client
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Schema tương tự như SQLite truyền thống
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  data JSON, -- Lưu tất cả thông tin như specifications, images, etc.
  category_id TEXT,
  brand_id TEXT,
  price REAL,
  sale_price REAL,
  in_stock BOOLEAN DEFAULT 1,
  featured BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Lựa chọn 3: Vercel Postgres (Free tier)
```javascript
// Free tier: 60 hours compute time/month
// Sử dụng @vercel/postgres

import { sql } from '@vercel/postgres';

// Tương tự schema trước nhưng optimize cho Postgres
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  data JSONB, -- Store all product info as JSON
  category_slug VARCHAR(100),
  brand_slug VARCHAR(100),
  price DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Recommended Approach: JSON Files + Git

**Ưu điểm:**
- Hoàn toàn miễn phí
- Deploy cùng với code, không cần connection string
- Fast loading (data được build-time generate)
- Version control cho data
- Không có giới hạn requests
- Phù hợp cho catalog sản phẩm ít thay đổi

**Nhược điểm:**
- Cần rebuild để update data
- Không real-time
- Không phù hợp cho user-generated content

**Implementation:**
```javascript
// lib/data.js
import speakersData from '@/data/products/speakers.json';
import amplifiersData from '@/data/products/amplifiers.json';
import categoriesData from '@/data/categories.json';

export async function getProducts(filters = {}) {
  const allProducts = [
    ...speakersData.speakers,
    ...amplifiersData.amplifiers,
    // ... other product types
  ];
  
  // Apply filters
  let filteredProducts = allProducts;
  
  if (filters.category) {
    filteredProducts = filteredProducts.filter(
      product => product.category === filters.category
    );
  }
  
  if (filters.brand) {
    filteredProducts = filteredProducts.filter(
      product => product.brand === filters.brand
    );
  }
  
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filteredProducts = filteredProducts.filter(
      product => product.price >= min && product.price <= max
    );
  }
  
  return filteredProducts;
}

export async function getProductBySlug(slug) {
  const allProducts = await getProducts();
  return allProducts.find(product => product.slug === slug);
}

export async function getFeaturedProducts() {
  const allProducts = await getProducts();
  return allProducts.filter(product => product.featured);
}
```

## 5. API ENDPOINTS - OPTIMIZED FOR STATIC DATA

### 5.1 Products API (Server Components + JSON data)
```javascript
// app/api/products/route.js
import { getProducts } from '@/lib/data';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const priceMin = searchParams.get('priceMin');
  const priceMax = searchParams.get('priceMax');
  const search = searchParams.get('search');
  
  const filters = {};
  if (category) filters.category = category;
  if (brand) filters.brand = brand;
  if (priceMin && priceMax) filters.priceRange = [+priceMin, +priceMax];
  
  let products = await getProducts(filters);
  
  // Search functionality
  if (search) {
    products = products.filter(product => 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  return Response.json(products);
}

// app/api/products/[slug]/route.js
export async function GET(request, { params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return new Response('Product not found', { status: 404 });
  }
  return Response.json(product);
}
```

### 5.2 Alternative: Static Generation (Recommended)
```javascript
// Thay vì API routes, sử dụng Static Generation cho performance tốt hơn

// app/san-pham/page.js
import { getProducts, getCategories } from '@/lib/data';

export async function generateStaticParams() {
  return []; // Static generation for main product page
}

export default async function ProductsPage({ searchParams }) {
  const products = await getProducts(searchParams);
  const categories = await getCategories();
  
  return (
    <div>
      <ProductFilter categories={categories} />
      <ProductGrid products={products} />
    </div>
  );
}

// app/san-pham/[slug]/page.js
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(product => ({
    slug: product.slug,
  }));
}

export default async function ProductDetailPage({ params }) {
  const product = await getProductBySlug(params.slug);
  // ... render product detail
}
```

### 5.3 Contact API (Dùng Vercel Functions miễn phí)
```javascript
// app/api/contact/route.js
import { Resend } from 'resend'; // Free tier: 3000 emails/month

export async function POST(request) {
  const { name, email, phone, message } = await request.json();
  
  // Send email using Resend or EmailJS
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    await resend.emails.send({
      from: 'website@tiendataudio.com',
      to: 'contact@tiendataudio.com',
      subject: `Liên hệ từ ${name}`,
      html: `
        <h3>Thông tin liên hệ mới</h3>
        <p><strong>Tên:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Số điện thoại:</strong> ${phone}</p>
        <p><strong>Nội dung:</strong> ${message}</p>
      `,
    });
    
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Gửi email thất bại' }, { status: 500 });
  }
}
```

## 6. RESPONSIVE DESIGN

### 6.1 Breakpoints
```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### 6.2 Mobile-First Approach
- Navigation: Hamburger menu cho mobile
- Product grid: 1 cột mobile, 2 cột tablet, 4 cột desktop
- Touch-friendly buttons (minimum 44px height)

## 7. ADMIN PANEL (Phase 2)

### 7.1 Product Management
- CRUD operations cho sản phẩm
- Bulk upload via CSV
- Image upload và resize
- SEO fields management

### 7.2 Order Management
- View và manage orders
- Order status updates
- Customer communication

## 8. TIMELINE TRIỂN KHAI

### Phase 1 (2-3 tuần)
- Setup project structure
- Implement homepage
- Product listing page
- Product detail page
- Basic responsive design

### Phase 2 (1-2 tuần)
- Contact forms
- Search functionality
- SEO optimization
- Performance optimization

### Phase 3 (1 tuần)
- Testing và bug fixes
- Content integration
- Launch preparation

## 9. TESTING STRATEGY

### 9.1 Performance Testing
- Lighthouse scores > 90
- Core Web Vitals optimization
- Mobile page speed < 3s

### 9.2 Cross-browser Testing
- Chrome, Firefox, Safari, Edge
- iOS Safari, Android Chrome
- Internet Explorer 11 (nếu cần)

### 9.3 SEO Testing
- Meta tags validation
- Schema markup testing
- Site crawlability check

## 10. DEPLOYMENT VÀ MONITORING - FREE TIER OPTIMIZATION

### 10.1 Vercel Deployment (Free tier)
```bash
# Environment variables (chỉ cần cho email service)
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_SITE_URL=https://tiendataudio.vercel.app
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

**Free tier limits:**
- 100GB bandwidth/month
- 1000 serverless function invocations/day
- 100 static builds/day
- Custom domain support

### 10.2 Alternative Free Hosting Options
```javascript
// Netlify (alternative)
- 100GB bandwidth/month
- 300 build minutes/month
- Form submissions: 100/month
- Serverless functions: 125k requests/month

// Cloudflare Pages
- Unlimited bandwidth
- 500 builds/month
- Custom domains
- Cloudflare Workers: 100k requests/day
```

### 10.3 Free Monitoring Tools
- **Vercel Analytics** (built-in)
- **Google Analytics 4** (free)
- **Google Search Console** (free)
- **Sentry** (5k errors/month free)
- **LogRocket** (1k sessions/month free)

### 10.4 Cost Breakdown (All Free!)
```
✅ Hosting: Vercel Free Tier ($0)
✅ Database: JSON files ($0) 
✅ Email Service: Resend Free Tier ($0)
✅ Domain: Vercel subdomain ($0) or custom domain (~$10/year)
✅ SSL Certificate: Free with Vercel
✅ CDN: Free with Vercel
✅ Analytics: Google Analytics ($0)
✅ Error Tracking: Sentry Free Tier ($0)

Total Monthly Cost: $0
Only potential cost: Custom domain (~$10/year)
```

### 10.5 Performance với Static Data
```javascript
// Next.js Static Generation advantages
- Build time: ~2-3 minutes
- Page load: <1s (pre-rendered HTML)
- SEO: Perfect (static HTML)
- Caching: Automatic with Vercel
- No database latency
- No connection limits

// Example build output
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         87.4 kB
├ ○ /san-pham                           12.1 kB         94.3 kB
├ ● /san-pham/[slug]                    8.7 kB         90.9 kB
├   ├ /san-pham/loa-jbl-partybox-110
├   ├ /san-pham/amply-karaoke-bmb-300
├   └ [+47 more paths]
└ ○ /lien-he                            4.8 kB         87.0 kB

○ (Static)  automatically rendered as static HTML
● (SSG)     automatically generated as static HTML + JSON
```

---

**Ghi chú**: Document này sẽ được cập nhật trong quá trình phát triển để phản ánh các thay đổi và yêu cầu mới.
