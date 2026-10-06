import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { MongoClient } from 'mongodb'

const projectRoot = process.cwd()
const apply = process.argv.includes('--apply')
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'tiendataudio'
const target = process.env.EDITORIAL_BATCH_TARGET || ''
const confirmation = process.env.EDITORIAL_BATCH_CONFIRM || ''
const preserveLifecycle = process.env.EDITORIAL_BATCH_PRESERVE_LIFECYCLE === '1'
const localHosts = new Set(['localhost', '127.0.0.1', '::1'])
const batchDir = process.env.EDITORIAL_BATCH_DIR || 'data/editorial-seeds/batch-1'
const productionConfirmation = 'SYNC-100-PUBLISHED'

function fail(message) {
  console.error(`[editorial-batch] ${message}`)
  process.exit(1)
}

function countWords(markdown) {
  return String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`\[\]()\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

function internalLinkCount(markdown) {
  return (String(markdown || '').match(/\[[^\]]+\]\(\/[^)]+\)/g) || []).length
}

const manifest = JSON.parse(await readFile(path.join(projectRoot, batchDir, 'manifest.json'), 'utf8'))
const items = Array.isArray(manifest.posts) ? manifest.posts : []
if (items.length < 5 || items.length > 10) fail(`batch must contain 5-10 posts; received ${items.length}`)
if (new Set(items.map((item) => item.id)).size !== items.length) fail('batch contains duplicate ids')

if (!uri) fail('MONGODB_URI is required')
let hostname = 'unknown'
try { hostname = new URL(uri).hostname } catch { fail('MONGODB_URI is invalid') }
const isLocalApply = apply && localHosts.has(hostname) && target === 'local'
const isProductionSync = localHosts.has(hostname) && target === 'production' && confirmation === productionConfirmation && preserveLifecycle
if (apply && !isLocalApply && !isProductionSync) {
  fail('Refusing to mutate content: local apply requires EDITORIAL_BATCH_TARGET=local; production sync requires EDITORIAL_BATCH_TARGET=production, EDITORIAL_BATCH_CONFIRM=SYNC-100-PUBLISHED and EDITORIAL_BATCH_PRESERVE_LIFECYCLE=1')
}

const client = await new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 5000 }).connect()
const db = client.db(dbName)
const posts = db.collection('posts')
const now = new Date().toISOString()

try {
  const actions = []
  for (const item of items) {
    const body = (await readFile(path.join(projectRoot, batchDir, item.bodyFile), 'utf8')).trim()
    const errors = []
    if (countWords(body) < 600) errors.push(`body has ${countWords(body)} words`)
    if (!/^##\s+/m.test(body)) errors.push('body needs H2 headings')
    if (!internalLinkCount(body)) errors.push('body needs an internal link')
    if (!item.seoResearch?.researchedAt) errors.push('researchedAt is missing')
    if (!item.seoResearch?.sourceCount || !item.seoResearch?.sources?.length) errors.push('source notes are missing')
    if (!item.seoResearch?.imagePlan?.length) errors.push('image plan is missing')
    if (/bản nháp|reviewer cần|nội dung seed|placeholder|trước khi xuất bản/i.test(body)) errors.push('body contains internal seed notes')
    if (errors.length) fail(`${item.slug}: ${errors.join('; ')}`)

    const shouldPublish = process.env.EDITORIAL_BATCH_PUBLISH === '1' || process.env.EDITORIAL_BATCH_PUBLISH === 'true'
    const existing = await posts.findOne({ $or: [{ id: item.id }, { slug: item.slug }] })
    if (existing && existing.contentType && existing.contentType !== 'editorial') {
      actions.push({ action: 'blocked', slug: item.slug, reason: `contentType=${existing.contentType}` })
      continue
    }
    if (isProductionSync && existing && (existing.status !== 'published' || existing.seo?.noIndex === true)) {
      actions.push({ action: 'blocked', slug: item.slug, reason: `production lifecycle is not published/indexable: status=${existing.status || 'missing'}, noIndex=${existing.seo?.noIndex === true}` })
      continue
    }
    if (!isProductionSync && existing && !['draft', 'review', 'published'].includes(existing.status || 'draft')) {
      actions.push({ action: 'blocked', slug: item.slug, reason: `status=${existing.status || 'missing'}` })
      continue
    }
    if (!isProductionSync && existing && existing.status === 'review' && existing.batchId === manifest.batchId && !shouldPublish) {
      if (!existing.seoResearch?.articleType && item.seoResearch?.articleType) {
        if (!apply) {
          actions.push({ action: 'would-update-metadata', slug: item.slug, field: 'seoResearch.articleType', value: item.seoResearch.articleType })
          continue
        }
        const next = {
          ...existing,
          seoResearch: { ...existing.seoResearch, articleType: item.seoResearch.articleType },
          updatedAt: now,
          version: Math.max(1, Number(existing.version) || 1) + 1,
        }
        delete next._id
        const result = await posts.replaceOne({ _id: existing._id, version: existing.version || 1 }, next)
        if (result.modifiedCount !== 1) fail(`${item.slug}: metadata update did not modify exactly one document`)
        actions.push({ action: 'updated-metadata', slug: item.slug, field: 'seoResearch.articleType', value: item.seoResearch.articleType })
        continue
      }
      actions.push({ action: 'skip', slug: item.slug, reason: 'batch already applied' })
      continue
    }

    const targetStatus = isProductionSync
      ? existing.status
      : (shouldPublish ? 'published' : 'review')
    const targetNoIndex = isProductionSync
      ? existing.seo?.noIndex === true
      : (shouldPublish ? (item.seo?.noIndex === true) : true)
    const targetPublishedAt = isProductionSync
      ? existing.publishedAt || null
      : (shouldPublish ? (existing?.publishedAt || now) : null)

    const next = {
      ...(existing || {}),
      ...item,
      bodyMarkdown: body,
      contentType: 'editorial',
      status: targetStatus,
      reviewer: isProductionSync ? (existing.reviewer || '') : (shouldPublish ? 'editorial-admin' : ''),
      scheduledAt: isProductionSync ? (existing.scheduledAt || null) : null,
      publishedAt: targetPublishedAt,
      archivedAt: isProductionSync ? (existing.archivedAt || null) : null,
      seo: { ...(existing?.seo || {}), ...item.seo, noIndex: targetNoIndex },
      seoResearch: item.seoResearch,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      version: Math.max(1, Number(existing?.version) || 1) + (existing ? 1 : 0),
      readingTime: Math.max(1, Math.ceil(countWords(body) / 220)),
      batchId: manifest.batchId,
    }
    delete next.bodyFile
    if (existing) delete next._id

    if (!existing) {
      if (!apply) {
        actions.push({ action: 'would-create', slug: item.slug, status: next.status, noIndex: next.seo.noIndex, wordCount: countWords(body) })
        continue
      }
      await posts.insertOne(next)
      actions.push({ action: 'created', slug: item.slug, status: next.status, noIndex: next.seo.noIndex, wordCount: countWords(body) })
      continue
    }

    if (!apply) {
      actions.push({ action: 'would-update', slug: item.slug, fromVersion: existing.version || 1, toVersion: next.version, status: next.status, noIndex: next.seo.noIndex, wordCount: countWords(body) })
      continue
    }
    const result = await posts.replaceOne({ _id: existing._id, version: existing.version || 1 }, next)
    if (result.modifiedCount !== 1) fail(`${item.slug}: optimistic update did not modify exactly one document`)
    actions.push({ action: 'updated', slug: item.slug, fromVersion: existing.version || 1, toVersion: next.version, status: next.status, noIndex: next.seo.noIndex, wordCount: countWords(body) })
  }

  const blocked = actions.filter((action) => ['missing', 'blocked'].includes(action.action))
  if (blocked.length) fail(`batch preflight failed: ${JSON.stringify(blocked)}`)
  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    target: { hostname, database: dbName },
    batchId: manifest.batchId,
    lifecycleMode: isProductionSync ? 'preserve-production-published' : 'review-noindex',
    humanGate: isProductionSync
      ? 'Production lifecycle was preserved; no publish/unpublish/index toggle was performed by this sync.'
      : 'All updated posts remain review/noindex; no publish or indexable mutation was performed.',
    actions,
  }, null, 2))
} finally {
  await client.close()
}
