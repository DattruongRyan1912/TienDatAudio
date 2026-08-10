import { randomUUID } from 'node:crypto'
import { chmod, mkdir, readFile, realpath, rename, rm, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import type { BrowserContext, BrowserContextOptions } from 'playwright'

type FacebookStorageState = Exclude<NonNullable<BrowserContextOptions['storageState']>, string>

const LOCAL_FACEBOOK_STATE_ROOT = resolve(process.cwd(), '.local', 'facebook')

function isPathWithin(root: string, candidate: string) {
  const relativePath = relative(root, candidate)
  return relativePath === '' || (!relativePath.startsWith(`..${sep}`) && relativePath !== '..' && !isAbsolute(relativePath))
}

function isFacebookHostname(value: string) {
  const hostname = value.toLowerCase().replace(/^\./, '').replace(/\.$/, '')
  return hostname === 'facebook.com' || hostname.endsWith('.facebook.com')
}

function isFacebookOrigin(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && isFacebookHostname(url.hostname)
  } catch {
    return false
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? value as Record<string, unknown> : null
}

function sanitizeStorageState(value: unknown): FacebookStorageState {
  const raw = asRecord(value)
  if (!raw || !Array.isArray(raw.cookies) || !Array.isArray(raw.origins)) throw new Error('FACEBOOK_STORAGE_STATE_INVALID')

  const cookies = raw.cookies.flatMap((value) => {
    const cookie = asRecord(value)
    if (!cookie || typeof cookie.name !== 'string' || typeof cookie.value !== 'string' || typeof cookie.domain !== 'string' || !isFacebookHostname(cookie.domain)) return []
    const sameSite: 'Strict' | 'None' | 'Lax' = cookie.sameSite === 'Strict' || cookie.sameSite === 'None' ? cookie.sameSite : 'Lax'
    return [{
      name: cookie.name,
      value: cookie.value,
      domain: cookie.domain,
      path: typeof cookie.path === 'string' ? cookie.path : '/',
      expires: typeof cookie.expires === 'number' ? cookie.expires : -1,
      httpOnly: cookie.httpOnly === true,
      secure: cookie.secure !== false,
      sameSite,
    }]
  })

  const origins = raw.origins.flatMap((value) => {
    const origin = asRecord(value)
    if (!origin || typeof origin.origin !== 'string' || !isFacebookOrigin(origin.origin) || !Array.isArray(origin.localStorage)) return []
    const localStorage = origin.localStorage.flatMap((entry) => {
      const item = asRecord(entry)
      return item && typeof item.name === 'string' && typeof item.value === 'string'
        ? [{ name: item.name, value: item.value }]
        : []
    })
    return [{ origin: origin.origin, localStorage }]
  })

  if (cookies.length === 0 && origins.length === 0) throw new Error('FACEBOOK_STORAGE_STATE_INVALID')
  return { cookies, origins }
}

export function resolveFacebookStorageStatePath(value?: string) {
  const raw = value?.trim()
  if (!raw) return undefined
  const candidate = isAbsolute(raw) ? resolve(raw) : resolve(process.cwd(), raw)
  if (!isPathWithin(LOCAL_FACEBOOK_STATE_ROOT, candidate)) throw new Error('FACEBOOK_STORAGE_STATE_PATH_INVALID')
  return candidate
}

async function assertSafeStorageStatePath(filePath: string) {
  await mkdir(LOCAL_FACEBOOK_STATE_ROOT, { recursive: true, mode: 0o700 })
  await chmod(LOCAL_FACEBOOK_STATE_ROOT, 0o700).catch(() => undefined)
  const realRoot = await realpath(LOCAL_FACEBOOK_STATE_ROOT)
  const realParent = await realpath(dirname(filePath)).catch(() => null)
  if (!realParent || !isPathWithin(realRoot, realParent)) throw new Error('FACEBOOK_STORAGE_STATE_PATH_INVALID')
  const realFile = await realpath(filePath).catch(() => join(realParent, basename(filePath)))
  if (!isPathWithin(realRoot, realFile)) throw new Error('FACEBOOK_STORAGE_STATE_PATH_INVALID')
}

export async function loadFacebookStorageState(value: string | undefined, options: { required?: boolean } = {}) {
  const filePath = resolveFacebookStorageStatePath(value)
  if (!filePath) return undefined
  await assertSafeStorageStatePath(filePath)

  try {
    const details = await stat(filePath)
    if (!details.isFile()) throw new Error('FACEBOOK_STORAGE_STATE_INVALID')
    if ((details.mode & 0o077) !== 0) await chmod(filePath, 0o600)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT' && !options.required) return undefined
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('FACEBOOK_STORAGE_STATE_NOT_FOUND')
    throw error
  }

  try {
    const value = JSON.parse(await readFile(filePath, 'utf8')) as unknown
    return { path: filePath, state: sanitizeStorageState(value) }
  } catch (error) {
    if (error instanceof Error && error.message === 'FACEBOOK_STORAGE_STATE_INVALID') throw error
    throw new Error('FACEBOOK_STORAGE_STATE_INVALID')
  }
}

export async function saveFacebookStorageState(context: BrowserContext, value: string) {
  const filePath = resolveFacebookStorageStatePath(value)
  if (!filePath) throw new Error('FACEBOOK_STORAGE_STATE_PATH_INVALID')
  await assertSafeStorageStatePath(filePath)
  const state = sanitizeStorageState(await context.storageState())
  const temporaryPath = join(dirname(filePath), `.storage-state-${randomUUID()}.tmp`)

  try {
    await writeFile(temporaryPath, JSON.stringify(state), { encoding: 'utf8', mode: 0o600 })
    await chmod(temporaryPath, 0o600)
    await rename(temporaryPath, filePath)
    await chmod(filePath, 0o600)
  } finally {
    await rm(temporaryPath, { force: true }).catch(() => undefined)
  }

  return filePath
}
