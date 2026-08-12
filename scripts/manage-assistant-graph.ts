import {
  applyGraphProjection,
  buildGraphProjectionSnapshot,
  syncPendingGraphOutbox,
  verifyGraphProjection,
} from '../src/modules/knowledge-graph/infrastructure/graph-projection'

async function main() {
  const action = process.argv.find((value) => !value.startsWith('-') && value !== process.argv[0] && value !== process.argv[1]) || 'verify'
  if (!['verify', 'sync', 'rebuild'].includes(action)) throw new Error('GRAPH_ACTION_INVALID')

  if (action === 'verify') {
    console.log(JSON.stringify(await verifyGraphProjection(), null, 2))
    return
  }
  if (!process.argv.includes('--apply') || process.env.ASSISTANT_GRAPH_CONFIRM !== 'APPLY-ASSISTANT-GRAPH') throw new Error('ASSISTANT_GRAPH_CONFIRM_REQUIRED')
  if (action === 'sync') {
    console.log(JSON.stringify(await syncPendingGraphOutbox(), null, 2))
    return
  }
  const snapshot = await buildGraphProjectionSnapshot()
  const counts = await applyGraphProjection(snapshot, { prune: true })
  console.log(JSON.stringify({ counts, verification: await verifyGraphProjection(snapshot) }, null, 2))
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.message : 'ASSISTANT_GRAPH_FAILED')
  process.exit(1)
})
