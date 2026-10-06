import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { MongoClient } from 'mongodb'

const projectRoot = process.cwd()
const apply = process.argv.includes('--apply')
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'tiendataudio'
const target = process.env.EDITORIAL_PURGE_TARGET || ''
const confirmation = process.env.EDITORIAL_PURGE_CONFIRM || ''
const localHosts = new Set(['localhost', '127.0.0.1', '::1'])
const productionConfirmation = 'PURGE-AI-DRAFTS'

function fail(message) {
  console.error(`[unpublish-ai-drafts] ${message}`)
  process.exit(1)
}

if (!uri) fail('MONGODB_URI is required.')

let hostname = 'unknown'
try {
  hostname = new URL(uri).hostname
} catch {
  fail('MONGODB_URI is invalid.')
}

if (apply) {
  const isLocalApply = target === 'local' && localHosts.has(hostname)
  const isProductionApply = target === 'production'
    && localHosts.has(hostname)
    && confirmation === productionConfirmation
  if (!isLocalApply && !isProductionApply) {
    fail('Refusing to mutate: local apply requires EDITORIAL_PURGE_TARGET=local; production requires EDITORIAL_PURGE_TARGET=production and EDITORIAL_PURGE_CONFIRM=PURGE-AI-DRAFTS.')
  }
}

// 1. Identify high-quality pillar articles to KEEP published
const batch1Manifest = JSON.parse(
  await readFile(path.join(projectRoot, 'data/editorial-seeds/batch-1/manifest.json'), 'utf8')
)
const keepSlugs = new Set(batch1Manifest.posts.map((p) => p.slug))

// Keep user manual posts if any
keepSlugs.add('bong-truong')

console.log(`[unpublish-ai-drafts] Whitelisted ${keepSlugs.size} high-quality articles to keep published:`)
for (const slug of keepSlugs) {
  console.log(`  - ${slug}`)
}

// 2. Connect to MongoDB
const client = await new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 5000 }).connect()
const db = client.db(dbName)
const posts = db.collection('posts')

try {
  // Find all posts that are currently published or in review but are NOT in the keep list
  const allPosts = await posts.find({}).toArray()
  const toUnpublish = allPosts.filter((post) => !keepSlugs.has(post.slug))

  console.log(`\n[unpublish-ai-drafts] Found ${allPosts.length} total posts in database.`)
  console.log(`[unpublish-ai-drafts] Identified ${toUnpublish.length} AI-generated skeleton posts to unpublish/hide from search engines.`)

  if (!apply) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      target: { hostname, database: dbName },
      totalFound: allPosts.length,
      keptCount: keepSlugs.size,
      wouldUnpublish: toUnpublish.length,
      sampleToUnpublish: toUnpublish.slice(0, 5).map((p) => ({ id: p.id, slug: p.slug, title: p.title })),
    }, null, 2))
    console.log('\nRun with EDITORIAL_PURGE_TARGET=local node scripts/unpublish-ai-editorial-drafts.mjs --apply to execute.')
    process.exit(0)
  }

  // Execute unpublish mutation
  const now = new Date().toISOString()
  const unpublishSlugs = toUnpublish.map((p) => p.slug)

  const result = await posts.updateMany(
    { slug: { $in: unpublishSlugs } },
    {
      $set: {
        status: 'draft',
        'seo.noIndex': true,
        publishedAt: null,
        scheduledAt: null,
        updatedAt: now,
      },
      $inc: { version: 1 },
    }
  )

  // Ensure the 5 whitelisted articles are explicitly published with noIndex = false
  const publishResult = await posts.updateMany(
    { slug: { $in: Array.from(keepSlugs) } },
    {
      $set: {
        status: 'published',
        'seo.noIndex': false,
        updatedAt: now,
      },
    }
  )

  console.log(JSON.stringify({
    mode: 'apply',
    target: { hostname, database: dbName },
    unpublishedCount: result.modifiedCount,
    ensuredPublishedCount: publishResult.modifiedCount,
    status: 'success',
  }, null, 2))

} finally {
  await client.close()
}
