import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { MongoClient } from 'mongodb'

const projectRoot = process.cwd()
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'tiendataudio'
const allowRemote = process.env.EDITORIAL_QA_ALLOW_REMOTE === '1'
const productionMode = process.env.EDITORIAL_QA_MODE === 'production'
const localHosts = new Set(['localhost', '127.0.0.1', '::1'])

function fail(message) {
  console.error(`[editorial-qa] ${message}`)
  process.exit(1)
}

function countWords(markdown) {
  return String(markdown || '').replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length
}

function normalizeParagraph(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\[[^\]]+\]\([^)]*\)/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

if (!uri) fail('MONGODB_URI is required')
let hostname = 'unknown'
try { hostname = new URL(uri).hostname } catch { fail('MONGODB_URI is invalid') }
if (!allowRemote && !localHosts.has(hostname)) fail('Refusing non-loopback QA; set EDITORIAL_QA_ALLOW_REMOTE=1 only for an explicitly authorized read-only audit')

const queue = JSON.parse(await readFile(path.join(projectRoot, 'data/editorial-seeds/research-queue-100.json'), 'utf8'))
const client = new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 5000 })
await client.connect()
const db = client.db(dbName)

try {
  const slugs = queue.items.map((item) => item.slug)
  const posts = await db.collection('posts').find({ slug: { $in: slugs } }).toArray()
  const bySlug = new Map(posts.map((post) => [post.slug, post]))
  const missing = slugs.filter((slug) => !bySlug.has(slug))
  const duplicateTitles = new Map()
  const duplicateMetaTitles = new Map()
  const duplicateParagraphs = new Map()
  const invalidInternalLinks = []
  const failures = []
  const warnings = []
  const typeCounts = {}
  let sourceReady = 0
  let imageRequired = 0
  let internalLinkReady = 0
  let noIndex = 0
  let review = 0
  let published = 0

  for (const slug of slugs) {
    const post = bySlug.get(slug)
    if (!post) continue
    if (post.status === 'review') review += 1
    if (post.status === 'published') published += 1
    if (post.seo?.noIndex === true) noIndex += 1
    const titleKey = String(post.title || '').trim().toLowerCase()
    const metaKey = String(post.seo?.metaTitle || '').trim().toLowerCase()
    if (titleKey) duplicateTitles.set(titleKey, [...(duplicateTitles.get(titleKey) || []), slug])
    if (metaKey) duplicateMetaTitles.set(metaKey, [...(duplicateMetaTitles.get(metaKey) || []), slug])
    const research = post.seoResearch && typeof post.seoResearch === 'object' ? post.seoResearch : {}
    typeCounts[research.articleType || 'missing'] = (typeCounts[research.articleType || 'missing'] || 0) + 1
    if (research.sourceCount > 0 && Array.isArray(research.sources) && research.sources.length > 0) sourceReady += 1
    if (Array.isArray(research.imagePlan) && research.imagePlan.some((image) => image?.licenseStatus === 'IMAGE_REQUIRED')) imageRequired += 1
    const internalLinks = String(post.bodyMarkdown || '').match(/\[[^\]]+\]\(\/[^)]+\)/g) || []
    if (internalLinks.length > 0) internalLinkReady += 1
    for (const link of internalLinks) {
      const href = link.match(/\]\((\/[^)]+)\)/)?.[1] || ''
      const isKnownRoute = ['/san-pham', '/products', '/contact', '/lien-he'].includes(href)
        || (href.startsWith('/kien-thuc/') && bySlug.has(href.slice('/kien-thuc/'.length)))
      if (!isKnownRoute) invalidInternalLinks.push({ slug, href })
    }
    const body = String(post.bodyMarkdown || '')
    const words = countWords(body)
    const h2Count = (body.match(/^##\s+/gm) || []).length
    if (productionMode) {
      if (post.status !== 'published') failures.push(`${slug}: status=${post.status || 'missing'}, expected published`)
      if (post.seo?.noIndex === true) failures.push(`${slug}: seo.noIndex is true, expected indexable`)
    } else {
      if (post.status !== 'review') failures.push(`${slug}: status=${post.status || 'missing'}`)
      if (post.seo?.noIndex !== true) failures.push(`${slug}: seo.noIndex is not true`)
    }
    if (words < 600) failures.push(`${slug}: only ${words} words`)
    if (h2Count < 4) failures.push(`${slug}: only ${h2Count} H2 headings`)
    if (!research.articleType || !research.primaryKeyword || !research.primaryIntent) failures.push(`${slug}: incomplete research identity`)
    if (!research.sourceCount || !research.sources?.length) failures.push(`${slug}: missing source notes`)
    if (!research.imagePlan?.length || (!productionMode && !research.imagePlan.some((image) => image?.licenseStatus === 'IMAGE_REQUIRED'))) warnings.push(`${slug}: image still requires human asset/license gate`)
    if (!internalLinks.length) failures.push(`${slug}: no internal links`)
    if (/bản nháp|reviewer cần|nội dung seed|placeholder|trước khi xuất bản/i.test(body)) failures.push(`${slug}: contains internal seed/editorial note`)
    const paragraphs = body.split(/\n\s*\n/)
      .filter((raw) => !/^(?:[-*]\s|\d+\.\s|#+\s)/.test(raw.trim()))
      .map(normalizeParagraph)
      .filter((paragraph) => paragraph.length >= 100)
    for (const paragraph of paragraphs) duplicateParagraphs.set(paragraph, [...(duplicateParagraphs.get(paragraph) || []), slug])
  }

  const duplicateTitleGroups = [...duplicateTitles.entries()].filter(([, values]) => values.length > 1)
  const duplicateMetaGroups = [...duplicateMetaTitles.entries()].filter(([, values]) => values.length > 1)
  const duplicateParagraphGroups = [...duplicateParagraphs.entries()].filter(([, values]) => values.length > 1).map(([paragraph, values]) => ({ paragraph: paragraph.slice(0, 180), slugs: values }))
  if (missing.length) failures.push(`missing posts: ${missing.join(', ')}`)
  if (posts.length !== queue.items.length) failures.push(`expected 100 posts, found ${posts.length}`)
  if (duplicateTitleGroups.length) failures.push(`duplicate titles: ${duplicateTitleGroups.length}`)
  if (duplicateMetaGroups.length) failures.push(`duplicate meta titles: ${duplicateMetaGroups.length}`)
  if (invalidInternalLinks.length) failures.push(`invalid internal links: ${invalidInternalLinks.length}`)
  if (!productionMode && published > 0) failures.push(`published posts found in local corpus: ${published}`)
  if (productionMode && published !== queue.items.length) failures.push(`expected all ${queue.items.length} posts published, found ${published}`)

  const report = {
    generatedAt: new Date().toISOString(),
    target: { hostname, database: dbName, readOnly: true, mode: productionMode ? 'production' : 'local' },
    corpus: { expected: queue.items.length, found: posts.length, review, published, noIndex, sourceReady, imageRequired, internalLinkReady },
    articleTypes: typeCounts,
    duplicates: { titles: duplicateTitleGroups, metaTitles: duplicateMetaGroups, paragraphs: duplicateParagraphGroups.slice(0, 20) },
    links: { invalidInternalLinks },
    failures,
    warnings: [...new Set(warnings)],
    humanGates: ['reviewer assignment', 'valid owned/licensed/original image for each image plan', 'fact and source claim review', 'SERP/cannibalization review', 'browser/mobile/structured-data QA'],
  }
  const outputDir = path.join(projectRoot, 'docs/content-audit')
  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, 'corpus-qa-report.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(JSON.stringify(report, null, 2))
  if (failures.length) process.exit(1)
} finally {
  await client.close()
}
