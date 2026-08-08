import { cookies } from 'next/headers'
import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const sessionCookieName = 'sonic_admin_session'
const sessionDuration = 60 * 60 * 8
const developmentSecret = randomBytes(32).toString('hex')

type AdminSession = {
  username: string
  exp: number
}

function getSessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET chưa được cấu hình')
  }
  return developmentSecret
}

function encode(value: string) {
  return Buffer.from(value).toString('base64url')
}

function decode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url')
}

function parsePasswordHash(value: string) {
  const [algorithm, salt, digest] = value.split('$')
  if (algorithm !== 'scrypt' || !salt || !digest) return null
  return { salt, digest }
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer
  return `scrypt$${salt}$${derivedKey.toString('hex')}`
}

async function verifyPassword(password: string, storedHash: string) {
  const parsed = parsePasswordHash(storedHash)
  if (!parsed) return false

  const derivedKey = (await scrypt(password, parsed.salt, 64)) as Buffer
  const expected = Buffer.from(parsed.digest, 'hex')
  return expected.length === derivedKey.length && timingSafeEqual(expected, derivedKey)
}

export async function verifyAdminCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME
  const storedHash = process.env.ADMIN_PASSWORD_HASH

  if (!expectedUsername || username !== expectedUsername) return false
  if (!storedHash && process.env.NODE_ENV !== 'production' && process.env.ADMIN_PASSWORD) {
    return password === process.env.ADMIN_PASSWORD
  }
  if (!storedHash) return false
  return verifyPassword(password, storedHash)
}

export function createAdminSession(username: string) {
  const payload: AdminSession = {
    username,
    exp: Math.floor(Date.now() / 1000) + sessionDuration,
  }
  const encodedPayload = encode(JSON.stringify(payload))
  return `${encodedPayload}.${sign(encodedPayload)}`
}

export function readAdminSession(token?: string | null): AdminSession | null {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expectedSignature = sign(payload)
  const actual = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null

  try {
    const session = JSON.parse(decode(payload)) as AdminSession
    if (!session.username || session.exp <= Math.floor(Date.now() / 1000)) return null
    return session
  } catch {
    return null
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies()
  return readAdminSession(cookieStore.get(sessionCookieName)?.value)
}

export function getSessionCookieName() {
  return sessionCookieName
}
