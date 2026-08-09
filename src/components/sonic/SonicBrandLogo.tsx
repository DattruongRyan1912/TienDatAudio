import Image from 'next/image'
import type { Brand } from '@/lib/data'

type BrandLogoVariants = Brand & { logoDark?: string; logoLight?: string }

export default function SonicBrandLogo({ brand, featured = false }: { brand: Brand; featured?: boolean }) {
  const source = brand as BrandLogoVariants
  const darkLogo = source.logoDark || source.logo || source.logoLight
  const lightLogo = source.logoLight || source.logo || source.logoDark
  const hasLogoVariants = Boolean(source.logoDark || source.logoLight)
  const surfaceClass = featured ? 'sonic-brand-logo-surface sonic-brand-logo-surface-featured' : 'sonic-brand-logo-surface'

  return (
    <div className={surfaceClass}>
      {hasLogoVariants ? (
        <>
          {darkLogo && <Image src={darkLogo} alt={brand.name} fill sizes="(min-width: 1024px) 260px, 70vw" className="sonic-brand-logo sonic-brand-logo-dark object-contain p-5" />}
          {lightLogo && <Image src={lightLogo} alt="" fill sizes="(min-width: 1024px) 260px, 70vw" className="sonic-brand-logo sonic-brand-logo-light object-contain p-5" />}
        </>
      ) : darkLogo ? (
        <Image src={darkLogo} alt={brand.name} fill sizes="(min-width: 1024px) 260px, 70vw" className="sonic-brand-logo object-contain p-5" />
      ) : (
        <span className="px-6 text-center text-xl font-bold tracking-[-0.04em] text-[#171715]">{brand.name}</span>
      )}
    </div>
  )
}
