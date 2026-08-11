const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

export async function notifyIndexNow(paths: string[]) {
  const key = process.env.INDEXNOW_KEY?.trim()
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (!key || !baseUrl || !paths.length) return { submitted: false }
  const host = new URL(baseUrl).host
  const urlList = Array.from(new Set(paths.map((path) => path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`))).slice(0, 10_000)
  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, key, keyLocation: `${baseUrl}/indexnow-key.txt`, urlList }),
      signal: AbortSignal.timeout(4_000),
    })
    if (!response.ok && response.status !== 202) throw new Error(`IndexNow returned ${response.status}`)
    return { submitted: true }
  } catch (error) {
    console.error('[indexnow]', error)
    return { submitted: false }
  }
}
