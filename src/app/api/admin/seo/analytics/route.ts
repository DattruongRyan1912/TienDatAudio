import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SEO_FILE = path.join(process.cwd(), 'data', 'seo.json')

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

interface SEOIssue {
  type: 'warning' | 'error'
  message: string
  page: string
  suggestion: string
}

export async function GET() {
  try {
    let seoContents: SEOContent[] = []

    // Load SEO data
    if (fs.existsSync(SEO_FILE)) {
      const data = fs.readFileSync(SEO_FILE, 'utf8')
      seoContents = JSON.parse(data)
    }

    // Calculate analytics
    const totalPages = seoContents.length
    const activeSEO = seoContents.filter(seo => seo.isActive).length
    const pagesWithKeywords = seoContents.filter(seo => seo.keywords.length > 0).length
    const pagesWithOGImage = seoContents.filter(seo => seo.ogImage && seo.ogImage.trim() !== '').length
    
    const totalKeywords = seoContents.reduce((sum, seo) => sum + seo.keywords.length, 0)
    const averageKeywordsPerPage = totalPages > 0 ? totalKeywords / totalPages : 0
    
    const totalTitleLength = seoContents.reduce((sum, seo) => sum + seo.title.length, 0)
    const averageTitleLength = totalPages > 0 ? totalTitleLength / totalPages : 0
    
    const totalDescriptionLength = seoContents.reduce((sum, seo) => sum + seo.description.length, 0)
    const averageDescriptionLength = totalPages > 0 ? totalDescriptionLength / totalPages : 0

    // Calculate recent updates (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentUpdates = seoContents.filter(seo => {
      const updatedDate = new Date(seo.updatedAt)
      return updatedDate >= sevenDaysAgo
    }).length

    // Analyze SEO issues
    const issues: SEOIssue[] = []

    seoContents.forEach(seo => {
      const pageLabel = seo.page

      // Check title length
      if (seo.title.length < 30) {
        issues.push({
          type: 'warning',
          message: 'Tiêu đề quá ngắn',
          page: pageLabel,
          suggestion: 'Tiêu đề nên có từ 30-60 ký tự để tối ưu SEO'
        })
      } else if (seo.title.length > 60) {
        issues.push({
          type: 'error',
          message: 'Tiêu đề quá dài',
          page: pageLabel,
          suggestion: 'Rút gọn tiêu đề xuống dưới 60 ký tự để hiển thị đầy đủ trên Google'
        })
      }

      // Check description length
      if (seo.description.length < 120) {
        issues.push({
          type: 'warning',
          message: 'Mô tả quá ngắn',
          page: pageLabel,
          suggestion: 'Mô tả nên có từ 120-160 ký tự để tối ưu SEO'
        })
      } else if (seo.description.length > 160) {
        issues.push({
          type: 'error',
          message: 'Mô tả quá dài',
          page: pageLabel,
          suggestion: 'Rút gọn mô tả xuống dưới 160 ký tự để hiển thị đầy đủ trên Google'
        })
      }

      // Check keywords
      if (seo.keywords.length === 0) {
        issues.push({
          type: 'warning',
          message: 'Thiếu từ khóa',
          page: pageLabel,
          suggestion: 'Thêm 3-5 từ khóa chính để tối ưu SEO'
        })
      } else if (seo.keywords.length > 10) {
        issues.push({
          type: 'warning',
          message: 'Quá nhiều từ khóa',
          page: pageLabel,
          suggestion: 'Giới hạn 5-8 từ khóa chính để tránh keyword stuffing'
        })
      }

      // Check H1 tag
      if (!seo.h1 || seo.h1.trim() === '') {
        issues.push({
          type: 'error',
          message: 'Thiếu H1 tag',
          page: pageLabel,
          suggestion: 'Thêm H1 tag chứa từ khóa chính cho trang'
        })
      }

      // Check Open Graph
      if (!seo.ogImage || seo.ogImage.trim() === '') {
        issues.push({
          type: 'warning',
          message: 'Thiếu Open Graph image',
          page: pageLabel,
          suggestion: 'Thêm hình ảnh OG để tối ưu hiển thị khi share trên social media'
        })
      }

      // Check duplicate titles
      const duplicateTitles = seoContents.filter(other => 
        other.id !== seo.id && other.title === seo.title
      )
      if (duplicateTitles.length > 0) {
        issues.push({
          type: 'error',
          message: 'Tiêu đề trùng lặp',
          page: pageLabel,
          suggestion: 'Mỗi trang cần có tiêu đề duy nhất để tránh duplicate content'
        })
      }

      // Check canonical URL
      if (!seo.canonicalUrl || seo.canonicalUrl.trim() === '') {
        issues.push({
          type: 'warning',
          message: 'Thiếu canonical URL',
          page: pageLabel,
          suggestion: 'Thêm canonical URL để tránh duplicate content'
        })
      }

      // Check inactive SEO
      if (!seo.isActive) {
        issues.push({
          type: 'warning',
          message: 'SEO chưa được kích hoạt',
          page: pageLabel,
          suggestion: 'Kích hoạt SEO để áp dụng cấu hình cho trang này'
        })
      }
    })

    const analytics = {
      totalPages,
      activeSEO,
      pagesWithKeywords,
      pagesWithOGImage,
      averageKeywordsPerPage,
      averageTitleLength,
      averageDescriptionLength,
      recentUpdates
    }

    return NextResponse.json({
      success: true,
      analytics,
      issues: issues.slice(0, 20) // Limit to 20 most important issues
    })

  } catch (error) {
    console.error('Error in SEO analytics API:', error)
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải dữ liệu analytics' },
      { status: 500 }
    )
  }
}
