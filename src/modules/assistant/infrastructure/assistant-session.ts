import { createHmac, timingSafeEqual } from 'node:crypto'
import { developmentSessionSecret } from '@/lib/session-secret'

export const assistantSessionCookieName = 'sonic_assistant_session'

type AssistantSessionToken = { id: string; exp: number }

function sessionSecret() {
  const value = process.env.ASSISTANT_SESSION_SECRET || process.env.SESSION_SECRET
  if (value) return value
  if (process.env.NODE_ENV === 'production') throw new Error('ASSISTANT_SESSION_SECRET_REQUIRED')
  return developmentSessionSecret
}
function sign(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url')
}

function encode(value: AssistantSessionToken) {
  const payload = Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function decode(token: string): AssistantSessionToken | null {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = Buffer.from(sign(payload))
  const received = Buffer.from(signature)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AssistantSessionToken
    if (!value.id || !Number.isFinite(value.exp) || value.exp <= Math.floor(Date.now() / 1000)) return null
    return value
  } catch {
    return null
  }
}

export function assistantRetentionDays() {
  const value = Number(process.env.ASSISTANT_RETENTION_DAYS || 30)
  return Number.isFinite(value) ? Math.min(90, Math.max(1, Math.floor(value))) : 30
}

export function createAssistantSessionToken(id: string) {
  return encode({ id, exp: Math.floor(Date.now() / 1000) + assistantRetentionDays() * 86_400 })
}

export function readAssistantSessionToken(token?: string | null) {
  return token ? decode(token) : null
}

export function readCookieValue(request: Request, name: string) {
  const header = request.headers.get('cookie') || ''
  for (const item of header.split(';')) {
    const [key, ...parts] = item.trim().split('=')
    if (key === name) return decodeURIComponent(parts.join('='))
  }
  return null
}
