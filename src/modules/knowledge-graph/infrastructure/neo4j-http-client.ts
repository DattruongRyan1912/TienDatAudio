import type { GraphConnectionRole, GraphHealth } from '../domain/types'

type Neo4jResponse = {
  results?: Array<{ columns?: string[]; data?: Array<{ row?: unknown[] }> }>
  errors?: Array<{ code?: string; message?: string }>
}
type Neo4jConfig = {
  endpoint: string
  database: string
  username: string
  password: string
}

function neo4jConfig(role: GraphConnectionRole): Neo4jConfig | null {
  const rawUrl = process.env.NEO4J_HTTP_URL?.trim().replace(/\/$/, '')
  const username = process.env[role === 'writer' ? 'NEO4J_WRITER_USERNAME' : 'NEO4J_READER_USERNAME']?.trim()
  const password = process.env[role === 'writer' ? 'NEO4J_WRITER_PASSWORD' : 'NEO4J_READER_PASSWORD']?.trim()
  if (!rawUrl || !username || !password) return null
  const parsed = new URL(rawUrl)
  const local = ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname)
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && local)) throw new Error('NEO4J_INSECURE_ENDPOINT')
  const database = (process.env.NEO4J_DATABASE || 'neo4j').replace(/[^a-zA-Z0-9_-]/g, '') || 'neo4j'
  return {
    endpoint: `${parsed.toString().replace(/\/$/, '')}/db/${database}/tx/commit`,
    database,
    username,
    password,
  }
}

export function hasNeo4jConfig(role: GraphConnectionRole = 'reader') {
  try {
    return Boolean(neo4jConfig(role))
  } catch {
    return false
  }
}

async function execute(role: GraphConnectionRole, statement: string, parameters: Record<string, unknown> = {}, timeoutMs = 10_000) {
  const config = neo4jConfig(role)
  if (!config) throw new Error('NEO4J_NOT_CONFIGURED')
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ statements: [{ statement, parameters, resultDataContents: ['row'] }] }),
    signal: AbortSignal.timeout(timeoutMs),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(response.status === 401 ? 'NEO4J_AUTH_FAILED' : 'NEO4J_REQUEST_FAILED')
  const payload = await response.json() as Neo4jResponse
  const firstError = payload.errors?.[0]
  if (firstError) {
    const code = String(firstError.code || '')
    if (code.includes('Security')) throw new Error('NEO4J_PERMISSION_DENIED')
    throw new Error('NEO4J_QUERY_FAILED')
  }
  const result = payload.results?.[0]
  const columns = result?.columns || []
  return (result?.data || []).map((item) => Object.fromEntries(columns.map((column, index) => [column, item.row?.[index]])))
}

export function runNeo4jRead(statement: string, parameters: Record<string, unknown> = {}) {
  return execute('reader', statement, parameters)
}

export function runNeo4jProjectionWrite(statement: string, parameters: Record<string, unknown> = {}) {
  return execute('writer', statement, parameters, 30_000)
}

export async function getNeo4jHealth(): Promise<GraphHealth> {
  const startedAt = performance.now()
  if (!hasNeo4jConfig('reader')) return { enabled: false, available: false, database: process.env.NEO4J_DATABASE || 'neo4j', latencyMs: 0, errorCode: 'NEO4J_NOT_CONFIGURED' }
  try {
    await runNeo4jRead('RETURN 1 AS ok')
    return { enabled: true, available: true, database: process.env.NEO4J_DATABASE || 'neo4j', latencyMs: Math.round(performance.now() - startedAt), errorCode: '' }
  } catch (error) {
    return {
      enabled: true,
      available: false,
      database: process.env.NEO4J_DATABASE || 'neo4j',
      latencyMs: Math.round(performance.now() - startedAt),
      errorCode: error instanceof Error ? error.message : 'NEO4J_UNAVAILABLE',
    }
  }
}
