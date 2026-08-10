/* global chrome */
'use strict'

(() => {
  const channel = 'tiendataudio.facebook.bridge.v1'
  const webToExtension = 'web-to-extension'
  const extensionToWeb = 'extension-to-web'

  function reply(requestId, type, response) {
    window.postMessage({
      channel,
      direction: extensionToWeb,
      requestId,
      type,
      ...response,
    }, window.location.origin)
  }

  window.addEventListener('message', (event) => {
    if (event.source !== window || event.origin !== window.location.origin) return
    const message = event.data
    if (!message
      || message.channel !== channel
      || message.direction !== webToExtension
      || typeof message.requestId !== 'string') return

    if (message.type === 'PING') {
      reply(message.requestId, 'PONG', { ok: true, data: { version: chrome.runtime.getManifest().version } })
      return
    }
    if (message.type !== 'SCAN_GALLERY') return

    chrome.runtime.sendMessage({
      type: 'TDA_SCAN_FACEBOOK_GALLERY',
      sourceUrl: message.payload?.sourceUrl,
    }, (response) => {
      const runtimeError = chrome.runtime.lastError
      if (runtimeError) {
        reply(message.requestId, 'SCAN_RESULT', { ok: false, error: { code: 'FACEBOOK_EXTENSION_CONNECTION_FAILED' } })
        return
      }
      reply(message.requestId, 'SCAN_RESULT', response?.ok === true
        ? { ok: true, data: response.data }
        : { ok: false, error: response?.error || { code: 'FACEBOOK_EXTENSION_FAILED' } })
    })
  })
})()
