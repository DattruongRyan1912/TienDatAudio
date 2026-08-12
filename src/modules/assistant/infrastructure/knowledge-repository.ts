import { getProducts } from '@/lib/catalog'
import { getPublicPosts } from '@/lib/content-repository'
import type { Product } from '@/lib/data'
import type { ContentPost } from '@/lib/content-types'
import {
  listPublishedKnowledgeEntries,
  listVerifiedClaims,
  searchArticleChunks,
} from '@/modules/knowledge/infrastructure/knowledge-repository'
import type { ArticleChunk, KnowledgeClaim, KnowledgeEntry } from '@/modules/knowledge/domain/types'
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
    authority: 95,
    ...(product.updatedAt ? { updatedAt: product.updatedAt } : {}),
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
    authority: 70,
    ...(post.updatedAt ? { updatedAt: post.updatedAt } : {}),
    content: content.slice(0, 7000),
    titleTerms: normalizeSearchText(post.title),
    keywordTerms: normalizeSearchText(keywordText),
    bodyTerms: normalizeSearchText(content),
  }
}

function curatedDocument(entry: KnowledgeEntry): AssistantKnowledgeDocument {
  const content = [`Kho tri thức: ${entry.title}`, entry.answerMarkdown].join('\n')
  return {
    id: entry.id,
    type: 'knowledge',
    title: entry.title,
    excerpt: oneLine(entry.answerMarkdown, 180),
    authority: 90 + Math.round(entry.priority / 20),
    updatedAt: entry.updatedAt,
    content: content.slice(0, 7000),
    titleTerms: normalizeSearchText(entry.title),
    keywordTerms: normalizeSearchText([...entry.aliases, ...entry.tags].join(' ')),
    bodyTerms: normalizeSearchText(content),
    reviewStatus: entry.reviewStatus,
    ...(entry.expiresAt ? { validUntil: entry.expiresAt } : {}),
  }
}

function claimDocument(claim: KnowledgeClaim): AssistantKnowledgeDocument {
  const content = [
    `Claim đã xác minh: ${claim.subject.label} ${claim.predicate.replace(/_/g, ' ')} ${claim.object.label}`,
    `Lý do: ${claim.reason}`,
  ].join('\n')
  return {
    id: claim.id,
    type: 'claim',
    title: `${claim.subject.label} · ${claim.predicate.replace(/_/g, ' ')}`,
    excerpt: oneLine(claim.reason, 180),
    authority: 90,
    updatedAt: claim.updatedAt,
    content: content.slice(0, 5000),
    titleTerms: normalizeSearchText(`${claim.subject.label} ${claim.predicate} ${claim.object.label}`),
    keywordTerms: normalizeSearchText(`${claim.subject.type} ${claim.object.type}`),
    bodyTerms: normalizeSearchText(content),
    reviewStatus: claim.reviewStatus,
    ...(claim.expiresAt ? { validUntil: claim.expiresAt } : {}),
  }
}

function chunkDocument(chunk: ArticleChunk): AssistantKnowledgeDocument {
  const heading = chunk.headingPath.join(' › ')
  const content = [`Bài viết: ${chunk.articleTitle}`, heading ? `Mục: ${heading}` : '', chunk.text].filter(Boolean).join('\n')
  return {
    id: chunk.id,
    type: 'article',
    title: heading ? `${chunk.articleTitle} — ${heading}` : chunk.articleTitle,
    url: `/kien-thuc/${chunk.articleSlug}`,
    excerpt: oneLine(chunk.text, 180),
    authority: 72,
    updatedAt: chunk.sourceUpdatedAt,
    content: content.slice(0, 5000),
    titleTerms: normalizeSearchText(`${chunk.articleTitle} ${heading}`),
    keywordTerms: normalizeSearchText(heading),
    bodyTerms: chunk.normalizedText,
  }
}

export function invalidateAssistantKnowledgeCache() {
  cache = null
}

export async function listAssistantKnowledge(query = '') {
  let documents: AssistantKnowledgeDocument[]
  if (cache && cache.expiresAt > Date.now()) {
    documents = cache.documents
  } else {
    const [products, posts, entries, claims] = await Promise.all([
      getProducts({ limit: 500 }),
      getPublicPosts(100),
      listPublishedKnowledgeEntries().catch(() => []),
      listVerifiedClaims().catch(() => []),
    ])
    documents = [
      ...products.map(productDocument),
      ...posts.map(articleDocument),
      ...entries.map(curatedDocument),
      ...claims.map(claimDocument),
    ]
    cache = { documents, expiresAt: Date.now() + CACHE_TTL_MS }
  }
  if (!query.trim()) return documents
  const chunks = await searchArticleChunks(query, 30).catch(() => [])
  if (!chunks.length) return documents
  const chunkArticleIds = new Set(chunks.map((chunk) => chunk.articleId))
  return [...documents.filter((document) => document.type !== 'article' || !chunkArticleIds.has(document.id)), ...chunks.map(chunkDocument)]
}
