import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Product } from '@/lib/data'
import { formatPrice } from '@/lib/utils'

function productPrice(product: Product) {
  return product.price ? formatPrice(product.salePrice || product.price) : 'Liên hệ giá'
}

export default function SonicCatalogFeaturedCard({ product }: { product: Product }) {
  const image = product.images[0] || '/images/sonic-hero.png'

  return (
    <article className="sonic-panel group overflow-hidden transition-colors duration-300 hover:border-[var(--sonic-gold)]">
      <Link href={`/san-pham/${product.slug}`} className="grid md:grid-cols-[1.08fr_0.92fr]">
        <div className="relative aspect-[1.18] overflow-hidden border-b border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)] md:aspect-auto md:min-h-[330px] md:border-b-0 md:border-r">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 55vw, 100vw"
            className="sonic-image-hover object-contain p-10 md:p-14"
          />
        </div>
        <div className="flex flex-col justify-between gap-10 p-6 md:p-9">
          <div>
            <p className="sonic-label text-[0.58rem]">{product.brand || 'Audio'}</p>
            <h2 className="mt-4 text-2xl font-bold leading-tight tracking-[-0.045em] text-[var(--sonic-text-strong)] md:text-3xl">
              {product.name}
            </h2>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-[var(--sonic-muted)]">
              {product.description || 'Thiết bị được tuyển chọn cho những cấu hình nghe nhạc có chủ đích.'}
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[var(--sonic-line)] pt-5">
            <div>
              <p className="text-xs text-[var(--sonic-muted)]">{product.category || 'Thiết bị âm thanh'}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--sonic-gold)]">{productPrice(product)}</p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--sonic-line-strong)] text-[var(--sonic-text)] transition-colors group-hover:border-[var(--sonic-gold)] group-hover:bg-[var(--sonic-gold)] group-hover:text-[var(--sonic-button-text)]">
              <ArrowUpRight size={18} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
