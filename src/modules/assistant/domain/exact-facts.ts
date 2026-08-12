import { normalizeSearchText } from './retrieval'
import type {
  AssistantAction,
  AssistantAnswer,
  AssistantBusinessProfile,
  AssistantExactIntent,
  AssistantProductFact,
  AssistantSource,
} from './types'

const BUSINESS_INTENT_PHRASES: Array<{ intent: AssistantExactIntent; phrases: string[] }> = [
  {
    intent: 'business_hours',
    phrases: ['gio mo cua', 'gio dong cua', 'gio lam viec', 'mo cua may gio', 'dong cua may gio', 'lam viec den may gio', 'thoi gian lam viec', 'co mo cua', 'shop mo cua', 'cua hang mo cua'],
  },
  {
    intent: 'business_location',
    phrases: ['dia chi', 'showroom o dau', 'cua hang o dau', 'cua hang nam o dau', 'shop o dau', 'vi tri cua hang', 'chi duong', 'ban do', 'mo ban do showroom'],
  },
  {
    intent: 'business_contact',
    phrases: ['so dien thoai', 'so lien he', 'dien thoai lien he', 'sdt', 'hotline', 'goi shop', 'goi cua hang', 'goi tien dat audio', 'goi dien', 'lien lac', 'lien he', 'zalo'],
  },
  {
    intent: 'business_identity',
    phrases: ['tien dat audio la ai', 'tien dat audio la gi', 'ban la ai', 'day la cua hang gi', 'ten cua hang', 'ten day du', 'ten shop', 'shop ten gi', 'cua hang ten gi', 'gioi thieu tien dat audio', 'gioi thieu ve tien dat audio', 'shop chuyen dich vu gi'],
  },
]

const PRODUCT_INTENT_PHRASES: Array<{ intent: AssistantExactIntent; phrases: string[] }> = [
  {
    intent: 'product_specification',
    phrases: ['thong so', 'cong suat', 'kich thuoc', 'trong luong', 'nang bao nhieu', 'tan so', 'tro khang', 'do nhay', 'bao nhieu watt', 'bao nhieu w'],
  },
  {
    intent: 'product_price',
    phrases: ['gia bao nhieu', 'bao nhieu tien', 'dang ban bao nhieu tien', 'gia cua', 'gia hien tai', 'gia ban', 'bao gia', 'lien he gia'],
  },
  {
    intent: 'product_availability',
    phrases: ['con hang', 'het hang', 'ton kho', 'trong kho', 'tinh trang kho', 'co san hang', 'co san', 'dang ban', 'tam het', 'mua duoc khong', 'mua ngay duoc khong'],
  },
]

function containsPhrase(normalizedQuery: string, phrase: string) {
  return ` ${normalizedQuery} `.includes(` ${phrase} `)
}

export function detectExactFactIntent(query: string): AssistantExactIntent | null {
  const normalizedQuery = normalizeSearchText(query)
  if (/\bmua\b.*\bngay duoc khong\b/.test(normalizedQuery)) return 'product_availability'
  for (const candidate of [BUSINESS_INTENT_PHRASES[0], BUSINESS_INTENT_PHRASES[1], ...PRODUCT_INTENT_PHRASES, BUSINESS_INTENT_PHRASES[2], BUSINESS_INTENT_PHRASES[3]]) {
    if (candidate.phrases.some((phrase) => containsPhrase(normalizedQuery, phrase))) return candidate.intent
  }
  if (containsPhrase(normalizedQuery, 'gia') && !containsPhrase(normalizedQuery, 'gia dinh') && !containsPhrase(normalizedQuery, 'gia su')) return 'product_price'
  return null
}

function businessSource(profile: AssistantBusinessProfile, excerpt: string): AssistantSource {
  return {
    id: 'business-profile',
    type: 'business',
    title: profile.name || 'Thông tin Tiến Đạt Audio',
    url: '/contact',
    excerpt,
    authority: 100,
    ...(profile.updatedAt ? { updatedAt: profile.updatedAt } : {}),
  }
}

function contactActions(profile: AssistantBusinessProfile): AssistantAction[] {
  const actions: AssistantAction[] = []
  if (profile.phone) {
    const phone = profile.phone.replace(/[^+\d]/g, '')
    actions.push({ type: 'call', label: `Gọi ${profile.phone}`, href: `tel:${phone}` })
    actions.push({ type: 'zalo', label: 'Nhắn Zalo', href: `https://zalo.me/${phone}` })
  }
  actions.push({ type: 'contact_form', label: 'Gửi yêu cầu tư vấn', href: '/contact' })
  return actions
}

