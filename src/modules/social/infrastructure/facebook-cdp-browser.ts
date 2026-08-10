import { chromium, type Browser, type BrowserContext } from 'playwright'
import { readFile } from 'node:fs/promises'
import { basename, isAbsolute, join } from 'node:path'
import { homedir, platform } from 'node:os'

type FacebookCdpConnection = {
  browser: Browser
  context: BrowserContext
  endpoint: string
}

let cachedConnection: FacebookCdpConnection | null = null
let pendingConnection: Promise<FacebookCdpConnection> | null = null

function defaultActivePortPath() {
  if (platform() === 'darwin') return join(homedir(), 'Library', 'Application Support', 'Google', 'Chrome', 'DevToolsActivePort')
  if (platform() === 'win32') return join(process.env.LOCALAPPDATA || homedir(), 'Google', 'Chrome', 'User Data', 'DevToolsActivePort')
  return join(homedir(), '.config', 'google-chrome', 'DevToolsActivePort')
}

export function resolveFacebookCdpActivePortPath(value = process.env.SOCIAL_FACEBOOK_CDP_ACTIVE_PORT_PATH) {
  const configuredPath = value?.trim()
  const activePortPath = configuredPath || defaultActivePortPath()
  if (!isAbsolute(activePortPath) || basename(activePortPath) !== 'DevToolsActivePort') {
    throw new Error('FACEBOOK_CDP_ACTIVE_PORT_PATH_INVALID')
  }
  return activePortPath
}

export function parseFacebookCdpActivePort(value: string) {
  const [portValue, browserPath] = value.trim().split(/\r?\n/).map((item) => item.trim())
  const port = Number(portValue)
  if (!Number.isInteger(port) || port < 1 || port > 65_535 || !/^\/devtools\/browser\/[A-Za-z0-9._-]+$/.test(browserPath || '')) {
    throw new Error('FACEBOOK_CDP_ACTIVE_PORT_INVALID')
  }
  return `ws://127.0.0.1:${port}${browserPath}`
}

export async function readFacebookCdpEndpoint(activePortPath = resolveFacebookCdpActivePortPath()) {
  let contents: string
  try {
    contents = await readFile(activePortPath, 'utf8')
  } catch {
    throw new Error('FACEBOOK_CDP_ACTIVE_PORT_NOT_FOUND')
  }
  return parseFacebookCdpActivePort(contents)
}

async function createFacebookCdpConnection(): Promise<FacebookCdpConnection> {
  const endpoint = await readFacebookCdpEndpoint()
  let browser: Browser
  try {
    browser = await chromium.connectOverCDP(endpoint, {
      isLocal: true,
      noDefaults: true,
      timeout: 30_000,
    })
  } catch {
    throw new Error('FACEBOOK_CDP_CONNECT_FAILED')
  }

  const context = browser.contexts()[0]
  if (!context) throw new Error('FACEBOOK_CDP_CONTEXT_NOT_FOUND')

  const connection: FacebookCdpConnection = { browser, context, endpoint }
  browser.once('disconnected', () => {
    if (cachedConnection === connection) cachedConnection = null
  })
  return connection
}

export async function getFacebookCdpConnection(): Promise<FacebookCdpConnection> {
  if (process.env.SOCIAL_FACEBOOK_CDP_ENABLED !== 'true') throw new Error('FACEBOOK_CDP_DISABLED')
  if (cachedConnection?.browser.isConnected()) return cachedConnection
  cachedConnection = null
  if (!pendingConnection) {
    pendingConnection = createFacebookCdpConnection().then((connection) => {
      cachedConnection = connection
      return connection
    }).finally(() => {
      pendingConnection = null
    })
  }
  return pendingConnection
}

/**
 * Release the application reference to a one-shot CDP caller. The caller must
 * terminate after the scan so Node closes its WebSocket naturally. Calling
 * Playwright's browser.close() against an existing Chrome can invalidate the
 * user's remote-debugging endpoint, so the worker never invokes it.
 */
export async function releaseFacebookCdpConnection() {
  cachedConnection = null
}
