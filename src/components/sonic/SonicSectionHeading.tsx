import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function SonicSectionHeading({ label, title, copy, href, linkLabel = 'Xem tất cả' }: { label: string; title: string; copy?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="sonic-label">{label}</p>
        <h2 className="sonic-title mt-4 max-w-3xl">{title}</h2>
        {copy && <p className="sonic-copy mt-5 max-w-xl">{copy}</p>}
      </div>
      {href && <Link href={href} className="group inline-flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#d4af37]">{linkLabel}<ArrowUpRight size={15} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" /></Link>}
    </div>
  )
}

