import { MongoClient } from 'mongodb'

const apply = process.argv.includes('--apply')
const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'tiendataudio'
const confirmation = process.env.CONFIRM_REAL_IMAGES || ''
const target = process.env.IMAGE_TARGET || 'local'

const localHosts = new Set(['localhost', '127.0.0.1', '::1'])

if (!uri) {
  console.error('[update-real-images] MONGODB_URI is required.')
  process.exit(1)
}

let hostname = 'unknown'
try {
  hostname = new URL(uri).hostname
} catch {
  console.error('[update-real-images] MONGODB_URI is invalid.')
  process.exit(1)
}

if (apply) {
  const isLocalApply = target === 'local' && localHosts.has(hostname)
  const isProductionApply = target === 'production' && localHosts.has(hostname) && confirmation === 'UPDATE-REAL-IMAGES'
  if (!isLocalApply && !isProductionApply) {
    console.error('[update-real-images] Refusing to mutate: local apply requires IMAGE_TARGET=local; production requires IMAGE_TARGET=production and CONFIRM_REAL_IMAGES=UPDATE-REAL-IMAGES.')
    process.exit(1)
  }
}

// Mapping 10 bài viết kỹ thuật sang hình ảnh sản phẩm/thiết bị chụp thực tế tại Tiến Đạt Audio
const REAL_IMAGE_MAP = {
  'dan-karaoke-gia-dinh-gia-bao-nhieu': '/uploads/1757873177981_wez3lmbcclj.jpg',
  'loa-karaoke-bi-hu-nguyen-nhan-cach-khac-phuc': '/uploads/1757873217170_zjcdu51ihss.webp',
  'lap-dat-dan-karaoke-gia-dinh-quang-ngai': '/uploads/1757911498269_vky7s589yrq.jpg',
  'cach-chon-loa-nghe-nhac-cho-phong-khach': '/uploads/1757872819402_6jhbuhvujsk.jpg',
  'dsp-audio-la-gi': '/uploads/1757870365500_xwo1nuqv39.jpg',
  'cach-chinh-vang-so-chong-hu-bang-may-tinh': '/uploads/1757869887047_orzq37kz72c.jpg',
  'cach-ghep-noi-vang-so-voi-cuc-day-cong-suat': '/uploads/1757873414645_hxra7006d3t.jpg',
  'kinh-nghiem-chon-micro-khong-day-karaoke-uhf': '/uploads/1757699242926_2u7b75d6b2p.png',
  'so-sanh-vang-co-lai-so-va-vang-so': '/uploads/1757873410571_2tstfuq2vcq.jpg',
  'loa-bass-bi-re-nguyen-nhan-va-cach-khac-phuc': '/uploads/1757873203337_t0b63dx81ng.webp',
}

const client = await new MongoClient(uri, { maxPoolSize: 3, serverSelectionTimeoutMS: 5000 }).connect()
const db = client.db(dbName)
const posts = db.collection('posts')

try {
  const updates = []
  for (const [slug, realImage] of Object.entries(REAL_IMAGE_MAP)) {
    const post = await posts.findOne({ slug })
    if (!post) {
      console.warn(`[update-real-images] Post not found for slug: ${slug}`)
      continue
    }

    const currentImg = post.featuredImage || ''
    updates.push({
      slug,
      title: post.title,
      from: currentImg,
      to: realImage,
    })

    if (apply) {
      await posts.updateOne(
        { _id: post._id },
        {
          $set: {
            featuredImage: realImage,
            'seo.ogImage': realImage,
            updatedAt: new Date().toISOString(),
          },
        }
      )
    }
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    target: { hostname, database: dbName },
    totalTargeted: Object.keys(REAL_IMAGE_MAP).length,
    updatedCount: updates.length,
    updates,
  }, null, 2))
} finally {
  await client.close()
}
