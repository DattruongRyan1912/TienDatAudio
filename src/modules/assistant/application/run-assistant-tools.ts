import type { AssistantPorts } from '../domain/assistant.ports'
import { matchAssistantProduct } from '../domain/exact-facts'
import { normalizeSearchText, queryTerms, retrieveKnowledge } from '../domain/retrieval'
import {
  ASSISTANT_TOOL_DEFINITIONS,
  isAssistantToolName,
  type AssistantToolCall,
  type AssistantToolName,
} from '../domain/tool-calling'
import type { AssistantKnowledgeDocument, AssistantMessage, AssistantProductFact } from '../domain/types'

const MAX_TOOL_CALLS = 3
const MAX_TOOL_ARGUMENTS_LENGTH = 4_000
const MAX_TOOL_DOCUMENTS = 10

type UnknownRecord = Record<string, unknown>
type ProductAvailability = 'available' | 'unavailable' | 'unknown' | 'all'

type ProductFilter = {
  query?: string
  brand?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  availability: ProductAvailability
  limit: number
}

export type AssistantToolExecutionTrace = {
  name: string
  outcome: 'completed' | 'rejected' | 'failed'
  resultCount: number
}

export type AssistantToolEvidence = {
  documents: AssistantKnowledgeDocument[]
  calls: AssistantToolExecutionTrace[]
}

function toolError(code: 'ASSISTANT_TOOL_NOT_ALLOWED' | 'ASSISTANT_TOOL_ARGUMENTS_INVALID') {
  return new Error(code)
}

function parseArguments(value: string): UnknownRecord {
  if (!value || value.length > MAX_TOOL_ARGUMENTS_LENGTH) throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
  return parsed as UnknownRecord
}

function assertAllowedKeys(value: UnknownRecord, allowed: readonly string[]) {
  if (Object.keys(value).some((key) => !allowed.includes(key))) throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
}

function optionalText(value: unknown, maxLength: number, required = false) {
  if (value === undefined || value === null) {
    if (required) throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
    return undefined
  }
  if (typeof value !== 'string') throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
  const normalized = value.replace(/\s+/g, ' ').trim()
  if ((required && normalized.length < 2) || normalized.length > maxLength) throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
  return normalized || undefined
}

function optionalNumber(value: unknown) {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1_000_000_000_000) {
    throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
  }
  return value
}

function boundedInteger(value: unknown, fallback: number, maximum: number) {
  if (value === undefined || value === null) return fallback
  if (typeof value !== 'number' || !Number.isInteger(value)) throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
  return Math.min(maximum, Math.max(1, value))
}

function productFilter(value: UnknownRecord, includeLimit: boolean): ProductFilter {
  const allowed = ['query', 'brand', 'category', 'minPrice', 'maxPrice', 'availability', ...(includeLimit ? ['limit'] : [])]
  assertAllowedKeys(value, allowed)
  const availability = value.availability === undefined ? 'all' : value.availability
  if (!['available', 'unavailable', 'unknown', 'all'].includes(String(availability))) {
    throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
  }
  const minPrice = optionalNumber(value.minPrice)
  const maxPrice = optionalNumber(value.maxPrice)
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
  }
  const query = optionalText(value.query, 160)
  const brand = optionalText(value.brand, 120)
  const category = optionalText(value.category, 120)
  return {
    ...(query ? { query } : {}),
    ...(brand ? { brand } : {}),
    ...(category ? { category } : {}),
    ...(minPrice !== undefined ? { minPrice } : {}),
    ...(maxPrice !== undefined ? { maxPrice } : {}),
    availability: availability as ProductAvailability,
    limit: includeLimit ? boundedInteger(value.limit, 5, 10) : 500,
  }
}

function currentPrice(product: AssistantProductFact) {
  if (product.salePrice !== null && product.salePrice > 0) return product.salePrice
  if (product.price !== null && product.price > 0) return product.price
  return null
}

function phraseMatches(values: Array<string | undefined>, expected: string | undefined) {
  if (!expected) return true
  const normalizedExpected = normalizeSearchText(expected)
  return values.some((value) => {
    const normalizedValue = normalizeSearchText(value || '')
    return normalizedValue === normalizedExpected
      || ` ${normalizedValue} `.includes(` ${normalizedExpected} `)
      || Boolean(normalizedValue && ` ${normalizedExpected} `.includes(` ${normalizedValue} `))
  })
}

