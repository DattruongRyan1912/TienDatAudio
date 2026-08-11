import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { MongoClient } from 'mongodb'

const projectRoot = process.cwd()
const sourceArg = process.argv.find((arg) => arg.startsWith('--source='))?.split('=')[1] || 'auto'
const allowRemote = process.env.AUDIT_ALLOW_REMOTE === '1'
const dbName = process.env.MONGODB_DB || 'tiendataudio'
const auditDate = process.env.AUDIT_DATE || new Date().toISOString()
const outputDir = path.join(projectRoot, 'docs/content-audit')

const editorialFilter = { $or: [{ contentType: 'editorial' }, { contentType: { $exists: false } }] }

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), 'utf8'))
}

function record(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function text(value) {
  return String(value ?? '').replace(/\r\n/g, '\n').trim()
}

function oneLine(value) {
  return text(value).replace(/\s+/g, ' ').trim()
}

function words(markdown) {
  return text(markdown)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`\[\]()\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

function normalize(value) {
  return oneLine(value)
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(value) {
  return new Set(normalize(value).split(' ').filter((token) => token.length > 2))
}

function jaccard(left, right) {
  const a = tokens(left)
  const b = tokens(right)
  if (!a.size || !b.size) return 0
  const intersection = [...a].filter((token) => b.has(token)).length
  return intersection / new Set([...a, ...b]).size
}

function parseMarkdown(markdown) {
  const source = text(markdown)
  const headings = [...source.matchAll(/^(#{2,3})\s+(.+)$/gm)].map((match) => ({ level: match[1].length, text: oneLine(match[2]) }))
  const links = [...source.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map((match) => ({ label: oneLine(match[1]), target: match[2].trim() }))
  const externalLinks = links.filter((link) => /^https?:\/\//i.test(link.target))
  const internalLinks = links.filter((link) => link.target.startsWith('/'))
  return { headings, links, externalLinks, internalLinks }
}

function classifyArticleType(post, queueItem) {
  const source = `${post.title} ${post.slug} ${queueItem?.focus || ''}`.toLocaleLowerCase('vi')
  const cluster = queueItem?.cluster || ''
  if (/là gì|khái niệm|định nghĩa/.test(source)) return 'Definition / Glossary / Concept'
  if (cluster === 'audio-technology') return 'Technical Explanation'
  if (cluster === 'karaoke-troubleshooting' || /bị hú|bị rè|bị ù|mất tiếng|bị trễ|không nhận|nóng/.test(source)) return 'Troubleshooting'
  if (cluster === 'room-acoustics' || /bố trí|đặt loa|tiêu âm|cách âm|tiếng vang|đo âm thanh/.test(source)) return 'Acoustic / Placement'
  if (cluster === 'setup-maintenance' || /cách đấu|vệ sinh|bảo quản|bảo dưỡng|checklist|nghiệm thu|bật tắt/.test(source)) return 'Setup Guide / How-to'
  if (cluster === 'commercial-event' || queueItem?.intent === 'local') return 'Commercial Investigation / Project Guide'
  if (queueItem?.intent === 'commercial' || cluster === 'buying-decisions' || cluster === 'family-karaoke' || cluster === 'speaker-hi-fi') return 'Buying Guide'
  return 'Technical Explanation'
}

function statusOf(post) {
  if (post.status) return post.status
  if (post.published === true) return 'published'
  return 'draft'
}

function publicStatus(post) {
  const status = statusOf(post)
  if (status === 'published') return Boolean(post.publishedAt && new Date(post.publishedAt) <= new Date())
  return status === 'scheduled' && post.scheduledAt && new Date(post.scheduledAt) <= new Date()
}

function isTemporaryImage(value) {
  const image = oneLine(value)
  return !image || image.includes('/editorial-temp/') || image.endsWith('/sonic-hero.png') || image.includes('placeholder')
}

function sourceHost(value) {
  try { return new URL(value).hostname } catch { return '' }
}

async function loadCorpus() {
  const fallbackPosts = await readJson('data/posts.json')
  const fallbackStrategy = await readJson('data/seo-strategy.json')
  const queue = await readJson('data/editorial-seeds/research-queue-100.json')
  const queueById = new Map((Array.isArray(queue.items) ? queue.items : []).map((item) => [item.id, item]))
  const queueBySlug = new Map((Array.isArray(queue.items) ? queue.items : []).map((item) => [item.slug, item]))

  if (sourceArg === 'json' || !process.env.MONGODB_URI) {
    return { source: 'json-fallback', sourceHost: 'local-file', posts: fallbackPosts, seoConfig: fallbackStrategy, queueById, queueBySlug }
  }

  let hostname = 'unknown'
  try { hostname = new URL(process.env.MONGODB_URI).hostname } catch { throw new Error('MONGODB_URI is invalid') }
  const loopback = new Set(['localhost', '127.0.0.1', '::1']).has(hostname)
  if (!loopback && !allowRemote) {
    throw new Error(`Refusing non-loopback audit target ${hostname}; set AUDIT_ALLOW_REMOTE=1 for an explicit read-only audit.`)
  }

  const client = await new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 }).connect()
  try {
    const db = client.db(dbName)
    const [posts, setting] = await Promise.all([
      db.collection('posts').find(editorialFilter, { projection: { _id: 0 } }).sort({ createdAt: 1 }).toArray(),
      db.collection('site_settings').findOne({ key: 'seo_strategy' }, { projection: { _id: 0, value: 1 } }),
    ])
    return {
      source: 'mongodb',
      sourceHost: hostname,
      posts,
      seoConfig: setting?.value && typeof setting.value === 'object' ? setting.value : fallbackStrategy,
      queueById,
      queueBySlug,
    }
  } finally {
    await client.close()
  }
}

function normalizePost(raw) {
  const post = record(raw)
  const slug = oneLine(post.slug || post.title)
  const parsed = parseMarkdown(post.bodyMarkdown || post.content)
  return {
    id: oneLine(post.id),
    title: oneLine(post.title),
    slug,
    excerpt: oneLine(post.excerpt),
    bodyMarkdown: text(post.bodyMarkdown || post.content),
    category: oneLine(post.category),
    tags: Array.isArray(post.tags) ? post.tags.map(oneLine).filter(Boolean) : [],
    author: oneLine(post.author),
    reviewer: oneLine(post.reviewer),
    featuredImage: oneLine(post.featuredImage || post.featured_image),
    gallery: Array.isArray(post.gallery) ? post.gallery.map(oneLine).filter(Boolean) : [],
    primaryKeywordId: oneLine(post.primaryKeywordId),
    keywordIds: Array.isArray(post.keywordIds) ? post.keywordIds.map(oneLine).filter(Boolean) : [],
    relatedProductIds: Array.isArray(post.relatedProductIds) ? post.relatedProductIds.map(oneLine).filter(Boolean) : [],
    relatedPostIds: Array.isArray(post.relatedPostIds) ? post.relatedPostIds.map(oneLine).filter(Boolean) : [],
    faqs: Array.isArray(post.faqs) ? post.faqs : [],
    seo: record(post.seo),
    seoResearch: record(post.seoResearch),
    status: statusOf(post),
    scheduledAt: post.scheduledAt || null,
    publishedAt: post.publishedAt || null,
    archivedAt: post.archivedAt || null,
    createdAt: post.createdAt || null,
    updatedAt: post.updatedAt || null,
    readingTime: Number(post.readingTime) || null,
    parsed,
  }
}

function normalizeResearch(value) {
  const research = record(value)
  const list = (key, max = 50) => Array.isArray(research[key]) ? research[key].map(oneLine).filter(Boolean).slice(0, max) : []
  const sources = Array.isArray(research.sources) ? research.sources.map((source) => {
    const item = record(source)
    return {
      url: oneLine(item.url),
      title: oneLine(item.title),
      publisher: oneLine(item.publisher),
      tier: Number(item.tier) || 3,
      accessedAt: oneLine(item.accessedAt),
      claimNotes: Array.isArray(item.claimNotes) ? item.claimNotes.map(oneLine).filter(Boolean) : [],
    }
  }).filter((source) => source.url).slice(0, 30) : []
  const imagePlan = Array.isArray(research.imagePlan) ? research.imagePlan.map((image) => {
    const item = record(image)
    return {
      url: oneLine(item.url),
      alt: oneLine(item.alt),
      caption: oneLine(item.caption),
      section: oneLine(item.section),
      source: oneLine(item.source),
      licenseStatus: oneLine(item.licenseStatus),
      isIllustration: Boolean(item.isIllustration),
    }
  }).filter((image) => image.alt || image.url || image.section).slice(0, 20) : []
  return {
    researchedAt: oneLine(research.researchedAt),
    primaryKeyword: oneLine(research.primaryKeyword),
    secondaryKeywords: list('secondaryKeywords', 20),
    semanticTerms: list('semanticTerms', 40),
    questionKeywords: list('questionKeywords', 20),
    longTailKeywords: list('longTailKeywords', 30),
    commercialModifiers: list('commercialModifiers', 20),
    entities: list('entities', 30),
    primaryIntent: oneLine(research.primaryIntent),
    secondaryIntent: oneLine(research.secondaryIntent),
    serpObservations: list('serpObservations', 20),
    cannibalizationNotes: list('cannibalizationNotes', 20),
    clusterRole: oneLine(research.clusterRole || 'unassigned'),
    sourceCount: Math.max(sources.length, Number.isSafeInteger(Number(research.sourceCount)) ? Number(research.sourceCount) : 0),
    sources,
    imagePlan,
  }
}

function queueItemFor(post, queueById, queueBySlug) {
  return queueById.get(post.id) || queueBySlug.get(post.slug) || null
}

function keywordFor(post, config, queueItem) {
  const keywords = Array.isArray(config.keywords) ? config.keywords : []
  const byId = keywords.find((keyword) => keyword?.id === post.primaryKeywordId)
  return byId || (queueItem?.term ? { id: post.primaryKeywordId, term: queueItem.term, intent: queueItem.intent, cluster: queueItem.cluster } : null)
}

function duplicateGroups(items, field) {
  const groups = new Map()
  for (const item of items) {
    const value = normalize(item[field])
    if (!value) continue
    const list = groups.get(value) || []
    list.push(item.slug)
    groups.set(value, list)
  }
  return [...groups.entries()].filter(([, slugs]) => slugs.length > 1).map(([value, slugs]) => ({ value, slugs }))
}

function buildCannibalization(items) {
  const pairs = []
  for (let index = 0; index < items.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < items.length; otherIndex += 1) {
      const left = items[index]
      const right = items[otherIndex]
      const sameCluster = left.cluster && left.cluster === right.cluster
      const titleOverlap = jaccard(left.title, right.title)
      const keywordOverlap = jaccard(left.primaryKeyword, right.primaryKeyword)
      const sameIntent = left.intent && left.intent === right.intent
      const score = Math.max(titleOverlap, keywordOverlap) + (sameCluster ? 0.2 : 0) + (sameIntent ? 0.05 : 0)
      if (score >= 0.62) {
        pairs.push({
          left: left.slug,
          right: right.slug,
          cluster: sameCluster ? left.cluster : null,
          titleOverlap: Number(titleOverlap.toFixed(3)),
          keywordOverlap: Number(keywordOverlap.toFixed(3)),
          score: Number(score.toFixed(3)),
          severity: score >= 0.86 ? 'high' : score >= 0.72 ? 'medium' : 'watch',
          recommendation: left.primaryKeyword === right.primaryKeyword ? 'merge-or-canonical-review' : 'differentiate-angle-and-internal-link',
          method: 'heuristic-token-overlap; human SERP review required',
        })
      }
    }
  }
  return pairs.sort((a, b) => b.score - a.score)
}

function clusterRole(item, clusterItems) {
  const broadPattern = /cách chọn|giá bao nhiêu|là gì|nguyên nhân và cách|quy trình|hướng dẫn|thiết kế|giải pháp/i
  const breadth = broadPattern.test(item.title) ? 2 : 0
  const length = Math.min(item.wordCount / 1000, 1)
  const score = breadth + length + (item.intent === 'commercial' || item.intent === 'local' ? 0.5 : 0)
  const top = [...clusterItems].sort((a, b) => b.pillarScore - a.pillarScore)[0]
  return top?.slug === item.slug && score >= 2 ? 'pillar-candidate' : 'supporting-candidate'
}

function chooseBatch(items) {
  const priority = { local: 5, commercial: 4, informational: 2, navigational: 1, transactional: 4 }
  const ranked = items.map((item) => {
    let score = priority[item.intent] || 1
    if (/giá bao nhiêu|cách chọn|là gì|nguyên nhân|quy trình|thiết kế/i.test(item.title)) score += 2
    if (!item.sourceCount) score += 1
    if (!item.relatedPostIds.length && !item.relatedProductIds.length) score += 1
    if (item.imageStatus !== 'ready') score += 1
    if (item.seedNotes.length) score += 1
    return { ...item, priorityScore: score }
  }).sort((a, b) => b.priorityScore - a.priorityScore || a.slug.localeCompare(b.slug))
  const picked = []
  const clusters = new Set()
  for (const item of ranked) {
    if (picked.length >= 8) break
    if (!clusters.has(item.cluster) || picked.length >= 5) {
      picked.push(item)
      clusters.add(item.cluster)
    }
  }
  return picked.length >= 5 ? picked : ranked.slice(0, 8)
}

function buildInventory(corpus) {
  const posts = corpus.posts.map(normalizePost)
  const config = record(corpus.seoConfig)
  const items = posts.map((post) => {
    const queueItem = queueItemFor(post, corpus.queueById, corpus.queueBySlug)
    const keyword = keywordFor(post, config, queueItem)
    const seoResearch = normalizeResearch(post.seoResearch)
    const primaryKeyword = oneLine(seoResearch.primaryKeyword || keyword?.term || post.primaryKeywordId || post.title)
    const seedNotes = [...new Set([
      ...(post.bodyMarkdown.match(/bản nháp|reviewer|seed|placeholder|cần (được )?biên tập|trước khi xuất bản/giu) || []),
      ...(post.seo.noIndex ? ['noindex'] : []),
    ])]
    const imageStatus = isTemporaryImage(post.featuredImage) ? 'IMAGE_REQUIRED' : 'ready'
    const item = {
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      tags: post.tags,
      articleType: classifyArticleType(post, queueItem),
      status: post.status,
      public: publicStatus(post),
      author: post.author,
      reviewer: post.reviewer,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      publishedAt: post.publishedAt,
      wordCount: words(post.bodyMarkdown),
      readingTime: post.readingTime,
      h2Count: post.parsed.headings.filter((heading) => heading.level === 2).length,
      h3Count: post.parsed.headings.filter((heading) => heading.level === 3).length,
      faqCount: post.faqs.length,
      primaryKeywordId: post.primaryKeywordId,
      primaryKeyword,
      intent: oneLine(keyword?.intent || queueItem?.intent || seoResearch.primaryIntent || ''),
      cluster: oneLine(keyword?.cluster || queueItem?.cluster || post.category || 'unmapped'),
      secondaryKeywords: seoResearch.secondaryKeywords.length ? seoResearch.secondaryKeywords : post.tags,
      questionKeywords: seoResearch.questionKeywords.length ? seoResearch.questionKeywords : queueItem?.questions || [],
      entities: seoResearch.entities,
      seo: {
        metaTitle: oneLine(post.seo.metaTitle),
        metaDescription: oneLine(post.seo.metaDescription),
        canonicalPath: oneLine(post.seo.canonicalPath),
        ogTitle: oneLine(post.seo.ogTitle),
        ogDescription: oneLine(post.seo.ogDescription),
        ogImage: oneLine(post.seo.ogImage),
        noIndex: post.seo.noIndex === true,
      },
      featuredImage: post.featuredImage,
      galleryCount: post.gallery.length,
      imageStatus,
      seoResearch,
      internalLinks: post.parsed.internalLinks,
      externalLinks: post.parsed.externalLinks.map((link) => ({ ...link, host: sourceHost(link.target) })),
      sourceCount: seoResearch.sourceCount || post.parsed.externalLinks.length,
      relatedPostIds: post.relatedPostIds,
      relatedProductIds: post.relatedProductIds,
      seedNotes,
      missing: {
        reviewer: !post.reviewer,
        internalLinks: !post.parsed.internalLinks.length && !post.relatedPostIds.length,
        relatedProducts: !post.relatedProductIds.length,
        sources: !(seoResearch.sourceCount || post.parsed.externalLinks.length),
        gallery: !post.gallery.length,
        realImage: imageStatus !== 'ready',
        imagePlan: !seoResearch.imagePlan.length || seoResearch.imagePlan.some((image) => ['IMAGE_REQUIRED', 'NEEDS_VERIFICATION'].includes(image.licenseStatus)),
        publishGate: post.status !== 'published' || post.seo.noIndex === true,
      },
      queueFocus: oneLine(queueItem?.focus),
      audience: oneLine(queueItem?.audience),
      pillarScore: 0,
    }
    item.pillarScore = (item.intent === 'commercial' || item.intent === 'local' ? 1 : 0) + (/giá bao nhiêu|cách chọn|là gì|nguyên nhân|quy trình|thiết kế/i.test(item.title) ? 2 : 0) + Math.min(item.wordCount / 1000, 1)
    return item
  })

  const clusterGroups = new Map()
  for (const item of items) {
    const list = clusterGroups.get(item.cluster) || []
    list.push(item)
    clusterGroups.set(item.cluster, list)
  }
  for (const group of clusterGroups.values()) {
    for (const item of group) item.clusterRole = clusterRole(item, group)
  }

  const cannibalizationPairs = buildCannibalization(items)
  const inventory = {
    schemaVersion: 1,
    auditedAt: auditDate,
    source: corpus.source,
    sourceHost: corpus.sourceHost,
    readOnly: true,
    summary: {
      total: items.length,
      published: items.filter((item) => item.public).length,
      draft: items.filter((item) => item.status === 'draft').length,
      review: items.filter((item) => item.status === 'review').length,
      noIndex: items.filter((item) => item.seo.noIndex).length,
      noReviewer: items.filter((item) => item.missing.reviewer).length,
      imageRequired: items.filter((item) => item.imageStatus === 'IMAGE_REQUIRED').length,
      noGallery: items.filter((item) => item.missing.gallery).length,
      noSources: items.filter((item) => item.missing.sources).length,
      noInternalLinks: items.filter((item) => item.missing.internalLinks).length,
      noRelatedProducts: items.filter((item) => item.missing.relatedProducts).length,
      cannibalizationWatchPairs: cannibalizationPairs.length,
      duplicateTitles: duplicateGroups(items, 'title').length,
      duplicateMetaTitles: duplicateGroups(items.map((item) => ({ ...item, title: item.seo.metaTitle })), 'title').length,
    },
    items,
    duplicateGroups: {
      titles: duplicateGroups(items, 'title'),
      primaryKeywords: duplicateGroups(items.map((item) => ({ ...item, title: item.primaryKeyword })), 'title'),
      metaTitles: duplicateGroups(items.map((item) => ({ ...item, title: item.seo.metaTitle })), 'title'),
      excerpts: duplicateGroups(items.map((item) => ({ ...item, title: item.excerpt })), 'title'),
    },
    cannibalizationPairs,
  }
  return { inventory, items, cannibalizationPairs, clusterGroups, batch: chooseBatch(items) }
}

function buildClusters(audit) {
  const clusters = [...audit.clusterGroups.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, items]) => ({
    cluster: name,
    articleCount: items.length,
    intents: [...new Set(items.map((item) => item.intent).filter(Boolean))],
    roles: {
      pillarCandidates: items.filter((item) => item.clusterRole === 'pillar-candidate').map((item) => item.slug),
      supportingCandidates: items.filter((item) => item.clusterRole === 'supporting-candidate').map((item) => item.slug),
    },
    primaryKeywords: items.map((item) => ({ slug: item.slug, keyword: item.primaryKeyword, keywordId: item.primaryKeywordId, intent: item.intent })),
    internalLinkCoverage: {
      withInternalLinks: items.filter((item) => item.internalLinks.length || item.relatedPostIds.length || item.relatedProductIds.length).length,
      withoutInternalLinks: items.filter((item) => !item.internalLinks.length && !item.relatedPostIds.length && !item.relatedProductIds.length).map((item) => item.slug),
    },
    editorialGaps: [...new Set(items.flatMap((item) => [
      ...(item.missing.sources ? ['authoritative-sources'] : []),
      ...(item.missing.realImage ? ['owned-or-licensed-image'] : []),
      ...(item.missing.imagePlan ? ['image-metadata-and-license'] : []),
      ...(item.missing.reviewer ? ['human-reviewer'] : []),
      ...(item.missing.relatedProducts ? ['verified-product-relation'] : []),
    ]))],
  }))
  return {
    schemaVersion: 1,
    auditedAt: audit.inventory.auditedAt,
    methodology: 'Cluster assignment uses the stored SEO keyword/queue cluster. Pillar/supporting roles are candidates only; SERP intent review is still required.',
    clusters,
    recommendedBatch: audit.batch.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      cluster: item.cluster,
      intent: item.intent,
      articleType: item.articleType,
      priorityScore: item.priorityScore,
      reasons: [
        item.intent === 'local' ? 'local commercial relevance' : item.intent === 'commercial' ? 'commercial investigation relevance' : 'supports topical authority',
        item.sourceCount ? 'has source links to verify' : 'needs authoritative research',
        item.imageStatus !== 'ready' ? 'requires non-placeholder visual plan' : 'has a non-placeholder image',
        !item.relatedPostIds.length && !item.relatedProductIds.length ? 'needs internal-link mapping' : 'has existing relations to audit',
      ],
    })),
  }
}

function buildReport(audit, clusters) {
  const summary = audit.inventory.summary
  const batch = clusters.recommendedBatch
  const lines = [
    '# Editorial corpus audit',
    '',
    `- Audited at: ${audit.inventory.auditedAt}`,
    `- Source: ${audit.inventory.source} (${audit.inventory.sourceHost})`,
    '- Mode: read-only; no MongoDB document was changed.',
    '',
    '## Current state',
    '',
    `Corpus hiện có **${summary.total} bài editorial**. Trong đó ${summary.published} bài đang public đủ điều kiện, ${summary.draft} bài còn draft, ${summary.review} bài đang chờ review và ${summary.noIndex} bài đang noindex. Đây là trạng thái publish gate, chưa phải tín hiệu rằng nội dung đã sẵn sàng index.`,
    '',
    '| Hạng mục | Số lượng | Ý nghĩa |',
    '| --- | ---: | --- |',
    `| Bài public đủ điều kiện | ${summary.published} | Được phép đưa vào public discovery nếu không có gate khác |`,
    `| Draft | ${summary.draft} | Chưa được publish |`,
    `| Review | ${summary.review} | Đã qua bước chuẩn bị nhưng còn human gate |`,
    `| Noindex | ${summary.noIndex} | Chưa cho công cụ tìm kiếm lập chỉ mục |`,
    `| Thiếu reviewer | ${summary.noReviewer} | Cần người kiểm duyệt trước khi public |`,
    `| Cần ảnh thật/được cấp phép | ${summary.imageRequired} | Không dùng ảnh tạm hoặc placeholder khi publish |`,
    `| Không có gallery | ${summary.noGallery} | Chỉ là cảnh báo; không phải bài nào cũng cần gallery |`,
    `| Không có nguồn ngoài | ${summary.noSources} | Cần research hoặc đánh dấu NEEDS_VERIFICATION |`,
    `| Không có internal link | ${summary.noInternalLinks} | Có nguy cơ orphan hoặc thiếu topical graph |`,
    `| Không có product relation | ${summary.noRelatedProducts} | Cần xác nhận có nên nối sản phẩm thật hay không |`,
    `| Cặp có nguy cơ cannibalization | ${summary.cannibalizationWatchPairs} | Heuristic token overlap; bắt buộc review SERP trước merge/canonical |`,
    '',
    '## Batch 1 đề xuất (8 bài)',
    '',
    'Đây là batch nghiên cứu và biên tập đầu tiên. Các bài vẫn chưa được publish tự động. Mỗi bài cần đối chiếu SERP hiện tại, nguồn kỹ thuật chính thống, internal links thật và image plan trước khi chuyển review.',
    '',
    '| # | Slug | Cluster | Intent | Vai trò | Điểm ưu tiên |',
    '| ---: | --- | --- | --- | --- | ---: |',
    ...batch.map((item, index) => `| ${index + 1} | \`${item.slug}\` | ${item.cluster} | ${item.intent} | ${item.articleType} | ${item.priorityScore} |`),
    '',
    '## Publish gates chưa đạt',
    '',
    '- `NEEDS_VERIFICATION`: không đưa claim kỹ thuật, thông số, giá, tồn kho, case hoặc trải nghiệm thực tế lên public nếu chưa có nguồn hoặc xác nhận nội bộ.',
    '- `IMAGE_REQUIRED`: thay ảnh tạm bằng asset sở hữu/được cấp phép/original hoặc sơ đồ minh họa có nhãn rõ ràng.',
    '- `REAL_EXPERIENCE_REQUIRED`: không biến template seed thành case study hoặc trải nghiệm của Tiến Đạt Audio khi chưa có dữ liệu thật.',
    '- Human gate: reviewer, canonical/meta, FAQ thật, schema đúng nội dung, internal-link graph và browser/mobile QA.',
    '',
    '## Files output',
    '',
    '- `content-inventory.json`: inventory từng bài, SEO fields, source/image/link gaps và heuristic cannibalization pairs.',
    '- `topic-clusters.json`: cluster map, pillar/supporting candidates và batch đề xuất.',
    '- `cannibalization-report.md`: nhóm cần review, cách xử lý và nguyên tắc không merge tự động.',
    '',
    '## Next action',
    '',
    'Research batch 1 theo thứ tự: audit query intent → đọc nguồn primary → viết lại từng bài → map internal links tới nội dung/sản phẩm thật → image QA → fact check → chuyển review. Chỉ sau khi reviewer duyệt mới bật public/index cho batch đó.',
    '',
  ]
  return lines.join('\n')
}

