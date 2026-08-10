/* global chrome */
'use strict';

(() => {
  const nextLabels = new Set(['ảnh tiếp theo', 'next photo', 'next'])

  function delay(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
  }

  function isFacebookMediaUrl(value) {
    try {
      const url = new URL(value)
      const hostname = url.hostname.toLowerCase()
      return /^https?:$/.test(url.protocol)
        && (hostname.endsWith('.fbcdn.net') || hostname.endsWith('.fbsbx.com') || hostname === 'facebook.com' || hostname.endsWith('.facebook.com'))
    } catch {
      return false
    }
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
    const result = []
    const seen = new Set()
    for (const group of groups) {
      for (const image of group) {
        if (!image?.imageUrl || !isFacebookMediaUrl(image.imageUrl)) continue
        const key = imageKey(image.imageUrl)
        if (seen.has(key)) continue
        seen.add(key)
        result.push(image)
      }
    }
    return result
  }

  function postRoot() {
    const dialogs = document.querySelectorAll('[role="dialog"]')
    return dialogs.length ? dialogs[dialogs.length - 1] : document.body
  }

  function collectImages(root) {
    const linked = Array.from(root.querySelectorAll('a[href*="/photo/"]')).flatMap((anchor) => {
      const image = anchor.querySelector('img')
      const imageUrl = image?.currentSrc || image?.src || ''
      if (!isFacebookMediaUrl(imageUrl)) return []
      return [{
        imageUrl,
        photoUrl: anchor.href || '',
        label: anchor.getAttribute('aria-label') || image?.alt || '',
      }]
    })

    const fallback = Array.from(root.querySelectorAll('img')).flatMap((image) => {
      const imageUrl = image.currentSrc || image.src || ''
      const rect = image.getBoundingClientRect()
      if (!isFacebookMediaUrl(imageUrl) || rect.width < 160 || rect.height < 120) return []
      const anchor = image.closest('a')
      return [{ imageUrl, photoUrl: anchor?.href || '', label: image.alt || '' }]
    })
    return mergeImages(linked, fallback)
  }

  function unopenedGalleryCount(value) {
    return /\+\d+|còn\s+\d+(?:\s+mục)?|more\s+\d+/i.test(value)
  }

  function findExpansionUrl(root) {
    for (const anchor of root.querySelectorAll('a[href*="/photo/"]')) {
      const image = anchor.querySelector('img')
      const label = `${anchor.getAttribute('aria-label') || ''} ${anchor.textContent || ''} ${image?.alt || ''}`
      if (unopenedGalleryCount(label) && anchor.href) return anchor.href
    }
    return ''
  }

  function visibleViewerImage() {
    const candidates = Array.from(document.querySelectorAll('img')).flatMap((image) => {
      const imageUrl = image.currentSrc || image.src || ''
      const rect = image.getBoundingClientRect()
      if (!isFacebookMediaUrl(imageUrl)
        || image.naturalWidth < 200
        || image.naturalHeight < 200
        || rect.width * rect.height < 40_000) return []
      return [{
        imageUrl,
        photoUrl: image.closest('a')?.href || window.location.href,
        label: image.alt || '',
        area: rect.width * rect.height,
      }]
    }).sort((left, right) => right.area - left.area)
    if (!candidates.length) return null
    return {
      imageUrl: candidates[0].imageUrl,
      photoUrl: candidates[0].photoUrl,
      label: candidates[0].label,
    }
  }

  function nextPhotoButton() {
    const controls = document.querySelectorAll('button, [role="button"]')
    for (const control of controls) {
      const label = (control.getAttribute('aria-label') || control.getAttribute('title') || control.textContent || '').trim().toLowerCase()
      if (nextLabels.has(label)) return control
    }
    return null
  }

  async function waitForViewerImage(previousKey = '') {
    const deadline = Date.now() + 7_000
    while (Date.now() < deadline) {
      const image = visibleViewerImage()
      if (image && (!previousKey || imageKey(image.imageUrl) !== previousKey)) return image
      await delay(300)
    }
    return null
  }

  async function collectViewerImages(maxImages) {
    const result = []
    const seen = new Set()
    let current = await waitForViewerImage()

    for (let step = 0; step < maxImages && current; step += 1) {
      const key = imageKey(current.imageUrl)
      if (seen.has(key)) break
      seen.add(key)
      result.push(current)

      const next = nextPhotoButton()
      if (!next) break
      next.click()
      current = await waitForViewerImage(key)
    }
    return result
  }

  function loginRequired() {
    if (/\/(?:login|checkpoint)(?:\/|$)/i.test(window.location.pathname)) return true
    const text = document.body?.innerText || ''
    return /log\s*in\s+to\s+(continue|see|view)|you must log in|login required|đăng nhập để (tiếp tục|xem thêm|xem ảnh)|hãy đăng nhập để/i.test(text)
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== 'TDA_SCAN_FACEBOOK_TAB') return false

    const run = async () => {
      await delay(1_500)
      const root = postRoot()
      const initialImages = collectImages(root)
      const expansionUrl = message.mode === 'initial' ? findExpansionUrl(root) : ''
      const viewerDetected = /\/photo(?:\.php|\/)/i.test(window.location.pathname) || Boolean(document.querySelector('[role="dialog"]'))
      const viewerImages = message.mode === 'viewer' || (viewerDetected && !expansionUrl)
        ? await collectViewerImages(Math.min(50, Math.max(1, Number(message.maxImages) || 50)))
        : []
      const images = mergeImages(viewerImages, initialImages).slice(0, 50)
      const blocked = loginRequired()
      const pageText = document.body?.innerText || ''
      return {
        images,
        expansionUrl,
        viewerDetected,
        finalUrl: window.location.href,
        loginRequired: blocked,
        partialGallery: blocked || (!viewerImages.length && unopenedGalleryCount(pageText)),
        warning: blocked ? 'Facebook yêu cầu đăng nhập hoặc tài khoản hiện tại chưa có quyền xem toàn bộ gallery.' : '',
      }
    }

    run()
      .then((data) => sendResponse({ ok: true, data }))
      .catch(() => sendResponse({ ok: false, error: { code: 'FACEBOOK_EXTENSION_SCAN_FAILED' } }))
    return true
  })
})()
