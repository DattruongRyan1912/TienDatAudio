import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, Headphones, MessageCircle, Phone, ShieldCheck, SlidersHorizontal, Sparkles, Truck, Wrench } from 'lucide-react'
import SonicProductCard from '@/components/sonic/SonicProductCard'
import SonicSolutionCard from '@/components/sonic/SonicSolutionCard'
import SonicReveal from '@/components/sonic/SonicReveal'
import SonicSectionHeading from '@/components/sonic/SonicSectionHeading'
import { getCategories, getFeaturedProducts, getPosts } from '@/lib/catalog'
import SocialPostCard from '@/components/social/SocialPostCard'
import { listSocialPosts } from '@/modules/social/application/social-post-service'
import { generateSEOMetadata } from '@/lib/seo'
import HomeKaraokeCalculator from '@/components/home/HomeKaraokeCalculator'

export const metadata: Metadata = generateSEOMetadata({
  pagePath: '/',
  title: 'Tiến Đạt Audio — Dàn Karaoke Gia Đình & Âm Thanh Quảng Ngãi',
  description: 'Chuyên cung cấp dàn karaoke gia đình, loa, vang số chống hú, cục đẩy công suất chính hãng tại Quảng Ngãi. Lắp đặt tận nơi, cắt hú 100%, bảo hành 2 năm 24/7. Showroom 264 Phan Đình Phùng. Hotline: 0934 995 657.',
  keywords: [
    'dàn karaoke gia đình Quảng Ngãi',
    'dàn karaoke Quảng Ngãi',
    'thiết bị âm thanh Quảng Ngãi',
    'loa Quảng Ngãi',
    'vang số chống hú Quảng Ngãi',
    'loa karaoke Quảng Ngãi',
    'Tiến Đạt Audio',
  ],
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
      {/* Real Commercial Hero Banner */}
      <section className="relative isolate overflow-hidden border-b border-[var(--sonic-line)] bg-gradient-to-b from-[var(--sonic-surface)] via-[var(--sonic-surface-strong)] to-[var(--sonic-surface)] pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="sonic-container">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            
            {/* Left Column: Commercial Hook & CTAs */}
            <SonicReveal className="lg:col-span-7" direction="left">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--sonic-gold)]/40 bg-[var(--sonic-gold)]/10 px-3.5 py-1 text-xs font-bold text-[var(--sonic-gold)] tracking-wide uppercase">
                🔥 ĐẠI LÝ CHÍNH HÃNG TẠI QUẢNG NGÃI
              </span>
              
              <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--sonic-text-strong)] sm:text-4xl md:text-5xl lg:leading-[1.15]">
                DÀN KARAOKE GIA ĐÌNH<br />
                <span className="text-[var(--sonic-gold)]">HÁT NHẸ HƠI — CẮT HÚ 100% — GIÁ TẬN KHO</span>
              </h1>
              
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--sonic-muted)] md:text-lg">
                Phối ghép chuẩn âm học cho phòng khách nhà ống miền Trung. 
                <strong> Trải nghiệm nghe thử thực tế tại showroom 264 Phan Đình Phùng, TP Quảng Ngãi</strong> trước khi quyết định. 
                Kỹ thuật viên đo đạc RTA và lắp đặt tận nhà toàn tỉnh.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="tel:0934995657"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--sonic-gold)] px-6 py-3.5 text-sm font-extrabold text-[var(--sonic-button-text)] shadow-lg shadow-[var(--sonic-gold)]/20 transition-transform hover:-translate-y-0.5"
                >
                  <Phone size={17} /> GỌI TƯ VẤN: 0934 995 657
                </a>
                
                <a
                  href="https://zalo.me/0934995657"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0068ff] px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-[#0068ff]/20 transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle size={17} /> CHAT ZALO BÁO GIÁ
                </a>
                
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--sonic-line-strong)] bg-[var(--sonic-surface)] px-4 py-3.5 text-sm font-bold text-[var(--sonic-text-strong)] hover:border-[var(--sonic-gold)] transition-colors"
                >
                  Xem Báo Giá Trọn Bộ <ArrowUpRight size={16} />
                </Link>
              </div>

              {/* 4 Golden Trust Badges */}
              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--sonic-gold)]">
                    <ShieldCheck size={16} /> 100% Chính Hãng
                  </div>
                  <p className="mt-1 text-[0.68rem] text-[var(--sonic-muted)]">Đền gấp đôi nếu hàng nhái</p>
                </div>

                <div className="rounded-lg border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--sonic-gold)]">
                    <Wrench size={16} /> Cắt Hú 100%
                  </div>
                  <p className="mt-1 text-[0.68rem] text-[var(--sonic-muted)]">Căn chỉnh RTA tận nhà</p>
                </div>

                <div className="rounded-lg border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--sonic-gold)]">
                    <Truck size={16} /> Lắp Trong 2 Giờ
                  </div>
                  <p className="mt-1 text-[0.68rem] text-[var(--sonic-muted)]">Toàn tỉnh Quảng Ngãi</p>
                </div>

                <div className="rounded-lg border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[var(--sonic-gold)]">
                    <CheckCircle2 size={16} /> Đổi Mới 30 Ngày
                  </div>
                  <p className="mt-1 text-[0.68rem] text-[var(--sonic-muted)]">Bảo hành 2 năm 24/7</p>
                </div>
              </div>
            </SonicReveal>

            {/* Right Column: Featured Best-Selling Combo Card */}
            <SonicReveal className="lg:col-span-5" direction="right">
              <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--sonic-gold)]/60 bg-[var(--sonic-surface-strong)] p-6 shadow-2xl">
                <div className="absolute top-4 right-4 rounded-full bg-[var(--sonic-gold)] px-3 py-1 text-[0.65rem] font-black uppercase text-[var(--sonic-button-text)] shadow-md">
                  ⭐ BÁN CHẠY NHẤT
                </div>

                <div className="relative aspect-[1.3] w-full overflow-hidden rounded-xl border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-6">
                  <Image
                    src="/uploads/1757873177981_wez3lmbcclj.jpg"
                    alt="Dàn karaoke gia đình bán chạy ARF Tiến Đạt Audio"
                    fill
                    priority
                    sizes="(min-width: 1024px) 35vw, 100vw"
                    className="object-contain p-4"
                  />
                </div>

                <div className="mt-5">
                  <span className="text-[0.68rem] font-bold uppercase tracking-wider text-[var(--sonic-gold)]">
                    Combo Phối Ghép Tiêu Chuẩn (Phòng 20 - 35m²)
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-[var(--sonic-text-strong)] md:text-xl">
                    Bộ Dàn Karaoke Gia Đình ARF Gold 02
                  </h3>
                  
                  <div className="mt-3 flex items-baseline gap-3">
                    <span className="text-2xl font-black text-[var(--sonic-gold)]">28.900.000đ</span>
                    <span className="text-sm text-[var(--sonic-muted)] line-through">34.500.000đ</span>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-500">Tiết kiệm 5.6tr</span>
                  </div>

                  <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                    🎁 <strong>Khuyến mãi hôm nay:</strong> Tặng 20m dây loa đồng OFC + 2 chống lăn micro + Miễn phí vận chuyển & căn chỉnh RTA tại nhà.
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2.5">
                    <a
                      href="tel:0934995657"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--sonic-gold)] bg-[var(--sonic-gold)]/10 py-2.5 text-xs font-bold text-[var(--sonic-gold)] hover:bg-[var(--sonic-gold)] hover:text-[var(--sonic-button-text)] transition-colors"
                    >
                      <Phone size={14} /> Đặt lịch nghe thử
                    </a>
                    <a
                      href="https://zalo.me/0934995657"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0068ff] py-2.5 text-xs font-bold text-white hover:bg-[#0056d6] transition-colors"
                    >
                      <MessageCircle size={14} /> Báo giá trọn gói
                    </a>
                  </div>
                </div>
              </div>
            </SonicReveal>

          </div>
        </div>
      </section>

      {/* Quick Category Filter Pills */}
      <section className="border-b border-[var(--sonic-line)] bg-[var(--sonic-surface)] py-5">
        <div className="sonic-container flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-[var(--sonic-muted)]">
            Xem nhanh theo nhu cầu:
          </span>
          <Link href="/products" className="shrink-0 rounded-full border border-[var(--sonic-gold)] bg-[var(--sonic-gold)]/10 px-4 py-1.5 text-xs font-bold text-[var(--sonic-gold)]">
            Tất Cả Thiết Bị
          </Link>
          <Link href="/products?category=loa-thung" className="shrink-0 rounded-full border border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] px-4 py-1.5 text-xs font-semibold text-[var(--sonic-text)] hover:border-[var(--sonic-gold)]">
            Loa Karaoke Bass 30
          </Link>
          <Link href="/products?category=vang-so" className="shrink-0 rounded-full border border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] px-4 py-1.5 text-xs font-semibold text-[var(--sonic-text)] hover:border-[var(--sonic-gold)]">
            Vang Số Cắt Hú Rời
          </Link>
          <Link href="/products?category=main-cong-suat" className="shrink-0 rounded-full border border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] px-4 py-1.5 text-xs font-semibold text-[var(--sonic-text)] hover:border-[var(--sonic-gold)]">
            Cục Đẩy Công Suất
          </Link>
          <Link href="/loa-quang-ngai" className="shrink-0 rounded-full border border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] px-4 py-1.5 text-xs font-semibold text-[var(--sonic-text)] hover:border-[var(--sonic-gold)]">
            Loa Quảng Ngãi Giá Kho
          </Link>
        </div>
      </section>

      {/* Featured Catalog Products */}
      <section className="sonic-container py-20 md:py-28">
        <SonicReveal>
          <SonicSectionHeading
            label="01 / Sản phẩm tiêu biểu"
            title="Thiết bị âm thanh chính hãng, sẵn hàng nghe thử."
            copy="Từ loa full chuyên nghiệp đến vang số chống hú rít và cục đẩy công suất cao — sẵn sàng phối ghép tại showroom 264 Phan Đình Phùng."
            href="/products"
            linkLabel="Xem toàn bộ danh mục"
          />
        </SonicReveal>
        <div className={`mt-12 grid gap-4 sm:grid-cols-2 ${featuredGridColumns}`}>
          {featuredProducts.length > 0 ? featuredProducts.map((product, index) => (
            <SonicReveal key={product.id} className="h-full" delay={Math.min(index * 0.08, 0.24)}>
              <SonicProductCard product={product} featured={index === 0} variant="home" eyebrow={product.featured ? 'Tuyển chọn' : `${String(index + 1).padStart(2, '0')} / ${product.category || 'Thiết bị'}`} />
            </SonicReveal>
          )) : <div className="sonic-panel col-span-full p-10 text-[#9ea2a2]">Danh mục đang được cập nhật. Liên hệ hotline 0934 995 657 để nhận báo giá.</div>}
        </div>
      </section>

      {/* Interactive Calculator Section */}
      <section className="sonic-container pb-20 md:pb-28">
        <SonicReveal>
          <HomeKaraokeCalculator />
        </SonicReveal>
      </section>

      {/* Solutions / Categories */}
      <section id="solutions" className="border-y border-[var(--sonic-line)] bg-[var(--sonic-surface)] py-20 md:py-28">
        <div className="sonic-container">
          <SonicReveal>
            <SonicSectionHeading
              label="02 / Giải pháp"
              title="Phối ghép theo đúng không gian sử dụng của bạn."
              copy="Dàn karaoke gia đình phòng khách, âm thanh cafe sân vườn hay hội trường sự kiện — chúng tôi thiết kế cấu hình tối ưu chi phí và độ bền."
              href="/contact"
              linkLabel="Trao đổi nhu cầu"
            />
          </SonicReveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
            {categories.slice(0, 6).map((category, index) => (
              <SonicReveal key={category.id} delay={Math.min(index * 0.07, 0.28)} className={`h-full ${index === 0 ? 'lg:col-span-5' : index === 1 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                <SonicSolutionCard category={category} index={index} featured={index === 0} />
              </SonicReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Real Customer Feedback in Quang Ngai */}
      <section className="sonic-container py-20 md:py-28">
        <SonicReveal>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="sonic-label">03 / Thực tế công trình</p>
              <h2 className="sonic-title mt-4">Khách hàng thực tế tại Quảng Ngãi đã lắp đặt</h2>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--sonic-gold)] hover:underline">
              Đặt lịch khảo sát tận nhà <ArrowUpRight size={15} />
            </Link>
          </div>
        </SonicReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <SonicReveal delay={0.08}>
            <div className="rounded-xl border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sonic-gold)]/10 text-sm font-black text-[var(--sonic-gold)]">
                  MH
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--sonic-text-strong)]">Chú Minh Hùng</h4>
                  <p className="text-xs text-[var(--sonic-muted)]">📍 P. Nghĩa Lộ, TP Quảng Ngãi</p>
                </div>
              </div>
              <div className="mt-3 text-amber-500 text-sm">★★★★★</div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--sonic-muted)] italic">
                &ldquo;Nhà tôi kiểu nhà ống 4x16m, trước đây mua bộ loa bãi hát bị rít nhức đầu. Đổi qua bộ ARF bên Tiến Đạt, anh em kỹ thuật đo đạc phần mềm máy tính cắt hết tiếng hú. Giờ cả nhà hát nhẹ re, rất ưng ý!&rdquo;
              </p>
            </div>
          </SonicReveal>

          <SonicReveal delay={0.16}>
            <div className="rounded-xl border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sonic-gold)]/10 text-sm font-black text-[var(--sonic-gold)]">
                  VT
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--sonic-text-strong)]">Anh Văn Tuấn</h4>
                  <p className="text-xs text-[var(--sonic-muted)]">📍 TT Châu Ổ, Huyện Bình Sơn</p>
                </div>
              </div>
              <div className="mt-3 text-amber-500 text-sm">★★★★★</div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--sonic-muted)] italic">
                &ldquo;Được ông bạn giới thiệu ra 264 Phan Đình Phùng nghe thử. 2 tiếng đồng hồ thử đủ dòng loa mới chốt bộ 29 triệu. Chiều thợ chở ra tận Bình Sơn lắp đặt, đi dây gọn gàng, test nhạc căng đét.&rdquo;
              </p>
            </div>
          </SonicReveal>

          <SonicReveal delay={0.24}>
            <div className="rounded-xl border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sonic-gold)]/10 text-sm font-black text-[var(--sonic-gold)]">
                  TM
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--sonic-text-strong)]">Chị Thanh Mai</h4>
                  <p className="text-xs text-[var(--sonic-muted)]">📍 Xã Đức Thạnh, Huyện Mộ Đức</p>
                </div>
              </div>
              <div className="mt-3 text-amber-500 text-sm">★★★★★</div>
              <p className="mt-3 text-xs leading-relaxed text-[var(--sonic-muted)] italic">
                &ldquo;Mua bộ karaoke về biếu ba mẹ ở quê hát mừng thọ. Nhân viên tư vấn đúng nhu cầu chứ không vẽ vời thêm đồ thừa. Có thắc mắc gọi Zalo là kỹ thuật hướng dẫn tận tình ngay.&rdquo;
              </p>
            </div>
          </SonicReveal>
        </div>
      </section>

      {/* Showroom Experience & Real Tuning */}
      <section id="projects" className="border-t border-[var(--sonic-line)] bg-[var(--sonic-surface)] py-20 md:py-28">
        <div className="sonic-container">
          <div className="grid items-center gap-10 md:grid-cols-[1.05fr_.95fr] md:gap-16">
            <SonicReveal direction="left" className="sonic-media-surface relative aspect-[1.08] overflow-hidden border border-[var(--sonic-line)] rounded-xl">
              <Image src="/images/sonic-hero.png" alt="Showroom âm thanh Tiến Đạt Audio 264 Phan Đình Phùng Quảng Ngãi" fill sizes="(min-width: 768px) 50vw, 100vw" className="sonic-image-hover object-cover" />
              <div className="sonic-media-plate absolute bottom-5 left-5 px-4 py-3 rounded-lg bg-black/70 backdrop-blur-md">
                <p className="sonic-label text-[var(--sonic-gold)]">Showroom Trải Nghiệm</p>
                <p className="sonic-media-copy mt-1 text-sm font-bold text-white">264 Phan Đình Phùng, TP Quảng Ngãi</p>
              </div>
            </SonicReveal>
            <SonicReveal direction="right">
              <p className="sonic-label">04 / Trải nghiệm thực tế</p>
              <h2 className="sonic-title mt-5">Nghe thử thực tế để chọn đúng thứ bạn cần.</h2>
              <p className="sonic-copy mt-6">
                Tại showroom Tiến Đạt Audio, bạn có thể nghe thử trực tiếp, đối chiếu chất âm của từng dòng loa, cầm micro hát thử và trao đổi trực tiếp với kỹ thuật viên về phương án lắp đặt cho phòng khách nhà mình.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3 md:grid-cols-1">
                {[
                  [Headphones, 'Nghe thử thực tế', 'Thử các thể loại nhạc từ Bolero đến Remix'],
                  [SlidersHorizontal, 'Cân chỉnh bằng máy tính', 'Đo đạc RTA cắt hú rít triệt để'],
                  [Sparkles, 'Tư vấn đúng ngân sách', 'Không bán hàng thừa công suất'],
                ].map(([Icon, label, desc]) => {
                  const Component = Icon as typeof Headphones
                  return (
                    <div key={label as string} className="flex items-center gap-4 border-t border-[var(--sonic-line)] pt-4">
                      <Component size={20} className="text-[var(--sonic-gold)] shrink-0" />
                      <div>
                        <span className="text-sm font-bold text-[var(--sonic-text-strong)]">{label as string}</span>
                        <p className="text-xs text-[var(--sonic-muted)]">{desc as string}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/contact" className="sonic-button sonic-button-gold">
                  Đặt lịch tại showroom <ArrowUpRight size={16} />
                </Link>
                <a href="tel:0934995657" className="sonic-button sonic-button-ghost">
                  Hotline: 0934 995 657
                </a>
              </div>
            </SonicReveal>
          </div>
        </div>
      </section>

      {/* Knowledge Articles */}
      <section className="border-t border-[var(--sonic-line)] py-20 md:py-28">
        <div className="sonic-container">
          <SonicReveal>
            <SonicSectionHeading
              label="05 / Kiến thức âm thanh"
              title="Kinh nghiệm căn chỉnh & Chọn thiết bị thực chiến."
              copy="Hướng dẫn cắt hú rít, tính toán công suất cục đẩy và xử lý âm học phòng khách nhà ống từ kỹ sư âm thanh."
              href="/kien-thuc"
              linkLabel="Đọc tất cả bài viết"
            />
          </SonicReveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {posts.slice(0, 3).map((post, index) => (
              <SonicReveal key={post.id} delay={index * 0.08}>
                <Link href={`/kien-thuc/${post.slug}`} className="group block rounded-xl border border-[var(--sonic-line)] bg-[var(--sonic-surface)] p-6 transition-all hover:border-[var(--sonic-gold)]">
                  <div className="flex items-center justify-between">
                    <span className="sonic-label text-[var(--sonic-gold)]">0{index + 1} / {post.category}</span>
                    <ArrowUpRight size={16} className="text-[var(--sonic-muted)] transition-colors group-hover:text-[var(--sonic-gold)]" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold leading-snug text-[var(--sonic-text-strong)] transition-colors group-hover:text-[var(--sonic-gold)]">
                    {post.title}
                  </h3>
                  <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[var(--sonic-muted)]">
                    {post.excerpt}
                  </p>
                  <p className="mt-4 text-[0.62rem] font-bold uppercase tracking-wider text-[var(--sonic-muted)]">
                    {post.readingTime || 5} phút đọc • Kỹ thuật thực tế
                  </p>
                </Link>
              </SonicReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Social Feed (if enabled) */}
      {socialFeed.items.length > 0 && (
        <section className="border-t border-[var(--sonic-line)] bg-[var(--sonic-surface)] py-20 md:py-28">
          <div className="sonic-container">
            <SonicReveal>
              <SonicSectionHeading
                label="06 / Góc Audio"
                title="Những công trình thực tế vừa bàn giao."
                copy="Hình ảnh lắp đặt trực tiếp tại các gia đình Quảng Ngãi và sản phẩm mới cập bến showroom."
                href="/bai-viet"
                linkLabel="Xem thêm công trình"
              />
            </SonicReveal>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {socialFeed.items.map((post, index) => (
                <SonicReveal key={post.id} delay={index * 0.08}>
                  <SocialPostCard post={post} />
                </SonicReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA Banner */}
      <section className="sonic-container py-20 md:py-28">
        <SonicReveal direction="scale">
          <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--sonic-gold)]/50 bg-[var(--sonic-surface-strong)] px-6 py-12 md:px-16 md:py-16 text-center">
            <h2 className="text-2xl font-black text-[var(--sonic-text-strong)] sm:text-3xl md:text-4xl">
              Bạn đang cần tìm dàn âm thanh cho không gian nào?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--sonic-muted)] md:text-base">
              Gọi ngay hotline hoặc nhắn Zalo để kỹ thuật viên tư vấn phối ghép cấu hình chuẩn, nhận báo giá chi tiết và lịch nghe thử miễn phí tại 264 Phan Đình Phùng.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="tel:0934995657"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--sonic-gold)] px-6 py-3.5 text-sm font-extrabold text-[var(--sonic-button-text)] shadow-lg shadow-[var(--sonic-gold)]/20 transition-transform hover:-translate-y-0.5"
              >
                <Phone size={17} /> GỌI NGAY: 0934 995 657
              </a>
              <a
                href="https://zalo.me/0934995657"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0068ff] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[#0068ff]/20 transition-transform hover:-translate-y-0.5"
              >
                <MessageCircle size={17} /> CHAT QUA ZALO
              </a>
            </div>
          </div>
        </SonicReveal>
      </section>
    </div>
  )
}
