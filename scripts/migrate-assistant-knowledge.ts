import { listContentPosts } from '../src/lib/content-repository'
import { backfillAssistantFeedbackRetention, ensureAssistantOperationsIndexes } from '../src/modules/assistant/infrastructure/assistant-operations-repository'
import { ensureKnowledgeIndexes, rebuildArticleChunks } from '../src/modules/knowledge/infrastructure/knowledge-repository'

async function main() {
  const apply = process.argv.includes('--apply')
  const firstPage = await listContentPosts({ page: 1, limit: 100 }, true)
  const posts = [...firstPage.items]
  const pageCount = Math.ceil(firstPage.total / firstPage.limit)
  for (let page = 2; page <= pageCount; page += 1) {
    const result = await listContentPosts({ page, limit: firstPage.limit }, true)
    posts.push(...result.items)
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', publishedArticles: posts.length, confirmationRequired: 'APPLY-ASSISTANT-KNOWLEDGE' }))

  if (!apply) {
    console.log('Dry-run only. Add --apply and ASSISTANT_MIGRATION_CONFIRM=APPLY-ASSISTANT-KNOWLEDGE to create additive indexes and rebuild chunks.')
    return
  }
  if (process.env.ASSISTANT_MIGRATION_CONFIRM !== 'APPLY-ASSISTANT-KNOWLEDGE') throw new Error('ASSISTANT_MIGRATION_CONFIRM_REQUIRED')

  await Promise.all([ensureKnowledgeIndexes(), ensureAssistantOperationsIndexes()])
  const feedbackRetentionBackfilled = await backfillAssistantFeedbackRetention()
  let chunks = 0
  for (const post of posts) chunks += (await rebuildArticleChunks(post)).length
  console.log(JSON.stringify({ status: 'complete', indexedArticles: posts.length, chunks, feedbackRetentionBackfilled }))
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.message : 'ASSISTANT_MIGRATION_FAILED')
  process.exit(1)
})
