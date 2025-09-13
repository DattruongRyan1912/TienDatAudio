# 🛠 Tiến Đạt Audio - Developer Guide

## 🚀 Quick Start Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # ESLint check

# Data Management
# Speakers data: /data/products/speakers.json
# Amplifiers data: /data/products/amplifiers.json
# Categories: /data/categories.json
# Brands: /data/brands.json
```

## 📝 Common Tasks

### 1. Add New Product
**Via Admin Panel:**
- Go to http://localhost:3000/admin/products
- Click "Thêm sản phẩm mới"
- Fill form and submit

**Via JSON File:**
```json
// Add to speakers.json or amplifiers.json
{
  "id": "new-product-id",
  "name": "Product Name",
  "price": 1500000,
  "category": "Loa",
  "brand": "Sony",
  "image": "/images/product.jpg",
  "description": "Product description...",
  "features": ["Feature 1", "Feature 2"],
  "specifications": {
    "power": "100W",
    "frequency": "20Hz-20kHz"
  },
  "inStock": true
}
```

### 2. Update SEO
**Page SEO:**
```typescript
// In any page.tsx
export const metadata = generateSEOMetadata({
  title: "Your Page Title",
  description: "Your description...",
  keywords: ["keyword1", "keyword2"]
})
```

**Global SEO Settings:**
```typescript
// Edit src/lib/seo.ts
const defaultSEO = {
  siteName: "Tiến Đạt Audio",
  siteUrl: "https://tiendataudio.com",
  // ... other settings
}
```

### 3. Responsive Breakpoint Changes
```typescript
// Tailwind breakpoints in use:
sm: '640px'   // Small tablets
md: '768px'   // Tablets  
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
2xl: '1536px' // Extra large

// Custom breakpoints in components:
mobile: '0-767px'
tablet: '768-1023px'  
desktop: '1024px+'
```

### 4. Add New Page
```typescript
// 1. Create page file
// src/app/new-page/page.tsx
import { generateSEOMetadata } from '@/lib/seo'

export const metadata = generateSEOMetadata({
  title: "New Page",
  description: "Page description..."
})

export default function NewPage() {
  return <div>New Page Content</div>
}

// 2. Add to navigation
// src/components/HeaderResponsive.tsx
const navItems = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Sản phẩm', href: '/products' },
  { name: 'New Page', href: '/new-page' }, // Add here
  // ...
]
```

### 5. Modify Admin Panel
```typescript
// Add new admin route
// src/app/admin/new-section/page.tsx

// Add to admin navigation
// src/components/admin/AdminSidebar.tsx
const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Sản phẩm', href: '/admin/products', icon: '📦' },
  { name: 'New Section', href: '/admin/new-section', icon: '🆕' },
  // ...
]
```

## 🎨 Styling Guidelines

### Color Palette
```css
/* Primary colors */
--blue-600: #2563eb
--blue-700: #1d4ed8
--blue-800: #1e40af

/* Accent colors */  
--orange-500: #f97316
--orange-600: #ea580c

/* Neutral colors */
--gray-50: #f9fafb
--gray-100: #f3f4f6
--gray-900: #111827
```

### Typography Scale
```css
/* Headings */
text-4xl: 36px (2.25rem)
text-3xl: 30px (1.875rem)  
text-2xl: 24px (1.5rem)
text-xl: 20px (1.25rem)

/* Body text */
text-lg: 18px (1.125rem)
text-base: 16px (1rem)
text-sm: 14px (0.875rem)
```

### Spacing System
```css
/* Consistent spacing */
space-2: 8px
space-4: 16px
space-6: 24px  
space-8: 32px
space-12: 48px
space-16: 64px
```

## 🔧 API Reference

### Product API Endpoints
```typescript
// GET /api/admin/products
// Returns: Product[]

// POST /api/admin/products  
// Body: { product: Product }
// Returns: { success: boolean, message: string }

// PUT /api/admin/products
// Body: { product: Product }  
// Returns: { success: boolean, message: string }

// DELETE /api/admin/products
// Body: { productId: string, category: string }
// Returns: { success: boolean, message: string }
```

### Search API
```typescript
// GET /api/search?q=query&category=speaker
// Returns: SearchResult[]

// Internal search function
import { searchProducts } from '@/lib/data'
const results = searchProducts('sony', 'speakers')
```

## 📱 Mobile Testing Checklist

### Testing Breakpoints
```bash
# Chrome DevTools sizes to test:
iPhone SE: 375x667
iPhone 12: 390x844
iPad: 768x1024
iPad Pro: 1024x1366
Desktop: 1920x1080
```

### Touch Interactions
- [ ] Tap targets ≥ 44px
- [ ] Swipe gestures work
- [ ] Forms are touch-friendly
- [ ] Mobile menu toggles correctly
- [ ] Search overlay functions

## 🔍 SEO Maintenance

### Regular SEO Tasks
```typescript
// Update sitemap (automatic with new pages)
// Check robots.txt directives
// Validate structured data: https://search.google.com/test/rich-results

// Monitor Core Web Vitals
// LCP: < 2.5s
// FID: < 100ms  
// CLS: < 0.1
```

### SEO Testing Tools
- Google PageSpeed Insights
- Search Console
- Schema Markup Validator
- Mobile-Friendly Test

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Run `npm run build` successfully
- [ ] Test production build locally
- [ ] Verify all images load
- [ ] Check responsive design
- [ ] Test admin functionality  
- [ ] Validate SEO metadata

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://tiendataudio.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Performance Optimization
```typescript
// Image optimization
import Image from 'next/image'
<Image 
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  priority={false} // Set true for above-fold images
/>

// Code splitting
import dynamic from 'next/dynamic'
const DynamicComponent = dynamic(() => import('./Component'))
```

## 🔐 Security Best Practices

### Admin Security (Future)
```typescript
// Authentication ready structure
// src/middleware.ts (create when needed)
// src/lib/auth.ts (authentication utilities)
// src/app/api/auth/ (auth endpoints)
```

### Data Validation
```typescript
// Validate inputs before saving
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  category: z.enum(['speakers', 'amplifiers'])
})
```

## 📊 Analytics Integration (Ready)

### Google Analytics
```typescript
// Add to layout.tsx when ready
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <GoogleAnalytics gaId="G-XXXXXXXXXX" />
      </body>
    </html>
  )
}
```

## 🛠 Troubleshooting

### Common Issues
```typescript
// Build errors - check TypeScript types
npm run type-check

// Styling issues - check Tailwind classes
npm run dev // Hot reload helps

// API errors - check file permissions
ls -la data/products/

// SEO not showing - check metadata
// View page source for meta tags
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check bundle size
npm run build
npm run analyze # If analyzer is installed
```

---

## 📞 Support Contacts

### Technical Questions
- File Structure: See `/src` directory  
- Components: Check `/src/components`
- API Routes: Located in `/src/app/api`
- Data Files: Stored in `/data`

### Quick Links
- **Development**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin  
- **API Docs**: http://localhost:3000/api
- **Repository**: Project documentation

---

**🎯 Keep this guide handy for quick reference during development and maintenance!**