export function resolveBusinessFact(intent: AssistantExactIntent, profile: AssistantBusinessProfile): AssistantAnswer | null {
  if (intent === 'business_contact' && profile.phone) {
    const email = profile.email ? `\nEmail: ${profile.email}.` : ''
    return {
      answerKind: 'exact',
      intent,
      answer: `Số điện thoại liên hệ của ${profile.name || 'Tiến Đạt Audio'} là ${profile.phone}.${email}`,
      confidence: 1,
      sources: [businessSource(profile, [profile.phone, profile.email].filter(Boolean).join(' · '))],
      actions: contactActions(profile),
      needsHuman: false,
    }
  }

  if (intent === 'business_location' && profile.address) {
    const actions = profile.mapUrl
      ? [{ type: 'map' as const, label: 'Mở Google Maps', href: profile.mapUrl }, ...contactActions(profile)]
      : contactActions(profile)
    return {
      answerKind: 'exact',
      intent,
      answer: `Địa chỉ của ${profile.name || 'Tiến Đạt Audio'}: ${profile.address}.`,
      confidence: 1,
      sources: [businessSource(profile, profile.address)],
      actions,
      needsHuman: false,
    }
  }

  if (intent === 'business_hours' && profile.businessHours.length) {
    return {
      answerKind: 'exact',
      intent,
      answer: `Giờ làm việc của ${profile.name || 'Tiến Đạt Audio'}:\n${profile.businessHours.map((item) => `- ${item}`).join('\n')}`,
      confidence: 1,
      sources: [businessSource(profile, profile.businessHours.join(' · '))],
      actions: contactActions(profile),
      needsHuman: false,
    }
  }

  if (intent === 'business_identity' && profile.name) {
    const alternateName = profile.alternateName && profile.alternateName !== profile.name ? ` (${profile.alternateName})` : ''
    return {
      answerKind: 'exact',
      intent,
      answer: `${profile.name}${alternateName}${profile.description ? ` — ${profile.description}` : '.'}`,
      confidence: 1,
      sources: [businessSource(profile, profile.description || profile.name)],
      actions: contactActions(profile),
      needsHuman: false,
    }
  }

  return null
}

type ProductMatch =
  | { kind: 'resolved'; product: AssistantProductFact }
  | { kind: 'ambiguous'; products: AssistantProductFact[] }
  | { kind: 'missing' }

function productTokens(name: string) {
  return [...new Set(normalizeSearchText(name).split(' ').filter((term) => term.length > 1))]
}

export function matchAssistantProduct(query: string, products: AssistantProductFact[]): ProductMatch {
  const normalizedQuery = normalizeSearchText(query)
  const queryTokenSet = new Set(normalizedQuery.split(' ').filter(Boolean))
  const eligible = products.filter((product) => product.id && product.name && product.slug)
  const fullMatches = eligible.filter((product) => {
    const normalizedName = normalizeSearchText(product.name)
    return normalizedName.length > 2 && containsPhrase(normalizedQuery, normalizedName)
  })

  if (fullMatches.length === 1) return { kind: 'resolved', product: fullMatches[0] }
  if (fullMatches.length > 1) return { kind: 'ambiguous', products: fullMatches.slice(0, 5) }

  const partialMatches = eligible
    .map((product) => {
      const tokens = productTokens(product.name)
      const matched = tokens.filter((term) => queryTokenSet.has(term)).length
      return { product, coverage: tokens.length ? matched / tokens.length : 0, matched }
    })
    .filter((candidate) => candidate.matched >= 2 && candidate.coverage >= 0.6)
    .sort((a, b) => b.coverage - a.coverage || b.matched - a.matched || a.product.name.localeCompare(b.product.name, 'vi'))

  if (partialMatches.length === 1) return { kind: 'resolved', product: partialMatches[0].product }
  if (partialMatches.length > 1) return { kind: 'ambiguous', products: partialMatches.slice(0, 5).map((item) => item.product) }
  return { kind: 'missing' }
}

function productSource(product: AssistantProductFact): AssistantSource {
  return {
    id: product.id,
    type: 'product',
    title: product.name,
    url: `/san-pham/${product.slug}`,
    excerpt: [product.brand, product.inStock === true ? 'Đang bán' : product.inStock === false ? 'Tạm hết hàng' : 'Chưa rõ tồn kho'].filter(Boolean).join(' · '),
    authority: 95,
    ...(product.updatedAt ? { updatedAt: product.updatedAt } : {}),
  }
}

