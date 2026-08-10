import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowUpRight, Headphones, SlidersHorizontal, Sparkles } from 'lucide-react'
import SonicProductCard from '@/components/sonic/SonicProductCard'
import SonicSolutionCard from '@/components/sonic/SonicSolutionCard'
import SonicReveal from '@/components/sonic/SonicReveal'
import SonicSectionHeading from '@/components/sonic/SonicSectionHeading'
import { getCategories, getFeaturedProducts, getPosts } from '@/lib/catalog'
import SocialPostCard from '@/components/social/SocialPostCard'
import { listSocialPosts } from '@/modules/social/application/social-post-service'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/',
  title: 'Tiến Đạt Audio — Âm thanh được tuyển chọn',
  description: 'Tư vấn, phối ghép và triển khai hệ thống âm thanh cao cấp tại Quảng Ngãi.',
})

export default async function HomePage() {
  const [featuredProducts, categories, posts, socialFeed] = await Promise.all([
    getFeaturedProducts(4),
    getCategories(),
    getPosts(),
    listSocialPosts({ limit: 3 }),
  ])
  const featuredGridColumns = featuredProducts.length <= 3 ? 'xl:grid-cols-3' : 'xl:grid-cols-4'

  return (
    <div className="sonic-page">
      <section className="sonic-media-surface relative isolate flex min-h-[760px] items-end overflow-hidden border-b border-white/10 pt-28 md:min-h-[850px] md:items-center">
        <Image src="/images/sonic-hero.png" alt="Loa hi-end trong không gian nghe nhạc tối" fill priority sizes="100vw" className="sonic-hero-image -z-20 object-cover object-[64%_center] md:object-center" />
        <div className="sonic-hero-glow absolute -z-10 h-72 w-72 rounded-full" />
        <div className="sonic-container relative z-10 w-full pb-16 md:pb-0">
          <SonicReveal className="sonic-media-content max-w-3xl" direction="left">
            <p className="sonic-label">Sonic Purity / Tiến Đạt Audio</p>
            <h1 className="sonic-display mt-6 max-w-3xl">Âm thanh không chỉ để nghe.<br /><span className="sonic-media-accent">Đó là một trải nghiệm.</span></h1>
            <p className="sonic-media-copy-muted mt-7 max-w-xl text-base leading-7 md:text-lg">Bộ sưu tập thiết bị được tuyển chọn và phối ghép cho những không gian cần âm thanh có chiều sâu, rõ ràng và đầy cảm xúc.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/products" className="sonic-button sonic-button-gold">Khám phá sản phẩm <ArrowUpRight size={16} /></Link>
              <Link href="/contact" className="sonic-button sonic-button-ghost">Đặt lịch trải nghiệm</Link>
            </div>
          </SonicReveal>
          <div className="sonic-media-copy-muted mt-14 flex items-center gap-4 text-[0.62rem] font-bold uppercase tracking-[0.18em] md:absolute md:bottom-10 md:right-0 md:mt-0">
            <ArrowDown size={14} className="sonic-media-accent" /> Cuộn để khám phá
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0b0b0b]">
        <div className="sonic-container grid gap-6 py-7 sm:grid-cols-3 md:py-9">
          {[
            ['01', 'Tư vấn cá nhân', 'Hiểu nhu cầu trước khi chọn thiết bị'],
            ['02', 'Phối ghép chuẩn', 'Cân bằng không gian, nguồn và công suất'],
            ['03', 'Hậu mãi tận tâm', 'Lắp đặt, cân chỉnh và đồng hành dài lâu'],
          ].map(([number, title, copy], index) => (
            <SonicReveal key={number} className="flex gap-4 border-l border-white/15 pl-4 first:border-[#d4af37]" delay={index * 0.08}>
              <span className="sonic-label text-[#858989]">{number}</span>
              <div><p className="text-sm font-bold text-[#e5e2e1]">{title}</p><p className="mt-1 text-xs leading-5 text-[#858989]">{copy}</p></div>
            </SonicReveal>
          ))}
        </div>
      </section>

      <section className="sonic-container py-24 md:py-32">
        <SonicReveal>
          <SonicSectionHeading label="01 / Bộ sưu tập" title="Những thiết bị làm nên một không gian nghe tốt." copy="Từ loa thùng chuyên nghiệp đến xử lý tín hiệu chính xác — mỗi sản phẩm đều được chọn vì vai trò của nó trong một hệ thống hoàn chỉnh." href="/products" linkLabel="Xem toàn bộ sản phẩm" />
        </SonicReveal>
        <div className={`mt-14 grid gap-4 sm:grid-cols-2 ${featuredGridColumns}`}>
          {featuredProducts.length > 0 ? featuredProducts.map((product, index) => (
            <SonicReveal key={product.id} className="h-full" delay={Math.min(index * 0.08, 0.24)}>
              <SonicProductCard product={product} featured={index === 0} variant="home" eyebrow={product.featured ? 'Tuyển chọn' : `${String(index + 1).padStart(2, '0')} / ${product.category || 'Thiết bị'}`} />
            </SonicReveal>
          )) : <div className="sonic-panel col-span-full p-10 text-[#9ea2a2]">Danh mục đang được cập nhật. Liên hệ để nhận danh sách thiết bị mới nhất.</div>}
        </div>
      </section>

      <section id="solutions" className="border-y border-white/10 bg-[#0d0d0d] py-24 md:py-32">
        <div className="sonic-container">
          <SonicReveal>
            <SonicSectionHeading label="02 / Giải pháp" title="Một hệ thống tốt bắt đầu từ đúng câu hỏi." copy="Không gian gia đình, phòng karaoke, cafe hay sân khấu — chúng tôi thiết kế cấu hình theo cách bạn thực sự sử dụng âm thanh." href="/contact" linkLabel="Trao đổi nhu cầu" />
          </SonicReveal>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
            {categories.slice(0, 6).map((category, index) => (
              <SonicReveal key={category.id} delay={Math.min(index * 0.07, 0.28)} className={`h-full ${index === 0 ? 'lg:col-span-5' : index === 1 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                <SonicSolutionCard category={category} index={index} featured={index === 0} />
              </SonicReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="sonic-container py-20 md:py-28">
        <div className="grid items-center gap-10 md:grid-cols-[1.05fr_.95fr] md:gap-16">
          <SonicReveal direction="left" className="sonic-media-surface relative aspect-[1.08] overflow-hidden border border-white/10">
            <Image src="/images/sonic-hero.png" alt="Không gian nghe nhạc được phối ghép" fill sizes="(min-width: 768px) 50vw, 100vw" className="sonic-image-hover object-cover" />
            <div className="sonic-media-plate absolute bottom-5 left-5 px-4 py-3"><p className="sonic-label">Listening room / 2025</p><p className="sonic-media-copy mt-1 text-sm font-bold">Một hệ thống, một cá tính.</p></div>
          </SonicReveal>
          <SonicReveal direction="right">
            <p className="sonic-label">03 / Trải nghiệm</p>
            <h2 className="sonic-title mt-5">Nghe đúng cách để chọn đúng thứ.</h2>
            <p className="sonic-copy mt-6">Tại showroom Tiến Đạt Audio, bạn có thể nghe thử, so sánh và trao đổi trực tiếp về hệ thống phù hợp với gu nhạc, không gian và ngân sách của mình.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3 md:grid-cols-1">
              {[[Headphones, 'Nghe thử thực tế'], [SlidersHorizontal, 'Cân chỉnh tại chỗ'], [Sparkles, 'Đề xuất có lý do']].map(([Icon, label]) => { const Component = Icon as typeof Headphones; return <div key={label as string} className="flex items-center gap-4 border-t border-white/10 pt-4"><Component size={18} className="text-[#d4af37]" /><span className="text-sm font-semibold text-[#c4c7c7]">{label as string}</span></div> })}
            </div>
            <Link href="/contact" className="sonic-button sonic-button-gold mt-9">Đặt lịch tại showroom <ArrowUpRight size={16} /></Link>
          </SonicReveal>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0d0d0d] py-20 md:py-28">
        <div className="sonic-container">
          <SonicReveal>
            <SonicSectionHeading label="04 / Kiến thức" title="Nghe sâu hơn. Chọn tự tin hơn." href="/kien-thuc" linkLabel="Đọc kiến thức" />
          </SonicReveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {posts.slice(0, 3).map((post, index) => (
              <SonicReveal key={post.id} delay={index * 0.08}>
                <Link href={`/kien-thuc/${post.slug}`} className="group block border-t border-white/15 pt-5">
                  <div className="flex items-center justify-between"><span className="sonic-label text-[#858989]">0{index + 1} / {post.category}</span><ArrowUpRight size={16} className="text-[#858989] transition-colors group-hover:text-[#d4af37]" /></div>
                  <h3 className="mt-6 text-xl font-bold leading-tight tracking-[-0.03em] text-[#e5e2e1] transition-colors group-hover:text-[#d4af37]">{post.title}</h3>
                  <p className="mt-4 text-sm leading-6 text-[#9ea2a2]">{post.excerpt}</p>
                  <p className="mt-6 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-[#707474]">{post.readingTime || 5} phút đọc</p>
                </Link>
              </SonicReveal>
            ))}
          </div>
        </div>
      </section>

      {socialFeed.items.length > 0 && <section className="sonic-container py-20 md:py-28">
        <SonicReveal>
          <SonicSectionHeading label="05 / Góc Audio" title="Những gì đang diễn ra ngoài showroom." copy="Cập nhật nhanh từ các hệ thống đã lắp đặt, sản phẩm mới và trải nghiệm nghe thực tế." href="/bai-viet" linkLabel="Xem Social Hub" />
        </SonicReveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">{socialFeed.items.map((post, index) => <SonicReveal key={post.id} delay={index * 0.08}><SocialPostCard post={post} /></SonicReveal>)}</div>
      </section>}

      <section className="sonic-container py-20 md:py-28">
        <SonicReveal direction="scale">
          <div className="relative overflow-hidden border border-[#d4af37]/40 bg-[#111111] px-6 py-12 md:px-16 md:py-16">
            <div className="sonic-cta-glow absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#d4af37]/10 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div><p className="sonic-label">05 / Bắt đầu từ cuộc trò chuyện</p><h2 className="sonic-title mt-5 max-w-2xl">Bạn đang tìm kiếm âm thanh cho không gian nào?</h2></div>
            <Link href="/contact" className="sonic-button sonic-button-gold shrink-0">Nhận tư vấn riêng <ArrowUpRight size={16} /></Link>
          </div>
          </div>
        </SonicReveal>
      </section>
    </div>
  )
}
