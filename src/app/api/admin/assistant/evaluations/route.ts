import { NextResponse } from 'next/server'
import { requireAdmin, unauthorizedResponse } from '@/lib/admin-guard'
import { runAssistantEvaluations } from '@/modules/assistant/application/run-assistant-evaluations'
import { createAssistantPorts } from '@/modules/assistant/infrastructure/assistant-runtime'
import { listAssistantEvaluationRuns, saveAssistantEvaluationResults } from '@/modules/assistant/infrastructure/assistant-operations-repository'
import type { AssistantGoldenCase } from '@/modules/assistant/domain/golden-dataset'

export async function GET() {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    return NextResponse.json({ success: true, data: await listAssistantEvaluationRuns() })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'EVALUATION_LIST_FAILED'
    return NextResponse.json({ success: false, code }, { status: code === 'MONGODB_REQUIRED' ? 503 : 500 })
  }
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return unauthorizedResponse()
  try {
    const body = await request.json() as { mode?: 'deterministic' | 'full'; limit?: number; group?: AssistantGoldenCase['group'] }
    const data = await runAssistantEvaluations({ ports: createAssistantPorts(), mode: body.mode, limit: body.limit, group: body.group })
    await saveAssistantEvaluationResults(data.results)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'EVALUATION_FAILED'
    return NextResponse.json({ success: false, code }, { status: code === 'MONGODB_REQUIRED' ? 503 : 500 })
  }
}
