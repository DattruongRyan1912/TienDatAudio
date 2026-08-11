import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { MongoClient } from 'mongodb'

const projectRoot = process.cwd()
const apply = process.argv.includes('--apply')
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'tiendataudio'
const target = process.env.EDITORIAL_SEED_TARGET || ''
const confirmation = process.env.EDITORIAL_SEED_CONFIRM || ''
const productionConfirmation = 'SEED-100-DRAFT-NOINDEX'

if (!uri) {
  console.error('MONGODB_URI is required. Temporary editorial images were not assigned.')
  process.exit(1)
}

let hostname = 'unknown'
try {
  hostname = new URL(uri).hostname
} catch {
  console.error('MONGODB_URI is invalid. Temporary editorial images were not assigned.')
  process.exit(1)
}

const localHosts = new Set(['localhost', '127.0.0.1', '::1'])
if (apply) {
  const isLocalApply = target === 'local' && localHosts.has(hostname)
  const isProductionApply = target === 'production' && localHosts.has(hostname) && confirmation === productionConfirmation
  if (!isLocalApply && !isProductionApply) {
    console.error('Refusing to assign temporary images: use a loopback MongoDB host; production also requires EDITORIAL_SEED_CONFIRM=SEED-100-DRAFT-NOINDEX.')
    process.exit(1)
  }
}

const readJson = async (file) => JSON.parse(await readFile(path.join(projectRoot, file), 'utf8'))
const queue = await readJson('data/editorial-seeds/research-queue-100.json')
const imageMap = await readJson('data/editorial-seeds/temp-image-map.json')

if (!Array.isArray(queue.items) || queue.items.length !== 100) {
  console.error(`Research queue must contain exactly 100 items; received ${queue.items?.length || 0}.`)
  process.exit(1)
}

const assignments = queue.items.map((item) => {
  const image = imageMap.images?.[item.cluster]
  if (!image) throw new Error(`Missing temporary image mapping for cluster: ${item.cluster}`)
  return { slug: item.slug, cluster: item.cluster, image }
})

for (const assignment of assignments) {
  const localPath = path.join(projectRoot, 'public', assignment.image.replace(/^\//, ''))
  await stat(localPath)
}

const client = await new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 5000 }).connect()
const db = client.db(dbName)
const posts = db.collection('posts')

try {
  const now = new Date().toISOString()
  const actions = []

  for (const assignment of assignments) {
    const existing = await posts.findOne(
      { slug: assignment.slug },
      { projection: { status: 1, seo: 1, featuredImage: 1, seedSource: 1 } },
    )

    if (!existing) {
      actions.push({ action: 'missing', slug: assignment.slug })
      continue
    }

    const isDraftNoIndex = existing.status === 'draft' && existing.seo?.noIndex === true
    if (!isDraftNoIndex) {
      actions.push({ action: 'protected', slug: assignment.slug, status: existing.status || 'unknown', noIndex: existing.seo?.noIndex === true })
      continue
    }

    const changed = existing.featuredImage !== assignment.image || existing.seo?.ogImage !== assignment.image
    if (!changed) {
      actions.push({ action: 'unchanged', slug: assignment.slug, image: assignment.image })
      continue
    }

    if (!apply) {
      actions.push({ action: 'update', slug: assignment.slug, cluster: assignment.cluster, image: assignment.image })
      continue
    }

    await posts.updateOne(
      { slug: assignment.slug, status: 'draft', 'seo.noIndex': true },
      { $set: { featuredImage: assignment.image, 'seo.ogImage': assignment.image, updatedAt: now } },
    )
    actions.push({ action: 'updated', slug: assignment.slug, cluster: assignment.cluster, image: assignment.image })
  }

  const counts = actions.reduce((result, item) => {
    result[item.action] = (result[item.action] || 0) + 1
    return result
  }, {})

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    target: { hostname, database: dbName },
    assignments: assignments.length,
    counts,
    humanGate: 'Only draft/noindex posts were eligible; published or indexed posts were protected.',
  }, null, 2))
} finally {
  await client.close()
}
