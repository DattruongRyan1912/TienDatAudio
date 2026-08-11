import { chromium, type BrowserContext, type Locator, type Page } from 'playwright'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { isFacebookLink, normalizePublicLinkUrl, type SocialGalleryImage, type SocialGalleryScanResult } from '../domain/link-preview'
import { getFacebookCdpConnection } from './facebook-cdp-browser'
import { loadFacebookStorageState, saveFacebookStorageState } from './facebook-session-state'

export type FacebookGalleryScanOptions = {
  sourceUrl: string
  browserMode?: 'temporary' | 'cdp'
  headed?: boolean
  waitForLogin?: boolean
  maxImages?: number
  profileDir?: string
  removeProfile?: boolean
  storageStatePath?: string
  storageStateRequired?: boolean
  saveStorageStatePath?: string
  onStatus?: (status: FacebookGalleryScanStatus) => void
}

export type FacebookGalleryScanStatus = 'launching' | 'opening' | 'collecting' | 'expanding' | 'waiting_for_login'

async function resolvePostRoot(page: Page): Promise<Locator> {
  const dialogs = page.locator('[role="dialog"]')
  return (await dialogs.count()) > 0 ? dialogs.last() : page.locator('body')
}

async function readFacebookPostText(root: Locator) {
  const preferred = await root.locator('[data-ad-preview="message"], [data-ad-comet-preview="message"], [data-ad-rendering-role="story_message"]').evaluateAll((elements) => elements
    .map((element) => (element.textContent || '').replace(/\s+/g, ' ').trim())
    .filter((value) => value.length >= 2)
    .sort((left, right) => right.length - left.length)[0] || '')
  if (preferred) return preferred.slice(0, 200_000)

  return (await root.locator('[dir="auto"]').evaluateAll((elements) => elements
    .map((element) => (element.textContent || '').replace(/\s+/g, ' ').trim())
    .filter((value) => value.length >= 12 && value.length <= 4_000)
    .filter((value) => !/email or phone|password|log in|đăng nhập/i.test(value))
    .sort((left, right) => right.length - left.length)[0] || '')).slice(0, 200_000)
}

async function clickGalleryControl(context: BrowserContext, page: Page, click: () => Promise<void>, ownedPages?: Set<Page>) {
  const pagesBeforeClick = new Set(context.pages())
  await click().catch(() => undefined)
  await page.waitForTimeout(2_500)

  const openedPage = context.pages().find((candidate) => !pagesBeforeClick.has(candidate))
  if (openedPage) ownedPages?.add(openedPage)
  const activePage = openedPage || page
  await activePage.waitForLoadState('domcontentloaded', { timeout: 12_000 }).catch(() => undefined)
  await activePage.bringToFront().catch(() => undefined)
  return activePage
}

async function findGalleryExpansionLink(root: Locator) {
  const controls = root.locator('a, button, [role="button"], [tabindex="0"]')
  let fallback: Locator | null = null
  for (let index = 0; index < await controls.count(); index += 1) {
    const control = controls.nth(index)
    const label = `${await control.getAttribute('aria-label') || ''} ${await control.getAttribute('title') || ''} ${await control.innerText().catch(() => '')}`.replace(/\s+/g, ' ').trim()
    if (!hasUnopenedGalleryCount(label) && !/xem\s+(tất\s+cả|thêm)|see\s+all|view\s+all|all\s+photos|tất\s+cả\s+ảnh/i.test(label)) continue
    if (hasUnopenedGalleryCount(label)) return control
    fallback ||= control
  }
  return fallback
}

async function expandGallery(context: BrowserContext, page: Page, root: Locator, ownedPages?: Set<Page>) {
  const moreLink = await findGalleryExpansionLink(root)
  if (moreLink) {
    await moreLink.scrollIntoViewIfNeeded().catch(() => undefined)
    return clickGalleryControl(context, page, () => moreLink.click({ timeout: 5_000 }), ownedPages)
  }

  const moreText = page.getByText(/^\+\s*\d+$/).last()
  if (await moreText.count()) {
    return clickGalleryControl(context, page, () => moreText.click({ timeout: 5_000 }), ownedPages)
  }

  return page
}

