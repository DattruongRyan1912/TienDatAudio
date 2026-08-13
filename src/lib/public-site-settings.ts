import { unstable_cache } from 'next/cache'
import { getBusinessProfile } from './business-profile'
import { getSEOConfig } from './seo-strategy'

export const PUBLIC_SITE_SETTINGS_CACHE_TAG = 'public-site-settings'

export const getPublicSiteSettings = unstable_cache(
  async () => {
    const [seoConfig, profile] = await Promise.all([getSEOConfig(), getBusinessProfile()])
    return { seoConfig, profile }
  },
  ['public-site-settings-v1'],
  { revalidate: 300, tags: [PUBLIC_SITE_SETTINGS_CACHE_TAG] },
)
