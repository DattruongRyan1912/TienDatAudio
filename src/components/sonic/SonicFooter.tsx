import Link from 'next/link'

const productLinks = [
  ['Loa hi-end', '/products?category=loa-thung'],
  ['Loa trầm', '/products?category=loa-tram'],
  ['Vang số', '/products?category=vang-so'],
  ['Thương hiệu', '/brands'],
]

export default function SonicFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#080808]">
      <div className="sonic-container grid gap-12 py-16 md:grid-cols-[1.35fr_.85fr_.85fr_1.45fr] md:py-20">
        <div>
          <p className="sonic-label">Tiến Đạt Audio / 01</p>
          <h2 className="mt-5 max-w-sm text-3xl font-bold tracking-[-0.05em] text-[#e5e2e1]">Âm thanh được tuyển chọn cho những không gian đáng nhớ.</h2>
          <p className="sonic-copy mt-5 max-w-sm text-sm">Tư vấn, phối ghép và triển khai hệ thống âm thanh tại Quảng Ngãi và khu vực miền Trung.</p>
        </div>
        <div>
          <p className="sonic-label">Điều hướng</p>
          <div className="mt-5 grid gap-3 text-sm text-[#a7aaaa]">
            <Link href="/products" className="transition-colors hover:text-[#d4af37]">Sản phẩm</Link>
            <Link href="/about#solutions" className="transition-colors hover:text-[#d4af37]">Giải pháp</Link>
            <Link href="/kien-thuc" className="transition-colors hover:text-[#d4af37]">Kiến thức</Link>
            <Link href="/contact" className="transition-colors hover:text-[#d4af37]">Liên hệ</Link>
          </div>
        </div>
        <div>
          <p className="sonic-label">Danh mục</p>
          <div className="mt-5 grid gap-3 text-sm text-[#a7aaaa]">
            {productLinks.map(([label, href]) => <Link key={href} href={href} className="transition-colors hover:text-[#d4af37]">{label}</Link>)}
          </div>
        </div>
        <div>
          <p className="sonic-label">Showroom</p>
          <p className="mt-5 text-sm leading-7 text-[#a7aaaa]">264 Phan Đình Phùng<br />Chánh Lộ, Quảng Ngãi</p>
          <a href="tel:0934995657" className="mt-4 inline-block text-lg font-bold text-[#d4af37]">0934 995 657</a>
          <p className="mt-2 text-xs text-[#707474]">8:00 — 22:00 / Thứ 2 — Chủ nhật</p>
          <p className="mt-6 sonic-label text-[#858989]">Vị trí showroom</p>
          <div className="sonic-map-frame relative mt-3 h-44 overflow-hidden border border-white/15 bg-[#111111] sm:h-48 md:h-40 lg:h-44">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d436.98143933457914!2d108.80262824033873!3d15.11569782866824!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3169adcf61ae37c5%3A0x1672600981d26f2b!2zVGnhur9uIMSQ4bqhdCBBdWRpbw!5e0!3m2!1svi!2s!4v1786213706677!5m2!1svi!2s" width="600" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" title="Bản đồ Tiến Đạt Audio" />
          </div>
          <a href="https://www.google.com/maps/search/?api=1&query=Ti%E1%BA%BFn%20%C4%90%E1%BA%A1t%20Audio" target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-bold uppercase tracking-[0.14em] text-[#d4af37] transition-colors hover:text-[#e5c45a]">Mở bản đồ <span aria-hidden="true" className="ml-2">↗</span></a>
        </div>
      </div>
      <div className="sonic-container flex flex-col gap-3 border-t border-white/10 py-5 text-[0.64rem] uppercase tracking-[0.16em] text-[#707474] sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Tiến Đạt Audio</span>
        <span>Sonic Purity / Designed for listening</span>
      </div>
    </footer>
  )
}
