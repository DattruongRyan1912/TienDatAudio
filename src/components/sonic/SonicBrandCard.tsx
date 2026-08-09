import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Brand } from '@/lib/data'
import SonicBrandLogo from './SonicBrandLogo'

export default function SonicBrandCard({ brand, index, productCount, featured = false }: { brand: Brand; index: number; productCount: number; featured?: boolean }) {
  return (
    <article className={`sonic-brand-card group ${featured ? 'sonic-brand-card-featured md:col-span-2' : ''}`}>
      <Link href={`/thuong-hieu/${brand.slug}`} className="flex h-full flex-col" aria-label={`Xem thương hiệu ${brand.name}`}>
        <div className="relative z-[1] flex items-start justify-between">
          <span className="sonic-label text-[var(--sonic-subtle)]">{String(index + 1).padStart(2, '0')}</span>
          <span className="sonic-brand-arrow flex h-9 w-9 items-center justify-center border border-[var(--sonic-line)] text-[var(--sonic-muted)] transition-colors group-hover:border-[var(--sonic-gold)] group-hover:text-[var(--sonic-gold)]" aria-hidden="true">
            <ArrowUpRight size={16} />
          </span>
        </div>

        <div className={`relative z-[1] mt-auto flex flex-col gap-6 ${featured ? 'md:grid md:grid-cols-[auto_1fr] md:items-end md:gap-10' : ''}`}>
          <SonicBrandLogo brand={brand} featured={featured} />
          <div>
            <div className="flex items-end justify-between gap-5">
              <div>
                <h3 className={`font-bold leading-none tracking-[-0.05em] text-[var(--sonic-text-strong)] ${featured ? 'text-3xl md:text-4xl' : 'text-2xl md:text-[1.65rem]'}`}>{brand.name}</h3>
                <p className="mt-3 text-sm text-[var(--sonic-muted)]">{brand.country || 'International partner'}</p>
              </div>
              <p className="shrink-0 text-right text-xs leading-5 text-[var(--sonic-subtle)]"><span className="block text-lg font-semibold text-[var(--sonic-text)]">{productCount}</span> sản phẩm</p>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--sonic-muted)]">{brand.description || 'Thương hiệu được tuyển chọn cho những hệ thống âm thanh có chủ đích.'}</p>
          </div>
        </div>
      </Link>
    </article>
  )
}
