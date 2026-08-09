import { getDb, hasMongoConfig } from './mongodb'
import type { AnalyticsEventInput } from './analytics-types'

export async function createAnalyticsEvent(input: AnalyticsEventInput) {
  if (!hasMongoConfig()) return false
  const db = await getDb()
  await db.collection('analytics_events').insertOne({ ...input, createdAt: new Date().toISOString() })
  return true
}

export async function getGrowthDashboard(days = 30) {
  if (!hasMongoConfig()) {
    return { days, sessions: 0, leads: 0, articleViews: 0, articleCTAs: 0, productViews: 0, productCTAs: 0, phoneClicks: 0, zaloClicks: 0, mapClicks: 0, conversionRate: 0, topArticles: [] as Array<{ postId: string; views: number; ctas: number }> }
  }
  const db = await getDb()
  const since = new Date(Date.now() - days * 86_400_000).toISOString()
  const eventMatch = { createdAt: { $gte: since } }
  const [counts, sessionIds, leads, articleRows] = await Promise.all([
    db.collection('analytics_events').aggregate([
      { $match: eventMatch },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]).toArray(),
    db.collection('analytics_events').distinct('sessionId', eventMatch),
    db.collection('leads').countDocuments({ createdAt: { $gte: since }, status: { $ne: 'archived' } }),
    db.collection('analytics_events').aggregate([
      { $match: { ...eventMatch, postId: { $type: 'string', $ne: '' }, type: { $in: ['article_view', 'article_cta'] } } },
      { $group: { _id: { postId: '$postId', type: '$type' }, count: { $sum: 1 } } },
    ]).toArray(),
  ])
  const countMap = new Map(counts.map((item) => [String(item._id), Number(item.count)]))
  const articleMap = new Map<string, { postId: string; views: number; ctas: number }>()
  articleRows.forEach((row) => {
    const postId = String(row._id.postId)
    const current = articleMap.get(postId) || { postId, views: 0, ctas: 0 }
    if (row._id.type === 'article_view') current.views = Number(row.count)
    if (row._id.type === 'article_cta') current.ctas = Number(row.count)
    articleMap.set(postId, current)
  })
  const sessions = sessionIds.length
  return {
    days,
    sessions,
    leads,
    articleViews: countMap.get('article_view') || 0,
    articleCTAs: countMap.get('article_cta') || 0,
    productViews: countMap.get('product_view') || 0,
    productCTAs: countMap.get('product_cta') || 0,
    phoneClicks: countMap.get('phone_click') || 0,
    zaloClicks: countMap.get('zalo_click') || 0,
    mapClicks: countMap.get('map_click') || 0,
    conversionRate: sessions ? Number(((leads / sessions) * 100).toFixed(1)) : 0,
    topArticles: Array.from(articleMap.values()).sort((a, b) => b.views - a.views).slice(0, 10),
  }
}
