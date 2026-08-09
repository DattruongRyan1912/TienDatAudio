import Link from 'next/link'
import { ArrowUpRight, BarChart3, FileText, Package, Tags, Users } from 'lucide-react'
import { getGrowthDashboard } from '@/lib/analytics-repository'
import { deriveContentSEOInsights } from '@/lib/content-seo'
import { listContentPosts } from '@/lib/content-repository'
import { getDashboardStats, getProducts } from '@/lib/catalog'
import { getSEOConfig } from '@/lib/seo-strategy'

export default async function AdminDashboardPage() {
  const [stats, products, growth, content, seo] = await Promise.all([
    getDashboardStats(),
    getProducts({ limit: 5 }),
    getGrowthDashboard(30),
    listContentPosts({ limit: 500 }),
    getSEOConfig(),
  ])
  const insights = deriveContentSEOInsights(seo, content.items)
  const statusCounts = Object.fromEntries(['idea', 'draft', 'review', 'scheduled', 'published', 'archived'].map((status) => [status, content.items.filter((post) => post.status === status).length]))
  const cards = [
    { icon: Package, label: 'Sản phẩm', value: stats.products, href: '/admin/products' },
    { icon: Tags, label: 'Danh mục', value: stats.categories, href: '/admin/categories' },
    { icon: FileText, label: 'Bài published', value: statusCounts.published, href: '/admin/posts?status=published' },
    { icon: Users, label: 'Lead 30 ngày', value: growth.leads, href: '/admin/contacts' },
    { icon: BarChart3, label: 'Article views', value: growth.articleViews, href: '/admin/seo/dashboard' },
  ]
  return <div className="mx-auto max-w-[1400px] pb-20"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="sonic-label">Dashboard / Overview</p><h1 className="mt-4 text-4xl font-bold tracking-[-0.06em]">Control room.</h1><p className="mt-3 text-sm text-[#858989]">Content, SEO và chuyển đổi — dữ liệu lấy từ MongoDB, không dùng số mẫu.</p></div><Link href="/" className="sonic-button sonic-button-ghost">Xem website <ArrowUpRight size={15} /></Link></div>
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(({ icon: Icon, label, value, href }) => <Link key={label} href={href} className="sonic-panel group p-6 transition-colors hover:border-[#d4af37]/60"><div className="flex items-start justify-between"><Icon size={19} className="text-[#d4af37]" /><ArrowUpRight size={16} className="text-[#707474] transition-colors group-hover:text-[#d4af37]" /></div><p className="mt-9 text-4xl font-bold tracking-[-0.06em] text-[#e5e2e1]">{String(value).padStart(2, '0')}</p><p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[#858989]">{label}</p></Link>)}</div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><section className="sonic-panel"><div className="flex items-center justify-between border-b border-white/10 px-6 py-5"><div><p className="sonic-label">Editorial / Pipeline</p><h2 className="mt-2 text-xl font-bold">Trạng thái content</h2></div><Link href="/admin/posts" className="text-xs font-bold uppercase tracking-[0.12em] text-[#d4af37]">Quản lý</Link></div><div className="grid grid-cols-2 gap-px bg-white/10 sm:grid-cols-3">{Object.entries(statusCounts).map(([status, count]) => <Link key={status} href={`/admin/posts?status=${status}`} className="bg-[#111111] p-5 transition-colors hover:bg-[#151515]"><p className="text-2xl font-bold">{count}</p><p className="mt-2 text-[0.62rem] uppercase tracking-[0.14em] text-[#858989]">{status}</p></Link>)}</div></section><section className="sonic-panel p-6"><p className="sonic-label">Acquisition / 30 days</p><h2 className="mt-3 text-2xl font-bold tracking-[-0.04em]">{growth.conversionRate}% lead conversion.</h2><div className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><p className="text-2xl font-bold">{growth.sessions}</p><p className="mt-1 text-xs text-[#858989]">unique sessions</p></div><div><p className="text-2xl font-bold">{growth.articleCTAs}</p><p className="mt-1 text-xs text-[#858989]">article CTA</p></div><div><p className="text-2xl font-bold">{growth.phoneClicks}</p><p className="mt-1 text-xs text-[#858989]">phone clicks</p></div><div><p className="text-2xl font-bold">{growth.zaloClicks}</p><p className="mt-1 text-xs text-[#858989]">Zalo clicks</p></div></div></section></div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_.85fr]"><section className="sonic-panel"><div className="flex items-center justify-between border-b border-white/10 px-6 py-5"><div><p className="sonic-label">Catalog / Recent</p><h2 className="mt-2 text-xl font-bold">Sản phẩm nổi bật</h2></div><Link href="/admin/products" className="text-xs font-bold uppercase tracking-[0.12em] text-[#d4af37]">Quản lý</Link></div><div>{products.map((product) => <Link key={product.id} href={`/san-pham/${product.slug}`} className="group flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4 last:border-0"><div><p className="text-sm font-bold text-[#e5e2e1] group-hover:text-[#d4af37]">{product.name}</p><p className="mt-1 text-xs text-[#707474]">{product.brand} / {product.category}</p></div><span className="text-xs text-[#858989]">{product.inStock ? 'Đang bán' : 'Tạm ẩn'}</span></Link>)}</div></section><section className="sonic-panel p-6"><div className="flex items-start justify-between"><div><p className="sonic-label">SEO / Content gaps</p><h2 className="mt-3 text-2xl font-bold tracking-[-0.04em]">{insights.uncoveredKeywords.length} keyword chưa phủ.</h2></div><Link href="/admin/seo/strategy" className="text-[#d4af37]"><ArrowUpRight size={17} /></Link></div><div className="mt-6 grid gap-3 text-sm">{insights.uncoveredKeywords.slice(0, 5).map(({ keyword }) => <p key={keyword.id} className="flex justify-between gap-4 border-t border-white/10 pt-3"><span>{keyword.term}</span><span className="text-xs text-[#707474]">{keyword.cluster}</span></p>)}{insights.cannibalizedKeywords.length > 0 && <p className="border-t border-red-300/20 pt-3 text-xs text-red-200">{insights.cannibalizedKeywords.length} keyword có nguy cơ cannibalization.</p>}</div></section></div>
  </div>
}
