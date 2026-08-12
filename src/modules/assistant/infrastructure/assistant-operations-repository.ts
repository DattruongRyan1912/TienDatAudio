import { randomUUID } from 'node:crypto'
import { getDb, hasMongoConfig } from '@/lib/mongodb'
import type {
  AssistantConversationConstraints,
  AssistantEvaluationResult,
  AssistantFeedback,
  AssistantSession,
  AssistantStoredMessage,
} from '@/modules/knowledge/domain/types'
import { assistantRetentionDays } from './assistant-session'

let indexesPromise: Promise<unknown> | null = null

function assertMongo() {
  if (!hasMongoConfig()) throw new Error('MONGODB_REQUIRED')
}

function retentionDate() {
  return new Date(Date.now() + assistantRetentionDays() * 86_400_000)
}

function iso(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value || ''))
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

export function redactAssistantText(value: string) {
  return String(value || '')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email đã ẩn]')
    .replace(/(?<!\d)(?:\+?84|0)(?:[ .-]?\d){9,10}(?!\d)/g, '[số điện thoại đã ẩn]')
    .slice(0, 5000)
}

export async function ensureAssistantOperationsIndexes() {
  assertMongo()
  if (!indexesPromise) {
    indexesPromise = getDb().then((db) => Promise.all([
      db.collection('assistant_sessions').createIndex({ id: 1 }, { unique: true, name: 'assistant_sessions_id_unique' }),
      db.collection('assistant_sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'assistant_sessions_ttl' }),
      db.collection('assistant_messages').createIndex({ sessionId: 1, createdAt: 1 }, { name: 'assistant_messages_session_time' }),
      db.collection('assistant_messages').createIndex({ requestId: 1, role: 1 }, { unique: true, name: 'assistant_messages_request_role_unique' }),
      db.collection('assistant_messages').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'assistant_messages_ttl' }),
      db.collection('assistant_feedback').createIndex({ sessionId: 1, requestId: 1 }, { unique: true, name: 'assistant_feedback_session_request_unique' }),
      db.collection('assistant_feedback').createIndex({ createdAt: -1 }, { name: 'assistant_feedback_created' }),
      db.collection('assistant_feedback').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'assistant_feedback_ttl' }),
      db.collection('assistant_evaluations').createIndex({ runId: 1, caseId: 1 }, { unique: true, name: 'assistant_evaluations_run_case_unique' }),
      db.collection('assistant_evaluations').createIndex({ createdAt: -1 }, { name: 'assistant_evaluations_created' }),
    ])).catch((error) => {
      indexesPromise = null
      throw error
    })
  }
  return indexesPromise
}

function normalizeSession(document: Record<string, unknown>): AssistantSession {
  const constraints = document.constraints && typeof document.constraints === 'object'
    ? document.constraints as AssistantConversationConstraints
    : {}
  return {
    id: String(document.id || ''),
    constraints,
    consent: 'anonymous_assistant',
    createdAt: iso(document.createdAt),
    updatedAt: iso(document.updatedAt),
    expiresAt: iso(document.expiresAt),
  }
}

export async function getOrCreateAssistantSession(id?: string | null) {
  assertMongo()
  await ensureAssistantOperationsIndexes()
  const db = await getDb()
  if (id) {
    const current = await db.collection('assistant_sessions').findOne({ id, expiresAt: { $gt: new Date() } })
    if (current) {
      const now = new Date()
      const expiresAt = retentionDate()
      await db.collection('assistant_sessions').updateOne({ id }, { $set: { updatedAt: now, expiresAt } })
      return normalizeSession({ ...current, updatedAt: now, expiresAt })
    }
  }
  const now = new Date()
  const session: AssistantSession = {
    id: randomUUID(),
    constraints: {},
    consent: 'anonymous_assistant',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: retentionDate().toISOString(),
  }
  await db.collection('assistant_sessions').insertOne({ ...session, createdAt: now, updatedAt: now, expiresAt: new Date(session.expiresAt) })
  return session
}

