import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Category } from '@/lib/data'

const DEFAULT_FOCAL_POSITIONS: Record<string, string> = {
  'loa-bluetooth': '50% 50%',
  'amply-karaoke': '50% 56%',
  'loa-thung': '58% 50%',
  'loa-tram': '50% 52%',
  'vang-so': '50% 62%',
  'main-cong-suat': '50% 56%',
}

export default function SonicSolutionCard({ category, index, featured = false }: { category: Category; index: number; featured?: boolean }) {
  const objectPosition = category.objectPosition || DEFAULT_FOCAL_POSITIONS[category.id] || '50% 50%'

  return (
    <Link href={`/products?category=${category.id}`} aria-label={`Xem sản phẩm thuộc ${category.name}`} className={`sonic-solution-card group relative block h-full min-h-[280px] overflow-hidden border ${featured ? 'sonic-solution-card-featured min-h-[360px]' : ''}`}>
      <Image src={category.image || '/images/sonic-hero.png'} alt={category.name} fill sizes={featured ? '(min-width: 1024px) 42vw, 100vw' : '(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw'} style={{ objectPosition }} className="sonic-solution-image object-cover" />
      <div className="sonic-solution-content relative z-10 flex h-full min-h-[280px] flex-col justify-between p-6 md:p-7">
        <span className="sonic-solution-eyebrow">{String(index + 1).padStart(2, '0')} / {category.name}</span>
        <div className="flex items-end justify-between gap-5">
          <div className="max-w-[26rem]">
            <h3 className="sonic-solution-title text-2xl font-bold leading-tight tracking-[-0.04em] md:text-3xl">{category.name}</h3>
            <p className="sonic-solution-description mt-3 max-w-sm text-sm leading-6">{category.description}</p>
          </div>
          <span className="sonic-solution-arrow flex h-10 w-10 shrink-0 items-center justify-center" aria-hidden="true"><ArrowUpRight size={17} /></span>
        </div>
      </div>
    </Link>
  )
}
