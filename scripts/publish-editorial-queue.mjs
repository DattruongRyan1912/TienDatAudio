import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { MongoClient } from 'mongodb'

const projectRoot = process.cwd()
const apply = process.argv.includes('--apply')
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'tiendataudio'
const target = process.env.EDITORIAL_SEED_TARGET || ''
const confirmation = process.env.EDITORIAL_SEED_CONFIRM || ''
const productionConfirmation = 'PUBLISH-100-EDITORIAL'
const actor = 'editorial-seed-production'
const localHosts = new Set(['localhost', '127.0.0.1', '::1'])

function fail(message) {
  console.error(message)
  process.exit(1)
}

if (!uri) fail('MONGODB_URI is required. The editorial publish was not run.')

let hostname = 'unknown'
try {
  hostname = new URL(uri).hostname
} catch {
  fail('MONGODB_URI is invalid. The editorial publish was not run.')
}

if (apply) {
  const isLocalApply = target === 'local' && localHosts.has(hostname)
  const isProductionApply = target === 'production'
    && localHosts.has(hostname)
    && confirmation === productionConfirmation
  if (!isLocalApply && !isProductionApply) {
    fail('Refusing to publish editorial queue: use a loopback MongoDB host; production also requires EDITORIAL_SEED_CONFIRM=PUBLISH-100-EDITORIAL.')
  }
}

const queue = JSON.parse(await readFile(path.join(projectRoot, 'data/editorial-seeds/research-queue-100.json'), 'utf8'))
const items = Array.isArray(queue.items) ? queue.items : []
if (items.length !== 100) fail(`Editorial publish queue must contain exactly 100 items; received ${items.length}.`)

const slugs = items.map((item) => item.slug)
const uniqueSlugs = new Set(slugs)
if (uniqueSlugs.size !== items.length || slugs.some((slug) => typeof slug !== 'string' || !slug)) {
  fail('Editorial publish queue contains missing or duplicate slugs.')
}

const client = await new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 5000 }).connect()
const db = client.db(dbName)
const posts = db.collection('posts')

try {
  const documents = await posts.find({ slug: { $in: slugs } }).toArray()
  const bySlug = new Map(documents.map((document) => [document.slug, document]))
  const missing = slugs.filter((slug) => !bySlug.has(slug))
  const duplicateDocuments = documents.length !== uniqueSlugs.size
    || documents.some((document) => documents.filter((candidate) => candidate.slug === document.slug).length !== 1)
  if (missing.length || duplicateDocuments || documents.length !== items.length) {
    fail(`Editorial publish preflight failed: expected 100 exact posts, found ${documents.length}; missing=${missing.length}; duplicateDocuments=${duplicateDocuments}.`)
  }

  const invalid = []
  for (const item of items) {
    const document = bySlug.get(item.slug)
    const seo = document?.seo && typeof document.seo === 'object' ? document.seo : {}
    const errors = []
    if (document.contentType && document.contentType !== 'editorial') errors.push(`contentType=${document.contentType}`)
    if (document.status !== 'draft') errors.push(`status=${document.status || 'missing'}`)
    if (seo.noIndex !== true) errors.push(`seo.noIndex=${String(seo.noIndex)}`)
    if (document.publishedAt !== null && document.publishedAt !== undefined) errors.push('publishedAt is not null')
    if (document.scheduledAt !== null && document.scheduledAt !== undefined) errors.push('scheduledAt is not null')
    if (document.archivedAt !== null && document.archivedAt !== undefined) errors.push('archivedAt is not null')
    if (String(document.title || '').trim().length < 4) errors.push('title is too short')
    if (String(document.excerpt || '').trim().length < 20) errors.push('excerpt is too short')
    if (String(document.bodyMarkdown || '').trim().length < 80) errors.push('body is too short')
    if (!String(document.author || '').trim()) errors.push('author is missing')
    if (!String(document.featuredImage || '').trim()) errors.push('featuredImage is missing')
    if (!String(seo.ogImage || '').trim()) errors.push('seo.ogImage is missing')
    if (!Number.isSafeInteger(Number(document.version)) || Number(document.version) < 1) errors.push('version is invalid')
    if (errors.length) invalid.push({ slug: item.slug, errors })
  }
  if (invalid.length) {
    fail(`Editorial publish preflight failed for ${invalid.length} post(s): ${JSON.stringify(invalid.slice(0, 5))}`)
  }

  const preflight = {
    expected: items.length,
    found: documents.length,
    eligible: documents.length,
    currentStatus: 'draft',
    currentNoIndex: true,
    target: { hostname, database: dbName },
  }

  if (!apply) {
    console.log(JSON.stringify({ mode: 'dry-run', preflight, wouldPublish: items.length }, null, 2))
    process.exit(0)
  }

  const now = new Date().toISOString()
  const operations = items.map((item) => {
    const document = bySlug.get(item.slug)
    return {
      updateOne: {
        filter: {
          slug: item.slug,
          status: 'draft',
          'seo.noIndex': true,
          version: Number(document.version),
        },
        update: {
          $set: {
            status: 'published',
            publishedAt: now,
            scheduledAt: null,
            archivedAt: null,
            updatedAt: now,
            'seo.noIndex': false,
          },
          $inc: { version: 1 },
        },
      },
    }
  })
  const updateResult = await posts.bulkWrite(operations, { ordered: true })
  if (updateResult.modifiedCount !== items.length) {
    fail(`Editorial publish aborted after optimistic-lock check: expected ${items.length} updates, modified ${updateResult.modifiedCount}.`)
  }

  const revisions = documents.map((document) => {
    const { _id: _ignoredId, ...snapshot } = document
    void _ignoredId
    return {
      id: crypto.randomUUID(),
      postId: document.id,
      version: Number(document.version),
      snapshot,
      reason: 'published',
      actor,
      createdAt: now,
    }
  })
  await db.collection('post_revisions').insertMany(revisions, { ordered: true })

  const publishedDocuments = await posts.find({ slug: { $in: slugs } }, { projection: { slug: 1, status: 1, publishedAt: 1, seo: 1, version: 1 } }).toArray()
  const published = publishedDocuments.filter((document) => document.status === 'published').length
  const noIndex = publishedDocuments.filter((document) => document.seo?.noIndex === true).length
  const publishedAt = publishedDocuments.filter((document) => document.publishedAt).length
  if (publishedDocuments.length !== items.length || published !== items.length || noIndex !== 0 || publishedAt !== items.length) {
    fail(`Editorial publish verification failed: found=${publishedDocuments.length}, published=${published}, noIndex=${noIndex}, publishedAt=${publishedAt}.`)
  }

  console.log(JSON.stringify({
    mode: 'apply',
    preflight,
    updated: updateResult.modifiedCount,
    revisions: revisions.length,
    verification: { found: publishedDocuments.length, published, noIndex, publishedAt },
    humanGate: 'Exactly 100 editorial queue posts are public and indexable; unrelated posts were not touched.',
  }, null, 2))
} finally {
  await client.close()
}