function buildCannibalizationReport(audit) {
  const lines = [
    '# Cannibalization report',
    '',
    `- Audited at: ${audit.inventory.auditedAt}`,
    `- Method: deterministic title/primary-keyword token overlap within the audited editorial corpus.`,
    '- This is a prioritization signal, not a Google ranking diagnosis. Do not merge, redirect or canonicalize without reviewing the current SERP and search intent.',
    '',
  ]
  if (!audit.cannibalizationPairs.length) {
    lines.push('Không có cặp vượt ngưỡng heuristic hiện tại. Vẫn cần review theo cluster vì các từ khóa khác nhau có thể phục vụ cùng intent.')
    return lines.join('\n') + '\n'
  }
  lines.push('| Severity | Left | Right | Cluster | Score | Recommendation |')
  lines.push('| --- | --- | --- | --- | ---: | --- |')
  for (const pair of audit.cannibalizationPairs.slice(0, 100)) {
  lines.push(`| ${pair.severity} | \`${pair.left}\` | \`${pair.right}\` | ${pair.cluster || 'cross-cluster'} | ${pair.score} | ${pair.recommendation} |`)
  }
  lines.push('', '## Review rules', '', '- Same primary keyword + same intent: choose one canonical target, merge only when the supporting article has no distinct value, otherwise rewrite one angle and link to the canonical.', '- Same cluster + high title overlap: differentiate audience, task, room, decision stage or troubleshooting condition; do not only change the title.', '- Different primary keyword but same SERP intent: inspect SERP manually before keeping both as separate indexable URLs.', '- The audit never changes MongoDB, slugs, redirects or publish status.')
  return lines.join('\n') + '\n'
}

