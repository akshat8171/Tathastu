import 'server-only'

import { getSiteUrl } from '@/lib/admin/links'

export interface InstagramAppConfig {
  appId: string
  appSecret: string
  redirectUri: string
}

export function getInstagramRedirectUri(): string {
  const override = process.env.INSTAGRAM_REDIRECT_URI?.trim()
  if (override) return override.replace(/\/$/, '')
  return `${getSiteUrl()}/api/admin/instagram/callback`
}

export function getInstagramAppConfig(): InstagramAppConfig | null {
  const appId = process.env.INSTAGRAM_APP_ID?.trim()
  const appSecret = process.env.INSTAGRAM_APP_SECRET?.trim()
  if (!appId || !appSecret) return null
  return {
    appId,
    appSecret,
    redirectUri: getInstagramRedirectUri(),
  }
}

export function isInstagramConfigured(): boolean {
  return getInstagramAppConfig() !== null
}
