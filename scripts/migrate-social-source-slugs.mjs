import { randomUUID } from 'node:crypto'
import { MongoClient } from 'mongodb'

const args = new Map()
for (const [index, value] of process.argv.slice(2).entries()) {
  if (!value.startsWith('--')) continue
  const [key, inlineValue] = value.slice(2).split('=', 2)
  args.set(key, inlineValue ?? process.argv[index + 3] ?? '')
}

const hasFlag = (name) => process.argv.includes(`--${name}`)
const apply = hasFlag('apply')
const backupConfirmed = hasFlag('backup-confirmed')
const postId = String(args.get('post-id') || '').trim()
const legacySlug = String(args.get('legacy-slug') || 'facebook').trim()
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'tiendataudio'

if (!uri) {
  console.error('MONGODB_URI is required for social slug migration.')
  process.exit(1)
}
if (!postId) {
  console.error('--post-id is required; refusing a broad production migration.')
  process.exit(1)
}
if (apply && !backupConfirmed) {
  console.error('Refusing to write without --backup-confirmed. Run a MongoDB backup first.')
  process.exit(1)
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function canonicalSourceUrl(value) {
  try {
    const url = new URL(value)
    url.hash = ''
    url.searchParams.sort()
    return url.toString()
  } catch {
    return String(value || '').trim()
  }
}

function stableHash(value) {
  let hash = 2_166_136_261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16_777_619)
  }
  return (hash >>> 0).toString(36).padStart(7, '0')
}

function facebookPostIdentity(sourceUrl) {
  try {
    const url = new URL(sourceUrl)
    const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
    if (!(hostname === 'facebook.com' || hostname === 'm.facebook.com' || hostname.endsWith('.facebook.com'))) return ''
    for (const key of ['story_fbid', 'fbid', 'post_id']) {
      const value = url.searchParams.get(key)?.trim() || ''
      if (/^\d+$/.test(value)) return value
    }
    return url.pathname.match(/\/(?:posts|post|reel|reels|videos?|photos?|permalink)\/(\d+)/i)?.[1] || ''
  } catch {
    return ''
  }
}

function sourceSlug(title, sourceUrl) {
  const canonical = canonicalSourceUrl(sourceUrl)
  const identity = facebookPostIdentity(canonical) || `src-${stableHash(canonical)}`
  const base = slugify(title) || 'goc-audio'
  const maxBaseLength = 200 - identity.length - 1
  const shortenedBase = base.slice(0, Math.max(1, maxBaseLength)).replace(/-+$/g, '') || 'goc-audio'
  return `${shortenedBase}-${identity}`
}

function sourceUrlOf(post) {
  if (typeof post.facebookSourceUrl === 'string' && post.facebookSourceUrl.trim()) return post.facebookSourceUrl.trim()
  if (!Array.isArray(post.links)) return ''
  const link = post.links.find((item) => {
    if (!item || typeof item.url !== 'string') return false
    try {
      return /(^|\.)facebook\.com$/i.test(new URL(item.url).hostname.replace(/^www\./, ''))
    } catch {
      return false
    }
  })
  return typeof link?.url === 'string' ? link.url.trim() : ''
}

const client = await new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 5_000 }).connect()
const db = client.db(dbName)
const posts = db.collection('posts')

try {
  const post = await posts.findOne({ contentType: 'social', id: postId })
  if (!post) {
    console.error(`Social post not found: ${postId}`)
    process.exitCode = 1
  } else if (post.slug !== legacySlug && Array.isArray(post.legacySlugs) && post.legacySlugs.includes(legacySlug)) {
    console.log(JSON.stringify({ mode: 'noop', reason: 'already-migrated', postId, slug: post.slug, legacySlug }, null, 2))
  } else if (post.slug !== legacySlug) {
    console.error(`Refusing migration: post slug is ${post.slug}, expected ${legacySlug}.`)
    process.exitCode = 1
  } else {
    const sourceUrl = sourceUrlOf(post)
    if (!sourceUrl) {
      console.error('Refusing migration: no Facebook source URL found in post.')
      process.exitCode = 1
    } else {
      const nextSlug = sourceSlug(post.title, sourceUrl)
      const collision = await posts.findOne({ contentType: 'social', slug: nextSlug, id: { $ne: postId } }, { projection: { id: 1, slug: 1 } })
      if (collision) {
        console.error(`Refusing migration: target slug already belongs to another post: ${nextSlug}`)
        process.exitCode = 1
      } else {
        const currentVersion = Number.isInteger(post.version) && post.version > 0 ? post.version : 1
        const existingLegacySlugs = Array.isArray(post.legacySlugs) ? post.legacySlugs.filter((value) => typeof value === 'string' && value.trim()) : []
        const legacySlugs = [...new Set([...existingLegacySlugs, legacySlug])]
        const currentSeo = post.seo && typeof post.seo === 'object' ? post.seo : {}
        const canonicalPath = currentSeo.canonicalPath === `/bai-viet/${legacySlug}` || !currentSeo.canonicalPath
          ? `/bai-viet/${nextSlug}`
          : currentSeo.canonicalPath
        const updatedAt = new Date().toISOString()
        const update = {
          slug: nextSlug,
          legacySlugs,
          facebookSourceUrl: sourceUrl,
          seo: { ...currentSeo, canonicalPath },
          updatedAt,
        }

        console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', postId, from: legacySlug, to: nextSlug, legacySlugs, sourceIdentity: facebookPostIdentity(sourceUrl) || `src-${stableHash(canonicalSourceUrl(sourceUrl))}`, version: currentVersion }, null, 2))
        if (apply) {
          const result = await posts.updateOne(
            { _id: post._id, contentType: 'social', id: postId, slug: legacySlug, version: currentVersion },
            { $set: update, $inc: { version: 1 } },
          )
          if (!result.modifiedCount) throw new Error('MIGRATION_VERSION_CONFLICT')

          const { _id: _ignored, ...snapshot } = post
          void _ignored
          await db.collection('post_revisions').insertOne({
            id: randomUUID(),
            postId,
            version: currentVersion,
            snapshot,
            reason: 'published_update',
            actor: 'migration-social-source-slug',
            createdAt: updatedAt,
          })
          await posts.createIndex({ contentType: 1, legacySlugs: 1 }, { name: 'posts_social_legacy_slugs' })
          console.log(JSON.stringify({ applied: true, postId, slug: nextSlug, version: currentVersion + 1 }, null, 2))
        } else {
          console.log('No data was changed. Add --apply --backup-confirmed only after reviewing this dry-run and taking a backup.')
        }
      }
    }
  }
} finally {
  await client.close()
}
