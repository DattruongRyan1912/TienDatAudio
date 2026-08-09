import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Product } from '@/lib/data'

export default function SocialRelatedProduct({ product }: { product: Product }) {
  const image = product.images[0] || '/images/sonic-hero.png'
  return <Link href={`/san-pham/${product.slug}`} className="group flex items-center gap-3 border-t border-[var(--sonic-line)] py-3 first:border-t-0"><div className="relative h-14 w-16 shrink-0 overflow-hidden bg-[var(--sonic-surface-raised)]"><Image src={image} alt={product.name} fill sizes="64px" className="sonic-image-hover object-contain p-1" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[var(--sonic-text)] group-hover:text-[var(--sonic-gold)]">{product.name}</p><p className="mt-1 text-xs text-[var(--sonic-muted)]">{product.category || 'Thiết bị âm thanh'}</p></div><ArrowUpRight size={15} className="shrink-0 text-[var(--sonic-gold)]" /></Link>
}