async function collectGalleryImages(root: Locator): Promise<SocialGalleryImage[]> {
  const linkedImages = await root.locator('a[href*="/photo/"]').evaluateAll((anchors) => anchors.map((anchor) => {
    const image = anchor.querySelector('img') as HTMLImageElement | null
    return {
      imageUrl: image?.currentSrc || image?.src || '',
      photoUrl: (anchor as HTMLAnchorElement).href || '',
      label: anchor.getAttribute('aria-label') || image?.alt || '',
    }
  }))

  const fallbackImages = await root.locator('img').evaluateAll((images) => images.map((image) => {
    const element = image as HTMLImageElement
    const rect = element.getBoundingClientRect()
    const source = element.currentSrc || element.src || ''
    let host = ''
    let protocol = ''
    try {
      const parsed = new URL(source)
      host = parsed.hostname
      protocol = parsed.protocol
    } catch {
      return null
    }
    if (!/^https?:$/i.test(protocol) || !/(fbcdn\.net|fbsbx\.com|facebook\.com)$/i.test(host) || rect.width < 120 || rect.height < 100) return null
    const anchor = element.closest('a') as HTMLAnchorElement | null
    return { imageUrl: source, photoUrl: anchor?.href || '', label: element.alt || '' }
  }).filter((item): item is SocialGalleryImage => Boolean(item)))

  const result: SocialGalleryImage[] = []
  const seen = new Set<string>()
  for (const item of [...linkedImages, ...fallbackImages]) {
    if (!item.imageUrl || seen.has(item.imageUrl)) continue
    seen.add(item.imageUrl)
    result.push(item)
  }
  return result
}

async function readVisibleViewerImage(page: Page): Promise<SocialGalleryImage | null> {
  const candidate = await page.locator('img').evaluateAll((images) => images.map((image) => {
    const element = image as HTMLImageElement
    const rect = element.getBoundingClientRect()
    const imageUrl = element.currentSrc || element.src || ''
    let host = ''
    let protocol = ''
    try {
      const parsed = new URL(imageUrl)
      host = parsed.hostname
      protocol = parsed.protocol
    } catch {
      return null
    }
    const anchor = element.closest('a') as HTMLAnchorElement | null
    return {
      imageUrl,
      photoUrl: anchor?.href || '',
      label: element.alt || '',
      area: rect.width * rect.height,
      naturalWidth: element.naturalWidth,
      naturalHeight: element.naturalHeight,
      host,
      protocol,
    }
  }).filter((item) => item
    && /^https?:$/i.test(item.protocol)
    && /(fbcdn\.net|fbsbx\.com|facebook\.com)$/i.test(item.host)
    && item.naturalWidth >= 200
    && item.naturalHeight >= 200
    && item.area > 0)
    .sort((left, right) => (right?.area || 0) - (left?.area || 0))[0] || null)

  if (!candidate) return null
  return {
    imageUrl: candidate.imageUrl,
    photoUrl: candidate.photoUrl || page.url(),
    label: candidate.label,
  }
}

async function findNextPhotoButton(page: Page) {
  for (const name of ['Ảnh tiếp theo', 'Next photo', 'Next']) {
    const button = page.getByRole('button', { name, exact: true })
    if (await button.count()) return button.last()
  }
  return null
}

async function waitForViewerImage(page: Page, previousKey = '') {
  const deadline = Date.now() + 6_000
  while (Date.now() < deadline) {
    const image = await readVisibleViewerImage(page)
    if (image && (!previousKey || imageKey(image.imageUrl) !== previousKey)) return image
    await page.waitForTimeout(300)
  }
  return null
}

async function collectViewerGalleryImages(page: Page, maxImages: number) {
  const result: SocialGalleryImage[] = []
  const seen = new Set<string>()
  let current = await waitForViewerImage(page)

  for (let step = 0; step < maxImages && current; step += 1) {
    const key = imageKey(current.imageUrl)
    if (seen.has(key)) break
    seen.add(key)
    result.push(current)

    const nextButton = await findNextPhotoButton(page)
    if (!nextButton) break
    await nextButton.click({ timeout: 8_000 }).catch(() => undefined)
    current = await waitForViewerImage(page, key)
  }

  return result
}

