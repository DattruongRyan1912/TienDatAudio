import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import localSEOConfig from '../data/seo-strategy.json'
import { getSEODataForPage } from '../src/lib/seo-static'

const landingSource = readFileSync(new URL('../src/app/loa-quang-ngai/page.tsx', import.meta.url), 'utf8')
const sitemapSource = readFileSync(new URL('../src/app/sitemap.ts', import.meta.url), 'utf8')

test('local Quảng Ngãi landing has an indexable canonical SEO record', () => {
  const seo = getSEODataForPage('/loa-quang-ngai')
  assert.equal(seo?.canonicalUrl, 'https://tiendataudioquangngai.id.vn/loa-quang-ngai')
  assert.equal(seo?.metaRobots, 'index,follow')
  assert.ok(seo?.keywords.includes('loa Quảng Ngãi'))
})

test('local keyword map routes commercial queries to the landing or a matching guide', () => {
  const terms = new Map(localSEOConfig.keywords.map((keyword) => [keyword.term, keyword.targetPage]))
  assert.equal(terms.get('loa Quảng Ngãi'), '/loa-quang-ngai')
  assert.equal(terms.get('bán loa Quảng Ngãi'), '/loa-quang-ngai')
  assert.equal(terms.get('cửa hàng âm thanh Quảng Ngãi'), '/loa-quang-ngai')
  assert.equal(terms.get('lắp đặt âm thanh Quảng Ngãi'), '/kien-thuc/lap-dat-am-thanh-gia-dinh-quang-ngai')
  assert.equal(terms.get('tư vấn phối ghép âm thanh Quảng Ngãi'), '/kien-thuc/tu-van-phoi-ghep-am-thanh-tai-quang-ngai')
})

test('local landing is discoverable from sitemap and contains matching public facts', () => {
  assert.match(sitemapSource, /baseUrl}\/loa-quang-ngai/)
  assert.match(landingSource, /Loa Quảng Ngãi/)
  assert.match(landingSource, /264 Phan Đình Phùng/)
  assert.match(landingSource, /0934995657/)
  assert.match(landingSource, /FAQPage/)
  assert.match(landingSource, /application\/ld\+json/)
})
