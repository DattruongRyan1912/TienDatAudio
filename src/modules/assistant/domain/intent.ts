import { normalizeSearchText } from './retrieval'
import type { AssistantConversationConstraints, AssistantIntent } from './types'

const TROUBLESHOOTING = ['bi hu', 'hu rit', 'bi re', 'bi u', 'tieng u', 'mat tieng', 'khong len nguon', 'loi am thanh', 'khong co tieng', 'khong phat bass', 'bi ngat', 'nhieu song', 'tieng bup', 'tre tieng', 'bass bi doi', 'khong nhan tin hieu', 'mui khet', 'nong bat thuong', 'am luong nhac nho hon tieng hat', 'cach khac phuc']
const COMPARISON = ['so sanh', 'tot hon', 'nen chon giua', 'hay hon', ' vs ']
const SYSTEM_RECOMMENDATION = ['tu van dan', 'tu van he thong', 'tu van am thanh', 'tu van loa', 'tu van micro', 'phoi ghep', 'cau hinh am thanh', 'cau hinh karaoke', 'cau hinh xem phim', 'lam rap phim', 'goi y he thong', 'goi y loa karaoke', 'goi y subwoofer', 'nen chon loa nao', 'chon main cong suat', 'toi can dan karaoke', 'toi can dan nghe nhac', 'toi can dan xem phim', 'combo am thanh', 'am thanh su kien', 'loa cho su kien', 'loa cho quan', 'nang cap dan', 'cho phong']
const PRODUCT_RECOMMENDATION = ['nen mua loa', 'nen chon loa', 'goi y loa', 'goi y amply', 'goi y ampli', 'san pham phu hop', 'chon san pham', 'chon loa giup toi', 'toi can subwoofer']
const ARTICLE_DISCOVERY = ['bai viet ve', 'huong dan ve', 'kien thuc ve', 'tai lieu ve', 'doc them ve']
const CONTACT_CONVERSION = ['gap nhan vien', 'dat lich', 'nhan tu van', 'tu van truc tiep', 'gui yeu cau', 'nhan vien ho tro', 'dang ky tu van']

function includesAny(value: string, phrases: string[]) {
  const wrapped = ` ${value} `
  return phrases.some((phrase) => wrapped.includes(phrase.startsWith(' ') ? phrase : ` ${phrase} `))
}

export function detectAssistantIntent(question: string): AssistantIntent {
  const normalized = normalizeSearchText(question)
  if (!normalized) return 'out_of_scope'
  if (includesAny(normalized, CONTACT_CONVERSION)) return 'contact_conversion'
  if (includesAny(normalized, TROUBLESHOOTING)) return 'troubleshooting'
  if (includesAny(normalized, COMPARISON)) return 'product_comparison'
  if (includesAny(normalized, SYSTEM_RECOMMENDATION)) return 'system_recommendation'
  if (includesAny(normalized, PRODUCT_RECOMMENDATION)) return 'product_recommendation'
  if (includesAny(normalized, ARTICLE_DISCOVERY)) return 'article_discovery'
  if (/\b(tim|co ban|co san pham|catalog|mau nao)\b/.test(normalized) && /\b(loa|ampli|amply|micro|sub|vang|mixer)\b/.test(normalized)) return 'product_lookup'
  return 'knowledge_question'
}

function parseMoney(value: string, unit: string) {
  const normalized = Number(value.replace(',', '.'))
  if (!Number.isFinite(normalized)) return null
  if (/^(ty|ti)$/i.test(unit)) return Math.round(normalized * 1_000_000_000)
  if (/^(tr|trieu)$/i.test(unit)) return Math.round(normalized * 1_000_000)
  return Math.round(normalized)
}

export function extractConversationConstraints(question: string): AssistantConversationConstraints {
  const normalized = normalizeSearchText(question)
  const constraints: AssistantConversationConstraints = {}
  const room = /(?<!\d)(\d{1,3}(?:[.,]\d+)?)\s*(?:m2|m²|mét vuông|met vuong)(?![\p{L}\d])/iu.exec(question)
  if (room) constraints.roomSizeM2 = Number(room[1].replace(',', '.'))

  const moneyMatches = Array.from(normalized.matchAll(/\b(\d+(?:[.,]\d+)?)\s*(trieu|tr|ty|ti)\b/g))
    .map((match) => parseMoney(match[1], match[2]))
    .filter((value): value is number => value !== null)
  if (moneyMatches.length >= 2) {
    constraints.budgetMin = Math.min(...moneyMatches)
    constraints.budgetMax = Math.max(...moneyMatches)
  } else if (moneyMatches.length === 1) {
    if (/\b(duoi|toi da|khong qua)\b/.test(normalized)) constraints.budgetMax = moneyMatches[0]
    else if (/\b(tren|toi thieu|tu)\b/.test(normalized)) constraints.budgetMin = moneyMatches[0]
    else constraints.budgetMax = moneyMatches[0]
  }

  const useCases = new Set<NonNullable<AssistantConversationConstraints['useCases']>[number]>()
  if (/\b(karaoke|hat)\b/.test(normalized)) useCases.add('karaoke')
  if (/\b(nghe nhac|music|hi fi|hifi)\b/.test(normalized)) useCases.add('music')
  if (/\b(xem phim|rap phim|phong phim|cinema|home theater)\b/.test(normalized)) useCases.add('cinema')
  if (/\b(su kien|event|hoi truong|san khau)\b/.test(normalized)) useCases.add('event')
  if (useCases.size) constraints.useCases = Array.from(useCases)

  const components = [
    ['loa sub', 'subwoofer'], ['loa tram', 'subwoofer'], ['loa', 'loa'], ['ampli', 'ampli'], ['amply', 'ampli'],
    ['micro', 'micro'], ['vang so', 'vang-so'], ['mixer', 'mixer'], ['main cong suat', 'main-cong-suat'],
  ] as const
  const requested = components.find(([phrase]) => ` ${normalized} `.includes(` ${phrase} `))
  if (requested) constraints.requestedComponent = requested[1]
  return constraints
}

export function mergeConversationConstraints(
  current: AssistantConversationConstraints = {},
  incoming: AssistantConversationConstraints = {},
): AssistantConversationConstraints {
  return {
    ...current,
    ...incoming,
    ...(incoming.useCases?.length || current.useCases?.length ? { useCases: incoming.useCases || current.useCases } : {}),
    ...(incoming.musicPreferences?.length || current.musicPreferences?.length ? { musicPreferences: incoming.musicPreferences || current.musicPreferences } : {}),
    ...(incoming.ownedProductIds?.length || current.ownedProductIds?.length ? { ownedProductIds: incoming.ownedProductIds || current.ownedProductIds } : {}),
    ...(incoming.preferredBrandIds?.length || current.preferredBrandIds?.length ? { preferredBrandIds: incoming.preferredBrandIds || current.preferredBrandIds } : {}),
  }
}
