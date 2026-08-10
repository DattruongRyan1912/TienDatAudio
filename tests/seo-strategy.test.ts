import assert from 'node:assert/strict'
import { test } from 'node:test'
import fallbackProfile from '../data/business-profile.json'
import { buildLLMSText, normalizeSEOConfig } from '../src/lib/seo-strategy'
import type { BusinessProfile } from '../src/lib/business-profile'

test('llms.txt exposes Markdown links for canonical and discovery pages', () => {
  const config = normalizeSEOConfig({
    keywords: [{ id: 'local-audio', term: 'thiết bị âm thanh Quảng Ngãi', targetPage: '/products', intent: 'local', cluster: 'core-local' }],
    ai: {
      enabled: true,
      positioning: 'Tư vấn âm thanh theo không gian.',
      entityFacts: [],
      services: [],
      faqs: [],
      preferredSources: ['/', '/products'],
      answerGuidelines: [],
    },
  })
  const output = buildLLMSText(config, fallbackProfile as BusinessProfile)

  assert.match(output, /^# Tiến Đạt Audio\n/)
  assert.match(output, /^> .+\n/m)
  assert.match(output, /- Website: \[Tiến Đạt Audio\]\(https:\/\/tiendataudioquangngai\.id\.vn\)/)
  assert.match(output, /- \[thiết bị âm thanh Quảng Ngãi\]\(https:\/\/tiendataudioquangngai\.id\.vn\/products\)/)
  assert.match(output, /- \[Homepage\]\(https:\/\/tiendataudioquangngai\.id\.vn\/?\)/)
})
