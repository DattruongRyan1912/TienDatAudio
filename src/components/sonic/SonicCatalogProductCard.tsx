import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Product } from '@/lib/data'
import { formatPrice } from '@/lib/utils'

function productPrice(product: Product) {
  return product.price ? formatPrice(product.salePrice || product.price) : 'Liên hệ giá'
}

export default function SonicCatalogProductCard({ product }: { product: Product }) {
  const image = product.images[0] || '/images/sonic-hero.png'

  return (
    <article className="sonic-panel group overflow-hidden transition-colors duration-300 hover:border-[var(--sonic-gold)]">
      <Link href={`/san-pham/${product.slug}`} className="block">
        <div className="relative aspect-[1.2] overflow-hidden border-b border-[var(--sonic-line)] bg-[var(--sonic-surface-strong)]">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 34vw, (min-width: 640px) 42vw, 100vw"
            className="sonic-image-hover object-contain p-8 md:p-10"
          />
          {product.featured && (
            <span className="absolute right-4 top-4 border border-[var(--sonic-gold)] bg-[var(--sonic-gold)] px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--sonic-button-text)]">
              Tuyển chọn
            </span>
          )}
        </div>

        <div className="p-5 md:p-6">
          <p className="sonic-label text-[0.58rem]">
            {product.brand || 'Audio'} / {product.category || 'Thiết bị'}
          </p>
          <h3 className="mt-3 text-lg font-bold leading-tight tracking-[-0.035em] text-[var(--sonic-text-strong)] md:text-xl">
            {product.name}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-[var(--sonic-muted)]">
            {product.description || product.category || 'Thiết bị âm thanh được tuyển chọn.'}
          </p>
          <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--sonic-line)] pt-4">
            <span className="text-sm font-semibold text-[var(--sonic-gold)]">{productPrice(product)}</span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--sonic-line-strong)] text-[var(--sonic-text)] transition-colors group-hover:border-[var(--sonic-gold)] group-hover:bg-[var(--sonic-gold)] group-hover:text-[var(--sonic-button-text)]">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
