import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Brand } from '@/lib/data'

type BrandLogoVariants = Brand & { logoDark?: string; logoLight?: string }

export default function SonicBrandCard({
  brand,
  index,
  productCount,
  featured = false,
}: {
  brand: Brand
  index: number
  productCount: number
  featured?: boolean
}) {
  const source = brand as BrandLogoVariants
  const logoUrl = source.logoLight || source.logo || source.logoDark

  return (
    <article
      className={`group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-200 hover:shadow-md ${
        featured ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white to-red-50/20' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
            #{String(index + 1).padStart(2, '0')}
          </span>
          <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-[#d32f2f] border border-red-100">
            {productCount} sản phẩm
          </span>
        </div>

        {/* Brand Logo Box */}
        <div className="mt-4 relative flex h-28 w-full items-center justify-center rounded-xl border border-slate-100 bg-[#f8fafc] p-4 transition-colors group-hover:bg-white group-hover:border-slate-200">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={`Logo thương hiệu ${brand.name}`}
              fill
              sizes="(min-width: 1024px) 240px, 50vw"
              className="object-contain p-3 transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <span className="text-xl font-black uppercase tracking-wider text-slate-800">
              {brand.name}
            </span>
          )}
        </div>

        {/* Brand Info */}
        <div className="mt-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-[#d32f2f]">
              {brand.name}
            </h3>
            {brand.country && (
              <span className="text-xs font-medium text-slate-500">{brand.country}</span>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-600">
            {brand.description ||
              `Thương hiệu ${brand.name} chính hãng được Tiến Đạt Audio phân phối và bảo hành tại Quảng Ngãi.`}
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <Link
          href={`/thuong-hieu/${brand.slug}`}
          className="inline-flex w-full items-center justify-between text-xs font-bold text-[#d32f2f] transition-all group-hover:translate-x-0.5"
          aria-label={`Xem sản phẩm thương hiệu ${brand.name}`}
        >
          <span>Xem tất cả sản phẩm {brand.name}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  )
}
