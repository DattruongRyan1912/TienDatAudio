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
const [speakers, amplifiers, categories, brands, combos, posts, settings] = await Promise.all([
  readJson('data/products/speakers.json'),
  readJson('data/products/amplifiers.json'),
  readJson('data/categories.json'),
  readJson('data/brands.json'),
  readJson('data/combos.json'),
  readJson('data/posts.json'),
  readJson('data/settings.json'),
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

await Promise.all([
  db.collection('products').createIndex({ slug: 1 }, { unique: true }),
  db.collection('categories').createIndex({ slug: 1 }, { unique: true }),
  db.collection('brands').createIndex({ slug: 1 }, { unique: true }),
  db.collection('posts').createIndex({ slug: 1 }, { unique: true }),
  db.collection('leads').createIndex({ createdAt: -1 }),
])

console.log(`Seed complete: ${dbName}`)
await client.close()

