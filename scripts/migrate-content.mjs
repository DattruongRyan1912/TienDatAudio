import { MongoClient } from 'mongodb'

const args = new Set(process.argv.slice(2))
const apply = args.has('--apply')
const backupConfirmed = args.has('--backup-confirmed')
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'tiendataudio'

if (!uri) {
  console.error('MONGODB_URI is required for content migration.')
  process.exit(1)
}
if (apply && !backupConfirmed) {
  console.error('Refusing to write without --backup-confirmed. Run a MongoDB backup first.')
  process.exit(1)
}

const client = await new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 5000 }).connect()
const db = client.db(dbName)
const posts = db.collection('posts')

try {
  const duplicates = await posts.aggregate([
    { $match: { slug: { $type: 'string', $ne: '' } } },
    { $group: { _id: '$slug', count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $limit: 20 },
  ]).toArray()
  if (duplicates.length) {
    console.error(`Duplicate slugs must be resolved before migration: ${duplicates.map((item) => item._id).join(', ')}`)
    process.exitCode = 1
  } else {
    const cursor = posts.find({})
    const operations = []
    let unchanged = 0
    for await (const post of cursor) {
      const set = {}
      if (typeof post.bodyMarkdown !== 'string' && typeof post.content === 'string') set.bodyMarkdown = post.content
      if (!post.status) set.status = post.published === true ? 'published' : 'draft'
      if (!Number.isInteger(post.version) || post.version < 1) set.version = 1
      if (!post.createdAt) set.createdAt = post.created_at || post.updatedAt || new Date().toISOString()
      if (!post.updatedAt) set.updatedAt = post.updated_at || post.createdAt || new Date().toISOString()
      if (!Array.isArray(post.gallery)) set.gallery = []
      if (!Array.isArray(post.keywordIds)) set.keywordIds = post.primaryKeywordId ? [post.primaryKeywordId] : []
      if (!Array.isArray(post.relatedProductIds)) set.relatedProductIds = []
      if (!Array.isArray(post.relatedPostIds)) set.relatedPostIds = []
      if (!Array.isArray(post.faqs)) set.faqs = []
      if (!post.seo || typeof post.seo !== 'object') {
        set.seo = {
          metaTitle: post.metaTitle || '',
          metaDescription: post.metaDescription || '',
          canonicalPath: `/kien-thuc/${post.slug || ''}`,
          ogTitle: '',
          ogDescription: '',
          ogImage: post.featuredImage || post.featured_image || '',
          noIndex: post.published !== true,
        }
      }
      if (Object.keys(set).length) {
        operations.push({ updateOne: { filter: { _id: post._id }, update: { $set: set } } })
      } else {
        unchanged += 1
      }
    }

    console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', pending: operations.length, unchanged }, null, 2))
    if (apply && operations.length) {
      const result = await posts.bulkWrite(operations, { ordered: false })
      console.log(`Updated ${result.modifiedCount} posts.`)
    }
    if (apply) {
      await Promise.all([
        posts.createIndex({ slug: 1 }, { unique: true, name: 'posts_slug_unique' }),
        posts.createIndex({ status: 1, publishedAt: -1 }, { name: 'posts_status_published' }),
        posts.createIndex({ keywordIds: 1 }, { name: 'posts_keyword_ids' }),
        db.collection('post_revisions').createIndex({ postId: 1, version: -1 }, { name: 'post_revisions_post_version' }),
      ])
      console.log('Content indexes are ready.')
    } else {
      console.log('No data was changed. Add --apply --backup-confirmed only after reviewing this dry-run and taking a backup.')
    }
  }
} finally {
  await client.close()
}