function productSearchText(product: AssistantProductFact) {
  return normalizeSearchText([
    product.name,
    product.slug,
    product.brand,
    product.brandId,
    product.category,
    product.categoryId,
    product.description,
    ...(product.features || []),
    ...Object.keys(product.specifications || {}),
  ].filter(Boolean).join(' '))
}

function filteredProducts(products: AssistantProductFact[], filter: ProductFilter) {
  const terms = filter.query ? queryTerms(filter.query) : []
  const normalizedQuery = normalizeSearchText(filter.query || '')
  return products
    .map((product, index) => {
      const price = currentPrice(product)
      if (!product.id || !product.name || !product.slug) return null
      if (!phraseMatches([product.brand, product.brandId], filter.brand)) return null
      if (!phraseMatches([product.category, product.categoryId], filter.category)) return null
      if (filter.minPrice !== undefined && (price === null || price < filter.minPrice)) return null
      if (filter.maxPrice !== undefined && (price === null || price > filter.maxPrice)) return null
      if (filter.availability === 'available' && product.inStock !== true) return null
      if (filter.availability === 'unavailable' && product.inStock !== false) return null
      if (filter.availability === 'unknown' && product.inStock !== null) return null

      const text = productSearchText(product)
      const matchedTerms = terms.filter((term) => ` ${text} `.includes(` ${term} `)).length
      if (normalizedQuery && !text.includes(normalizedQuery) && terms.length && matchedTerms === 0) return null
      return { product, index, score: matchedTerms + (normalizedQuery && text.includes(normalizedQuery) ? 5 : 0) }
    })
    .filter((item): item is { product: AssistantProductFact; index: number; score: number } => Boolean(item))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((item) => item.product)
}

function priceLabel(product: AssistantProductFact) {
  const price = currentPrice(product)
  return price === null ? 'Liên hệ giá' : `${new Intl.NumberFormat('vi-VN').format(price)} đ`
}

function productDocument(product: AssistantProductFact): AssistantKnowledgeDocument {
  const specifications = Object.entries(product.specifications || {})
    .slice(0, 20)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
    .join('\n')
  const availability = product.inStock === true ? 'Đang bán' : product.inStock === false ? 'Tạm hết hàng' : 'Chưa xác nhận tồn kho'
  const content = [
    `Sản phẩm: ${product.name}`,
    product.brand ? `Thương hiệu: ${product.brand}` : '',
    product.category ? `Danh mục: ${product.category}` : '',
    `Giá công khai: ${priceLabel(product)}`,
    `Trạng thái công khai: ${availability}`,
    product.description ? `Mô tả: ${product.description}` : '',
    product.features?.length ? `Đặc điểm: ${product.features.slice(0, 12).join('; ')}` : '',
    specifications ? `Thông số:\n${specifications}` : '',
  ].filter(Boolean).join('\n')
  return {
    id: product.id,
    type: 'product',
    title: product.name,
    url: `/san-pham/${product.slug}`,
    excerpt: [product.brand, product.category, priceLabel(product), availability].filter(Boolean).join(' · '),
    authority: 95,
    ...(product.updatedAt ? { updatedAt: product.updatedAt } : {}),
    content: content.slice(0, 5_000),
    titleTerms: normalizeSearchText(product.name),
    keywordTerms: normalizeSearchText([product.brand, product.category, ...(product.features || [])].filter(Boolean).join(' ')),
    bodyTerms: normalizeSearchText(content),
  }
}

function productsUrl(filter: ProductFilter) {
  const params = new URLSearchParams()
  if (filter.query) params.set('search', filter.query)
  if (filter.brand) params.set('brand', filter.brand)
  if (filter.category) params.set('category', filter.category)
  const query = params.toString()
  return `/products${query ? `?${query}` : ''}`
}

function catalogResultDocument(filter: ProductFilter, count: number, title: string): AssistantKnowledgeDocument {
  const scope = [filter.query, filter.brand, filter.category].filter(Boolean).join(' · ') || 'toàn bộ catalog'
  const idScope = normalizeSearchText(scope).replace(/\s+/g, '-').slice(0, 100) || 'all'
  const content = [
    'Kết quả được tính trực tiếp từ catalog công khai của Tiến Đạt Audio.',
    `Phạm vi: ${scope}.`,
    `Số sản phẩm phù hợp: ${count}.`,
  ].join('\n')
  return {
    id: `catalog:${idScope}`,
    type: 'product',
    title,
    url: productsUrl(filter),
    excerpt: `${count} sản phẩm · ${scope}`,
    authority: 98,
    content,
    titleTerms: normalizeSearchText(title),
    keywordTerms: normalizeSearchText(scope),
    bodyTerms: normalizeSearchText(content),
  }
}

