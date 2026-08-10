const GENERATED_SOURCE_TEXT = /^xem nội dung tại\s+https?:\/\/\S+$/i
const GENERIC_SOCIAL_TITLE = /^(facebook(?: post)?|bài viết|góc audio)$/i

export function normalizeSocialSourceText(value: unknown, maxLength = 200_000) {
  return String(value ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength)
}

export function isGeneratedSocialSourceText(value: unknown) {
  return GENERATED_SOURCE_TEXT.test(normalizeSocialSourceText(value))
}

export function resolveImportedSocialText({ currentText, sourceText, description }: { currentText?: unknown; sourceText?: unknown; description?: unknown }) {
  const candidates = [sourceText, currentText, description]
    .map((value) => normalizeSocialSourceText(value))
    .filter((value) => value && !isGeneratedSocialSourceText(value))
  return candidates[0] || ''
}

export function getDisplaySocialText(value: unknown) {
  const text = normalizeSocialSourceText(value)
  return isGeneratedSocialSourceText(text) ? '' : text
}

export function getSocialDiscoveryDescription({ text, excerpt, metaDescription }: { text?: unknown; excerpt?: unknown; metaDescription?: unknown }) {
  return resolveImportedSocialText({ sourceText: metaDescription, currentText: excerpt, description: text })
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300)
}

export function getSocialDiscoveryTitle({ title, text, excerpt, category }: { title?: unknown; text?: unknown; excerpt?: unknown; category?: unknown }) {
  const candidate = normalizeSocialSourceText(title)
    .replace(/\s+[—|-]\s+Tiến Đạt Audio.*$/i, '')
    .trim()
  if (candidate && !GENERIC_SOCIAL_TITLE.test(candidate)) return candidate.slice(0, 120)

  const description = getSocialDiscoveryDescription({ text, excerpt })
  const firstSentence = description.split(/[.!?]\s|\n/).find(Boolean)?.trim() || ''
  const derived = firstSentence.length > 90
    ? `${firstSentence.slice(0, 87).replace(/\s+\S*$/, '').trim()}…`
    : firstSentence
  return derived || normalizeSocialSourceText(category) || 'Góc Audio'
}