export async function updateAssistantSessionConstraints(sessionId: string, constraints: AssistantConversationConstraints) {
  assertMongo()
  const now = new Date()
  const expiresAt = retentionDate()
  await (await getDb()).collection('assistant_sessions').updateOne(
    { id: sessionId },
    { $set: { constraints, updatedAt: now, expiresAt } },
  )
}

export async function loadAssistantHistory(sessionId: string, limit = 10) {
  if (!hasMongoConfig()) return [] as Array<{ role: 'user' | 'assistant'; content: string }>
  const documents = await (await getDb()).collection('assistant_messages')
    .find({ sessionId, expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .limit(Math.min(20, Math.max(1, limit)))
    .toArray()
  return documents.reverse().map((document) => ({
    role: document.role === 'assistant' ? 'assistant' as const : 'user' as const,
    content: String(document.content || '').slice(0, 5000),
  }))
}

type RecordExchangeInput = {
  sessionId: string
  requestId: string
  question: string
  answer: string
  intent: string
  answerKind: string
  sourceIds: string[]
  confidence: number
  needsHuman: boolean
  latencyMs: number
  modelLatencyMs?: number
  graphLatencyMs?: number
  validatorOutcome?: AssistantStoredMessage['validatorOutcome']
  errorCode?: string
}

export async function recordAssistantExchange(input: RecordExchangeInput) {
  if (!hasMongoConfig()) return
  await ensureAssistantOperationsIndexes()
  const now = new Date()
  const expiresAt = retentionDate()
  const common = {
    sessionId: input.sessionId,
    requestId: input.requestId,
    intent: input.intent,
    answerKind: input.answerKind,
    sourceIds: input.sourceIds.slice(0, 20),
    confidence: input.confidence,
    needsHuman: input.needsHuman,
    latencyMs: input.latencyMs,
    modelLatencyMs: input.modelLatencyMs || 0,
    graphLatencyMs: input.graphLatencyMs || 0,
    validatorOutcome: input.validatorOutcome || 'not_run',
    errorCode: String(input.errorCode || '').slice(0, 100),
    createdAt: now,
    expiresAt,
  }
  await (await getDb()).collection('assistant_messages').bulkWrite([
    { updateOne: { filter: { requestId: input.requestId, role: 'user' }, update: { $setOnInsert: { ...common, id: randomUUID(), role: 'user', content: redactAssistantText(input.question) } }, upsert: true } },
    { updateOne: { filter: { requestId: input.requestId, role: 'assistant' }, update: { $setOnInsert: { ...common, id: randomUUID(), role: 'assistant', content: redactAssistantText(input.answer) } }, upsert: true } },
  ], { ordered: false })
}

export async function saveAssistantFeedback(sessionId: string, requestId: string, helpful: boolean, reason: string) {
  assertMongo()
  await ensureAssistantOperationsIndexes()
  const db = await getDb()
  const ownsRequest = await db.collection('assistant_messages').findOne({ sessionId, requestId, role: 'assistant' }, { projection: { _id: 1 } })
  if (!ownsRequest) throw new Error('FEEDBACK_REQUEST_NOT_FOUND')
  const feedback: AssistantFeedback = {
    id: randomUUID(),
    sessionId,
    requestId,
    helpful,
    reason: redactAssistantText(reason).slice(0, 500),
    createdAt: new Date().toISOString(),
    expiresAt: retentionDate().toISOString(),
  }
  const { id, ...mutableFeedback } = feedback
  await db.collection('assistant_feedback').updateOne(
    { sessionId, requestId },
    {
      $set: { ...mutableFeedback, createdAt: new Date(feedback.createdAt), expiresAt: new Date(feedback.expiresAt) },
      $setOnInsert: { id },
    },
    { upsert: true },
  )
  return feedback
}

export async function backfillAssistantFeedbackRetention() {
  assertMongo()
  const result = await (await getDb()).collection('assistant_feedback').updateMany(
    { expiresAt: { $exists: false } },
    { $set: { expiresAt: retentionDate() } },
  )
  return result.modifiedCount
}

export async function listAssistantConversations(page = 1, limit = 20) {
  assertMongo()
  await ensureAssistantOperationsIndexes()
  const safePage = Math.max(1, page)
  const safeLimit = Math.min(100, Math.max(1, limit))
  const db = await getDb()
  const [items, total] = await Promise.all([
    db.collection('assistant_sessions').aggregate([
      { $sort: { updatedAt: -1 } },
      { $skip: (safePage - 1) * safeLimit },
      { $limit: safeLimit },
      {
        $lookup: {
          from: 'assistant_messages',
          let: { sessionId: '$id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$sessionId', '$$sessionId'] } } },
            { $sort: { createdAt: -1 } },
            { $project: { _id: 0, content: 1 } },
          ],
          as: 'messages',
        },
      },
      { $project: { _id: 0, id: 1, constraints: 1, createdAt: 1, updatedAt: 1, expiresAt: 1, messageCount: { $size: '$messages' }, lastMessage: { $arrayElemAt: ['$messages.content', 0] } } },
    ]).toArray(),
    db.collection('assistant_sessions').countDocuments(),
  ])
  return { items: items.map((item) => ({ ...item, createdAt: iso(item.createdAt), updatedAt: iso(item.updatedAt), expiresAt: iso(item.expiresAt) })), total, page: safePage, limit: safeLimit }
}

