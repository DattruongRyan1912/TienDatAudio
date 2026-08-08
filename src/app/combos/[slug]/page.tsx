import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, Check } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getCombos } from '@/lib/catalog'

export default async function ComboDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const combo = (await getCombos()).find((item) => item.slug === slug)
  if (!combo) notFound()
  const image = combo.thumbnail.startsWith('http') || combo.thumbnail.startsWith('/uploads/') ? combo.thumbnail : '/images/sonic-hero.png'
  return <div className="sonic-page pt-28 md:pt-36"><div className="sonic-container pb-20 md:pb-28"><Link href="/combos" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#858989] hover:text-[#d4af37]"><ArrowLeft size={14} /> Các cấu hình</Link><div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16"><div className="relative aspect-square overflow-hidden border border-white/10"><Image src={image} alt={combo.title} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" /></div><div><p className="sonic-label">{combo.tags.join(' / ')}</p><h1 className="mt-5 text-4xl font-bold tracking-[-0.06em] md:text-6xl">{combo.title}</h1><p className="sonic-copy mt-6">{combo.description}</p><div className="mt-8 grid gap-3">{combo.features.map((feature) => <div key={feature} className="flex items-start gap-3 text-sm text-[#c4c7c7]"><Check size={16} className="mt-0.5 text-[#d4af37]" />{feature}</div>)}</div><Link href={`/contact?product=${encodeURIComponent(combo.title)}`} className="sonic-button sonic-button-gold mt-9">Nhận tư vấn cấu hình <ArrowUpRight size={16} /></Link></div></div></div></div>
}
