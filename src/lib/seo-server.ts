import fs from 'fs'
import path from 'path'

interface SEOContent {
  id: string
  page: string
  title: string
  description: string
  keywords: string[]
  ogTitle: string
  ogDescription: string
  ogImage: string
  structuredData: Record<string, unknown>
  metaRobots: string
  canonicalUrl: string
  h1: string
  h2: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Function to get SEO data for server-side only
export function getSEODataForPage(pagePath: string): SEOContent | null {
  try {
    const seoFilePath = path.join(process.cwd(), 'data', 'seo.json')
    if (!fs.existsSync(seoFilePath)) {
      return null
    }
    
    const data = fs.readFileSync(seoFilePath, 'utf-8')
    const parsed = JSON.parse(data)
    const seoContents = parsed.seoContents || []
    
    // Find SEO data for this page
    const seoData = seoContents.find((item: SEOContent) => 
      item.page === pagePath && item.isActive
    )
    
    return seoData || null
  } catch (error) {
    console.error('Error loading SEO data:', error)
    return null
  }
}