export function isFacebookBlockingLoginText(value: string) {
  return /log\s*in\s+to\s+(continue|see|view)|you must log in|login required|đăng nhập để (tiếp tục|xem thêm|xem ảnh)|hãy đăng nhập để/i.test(value)
}

function isFacebookLoginUrl(value: string) {
  try {
    const url = new URL(value)
    return /(?:^|\.)facebook\.com$/i.test(url.hostname) && /\/(?:login|checkpoint)(?:\/|$)/i.test(url.pathname)
  } catch {
    return false
  }
}

function isFacebookLoginForm(value: string) {
  return /email or phone/i.test(value) && /password/i.test(value) && /(?:log\s*in|đăng nhập)/i.test(value)
}

async function hasBlockingLoginGate(page: Page, imageCount = Number.MAX_SAFE_INTEGER) {
  const dialogText = await page.locator('[role="dialog"]').last().innerText().catch(() => '')
  if (dialogText && /log\s*in|đăng nhập|mật khẩu|password/i.test(dialogText)) return true
  if (isFacebookLoginUrl(page.url())) return true
  const bodyText = await page.locator('body').innerText().catch(() => '')
  return isFacebookBlockingLoginText(bodyText) || (imageCount === 0 && isFacebookLoginForm(bodyText))
}

function hasUnopenedGalleryCount(value: string) {
  return /\+\s*\d+|còn\s+\d+(?:\s+mục)?|more\s+\d+/i.test(value)
}

function imageKey(value: string) {
  try {
    const url = new URL(value)
    if (/(fbcdn\.net|fbsbx\.com|facebook\.com)$/i.test(url.hostname)) return `${url.hostname}${url.pathname}`
  } catch {
    // Ignore malformed image candidates.
  }
  return value
}

function mergeGalleryImages(...groups: SocialGalleryImage[][]) {
  const result: SocialGalleryImage[] = []
  const seen = new Set<string>()
  for (const group of groups) {
    for (const item of group) {
      const key = imageKey(item.imageUrl)
      if (!item.imageUrl || seen.has(key)) continue
      seen.add(key)
      result.push(item)
    }
  }
  return result
}

async function waitForManualLogin(page: Page, onStatus?: (status: FacebookGalleryScanStatus) => void, browserMode: 'temporary' | 'cdp' = 'temporary') {
  onStatus?.('waiting_for_login')
  console.error(browserMode === 'cdp'
    ? 'Facebook yêu cầu đăng nhập lại; hãy hoàn tất trong tab worker của Chrome hiện tại. Worker không trích xuất hoặc lưu token/cookie và sẽ đóng đúng tab worker sau khi chạy.'
    : 'Facebook yêu cầu login; hãy đăng nhập thủ công trong profile tạm. Worker không đọc/copy cookie từ profile Chrome gốc và sẽ tự xoá profile sau khi chạy.')
  const deadline = Date.now() + 120_000
  while (Date.now() < deadline) {
    const root = await resolvePostRoot(page)
    const images = await collectGalleryImages(root)
    if (!(await hasBlockingLoginGate(page, images.length)) && images.length > 0) return
    await page.waitForTimeout(2_000)
  }
  throw new Error('FACEBOOK_LOGIN_REQUIRED')
}

