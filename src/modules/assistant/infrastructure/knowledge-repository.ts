import { getProducts } from '@/lib/catalog'
import { getPublicPosts } from '@/lib/content-repository'
import type { Product } from '@/lib/data'
import type { ContentPost } from '@/lib/content-types'
import { normalizeSearchText } from '../domain/retrieval'
import type { AssistantKnowledgeDocument } from '../domain/types'

const CACHE_TTL_MS = 5 * 60 * 1000
let cache: { expiresAt: number; documents: AssistantKnowledgeDocument[] } | null = null

function oneLine(value: unknown, max = 500) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max)
}

function productDocument(product: Product): AssistantKnowledgeDocument {
  const price = product.salePrice || product.price
  const specifications = Object.entries(product.specifications || {})
    .slice(0, 12)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n')
  const content = [
    `Sản phẩm: ${product.name}`,
    `Thương hiệu: ${product.brand || 'Chưa cập nhật'}`,
    `Danh mục: ${product.category || 'Chưa cập nhật'}`,
    `Giá: ${price > 0 ? `${new Intl.NumberFormat('vi-VN').format(price)} đ` : 'Liên hệ giá'}`,
    `Tình trạng: ${product.inStock ? 'Đang bán' : 'Tạm hết hàng'}`,
    `Mô tả: ${oneLine(product.description, 1200)}`,
    product.features.length ? `Đặc điểm: ${product.features.slice(0, 12).join('; ')}` : '',
    specifications ? `Thông số:\n${specifications}` : '',
  ].filter(Boolean).join('\n')
  const keywordText = [product.brand, product.category, ...product.features, ...Object.keys(product.specifications || {})].join(' ')

  return {
    id: product.id,
    type: 'product',
    title: product.name,
    url: `/san-pham/${product.slug}`,
    excerpt: oneLine(product.description, 180) || `${product.brand || ''} ${product.category || ''}`.trim(),
    content: content.slice(0, 5000),
    titleTerms: normalizeSearchText(product.name),
    keywordTerms: normalizeSearchText(keywordText),
    bodyTerms: normalizeSearchText(content),
  }
}

function articleDocument(post: ContentPost): AssistantKnowledgeDocument {
  const faqText = post.faqs.map((faq) => `${faq.question}: ${faq.answer}`).join('\n')
  const content = [
    `Bài viết: ${post.title}`,
    `Tóm tắt: ${post.excerpt}`,
    post.bodyMarkdown,
    faqText ? `Câu hỏi thường gặp:\n${faqText}` : '',
  ].filter(Boolean).join('\n')
  const keywordText = [post.category, ...post.tags, post.seoResearch.primaryKeyword, ...post.seoResearch.semanticTerms].join(' ')

  return {
    id: post.id,
    type: 'article',
    title: post.title,
    url: `/kien-thuc/${post.slug}`,
    excerpt: oneLine(post.excerpt, 180),
    content: content.slice(0, 7000),
    titleTerms: normalizeSearchText(post.title),
    keywordTerms: normalizeSearchText(keywordText),
    bodyTerms: normalizeSearchText(content),
  }
}

export async function listAssistantKnowledge() {
  if (cache && cache.expiresAt > Date.now()) return cache.documents
  const [products, posts] = await Promise.all([getProducts({ limit: 500 }), getPublicPosts(100)])
  const documents = [...products.map(productDocument), ...posts.map(articleDocument)]
  cache = { documents, expiresAt: Date.now() + CACHE_TTL_MS }
  return documents
}
