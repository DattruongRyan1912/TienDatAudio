import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Product } from '@/lib/data'
import { formatPrice } from '@/lib/utils'

export default function SonicProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const image = product.images[0] || '/images/sonic-hero.png'
  return (
    <article className={`group sonic-panel relative overflow-hidden ${featured ? 'md:col-span-2 md:row-span-2' : ''}`}>
      <Link href={`/san-pham/${product.slug}`} className="block h-full">
        <div className={`relative overflow-hidden bg-[#0c0c0c] ${featured ? 'aspect-[1.04]' : 'aspect-[1.12]'}`}>
          <Image src={image} alt={product.name} fill sizes={featured ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'} className="object-contain p-8 transition duration-700 ease-out group-hover:scale-105 md:p-12" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-80" />
          {product.featured && <span className="absolute left-4 top-4 sonic-label bg-[#d4af37] px-2 py-1 text-[#080808]">Tuyển chọn</span>}
          <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
            <div>
              <p className="sonic-label text-[0.58rem]">{product.brand || 'Audio'} / {product.category || 'Thiết bị'}</p>
              <h3 className="mt-2 text-xl font-bold tracking-[-0.04em] text-[#e5e2e1] md:text-2xl">{product.name}</h3>
              <p className="mt-2 text-sm text-[#d4af37]">{product.price ? formatPrice(product.salePrice || product.price) : 'Liên hệ tư vấn'}</p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/30 text-[#e5e2e1] transition-all group-hover:border-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#080808]"><ArrowUpRight size={17} /></span>
          </div>
        </div>
      </Link>
    </article>
  )
}

