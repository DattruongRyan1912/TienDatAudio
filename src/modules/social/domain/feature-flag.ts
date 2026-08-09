export function isSocialHubEnabled() {
  return process.env.SOCIAL_HUB_ENABLED !== 'false' && process.env.NEXT_PUBLIC_SOCIAL_HUB_ENABLED !== 'false'
}
