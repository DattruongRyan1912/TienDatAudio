import { NextResponse } from 'next/server'
import { KNOWLEDGE_RESOURCES, type KnowledgeResourceName } from '../domain/types'

export function parseKnowledgeResource(value: unknown): KnowledgeResourceName | null {
  const resource = String(value || '') as KnowledgeResourceName
  return KNOWLEDGE_RESOURCES.includes(resource) ? resource : null
}

export function knowledgeErrorResponse(error: unknown) {
  const raw = error instanceof Error ? error.message : 'KNOWLEDGE_FAILED'
  if (raw.startsWith('VALIDATION:')) {
    return NextResponse.json({ success: false, code: 'VALIDATION_ERROR', message: raw.slice('VALIDATION:'.length).replaceAll('|', '. ') }, { status: 400 })
  }
  if (raw === 'MONGODB_REQUIRED') return NextResponse.json({ success: false, code: raw, message: 'MongoDB chưa được cấu hình.' }, { status: 503 })
  console.error('[knowledge] request failed', raw)
  return NextResponse.json({ success: false, code: 'KNOWLEDGE_FAILED', message: 'Không thể xử lý kho tri thức lúc này.' }, { status: 500 })
}

export function knowledgeMutationResponse(result: { ok: true; value: unknown } | { ok: false; code: 'NOT_FOUND' | 'VERSION_CONFLICT' | 'SLUG_CONFLICT'; current?: unknown }) {
  if (result.ok) return NextResponse.json({ success: true, data: result.value })
  const status = result.code === 'NOT_FOUND' ? 404 : result.code === 'VERSION_CONFLICT' ? 409 : 422
  return NextResponse.json({ success: false, code: result.code, current: result.current }, { status })
}