function selectedContentTypes(value: unknown) {
  if (value === undefined || value === null) return new Set(['article', 'knowledge', 'claim'])
  if (!Array.isArray(value) || value.length > 3) throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
  const types = value.map((item) => String(item))
  if (types.some((item) => !['article', 'knowledge', 'claim'].includes(item))) {
    throw toolError('ASSISTANT_TOOL_ARGUMENTS_INVALID')
  }
  return new Set(types)
}

async function executeTool(
  call: AssistantToolCall,
  ports: AssistantPorts,
  loadProducts: () => Promise<AssistantProductFact[]>,
): Promise<AssistantKnowledgeDocument[]> {
  if (!isAssistantToolName(call.name)) throw toolError('ASSISTANT_TOOL_NOT_ALLOWED')
  const args = parseArguments(call.arguments)

  if (call.name === 'search_products') {
    const filter = productFilter(args, true)
    const products = filteredProducts(await loadProducts(), filter)
    if (!products.length) return [catalogResultDocument(filter, 0, 'Không tìm thấy sản phẩm phù hợp')]
    return products.slice(0, filter.limit).map(productDocument)
  }

  if (call.name === 'get_product_details') {
    assertAllowedKeys(args, ['query'])
    const query = optionalText(args.query, 160, true)!
    const products = await loadProducts()
    const match = matchAssistantProduct(query, products)
    if (match.kind === 'resolved') return [productDocument(match.product)]
    if (match.kind === 'ambiguous') return match.products.slice(0, 5).map(productDocument)
    const filter = productFilter({ query }, false)
    return [catalogResultDocument(filter, 0, 'Không tìm thấy sản phẩm theo tên đã cung cấp')]
  }

  if (call.name === 'count_products') {
    const filter = productFilter(args, false)
    const products = filteredProducts(await loadProducts(), filter)
    return [catalogResultDocument(filter, products.length, 'Thống kê catalog công khai')]
  }

  assertAllowedKeys(args, ['query', 'types', 'limit'])
  const query = optionalText(args.query, 200, true)!
  const types = selectedContentTypes(args.types)
  const limit = boundedInteger(args.limit, 5, 5)
  const candidates = (await ports.listKnowledge(query)).filter((document) => types.has(document.type))
  return retrieveKnowledge(query, candidates, limit)
}

function traceName(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'invalid_tool'
}

function deduplicateCalls(calls: AssistantToolCall[]) {
  const seen = new Set<string>()
  return calls.filter((call) => {
    const key = `${call.name}\u0000${call.arguments}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).slice(0, MAX_TOOL_CALLS)
}

export async function collectAssistantToolEvidence(
  messages: AssistantMessage[],
  ports: AssistantPorts,
): Promise<AssistantToolEvidence> {
  if (!ports.toolsEnabled || !ports.selectTools) return { documents: [], calls: [] }
  const selected = await ports.selectTools({ messages: messages.slice(-6), tools: ASSISTANT_TOOL_DEFINITIONS })
  if (!Array.isArray(selected)) throw new Error('ASSISTANT_TOOL_RESPONSE_INVALID')
  const calls = deduplicateCalls(selected)
  let productsPromise: Promise<AssistantProductFact[]> | null = null
  const loadProducts = () => productsPromise ||= ports.listProducts()

  const executions = await Promise.all(calls.map(async (call) => {
    const name = traceName(call.name)
    try {
      const documents = await executeTool(call, ports, loadProducts)
      return { documents, trace: { name, outcome: 'completed' as const, resultCount: documents.length } }
    } catch (error) {
      const code = error instanceof Error ? error.message : 'ASSISTANT_TOOL_FAILED'
      const rejected = code === 'ASSISTANT_TOOL_NOT_ALLOWED' || code === 'ASSISTANT_TOOL_ARGUMENTS_INVALID'
      return {
        documents: [],
        trace: { name, outcome: rejected ? 'rejected' as const : 'failed' as const, resultCount: 0 },
      }
    }
  }))

  const unique = new Map<string, AssistantKnowledgeDocument>()
  for (const document of executions.flatMap((item) => item.documents)) {
    const key = `${document.type}:${document.id}:${document.url || ''}`
    if (!unique.has(key)) unique.set(key, document)
    if (unique.size >= MAX_TOOL_DOCUMENTS) break
  }
  return { documents: Array.from(unique.values()), calls: executions.map((item) => item.trace) }
}

export function assistantToolNames() {
  return ASSISTANT_TOOL_DEFINITIONS.map((tool) => tool.function.name)
}

export type { AssistantToolName }
