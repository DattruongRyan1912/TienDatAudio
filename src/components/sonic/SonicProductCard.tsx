import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Product } from '@/lib/data'
import { formatPrice } from '@/lib/utils'

type SonicProductCardProps = { product: Product; featured?: boolean; variant?: 'default' | 'home'; eyebrow?: string }

export default function SonicProductCard({ product, featured = false, variant = 'default', eyebrow }: SonicProductCardProps) {
  const image = product.images[0] || '/images/sonic-hero.png'

  if (variant === 'home') {
    return (
      <article className={`sonic-home-product-card group h-full overflow-hidden ${featured ? 'sonic-home-product-card-featured' : ''}`}>
        <Link href={`/san-pham/${product.slug}`} className="flex h-full flex-col">
          <div className="sonic-home-product-media relative overflow-hidden">
            <Image src={image} alt={product.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="sonic-home-product-image object-contain p-7 md:p-9" />
            <div className="relative z-10 flex items-start justify-between gap-4 px-5 pt-5">
              <span className="sonic-home-product-eyebrow">{eyebrow || (product.featured ? 'Tuyển chọn' : `01 / ${product.category || 'Thiết bị'}`)}</span>
              <span className="sonic-home-product-index" aria-hidden="true">Audio archive</span>
            </div>
          </div>
          <div className="sonic-home-product-content flex flex-1 flex-col justify-between gap-7 p-5 md:p-6">
            <div>
              <p className="sonic-home-product-meta">{product.brand || 'Audio'} / {product.category || 'Thiết bị'}</p>
              <h3 className="sonic-home-product-title mt-3">{product.name}</h3>
            </div>
            <div className="flex items-end justify-between gap-4">
              <p className="sonic-home-product-price">{product.price ? formatPrice(product.salePrice || product.price) : 'Liên hệ tư vấn'}</p>
              <span className="sonic-home-product-arrow flex h-10 w-10 shrink-0 items-center justify-center" aria-hidden="true"><ArrowUpRight size={17} /></span>
            </div>
          </div>
        </Link>
      </article>
    )
  }

  return (
    <article className={`sonic-media-surface group sonic-panel relative overflow-hidden ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}>
      <Link href={`/san-pham/${product.slug}`} className="block h-full">
        <div className={`relative overflow-hidden bg-[#0c0c0c] ${featured ? 'aspect-[1.04]' : 'aspect-[1.12]'}`}>
          <Image src={image} alt={product.name} fill sizes={featured ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'} className="sonic-image-hover object-contain p-8 md:p-12" />
          {product.featured && <span className="sonic-media-badge sonic-media-badge-gold sonic-label absolute left-4 top-4 px-2 py-1">Tuyển chọn</span>}
          <div className="sonic-media-content absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
            <div>
              <p className="sonic-label text-[0.58rem]">{product.brand || 'Audio'} / {product.category || 'Thiết bị'}</p>
              <h3 className="mt-2 text-xl font-bold tracking-[-0.04em] md:text-2xl">{product.name}</h3>
              <p className="sonic-media-accent mt-2 text-sm">{product.price ? formatPrice(product.salePrice || product.price) : 'Liên hệ tư vấn'}</p>
            </div>
            <span className="sonic-media-plate flex h-10 w-10 shrink-0 items-center justify-center transition-colors duration-200 group-hover:border-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#080808]"><ArrowUpRight size={17} /></span>
          </div>
        </div>
      </Link>
    </article>
  )
}
