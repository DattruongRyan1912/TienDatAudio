import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, MessageCircle, Phone } from 'lucide-react'
import SonicProductCard from '@/components/sonic/SonicProductCard'
import { getFeaturedProducts, getPosts } from '@/lib/catalog'
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
  const [featuredProducts, posts] = await Promise.all([
    getFeaturedProducts(8),
    getPosts(),
  ])

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800">
      {/* 1. Hero Banner (Exact match with Demo) */}
      <section className="border-b border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 py-8 md:py-14">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
            
            {/* Left: Commercial Hook & CTAs */}
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fee2e2] px-3.5 py-1 text-xs font-bold text-[#b91c1c]">
                🔥 ĐẠI LÝ CHÍNH HÃNG TẠI QUẢNG NGÃI
              </span>
              
              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-[40px] lg:leading-[1.15]">
                DÀN KARAOKE GIA ĐÌNH<br />
                <span className="text-[#d32f2f]">HÁT NHẸ HƠI — CẮT HÚ 100% — GIÁ TẬN KHO</span>
              </h1>
              
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                Phối ghép chuẩn âm học cho phòng khách nhà ống miền Trung. 
                <strong className="text-slate-800"> Trải nghiệm nghe thử thực tế tại 264 Phan Đình Phùng, TP Quảng Ngãi</strong> trước khi quyết định. 
                Đội ngũ kỹ sư đo đạc âm học RTA và bàn giao tận nhà toàn tỉnh.
              </p>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="tel:0934995657"
                  className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] px-6 py-3 text-sm font-black text-white shadow-md shadow-[#d32f2f]/30 transition-transform hover:-translate-y-0.5"
                >
                  <Phone size={17} /> GỌI TƯ VẤN: 0934 995 657
                </a>
                
                <a
                  href="https://zalo.me/0934995657"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-[#0068ff] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#0068ff]/30 transition-transform hover:-translate-y-0.5"
                >
                  <MessageCircle size={17} /> CHAT ZALO BÁO GIÁ NHANH
                </a>
              </div>

              {/* 4 Trust Badges */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Chính Hãng 100%</p>
                    <p className="text-[11px] text-slate-600">Đền 200% nếu hàng giả</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                  <span className="text-xl">🎛️</span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Cắt Hú 100%</p>
                    <p className="text-[11px] text-slate-600">Căn chỉnh RTA tận nhà</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                  <span className="text-xl">🚚</span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Lắp Trong 2 Giờ</p>
                    <p className="text-[11px] text-slate-600">Toàn tỉnh Quảng Ngãi</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3 shadow-xs">
                  <span className="text-xl">🔄</span>
                  <div>
                    <p className="text-xs font-extrabold text-slate-900">Đổi Mới 30 Ngày</p>
                    <p className="text-[11px] text-slate-600">Bảo hành 2 năm 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Featured Best-Selling Combo Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl border-2 border-[#fed7aa] bg-white p-5 shadow-xl">
                <div className="absolute -top-3 left-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-600 px-3.5 py-1 text-[11px] font-black uppercase text-white shadow-md">
                  ⭐ COMBO BÁN CHẠY NHẤT 2026
                </div>

                <div className="relative aspect-[1.3] w-full overflow-hidden rounded-lg border border-slate-100 bg-[#f8fafc] p-4">
                  <Image
                    src="/uploads/1757873177981_wez3lmbcclj.jpg"
                    alt="Dàn karaoke gia đình bán chạy ARF Tiến Đạt Audio"
                    fill
                    priority
                    sizes="(min-width: 1024px) 35vw, 100vw"
                    className="object-contain p-2"
                  />
                </div>

                <div className="mt-4">
                  <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
                    Dàn Karaoke Gia Đình Tiêu Chuẩn TĐ-01 (Phòng 20 - 35m²)
                  </h2>
                  
                  <div className="mt-2.5 flex items-baseline gap-3">
                    <span className="text-2xl font-black text-[#d32f2f]">28.900.000đ</span>
                    <span className="text-sm text-slate-500 line-through">34.500.000đ</span>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">Tiết kiệm 5.6tr</span>
                  </div>

                  <div className="mt-3 rounded-md border border-dashed border-amber-400 bg-amber-50 p-2.5 text-xs text-amber-800">
                    🎁 <strong>Khuyến mãi hôm nay:</strong> Tặng bộ dây loa đồng OFC 20m + 2 chống lăn micro + Miễn phí vận chuyển & cân chỉnh tại nhà.
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <a
                      href="tel:0934995657"
                      className="flex items-center justify-center rounded-md border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-[#b91c1c] transition-colors hover:bg-red-100"
                    >
                      📞 Đặt Lịch Nghe Thử
                    </a>
                    <a
                      href="https://zalo.me/0934995657"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center rounded-md bg-[#0068ff] py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#0052cc]"
                    >
                      💬 Báo Giá Trọn Gói
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <main className="mx-auto max-w-[1240px] px-4 py-8">

        {/* Filter Pills by Customer Need */}
        <div className="mb-6 flex gap-2.5 overflow-x-auto pb-2 text-xs font-bold whitespace-nowrap scrollbar-none">
          <Link href="/products" className="rounded-full bg-[#d32f2f] px-4 py-2 text-white shadow-xs">
            🔥 Tất Cả Cấu Hình
          </Link>
          <Link href="/products?budget=under20" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:border-[#d32f2f] hover:text-[#d32f2f]">
            Dàn Dưới 20 Triệu (Tiết kiệm)
          </Link>
          <Link href="/products?budget=mid" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:border-[#d32f2f] hover:text-[#d32f2f]">
            Dàn 25 - 40 Triệu (Bán chạy)
          </Link>
          <Link href="/products?budget=pro" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:border-[#d32f2f] hover:text-[#d32f2f]">
            Dàn Trên 50 Triệu (Cao cấp)
          </Link>
          <Link href="/products?category=vang-so" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:border-[#d32f2f] hover:text-[#d32f2f]">
            Vang Số Cắt Hú Rời
          </Link>
          <Link href="/products?category=loa-sub" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-700 hover:border-[#d32f2f] hover:text-[#d32f2f]">
            Loa Sub Siêu Trầm
          </Link>
        </div>

        {/* Product Showcase Section */}
        <div className="mb-4 flex items-end justify-between border-b-2 border-slate-200 pb-2">
          <div className="relative">
            <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              Combo Dàn Karaoke Gia Đình Tuyển Chọn
            </h2>
            <div className="absolute -bottom-2.5 left-0 h-0.5 w-20 bg-[#d32f2f]"></div>
          </div>
          <Link href="/products" className="text-xs font-bold text-[#d32f2f] hover:underline sm:text-sm">
            Xem tất cả thiết bị &rarr;
          </Link>
        </div>

        {/* Product Grid */}
        <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <SonicProductCard
              key={product.id}
              product={product}
              featured={index === 0}
            />
          ))}
        </div>

        {/* Interactive Calculator Section */}
        <div className="mb-14">
          <HomeKaraokeCalculator />
        </div>

        {/* Real Customer Proof in Quang Ngai */}
        <div className="mb-14">
          <div className="mb-6 flex items-end justify-between border-b-2 border-slate-200 pb-2">
            <div className="relative">
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Khách Hàng Thực Tế Tại Quảng Ngãi Đã Lắp Đặt
              </h2>
              <div className="absolute -bottom-2.5 left-0 h-0.5 w-20 bg-[#d32f2f]"></div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-700">
                  MH
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Chú Minh Hùng</h3>
                  <p className="text-xs text-slate-500">📍 P. Nghĩa Lộ, TP Quảng Ngãi</p>
                </div>
              </div>
              <div className="mt-2 text-sm text-amber-600">★★★★★</div>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-600 italic">
                &ldquo;Nhà tôi kiểu nhà ống 4x16m, trước đây mua bộ loa bãi hát bị rít nhức đầu. Đổi qua bộ ARF bên Tiến Đạt, anh em kỹ thuật đo đạc phần mềm máy tính cắt hết tiếng hú. Giờ bà xã với mấy đứa nhỏ hát nhẹ re, rất ưng ý!&rdquo;
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-700">
                  VT
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Anh Văn Tuấn</h3>
                  <p className="text-xs text-slate-500">📍 TT Châu Ổ, Huyện Bình Sơn</p>
                </div>
              </div>
              <div className="mt-2 text-sm text-amber-600">★★★★★</div>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-600 italic">
                &ldquo;Được ông bạn giới thiệu ra 264 Phan Đình Phùng nghe thử. 2 tiếng đồng hồ thử đủ dòng loa mới chốt bộ 32 triệu. Chiều thợ chở ra tận Bình Sơn lắp đặt, đi dây âm tường gọn gàng, test nhạc căng đét.&rdquo;
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-700">
                  TM
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Chị Thanh Mai</h3>
                  <p className="text-xs text-slate-500">📍 Xã Đức Thạnh, Huyện Mộ Đức</p>
                </div>
              </div>
              <div className="mt-2 text-sm text-amber-600">★★★★★</div>
              <p className="mt-2.5 text-xs leading-relaxed text-slate-600 italic">
                &ldquo;Mua bộ karaoke về biếu ba mẹ ở quê hát mừng thọ. Nhân viên tư vấn đúng nhu cầu chứ không vẽ vời thêm đồ thừa. Có thắc mắc gọi Zalo là kỹ thuật hướng dẫn tận tình ngay.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Knowledge Articles Section */}
        <div className="mb-14">
          <div className="mb-6 flex items-end justify-between border-b-2 border-slate-200 pb-2">
            <div className="relative">
              <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                Kinh Nghiệm Căn Chỉnh & Chọn Thiết Bị Chuẩn Âm Học
              </h2>
              <div className="absolute -bottom-2.5 left-0 h-0.5 w-20 bg-[#d32f2f]"></div>
            </div>
            <Link href="/kien-thuc" className="text-xs font-bold text-[#d32f2f] hover:underline sm:text-sm">
              Đọc tất cả bài viết &rarr;
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                href={`/kien-thuc/${post.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-[#d32f2f] hover:shadow-md"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#d32f2f]">
                    {post.category || 'Kiến thức'}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-slate-900 transition-colors group-hover:text-[#d32f2f]">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                    {post.excerpt}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-500">
                  <span>{post.readingTime || 5} phút đọc • Kỹ thuật</span>
                  <ArrowUpRight size={15} className="text-[#d32f2f]" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Showroom Contact Banner */}
        <div className="rounded-2xl border-2 border-[#d32f2f] bg-gradient-to-r from-red-50 via-white to-red-50 p-6 text-center sm:p-10">
          <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
            Trải Nghiệm Trực Tiếp Tại Showroom Tiến Đạt Audio
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            📍 <strong>264 Phan Đình Phùng, TP Quảng Ngãi</strong> — Phòng thử âm học tiêu chuẩn, sẵn sàng các dòng loa ARF, Crown, DBX để quý khách test chất âm trước khi mua.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="tel:0934995657"
              className="inline-flex items-center gap-2 rounded-md bg-[#d32f2f] px-6 py-3 text-sm font-extrabold text-white shadow-md shadow-[#d32f2f]/30 transition-transform hover:-translate-y-0.5"
            >
              <Phone size={16} /> GỌI NGAY: 0934 995 657
            </a>
            <a
              href="https://zalo.me/0934995657"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-[#0068ff] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#0068ff]/30 transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle size={16} /> NHẮN ZALO TƯ VẤN
            </a>
          </div>
        </div>

      </main>
    </div>
  )
}