export async function scanFacebookGallery(options: FacebookGalleryScanOptions): Promise<SocialGalleryScanResult> {
  const sourceUrl = normalizePublicLinkUrl(options.sourceUrl)
  if (!isFacebookLink(sourceUrl)) throw new Error('FACEBOOK_URL_INVALID')

  const maxImages = Math.min(50, Math.max(1, Math.trunc(options.maxImages || 50)))
  const useCdp = options.browserMode === 'cdp'
  const storageState = useCdp ? undefined : await loadFacebookStorageState(options.storageStatePath, { required: options.storageStateRequired })
  const ownsProfile = !useCdp && !options.profileDir
  const profileDir = useCdp ? undefined : options.profileDir || await mkdtemp(join(tmpdir(), 'tiendataudio-facebook-gallery-'))
  const removeProfile = !useCdp && (options.removeProfile ?? ownsProfile)
  let context: BrowserContext | null = null
  const ownedPages = new Set<Page>()

  try {
    options.onStatus?.('launching')
    if (useCdp) {
      context = (await getFacebookCdpConnection()).context
    } else {
      context = await chromium.launchPersistentContext(profileDir!, {
        headless: !options.headed,
        locale: 'vi-VN',
        viewport: { width: 1440, height: 1000 },
        serviceWorkers: 'block',
        args: options.headed ? ['--window-size=1440,1000'] : undefined,
      })
    }
    context.setDefaultTimeout(10_000)
    if (storageState && !useCdp) {
      await context.addCookies(storageState.state.cookies)
      for (const origin of storageState.state.origins) {
        await context.addInitScript(({ expectedOrigin, entries }) => {
          if (window.location.origin !== expectedOrigin) return
          for (const entry of entries) window.localStorage.setItem(entry.name, entry.value)
        }, { expectedOrigin: origin.origin, entries: origin.localStorage })
      }
    }
    let page = useCdp ? await context.newPage() : context.pages()[0] || await context.newPage()
    if (useCdp) ownedPages.add(page)
    await page.bringToFront().catch(() => undefined)
    options.onStatus?.('opening')
    let opened = false
    for (let attempt = 0; attempt < 2 && !opened; attempt += 1) {
      try {
        await page.goto(sourceUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 })
        opened = true
      } catch {
        if (attempt === 1) throw new Error('FACEBOOK_NAVIGATION_FAILED')
        await page.waitForTimeout(1_000)
      }
    }
    await page.waitForTimeout(5_000)
    await page.waitForLoadState('domcontentloaded', { timeout: 12_000 }).catch(() => undefined)

    options.onStatus?.('collecting')
    let root = await resolvePostRoot(page)
    const initialImages = await collectGalleryImages(root)
    const initialPostText = await readFacebookPostText(root)
    const initialBodyText = await page.locator('body').innerText().catch(() => '')
    if (options.waitForLogin && await hasBlockingLoginGate(page, initialImages.length)) await waitForManualLogin(page, options.onStatus, options.browserMode)
    options.onStatus?.('expanding')
    page = await expandGallery(context, page, root, ownedPages)
    const expandedRoot = await resolvePostRoot(page)
    const expandedImages = await collectGalleryImages(expandedRoot)
    const expandedPostText = await readFacebookPostText(expandedRoot)
    if (options.waitForLogin && await hasBlockingLoginGate(page, expandedImages.length)) await waitForManualLogin(page, options.onStatus, options.browserMode)
    const viewerImages = page.url().includes('/photo/') ? await collectViewerGalleryImages(page, maxImages) : []
    root = await resolvePostRoot(page)
    const images = mergeGalleryImages(viewerImages, initialImages, expandedImages, await collectGalleryImages(root)).slice(0, maxImages)
    const bodyText = await page.locator('body').innerText().catch(() => '')
    const postText = await readFacebookPostText(root) || expandedPostText || initialPostText
    const loginRequired = await hasBlockingLoginGate(page, images.length)
    if (!images.length && loginRequired) throw new Error('FACEBOOK_LOGIN_REQUIRED')
    if (!images.length) throw new Error('FACEBOOK_GALLERY_NOT_FOUND')
    const galleryOpened = viewerImages.length > 0
    const galleryText = [initialBodyText, bodyText, ...images.map((image) => image.label)].join(' ')

    if (options.saveStorageStatePath && !useCdp) await saveFacebookStorageState(context, options.saveStorageStatePath)

    return {
      images,
      finalUrl: page.url(),
      ...(postText ? { postText } : {}),
      loginRequired,
      partialGallery: loginRequired || (!galleryOpened && hasUnopenedGalleryCount(galleryText)),
      provider: useCdp ? 'cdp_browser' : options.waitForLogin ? 'manual_profile' : 'public_browser',
      sessionSource: useCdp ? 'cdp_browser' : storageState ? 'local_storage_state' : options.waitForLogin ? 'manual_login' : 'none',
    }
  } finally {
    if (useCdp) {
      for (const page of [...ownedPages].reverse()) await page.close().catch(() => undefined)
    } else {
      await context?.close().catch(() => undefined)
    }
    if (removeProfile && profileDir) await rm(profileDir, { recursive: true, force: true })
  }
}
