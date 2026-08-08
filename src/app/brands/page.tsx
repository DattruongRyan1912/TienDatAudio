import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getBrands, getProducts } from '@/lib/catalog'
import SonicSectionHeading from '@/components/sonic/SonicSectionHeading'

export const metadata = { title: 'Thương hiệu — Tiến Đạt Audio', description: 'Các thương hiệu thiết bị âm thanh được Tiến Đạt Audio tuyển chọn và tư vấn.' }

export default async function BrandsPage() {
  const [brands, products] = await Promise.all([getBrands(), getProducts()])
  return (
    <div className="sonic-page pt-28 md:pt-36">
      <section className="sonic-container pb-16 md:pb-24"><p className="sonic-label">Brands / Selected partners</p><h1 className="sonic-title mt-5 max-w-4xl">Những cái tên tạo nên ngôn ngữ âm thanh riêng.</h1><p className="sonic-copy mt-6 max-w-xl">Chúng tôi không chọn thương hiệu vì danh tiếng đơn thuần. Mỗi cái tên cần có một lý do để hiện diện trong hệ thống của bạn.</p></section>
      <section className="border-y border-white/10 bg-[#0d0d0d] py-16 md:py-24"><div className="sonic-container"><SonicSectionHeading label="01 / Partner library" title="Từ sân khấu đến phòng nghe tại gia." /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{brands.map((brand, index) => { const count = products.filter((product) => product.brand_id === brand.id || product.brand === brand.name).length || brand.productCount || 0; return <Link key={brand.id} href={`/products?brand=${brand.id}`} className="group sonic-panel relative min-h-[270px] overflow-hidden p-6 transition-colors hover:border-[#d4af37]/60"><div className="flex items-start justify-between"><span className="sonic-label text-[#858989]">0{index + 1}</span><ArrowUpRight size={16} className="text-[#858989] transition-colors group-hover:text-[#d4af37]" /></div><div className="absolute inset-x-6 bottom-6"><div className="relative mb-5 h-14 w-32 opacity-80 grayscale transition group-hover:grayscale-0">{brand.logo && <Image src={brand.logo} alt={brand.name} fill sizes="128px" className="object-contain object-left" />}</div><h2 className="text-3xl font-bold tracking-[-0.05em] text-[#e5e2e1]">{brand.name}</h2><div className="mt-2 flex items-center justify-between text-xs text-[#858989]"><span>{brand.country || 'International partner'}</span><span>{count} sản phẩm</span></div></div></Link> })}</div></div></section>
      <section className="sonic-container py-16 md:py-24"><div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-end"><div><p className="sonic-label">02 / Phối ghép</p><h2 className="sonic-title mt-5">Một logo không nói lên tất cả.</h2></div><div><p className="sonic-copy max-w-2xl">Thương hiệu chỉ là điểm khởi đầu. Khả năng phối ghép, căn chỉnh và cách hệ thống phản hồi trong chính không gian của bạn mới là điều chúng tôi quan tâm.</p><Link href="/contact" className="group mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#d4af37]">Nói chuyện với chuyên gia <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link></div></div></section>
    </div>
  )
}

