import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Product } from '@/lib/data'

export default function SocialRelatedProduct({ product }: { product: Product }) {
  const image = product.images[0] || '/uploads/1757873177981_wez3lmbcclj.jpg'
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="group flex items-center gap-3 border-t border-slate-100 py-3 first:border-t-0 transition-colors hover:bg-slate-50/80 rounded-lg px-2 -mx-2"
    >
      <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-md border border-slate-100 bg-[#f8fafc]">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="64px"
          className="object-contain p-1 transition-transform group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-900 group-hover:text-[#d32f2f]">
          {product.name}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {product.category || 'Thiết bị âm thanh'}
        </p>
      </div>
      <ArrowUpRight size={15} className="shrink-0 text-slate-400 group-hover:text-[#d32f2f]" />
    </Link>
  )
}
