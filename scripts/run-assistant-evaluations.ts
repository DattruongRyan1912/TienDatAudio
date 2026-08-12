import { createAssistantPorts } from '../src/modules/assistant/infrastructure/assistant-runtime'
import { runAssistantEvaluations } from '../src/modules/assistant/application/run-assistant-evaluations'
import { saveAssistantEvaluationResults } from '../src/modules/assistant/infrastructure/assistant-operations-repository'
import type { AssistantGoldenCase } from '../src/modules/assistant/domain/golden-dataset'

async function main() {
  const mode = process.argv.includes('--full') ? 'full' : 'deterministic'
  const persist = process.argv.includes('--persist')
  const limitArg = process.argv.find((value) => value.startsWith('--limit='))
  const groupArg = process.argv.find((value) => value.startsWith('--group='))
  const limit = limitArg ? Number(limitArg.split('=')[1]) : undefined
  const group = groupArg?.split('=')[1] as AssistantGoldenCase['group'] | undefined
  const result = await runAssistantEvaluations({ ports: createAssistantPorts(), mode, limit, group })
  if (persist) await saveAssistantEvaluationResults(result.results)
  console.log(JSON.stringify({ runId: result.runId, datasetVersion: result.datasetVersion, mode, persisted: persist, summary: result.summary }, null, 2))
  for (const item of result.results.filter((entry) => !entry.passed).slice(0, 30)) console.log(`${item.caseId}: ${item.violations.join(', ')}`)
  if (result.summary.failed) process.exitCode = 1
}

main().then(() => process.exit(process.exitCode || 0)).catch((error) => {
  console.error(error instanceof Error ? error.message : 'ASSISTANT_EVALUATION_FAILED')
  process.exit(1)
})
