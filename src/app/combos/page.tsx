import Image from 'next/image'
import Link from 'next/link'
import { Check, MessageCircle, Sparkles, Volume2 } from 'lucide-react'
import { getCombos } from '@/lib/catalog'
import { generateSEOMetadata } from '@/lib/seo'

export const metadata = generateSEOMetadata({
  pagePath: '/combos',
  title: 'Dàn Karaoke Gia Đình & Bộ Âm Thanh Trọn Gói — Tiến Đạt Audio Quảng Ngãi',
  description: 'Trọn bộ cấu hình dàn karaoke gia đình, phòng khách, cafe acoustic chuẩn âm học tại Quảng Ngãi. Miễn phí vận chuyển, lắp đặt và căn chỉnh chống hú tận nhà.',
  keywords: [
    'dàn karaoke gia đình Quảng Ngãi',
    'bộ âm thanh trọn gói Quảng Ngãi',
    'lắp đặt dàn karaoke Quảng Ngãi',
    'dàn karaoke giá bao nhiêu',
    'Tiến Đạt Audio',
  ],
})

export default async function CombosPage() {
  const combos = await getCombos()

  return (
    <div className="bg-[#f8fafc] pt-24 md:pt-32">
      {/* 1. Header Banner */}
      <section className="border-b border-slate-200 bg-white py-8 md:py-12">
        <div className="mx-auto max-w-[1240px] px-4">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-[#d32f2f]">Trang chủ</Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">Dàn Karaoke Trọn Gói</span>
          </nav>

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-[#d32f2f]">
                <Sparkles size={13} />
                <span>Giải Pháp Phối Ghép Đạt Chuẩn Âm Học</span>
              </div>
              <h1 className="mt-2.5 text-2xl font-black text-slate-900 md:text-3xl lg:text-4xl">
                Dàn Karaoke & Bộ Âm Thanh Phối Ghép Trọn Gói
              </h1>
              <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
                Được kỹ thuật viên Tiến Đạt Audio tính toán công suất, độ nhạy và dải tần chuẩn xác. Cắt triệt để tiếng hú rít, nâng giọng hát nhẹ hơi và bao trọn phòng khách gia đình.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://zalo.me/0934995657?text=Xin%20ch%C3%A0o%20Ti%E1%BA%BFn%20%C4%90%E1%BA%A1t%20Audio!%20T%C3%B4i%20c%E1%BA%A7n%20t%C6%B0%20v%E1%BA%A5n%20c%E1%BA%A5u%20h%C3%ACnh%20d%C3%A0n%20karaoke."
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#0068ff] px-5 py-3 text-xs font-bold text-white shadow-md shadow-[#0068ff]/25 transition-transform hover:-translate-y-0.5 hover:bg-[#0052cc]"
              >
                <MessageCircle size={15} />
                <span>Tư Vấn Cấu Hình Theo Phòng</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Combo Grid */}
      <section className="mx-auto max-w-[1240px] px-4 py-8 md:py-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {combos.map((combo, index) => {
            const image = combo.thumbnail.startsWith('http') || combo.thumbnail.startsWith('/uploads/')
              ? combo.thumbnail
              : '/uploads/1757873177981_wez3lmbcclj.jpg'

            const zaloMsg = encodeURIComponent(
              `Xin chào Tiến Đạt Audio! Tôi quan tâm đến cấu hình: "${combo.title}". Nhờ tư vấn chi tiết và báo giá trọn gói lắp đặt.`
            )

            return (
              <article
                key={combo.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all hover:shadow-lg hover:border-red-200"
              >
                {/* Image & Badges */}
                <div>
                  <div className="relative aspect-[1.3] w-full overflow-hidden bg-slate-100">
                    <Image
                      src={image}
                      alt={combo.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="rounded-md bg-[#d32f2f] px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                        Cấu hình #0{index + 1}
                      </span>
                      {combo.tags[0] && (
                        <span className="rounded-md bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-sm">
                          {combo.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 md:p-6">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-[#d32f2f]">
                      <Volume2 size={14} />
                      <span>{combo.tags.join(' • ')}</span>
                    </div>

                    <Link href={`/combos/${combo.slug}`}>
                      <h2 className="mt-2 text-lg font-black text-slate-900 transition-colors group-hover:text-[#d32f2f] sm:text-xl">
                        {combo.title}
                      </h2>
                    </Link>

                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      {combo.description}
                    </p>

                    {/* Features checklist */}
                    {combo.features.length > 0 && (
                      <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3.5">
                        {combo.features.slice(0, 3).map((feat) => (
                          <div key={feat} className="flex items-center gap-2 text-xs text-slate-700">
                            <Check size={13} className="shrink-0 text-emerald-600" />
                            <span className="line-clamp-1">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="border-t border-slate-100 p-5 pt-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/combos/${combo.slug}`}
                      className="flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-800 transition-colors hover:bg-slate-200"
                    >
                      Chi tiết bộ này
                    </Link>
                    <a
                      href={`https://zalo.me/0934995657?text=${zaloMsg}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0068ff] px-3 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#0052cc]"
                    >
                      <MessageCircle size={14} />
                      <span>Báo giá Zalo</span>
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* 3. Quy trình lắp đặt tại Tiến Đạt Audio */}
      <section className="border-t border-slate-200 bg-white py-12 md:py-16">
        <div className="mx-auto max-w-[1240px] px-4">
          <div className="text-center">
            <span className="text-xs font-black uppercase tracking-wider text-[#d32f2f]">
              Quy Trình Chuẩn 4 Bước
            </span>
            <h3 className="mt-1.5 text-2xl font-black text-slate-900 md:text-3xl">
              Từ Khảo Sát Phòng Đến Bàn Giao Hát Thử
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-xs text-slate-600 sm:text-sm">
              Đảm bảo mỗi dàn máy khi đặt vào nhà khách hàng đều phát huy 100% công lực âm học.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d32f2f] text-xs font-black text-white">
                01
              </span>
              <h4 className="mt-3 text-sm font-bold text-slate-900">Khảo sát & tư vấn không gian</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Lắng nghe nhu cầu hát karaoke, diện tích phòng khách để gợi ý cấu hình công suất phù hợp nhất.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d32f2f] text-xs font-black text-white">
                02
              </span>
              <h4 className="mt-3 text-sm font-bold text-slate-900">Nghe thử tại showroom</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Khách hàng ghé 264 Phan Đình Phùng hát thử trực tiếp, cảm nhận độ nhẹ của micro và uy lực của loa.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d32f2f] text-xs font-black text-white">
                03
              </span>
              <h4 className="mt-3 text-sm font-bold text-slate-900">Vận chuyển & lắp đặt tận nhà</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Kỹ thuật viên giao máy, đi dây gọn gàng, bố trí vị trí loa tối ưu thẩm mỹ không gian phòng.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#f8fafc] p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d32f2f] text-xs font-black text-white">
                04
              </span>
              <h4 className="mt-3 text-sm font-bold text-slate-900">Cân chỉnh DSP & bàn giao</h4>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                Dùng phần mềm máy tính cắt dứt điểm hú rít theo giọng hát gia chủ, hướng dẫn sử dụng chi tiết.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
