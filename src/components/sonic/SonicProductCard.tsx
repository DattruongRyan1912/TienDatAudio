import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/data'
import { formatPrice } from '@/lib/utils'

type SonicProductCardProps = {
  product: Product
  featured?: boolean
  variant?: 'default' | 'home'
  eyebrow?: string
}

export default function SonicProductCard({ product, featured = false }: SonicProductCardProps) {
  const image = product.images[0] || '/uploads/1757873177981_wez3lmbcclj.jpg'
  const isSale = Boolean(product.salePrice && product.salePrice < product.price)

  // Extract up to 3 bullet specs from features or specifications
  const specs = product.features && product.features.length > 0
    ? product.features.slice(0, 3)
    : Object.entries(product.specifications || {}).slice(0, 3).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
      {/* 1. Image Container */}
      <div className="relative aspect-[1.15] w-full overflow-hidden border-b border-slate-100 bg-[#f8fafc] p-5">
        {/* Top-left Badge */}
        <div className="absolute top-3 left-3 z-10">
          {product.bestseller ? (
            <span className="rounded bg-[#d32f2f] px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
              BÁN CHẠY #1
            </span>
          ) : featured ? (
            <span className="rounded bg-[#0284c7] px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
              TUYỂN CHỌN
            </span>
          ) : (
            <span className="rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow-sm">
              CHÍNH HÃNG 100%
            </span>
          )}
        </div>

        <Link href={`/san-pham/${product.slug}`} className="block h-full w-full">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* 2. Card Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {product.brand || 'Tiến Đạt Audio'} • {product.category || 'Thiết bị'}
          </p>

          <Link href={`/san-pham/${product.slug}`}>
            <h3 className="mt-1.5 line-clamp-2 text-sm font-bold text-slate-900 transition-colors group-hover:text-[#d32f2f] sm:text-base">
              {product.name}
            </h3>
          </Link>

          {/* Bullet Specs */}
          {specs.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-slate-600">
              {specs.map((item, idx) => (
                <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                  <span className="font-bold text-[#d32f2f]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 3. Pricing & Actions */}
        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="mb-3 flex items-baseline gap-2">
            {product.price > 0 ? (
              <>
                <span className="text-base font-black text-[#d32f2f] sm:text-lg">
                  {formatPrice(product.salePrice || product.price)}
                </span>
                {isSale && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </>
            ) : (
              <div>
                <span className="text-sm font-bold text-[#d32f2f]">
                  Báo giá tốt qua Zalo
                </span>
                <span className="block text-[10px] text-slate-500">
                  Hotline: 0934 995 657
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/san-pham/${product.slug}`}
              className="flex items-center justify-center rounded-md bg-slate-100 px-2 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Xem chi tiết
            </Link>
            <a
              href={`https://zalo.me/0934995657?text=${encodeURIComponent(`Xin chào Tiến Đạt Audio! Tôi quan tâm đến sản phẩm: ${product.name}. Nhờ tư vấn báo giá giúp tôi.`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center rounded-md bg-[#0068ff] px-2 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0052cc]"
            >
              Nhận báo giá
            </a>
          </div>
        </div>
      </div>
    </article>
  )
}