async function main() {
  const corpus = await loadCorpus()
  const audit = buildInventory(corpus)
  const clusters = buildClusters(audit)
  await mkdir(outputDir, { recursive: true })
  await Promise.all([
    writeFile(path.join(outputDir, 'content-inventory.json'), `${JSON.stringify(audit.inventory, null, 2)}\n`),
    writeFile(path.join(outputDir, 'topic-clusters.json'), `${JSON.stringify(clusters, null, 2)}\n`),
    writeFile(path.join(outputDir, 'audit-report.md'), buildReport(audit, clusters)),
    writeFile(path.join(outputDir, 'cannibalization-report.md'), buildCannibalizationReport(audit)),
    writeFile(path.join(outputDir, 'README.md'), '# Content audit artifacts\n\nGenerated by `node --env-file-if-exists=.env.local scripts/audit-editorial-corpus.mjs`. The command is read-only against MongoDB and writes only these local audit artifacts. Review the report before any content mutation or publish operation.\n'),
  ])
  console.log(JSON.stringify({
    source: corpus.source,
    sourceHost: corpus.sourceHost,
    audited: audit.inventory.summary,
    recommendedBatch: clusters.recommendedBatch.map((item) => item.slug),
    outputDir: path.relative(projectRoot, outputDir),
  }, null, 2))
}

main().catch((error) => {
  console.error(`[editorial-audit] ${error instanceof Error ? error.message : String(error)}`)
  process.exit(1)
})
