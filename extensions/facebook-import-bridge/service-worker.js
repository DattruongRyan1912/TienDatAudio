/* global chrome */
'use strict';

const allowedAdminOrigins = new Set([
  'https://tiendataudioquangngai.id.vn',
  'https://tien-dat-audio.vercel.app',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
])

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

function normalizeFacebookUrl(value) {
  if (typeof value !== 'string' || value.length > 2_048) throw new Error('FACEBOOK_URL_INVALID')
  const url = new URL(value)
  const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  if (url.protocol !== 'https:' || !(hostname === 'facebook.com' || hostname.endsWith('.facebook.com'))) {
    throw new Error('FACEBOOK_URL_INVALID')
  }
  url.username = ''
  url.password = ''
  return url.toString()
}

function isAllowedAdminSender(sender) {
  try {
    const url = new URL(sender.url || sender.tab?.url || '')
    return allowedAdminOrigins.has(url.origin) && url.pathname.startsWith('/admin/social-posts/')
  } catch {
    return false
  }
}

async function waitForTabComplete(tabId, timeoutMs = 45_000) {
  const current = await chrome.tabs.get(tabId)
  if (current.status === 'complete') return

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('FACEBOOK_EXTENSION_NAVIGATION_TIMEOUT'))
    }, timeoutMs)
    const onUpdated = (updatedTabId, changeInfo) => {
      if (updatedTabId !== tabId || changeInfo.status !== 'complete') return
      cleanup()
      resolve()
    }
    const cleanup = () => {
      clearTimeout(timer)
      chrome.tabs.onUpdated.removeListener(onUpdated)
    }
    chrome.tabs.onUpdated.addListener(onUpdated)
  })
}

async function sendScannerMessage(tabId, mode) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { type: 'TDA_SCAN_FACEBOOK_TAB', mode, maxImages: 50 })
      if (response?.ok === true) return response.data
      if (response?.error?.code) throw new Error(response.error.code)
    } catch (error) {
      if (attempt === 11) throw error
      await delay(500)
    }
  }
  throw new Error('FACEBOOK_EXTENSION_SCANNER_UNAVAILABLE')
}

function imageKey(value) {
  try {
    const url = new URL(value)
    return `${url.hostname}${url.pathname}`
  } catch {
    return value
  }
}

function mergeImages(...groups) {
  const images = []
  const seen = new Set()
  for (const group of groups) {
    for (const image of Array.isArray(group) ? group : []) {
      if (!image?.imageUrl) continue
      const key = imageKey(image.imageUrl)
      if (seen.has(key)) continue
      seen.add(key)
      images.push(image)
      if (images.length >= 50) return images
    }
  }
  return images
}

async function scanFacebookGallery(sourceValue, adminTab) {
  const sourceUrl = normalizeFacebookUrl(sourceValue)
  const workerTab = await chrome.tabs.create({
    url: sourceUrl,
    active: true,
    windowId: adminTab.windowId,
  })
  if (!workerTab.id) throw new Error('FACEBOOK_EXTENSION_TAB_FAILED')

  try {
    await waitForTabComplete(workerTab.id)
    const initial = await sendScannerMessage(workerTab.id, 'initial')
    let viewer = null

    if (initial.expansionUrl) {
      await chrome.tabs.update(workerTab.id, { url: normalizeFacebookUrl(initial.expansionUrl), active: true })
      await waitForTabComplete(workerTab.id)
      viewer = await sendScannerMessage(workerTab.id, 'viewer')
    } else if (initial.viewerDetected) {
      viewer = initial
    }

    const images = mergeImages(viewer?.images, initial.images)
    if (!images.length && (viewer?.loginRequired || initial.loginRequired)) throw new Error('FACEBOOK_LOGIN_REQUIRED')
    if (!images.length) throw new Error('FACEBOOK_GALLERY_NOT_FOUND')

    return {
      images,
      finalUrl: viewer?.finalUrl || initial.finalUrl || sourceUrl,
      loginRequired: viewer?.loginRequired === true || initial.loginRequired === true,
      partialGallery: viewer ? viewer.partialGallery === true : initial.partialGallery === true,
      provider: 'browser_extension',
      sessionSource: 'browser_session',
      warning: viewer?.warning || initial.warning || '',
    }
  } finally {
    await chrome.tabs.remove(workerTab.id).catch(() => undefined)
    if (adminTab.id) await chrome.tabs.update(adminTab.id, { active: true }).catch(() => undefined)
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'TDA_SCAN_FACEBOOK_GALLERY') return false
  if (!isAllowedAdminSender(sender) || !sender.tab) {
    sendResponse({ ok: false, error: { code: 'FACEBOOK_EXTENSION_ORIGIN_DENIED' } })
    return false
  }

  scanFacebookGallery(message.sourceUrl, sender.tab)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((error) => sendResponse({
      ok: false,
      error: { code: error instanceof Error ? error.message : 'FACEBOOK_EXTENSION_FAILED' },
    }))
  return true
})
