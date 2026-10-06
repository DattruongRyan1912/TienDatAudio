import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen, Clock, MessageCircle, Phone, Search, Sparkles, User } from 'lucide-react'
import { getPublicPosts } from '@/lib/content-repository'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...generateSEOMetadata({
    pagePath: '/kien-thuc',
    title: 'Kiến Thức Âm Thanh & Hướng Dẫn Kỹ Thuật — Tiến Đạt Audio Quảng Ngãi',
    description: 'Tổng hợp hướng dẫn chỉnh vang số bằng máy tính, ghép nối cục đẩy công suất, chọn loa nghe nhạc phòng khách và cách xử lý lỗi loa bị rè dứt điểm.',
    keywords: [
      'kiến thức âm thanh Quảng Ngãi',
      'cách chỉnh vang số chống hú',
      'cách ghép nối vang số với cục đẩy',
      'loa bass bị rè',
      'dàn karaoke gia đình giá bao nhiêu',
      'Tiến Đạt Audio',
    ],
  }),
  alternates: { canonical: '/kien-thuc', types: { 'application/rss+xml': '/feed.xml' } },
}

export const revalidate = 300

export default async function KnowledgePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const [posts, params] = await Promise.all([getPublicPosts(200), searchParams])
  const query = String(params.q || '').trim().toLocaleLowerCase('vi')
  const filtered = query
    ? posts.filter((post) =>
        [post.title, post.excerpt, post.category, ...post.tags]
          .join(' ')
          .toLocaleLowerCase('vi')
          .includes(query)
      )
    : posts

  const [featured, ...rest] = filtered

  return (
    <div className="bg-[#f8fafc] pt-24 md:pt-32">
      {/* 1. Header Banner */}
      <section className="border-b border-slate-200 bg-white py-8 md:py-12">
        <div className="mx-auto max-w-[1240px] px-4">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-[#d32f2f]">Trang chủ</Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">Kiến Thức Âm Thanh</span>
          </nav>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#d32f2f]">
                <Sparkles size={13} />
                <span>Kinh Nghiệm Thực Tế Từ Thợ Âm Thanh</span>
              </div>
              <h1 className="mt-2.5 text-2xl font-black text-slate-900 md:text-3xl lg:text-4xl">
                Cẩm Nang & Kiến Thức Kỹ Thuật Âm Thanh
              </h1>
              <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
                Tổng hợp bài viết phân tích chuyên sâu về cách chọn thiết bị, căn chỉnh chống hú bằng phần mềm, nguyên lý âm học và bảo quản dàn karaoke gia đình.
              </p>
            </div>

            {/* Search Input */}
            <div className="w-full md:max-w-xs">
              <form action="/kien-thuc" className="relative">
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q || ''}
                  placeholder="Tìm bài viết kỹ thuật..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#d32f2f] focus:bg-white"
                />
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Content Body */}
      <section className="mx-auto max-w-[1240px] px-4 py-8 md:py-14">
        {!featured ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
            <BookOpen size={36} className="mx-auto text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-slate-900">
              Không tìm thấy bài viết phù hợp với “{params.q}”
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Hãy thử tìm kiếm với từ khóa khác như: vang số, loa rè, micro, karaoke...
            </p>
            <Link
              href="/kien-thuc"
              className="mt-4 inline-block rounded-lg bg-[#d32f2f] px-4 py-2 text-xs font-bold text-white hover:bg-[#b71c1c]"
            >
              Xem tất cả bài viết
            </Link>
          </div>
        ) : (
          <>
            {/* Featured Article Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow hover:shadow-lg">
              <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
                <div className="relative aspect-[1.3] w-full bg-slate-100 lg:aspect-auto">
                  <Image
                    src={featured.featuredImage || '/uploads/1757873177981_wez3lmbcclj.jpg'}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="rounded-md bg-[#d32f2f] px-3 py-1 text-xs font-black uppercase text-white shadow-sm">
                      Bài viết tiêu điểm
                    </span>
                  </div>
                </div>

                <div className="flex flex-col justify-between p-6 md:p-10">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#d32f2f]">
                      {featured.category}
                    </span>
                    <Link href={`/kien-thuc/${featured.slug}`}>
                      <h2 className="mt-2 text-xl font-black text-slate-900 transition-colors hover:text-[#d32f2f] sm:text-2xl md:text-3xl leading-snug">
                        {featured.title}
                      </h2>
                    </Link>
                    <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm line-clamp-3">
                      {featured.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          <User size={13} /> {featured.author}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={13} /> {featured.readingTime} phút đọc
                        </span>
                      </div>
                      <Link
                        href={`/kien-thuc/${featured.slug}`}
                        className="inline-flex items-center gap-1.5 font-bold text-[#d32f2f] hover:underline"
                      >
                        <span>Đọc tiếp</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Articles Grid */}
            <div className="mt-12">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 md:text-xl">
                  Tất Cả Bài Viết Hướng Dẫn ({rest.length + 1})
                </h3>
                <span className="text-xs text-slate-500">
                  Cập nhật liên tục từ showroom Tiến Đạt Audio
                </span>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <article
                    key={post.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all hover:shadow-lg hover:border-red-200"
                  >
                    <div>
                      <div className="relative aspect-[1.3] w-full overflow-hidden bg-slate-100">
                        <Image
                          src={post.featuredImage || '/uploads/1757873177981_wez3lmbcclj.jpg'}
                          alt={post.title}
                          fill
                          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 left-3 rounded-md bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                          {post.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <Link href={`/kien-thuc/${post.slug}`}>
                          <h4 className="line-clamp-2 text-base font-black text-slate-900 transition-colors group-hover:text-[#d32f2f]">
                            {post.title}
                          </h4>
                        </Link>
                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 p-5 pt-3.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} /> {post.readingTime} phút đọc
                        </span>
                        <Link
                          href={`/kien-thuc/${post.slug}`}
                          className="font-bold text-[#d32f2f] hover:underline"
                        >
                          Chi tiết &rarr;
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* 3. Bottom CTA Support Banner */}
      <section className="border-t border-slate-200 bg-white py-12 md:py-16">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="rounded-2xl border border-red-100 bg-gradient-to-r from-red-50 via-rose-50/60 to-orange-50/50 p-8 md:p-12 text-center">
            <span className="text-xs font-black uppercase tracking-wider text-[#d32f2f]">
              Hỗ Trợ Kỹ Thuật Miễn Phí
            </span>
            <h3 className="mt-2 text-2xl font-black text-slate-900 md:text-3xl">
              Dàn Máy Nhà Bạn Bị Hú Rít, Tiếng Bí Hoặc Loa Rè?
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-xs text-slate-600 sm:text-sm">
              Đừng ngần ngại liên hệ với kỹ thuật viên Tiến Đạt Audio để được tư vấn nguyên nhân và hướng dẫn xử lý từ xa hoặc tại nhà.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="https://zalo.me/0934995657?text=Xin%20ch%C3%A0o%20k%E1%BB%B9%20thu%E1%BA%ADt%20vi%C3%AAn%20Ti%E1%BA%BFn%20%C4%90%E1%BA%A1t%20Audio!%20D%C3%A0n%20m%C3%A1y%20nh%C3%A0%20t%C3%B4i%20%C4%91ang%20b%E1%BB%8B%20s%E1%BB%B1%20c%E1%BB%91."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0068ff] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#0068ff]/25 hover:bg-[#0052cc]"
              >
                <MessageCircle size={16} />
                <span>Nhắn Tin Zalo Kỹ Thuật</span>
              </a>
              <a
                href="tel:0934995657"
                className="inline-flex items-center gap-2 rounded-xl bg-[#d32f2f] px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#d32f2f]/25 hover:bg-[#b71c1c]"
              >
                <Phone size={16} />
                <span>Gọi Hotline 0934.995.657</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
