import 'server-only'

import { getSiteUrl } from '@/lib/admin/links'

export interface InstagramAppConfig {
  appId: string
  appSecret: string
  redirectUri: string
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, '')
}

export function resolveOAuthOrigin(requestOrigin: string | undefined, siteUrl: string): string {
  const fallback = stripTrailingSlash(siteUrl)
  if (!requestOrigin) return fallback
  try {
    const url = new URL(requestOrigin)
    const origin = `${url.protocol}//${url.host}`
    const host = url.hostname
    if (url.protocol !== 'https:' && host !== 'localhost' && host !== '127.0.0.1') return fallback
    const siteHost = new URL(fallback).hostname
    const siteRoot = siteHost.replace(/^www\./, '')
    if (host === siteHost || host === siteRoot || host === `www.${siteRoot}`) return origin
    if (host.endsWith('.vercel.app')) return origin
    if (host === 'localhost' || host === '127.0.0.1') return origin
    return fallback
  } catch {
    return fallback
  }
}

export function getInstagramRedirectUri(requestOrigin?: string): string {
  const override = process.env.INSTAGRAM_REDIRECT_URI?.trim()
  if (override) return stripTrailingSlash(override)
  const origin = resolveOAuthOrigin(requestOrigin, getSiteUrl())
  return `${origin}/api/admin/instagram/callback`
}

export function getInstagramAppConfig(requestOrigin?: string): InstagramAppConfig | null {
  const appId = process.env.INSTAGRAM_APP_ID?.trim()
  const appSecret = process.env.INSTAGRAM_APP_SECRET?.trim()
  if (!appId || !appSecret) return null
  return {
    appId,
    appSecret,
    redirectUri: getInstagramRedirectUri(requestOrigin),
  }
}

export function isInstagramConfigured(): boolean {
  return getInstagramAppConfig() !== null
}
