import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'tiendataudio'

if (!uri) {
  console.error('MONGODB_URI is required. Copy .env.example to .env.local and export it before seeding.')
  process.exit(1)
}

const projectRoot = process.cwd()
const readJson = async (file) => JSON.parse(await readFile(path.join(projectRoot, file), 'utf8'))
const [speakers, amplifiers, categories, brands, combos, posts, settings, businessProfile, seoStrategy] = await Promise.all([
  readJson('data/products/speakers.json'),
  readJson('data/products/amplifiers.json'),
  readJson('data/categories.json'),
  readJson('data/brands.json'),
  readJson('data/combos.json'),
  readJson('data/posts.json'),
  readJson('data/settings.json'),
  readJson('data/business-profile.json'),
  readJson('data/seo-strategy.json'),
])

const client = await new MongoClient(uri, { maxPoolSize: 5 }).connect()
const db = client.db(dbName)
const products = [...speakers.speakers, ...amplifiers.amplifiers]

async function upsert(collectionName, documents) {
  if (!documents.length) return
  const collection = db.collection(collectionName)
  await collection.bulkWrite(documents.map((document) => ({
    updateOne: {
      filter: { id: document.id },
      update: { $set: document },
      upsert: true,
    },
  })))
  console.log(`${collectionName}: ${documents.length} records`)
}

await upsert('products', products)
await upsert('categories', categories.categories)
await upsert('brands', brands)
await upsert('combos', combos)
await upsert('posts', posts)
await db.collection('site_settings').updateOne(
  { key: 'site' },
  { $set: { key: 'site', value: settings, updatedAt: new Date().toISOString() } },
  { upsert: true },
)
await db.collection('site_settings').updateOne(
  { key: 'business_profile' },
  { $set: { key: 'business_profile', value: businessProfile, updatedAt: new Date().toISOString() } },
  { upsert: true },
)
await db.collection('site_settings').updateOne(
  { key: 'seo_strategy' },
  { $set: { key: 'seo_strategy', value: seoStrategy, updatedAt: new Date().toISOString() } },
  { upsert: true },
)

await Promise.all([
  db.collection('products').createIndex({ slug: 1 }, { unique: true }),
  db.collection('categories').createIndex({ slug: 1 }, { unique: true }),
  db.collection('brands').createIndex({ slug: 1 }, { unique: true }),
  db.collection('posts').createIndex({ slug: 1 }, { unique: true, name: 'posts_slug_unique' }),
  db.collection('posts').createIndex({ status: 1, publishedAt: -1 }, { name: 'posts_status_published' }),
  db.collection('posts').createIndex({ keywordIds: 1 }, { name: 'posts_keyword_ids' }),
  db.collection('post_revisions').createIndex({ postId: 1, version: -1 }, { name: 'post_revisions_post_version' }),
  db.collection('leads').createIndex({ createdAt: -1 }, { name: 'leads_created_at' }),
  db.collection('analytics_events').createIndex({ createdAt: -1, type: 1 }, { name: 'events_created_type' }),
  db.collection('analytics_events').createIndex({ sessionId: 1, createdAt: -1 }, { name: 'events_session_created' }),
])

console.log(`Seed complete: ${dbName}`)
await client.close()
