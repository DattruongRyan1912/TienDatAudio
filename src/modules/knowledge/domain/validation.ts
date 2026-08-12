import {
  COMPATIBILITY_VERDICTS,
  EVIDENCE_REVIEW_STATUSES,
  KNOWLEDGE_ENTRY_STATUSES,
  KNOWLEDGE_ENTRY_TYPES,
  KNOWLEDGE_SOURCE_TYPES,
  type CompatibilityAssessment,
  type EvidenceReviewStatus,
  type KnowledgeClaim,
  type KnowledgeEntry,
  type KnowledgeEntityRef,
  type KnowledgeSource,
} from './types'

type UnknownRecord = Record<string, unknown>

function record(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {}
}

function text(value: unknown, fallback = '', maxLength = 5000) {
  return String(value ?? fallback).replace(/\r\n?/g, '\n').trim().slice(0, maxLength)
}

function lineText(value: unknown, fallback = '', maxLength = 500) {
  return text(value, fallback, maxLength).replace(/\s+/g, ' ')
}

function list(value: unknown, maxItems = 100, maxLength = 300) {
  const source = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : []
  return Array.from(new Set(source.map((item) => lineText(item, '', maxLength)).filter(Boolean))).slice(0, maxItems)
}

function dateOrNull(value: unknown) {
  const candidate = lineText(value, '', 50)
  if (!candidate) return null
  const parsed = new Date(candidate)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function numberInRange(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.min(max, Math.max(min, parsed)) : fallback
}

function enumValue<T extends readonly string[]>(value: unknown, values: T, fallback: T[number]): T[number] {
  return values.includes(value as T[number]) ? value as T[number] : fallback
}

function safeUrl(value: unknown) {
  const candidate = lineText(value, '', 2000)
  if (!candidate) return ''
  try {
    const parsed = new URL(candidate)
    return parsed.protocol === 'https:' ? parsed.toString() : ''
  } catch {
    return ''
  }
}

export function knowledgeSlug(value: unknown) {
  return lineText(value, '', 160)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

function entityRef(value: unknown): KnowledgeEntityRef {
  const input = record(value)
  return {
    type: knowledgeSlug(input.type).replace(/-/g, '_').slice(0, 60),
    sourceId: lineText(input.sourceId, '', 160),
    label: lineText(input.label, '', 240),
  }
}

export function normalizeKnowledgeEntry(value: unknown, fallback: Partial<KnowledgeEntry> = {}): KnowledgeEntry {
  const input = { ...fallback, ...record(value) }
  const now = new Date().toISOString()
  const title = lineText(input.title, '', 240)
  return {
    id: lineText(input.id, '', 160),
    slug: knowledgeSlug(input.slug || title),
    type: enumValue(input.type, KNOWLEDGE_ENTRY_TYPES, 'faq'),
    title,
    answerMarkdown: text(input.answerMarkdown, '', 30_000),
    aliases: list(input.aliases, 80, 240),
    tags: list(input.tags, 50, 120).map(knowledgeSlug).filter(Boolean),
    priority: Math.round(numberInRange(input.priority, 50, 0, 100)),
    reviewStatus: enumValue(input.reviewStatus, KNOWLEDGE_ENTRY_STATUSES, 'draft'),
    sourceIds: list(input.sourceIds, 100, 160),
    validFrom: dateOrNull(input.validFrom),
    expiresAt: dateOrNull(input.expiresAt),
    reviewedBy: lineText(input.reviewedBy, '', 160) || null,
    reviewedAt: dateOrNull(input.reviewedAt),
    version: Math.max(1, Math.floor(numberInRange(input.version, 1, 1, Number.MAX_SAFE_INTEGER))),
    createdAt: dateOrNull(input.createdAt) || now,
    updatedAt: dateOrNull(input.updatedAt) || now,
  }
}

export function validateKnowledgeEntry(value: unknown, fallback: Partial<KnowledgeEntry> = {}) {
  const entry = normalizeKnowledgeEntry(value, fallback)
  const errors: string[] = []
  if (entry.title.length < 3) errors.push('Tiêu đề phải có ít nhất 3 ký tự')
  if (!entry.slug) errors.push('Slug không hợp lệ')
  if (entry.answerMarkdown.length < 10) errors.push('Nội dung phải có ít nhất 10 ký tự')
  if (entry.expiresAt && entry.validFrom && entry.expiresAt <= entry.validFrom) errors.push('Ngày hết hiệu lực phải sau ngày bắt đầu')
  if (entry.reviewStatus === 'published' && (!entry.reviewedBy || entry.sourceIds.length === 0)) errors.push('Knowledge đã xuất bản phải có người duyệt và nguồn đã xác minh')
  return { entry, errors }
}

export function normalizeKnowledgeSource(value: unknown, fallback: Partial<KnowledgeSource> = {}): KnowledgeSource {
  const input = { ...fallback, ...record(value) }
  const now = new Date().toISOString()
  return {
    id: lineText(input.id, '', 160),
    type: enumValue(input.type, KNOWLEDGE_SOURCE_TYPES, 'verified_internal'),
    organization: lineText(input.organization, '', 240),
    title: lineText(input.title, '', 300),
    url: safeUrl(input.url),
    retrievedAt: dateOrNull(input.retrievedAt),
    reviewStatus: enumValue(input.reviewStatus, EVIDENCE_REVIEW_STATUSES, 'review'),
    reviewedBy: lineText(input.reviewedBy, '', 160) || null,
    reviewedAt: dateOrNull(input.reviewedAt),
    checksum: lineText(input.checksum, '', 128),
    version: Math.max(1, Math.floor(numberInRange(input.version, 1, 1, Number.MAX_SAFE_INTEGER))),
    createdAt: dateOrNull(input.createdAt) || now,
    updatedAt: dateOrNull(input.updatedAt) || now,
  }
}

export function validateKnowledgeSource(value: unknown, fallback: Partial<KnowledgeSource> = {}) {
  const source = normalizeKnowledgeSource(value, fallback)
  const errors: string[] = []
  if (source.title.length < 3) errors.push('Tên nguồn phải có ít nhất 3 ký tự')
  if (record(value).url && !source.url) errors.push('URL nguồn phải dùng HTTPS')
  if (source.reviewStatus === 'verified' && !source.reviewedBy) errors.push('Nguồn verified phải có người duyệt')
  return { source, errors }
}

export function normalizeKnowledgeClaim(value: unknown, fallback: Partial<KnowledgeClaim> = {}): KnowledgeClaim {
  const input = { ...fallback, ...record(value) }
  const objectInput = record(input.object)
  const now = new Date().toISOString()
  return {
    id: lineText(input.id, '', 160),
    subject: entityRef(input.subject),
    predicate: knowledgeSlug(input.predicate).replace(/-/g, '_').slice(0, 100),
    object: {
      type: knowledgeSlug(objectInput.type).replace(/-/g, '_').slice(0, 60),
      sourceId: lineText(objectInput.sourceId, '', 160) || null,
      value: lineText(objectInput.value, '', 1000) || null,
      label: lineText(objectInput.label, '', 240),
    },
    reason: text(input.reason, '', 5000),
    sourceIds: list(input.sourceIds, 100, 160),
    reviewStatus: enumValue(input.reviewStatus, EVIDENCE_REVIEW_STATUSES, 'suggested'),
    confidence: numberInRange(input.confidence, 0, 0, 1),
    verifiedBy: lineText(input.verifiedBy, '', 160) || null,
    verifiedAt: dateOrNull(input.verifiedAt),
    validFrom: dateOrNull(input.validFrom),
    expiresAt: dateOrNull(input.expiresAt),
    version: Math.max(1, Math.floor(numberInRange(input.version, 1, 1, Number.MAX_SAFE_INTEGER))),
    createdAt: dateOrNull(input.createdAt) || now,
    updatedAt: dateOrNull(input.updatedAt) || now,
  }
}

export function validateKnowledgeClaim(value: unknown, fallback: Partial<KnowledgeClaim> = {}) {
  const claim = normalizeKnowledgeClaim(value, fallback)
  const errors: string[] = []
  if (!claim.subject.type || !claim.subject.sourceId || !claim.subject.label) errors.push('Claim cần subject hợp lệ')
  if (!claim.predicate) errors.push('Claim cần predicate hợp lệ')
  if (!claim.object.type || !claim.object.label) errors.push('Claim cần object hợp lệ')
  if (claim.reason.length < 5) errors.push('Claim cần lý do')
  if (claim.reviewStatus === 'verified' && (!claim.verifiedBy || claim.sourceIds.length === 0)) errors.push('Claim verified cần người duyệt và nguồn')
  if (claim.expiresAt && claim.validFrom && claim.expiresAt <= claim.validFrom) errors.push('Ngày hết hiệu lực phải sau ngày bắt đầu')
  return { claim, errors }
}

export function normalizeCompatibility(value: unknown, fallback: Partial<CompatibilityAssessment> = {}): CompatibilityAssessment {
  const input = { ...fallback, ...record(value) }
  const room = record(input.room)
  const now = new Date().toISOString()
  const minM2 = Number(room.minM2)
  const maxM2 = Number(room.maxM2)
  return {
    id: lineText(input.id, '', 160),
    componentIds: list(input.componentIds, 30, 160),
    room: {
      minM2: Number.isFinite(minM2) && minM2 >= 0 ? minM2 : null,
      maxM2: Number.isFinite(maxM2) && maxM2 >= 0 ? maxM2 : null,
    },
    useCases: list(input.useCases, 20, 80).map(knowledgeSlug).filter(Boolean),
    preferences: list(input.preferences, 30, 120),
    verdict: enumValue(input.verdict, COMPATIBILITY_VERDICTS, 'conditional'),
    reason: text(input.reason, '', 5000),
    sourceIds: list(input.sourceIds, 100, 160),
    reviewStatus: enumValue(input.reviewStatus, EVIDENCE_REVIEW_STATUSES, 'suggested'),
    confidence: numberInRange(input.confidence, 0, 0, 1),
    verifiedBy: lineText(input.verifiedBy, '', 160) || null,
    verifiedAt: dateOrNull(input.verifiedAt),
    version: Math.max(1, Math.floor(numberInRange(input.version, 1, 1, Number.MAX_SAFE_INTEGER))),
    createdAt: dateOrNull(input.createdAt) || now,
    updatedAt: dateOrNull(input.updatedAt) || now,
  }
}

export function validateCompatibility(value: unknown, fallback: Partial<CompatibilityAssessment> = {}) {
  const assessment = normalizeCompatibility(value, fallback)
  const errors: string[] = []
  if (assessment.componentIds.length < 1) errors.push('Compatibility cần ít nhất một sản phẩm')
  if (assessment.room.minM2 !== null && assessment.room.maxM2 !== null && assessment.room.maxM2 < assessment.room.minM2) errors.push('Diện tích tối đa phải lớn hơn diện tích tối thiểu')
  if (assessment.useCases.length === 0) errors.push('Compatibility cần ít nhất một use case')
  if (assessment.reason.length < 5) errors.push('Compatibility cần lý do')
  if (assessment.reviewStatus === 'verified' && (!assessment.verifiedBy || assessment.sourceIds.length === 0)) errors.push('Compatibility verified cần người duyệt và nguồn')
  return { assessment, errors }
}

export function isEvidenceActive(status: EvidenceReviewStatus, expiresAt?: string | null) {
  return status === 'verified' && (!expiresAt || expiresAt > new Date().toISOString())
}