export async function getAssistantConversation(sessionId: string) {
  assertMongo()
  const db = await getDb()
  const session = await db.collection('assistant_sessions').findOne({ id: sessionId }, { projection: { _id: 0 } })
  if (!session) return null
  const [messages, feedback] = await Promise.all([
    db.collection('assistant_messages').find({ sessionId }).sort({ createdAt: 1 }).project({ _id: 0 }).limit(200).toArray(),
    db.collection('assistant_feedback').find({ sessionId }).sort({ createdAt: 1 }).project({ _id: 0 }).limit(200).toArray(),
  ])
  return {
    session: { ...session, createdAt: iso(session.createdAt), updatedAt: iso(session.updatedAt), expiresAt: iso(session.expiresAt) },
    messages: messages.map((message) => ({ ...message, createdAt: iso(message.createdAt), expiresAt: iso(message.expiresAt) })),
    feedback: feedback.map((item) => ({ ...item, createdAt: iso(item.createdAt), expiresAt: iso(item.expiresAt) })),
  }
}

export async function deleteAssistantConversation(sessionId: string) {
  assertMongo()
  const db = await getDb()
  const result = await db.collection('assistant_sessions').deleteOne({ id: sessionId })
  await Promise.all([
    db.collection('assistant_messages').deleteMany({ sessionId }),
    db.collection('assistant_feedback').deleteMany({ sessionId }),
  ])
  return result.deletedCount > 0
}

export async function saveAssistantEvaluationResults(results: AssistantEvaluationResult[]) {
  assertMongo()
  await ensureAssistantOperationsIndexes()
  if (!results.length) return
  await (await getDb()).collection('assistant_evaluations').bulkWrite(results.map((result) => ({
    updateOne: {
      filter: { runId: result.runId, caseId: result.caseId },
      update: { $set: { ...result, createdAt: new Date(result.createdAt) } },
      upsert: true,
    },
  })), { ordered: false })
}

export async function listAssistantEvaluationRuns(limit = 200) {
  assertMongo()
  await ensureAssistantOperationsIndexes()
  const documents = await (await getDb()).collection('assistant_evaluations').find({}).sort({ createdAt: -1 }).limit(Math.min(1000, Math.max(1, limit))).toArray()
  return documents.map((document) => ({ ...document, _id: undefined, createdAt: iso(document.createdAt) }))
}

export async function assistantOperationsOverview() {
  if (!hasMongoConfig()) return { sessions: 0, messages: 0, feedback: 0, helpful: 0, unanswered: 0 }
  const db = await getDb()
  const [sessions, messages, feedback, helpful, unanswered] = await Promise.all([
    db.collection('assistant_sessions').countDocuments(),
    db.collection('assistant_messages').countDocuments({ role: 'assistant' }),
    db.collection('assistant_feedback').countDocuments(),
    db.collection('assistant_feedback').countDocuments({ helpful: true }),
    db.collection('assistant_messages').countDocuments({ role: 'assistant', needsHuman: true }),
  ])
  return { sessions, messages, feedback, helpful, unanswered }
}