function productActions(product: AssistantProductFact): AssistantAction[] {
  return [
    { type: 'product', label: 'Xem sản phẩm', href: `/san-pham/${product.slug}` },
    { type: 'contact_form', label: 'Yêu cầu tư vấn', href: '/contact' },
  ]
}

function formatPrice(value: number) {
  return `${new Intl.NumberFormat('vi-VN').format(value)} đ`
}

function formatSpecificationValue(value: string | string[]) {
  return Array.isArray(value) ? value.join(', ') : value
}

export function resolveProductFact(
  intent: AssistantExactIntent,
  query: string,
  products: AssistantProductFact[],
): AssistantAnswer {
  const match = matchAssistantProduct(query, products)
  if (match.kind === 'missing') {
    return {
      answerKind: 'clarification',
      intent,
      answer: 'Tôi chưa xác định được chính xác sản phẩm. Bạn hãy nhập đầy đủ tên hoặc model sản phẩm để tôi kiểm tra đúng dữ liệu catalog.',
      confidence: 0,
      sources: [],
      actions: [{ type: 'contact_form', label: 'Nhờ nhân viên kiểm tra', href: '/contact' }],
      needsHuman: true,
    }
  }

  if (match.kind === 'ambiguous') {
    return {
      answerKind: 'clarification',
      intent,
      answer: `Tôi tìm thấy nhiều sản phẩm có tên gần giống: ${match.products.map((product) => product.name).join('; ')}. Bạn muốn kiểm tra model nào?`,
      confidence: 0.4,
      sources: match.products.map(productSource),
      actions: [],
      needsHuman: true,
    }
  }

  const product = match.product
  if (intent === 'product_price') {
    const currentPrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price
    const answer = currentPrice && currentPrice > 0
      ? product.salePrice && product.salePrice > 0 && product.price && product.price > product.salePrice
        ? `${product.name} đang có giá ${formatPrice(product.salePrice)}; giá niêm yết ${formatPrice(product.price)}.`
        : `Giá hiện tại của ${product.name} là ${formatPrice(currentPrice)}.`
      : `${product.name} hiện đang để trạng thái “Liên hệ giá”.`
    return {
      answerKind: 'exact', intent, answer, confidence: 1,
      sources: [productSource(product)], actions: productActions(product), needsHuman: currentPrice === null || currentPrice <= 0,
    }
  }

  if (intent === 'product_availability') {
    const answer = product.inStock === true
      ? `Trạng thái trên catalog hiện tại của ${product.name}: đang bán. Website không lưu số lượng tồn kho, vì vậy hãy liên hệ nhân viên để xác nhận trước khi đến cửa hàng.`
      : product.inStock === false
        ? `Trạng thái trên catalog hiện tại của ${product.name}: tạm hết hàng.`
        : `Catalog chưa có trạng thái hàng hóa đủ tin cậy cho ${product.name}.`
    return {
      answerKind: product.inStock === null ? 'fallback' : 'exact', intent, answer,
      confidence: product.inStock === null ? 0 : 1,
      sources: [productSource(product)], actions: productActions(product), needsHuman: true,
    }
  }

  const normalizedQuery = normalizeSearchText(query)
  const entries = Object.entries(product.specifications)
  const matchingEntries = entries.filter(([key]) => containsPhrase(normalizedQuery, normalizeSearchText(key)))
  const selectedEntries = (matchingEntries.length ? matchingEntries : entries).slice(0, 8)
  const answer = selectedEntries.length
    ? `Thông số catalog của ${product.name}:\n${selectedEntries.map(([key, value]) => `- ${key}: ${formatSpecificationValue(value)}`).join('\n')}`
    : `Catalog chưa cập nhật thông số kỹ thuật cho ${product.name}.`
  return {
    answerKind: selectedEntries.length ? 'exact' : 'fallback', intent, answer,
    confidence: selectedEntries.length ? 1 : 0,
    sources: [productSource(product)], actions: productActions(product), needsHuman: !selectedEntries.length,
  }
}

export function unavailableExactFact(intent: AssistantExactIntent): AssistantAnswer {
  const subject = intent.startsWith('business_') ? 'thông tin doanh nghiệp' : 'dữ liệu sản phẩm'
  return {
    answerKind: 'fallback',
    intent,
    answer: `Tôi chưa thể xác nhận ${subject} từ cơ sở dữ liệu hiện hành vào lúc này. Tôi sẽ không dùng dữ liệu dự phòng để trả lời một thông tin có thể đã thay đổi.`,
    confidence: 0,
    sources: [],
    actions: [],
    needsHuman: true,
  }
}
