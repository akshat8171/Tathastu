import 'server-only'

import { INSTAGRAM_COMMENT_LIMIT, INSTAGRAM_MEDIA_LIMIT } from '@/lib/instagram/constants'
import { graphGet } from '@/lib/instagram/graph'

export interface InstagramProfile {
  id: string
  username: string
  name: string | null
  followersCount: number | null
  followsCount: number | null
  mediaCount: number | null
  profilePictureUrl: string | null
}

export interface InstagramInsight {
  name: string
  period: string
  value: number
}

export interface InstagramComment {
  id: string
  text: string
  username: string
  timestamp: string
}

export interface InstagramMediaItem {
  id: string
  caption: string
  mediaType: string
  permalink: string
  thumbnailUrl: string | null
  timestamp: string
  likeCount: number | null
  commentsCount: number | null
  comments: InstagramComment[]
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

export function mapProfile(payload: unknown): InstagramProfile | null {
  const row = asRecord(payload)
  if (!row) return null
  const id = asString(row.id)
  const username = asString(row.username)
  if (!id || !username) return null
  return {
    id,
    username,
    name: asString(row.name),
    followersCount: asNumber(row.followers_count),
    followsCount: asNumber(row.follows_count),
    mediaCount: asNumber(row.media_count),
    profilePictureUrl: asString(row.profile_picture_url),
  }
}

export function mapInsights(payload: unknown): InstagramInsight[] {
  const row = asRecord(payload)
  const data = Array.isArray(row?.data) ? row.data : []
  const insights: InstagramInsight[] = []
  for (const item of data) {
    const entry = asRecord(item)
    if (!entry) continue
    const name = asString(entry.name)
    const period = asString(entry.period) || 'day'
    const values = Array.isArray(entry.values) ? entry.values : []
    const last = asRecord(values[values.length - 1])
    const value = asNumber(last?.value)
    if (!name || value === null) continue
    insights.push({ name, period, value })
  }
  return insights
}

function mapComments(payload: unknown): InstagramComment[] {
  const row = asRecord(payload)
  const data = Array.isArray(row?.data) ? row.data : []
  const comments: InstagramComment[] = []
  for (const item of data.slice(0, INSTAGRAM_COMMENT_LIMIT)) {
    const entry = asRecord(item)
    if (!entry) continue
    const id = asString(entry.id)
    const text = asString(entry.text) || ''
    const username = asString(entry.username) || 'unknown'
    const timestamp = asString(entry.timestamp) || ''
    if (!id) continue
    comments.push({ id, text, username, timestamp })
  }
  return comments
}

export async function fetchInstagramProfile(accessToken: string): Promise<InstagramProfile> {
  const payload = await graphGet('me', accessToken, {
    fields: 'id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count',
  })
  const profile = mapProfile(payload)
  if (!profile) throw new Error('Instagram profile was empty')
  return profile
}

export async function fetchAccountInsights(
  igUserId: string,
  accessToken: string
): Promise<InstagramInsight[]> {
  try {
    const payload = await graphGet(`${igUserId}/insights`, accessToken, {
      metric: 'reach,follower_count,website_clicks,profile_views,accounts_engaged,views',
      period: 'day',
    })
    return mapInsights(payload)
  } catch {
    try {
      const payload = await graphGet(`${igUserId}/insights`, accessToken, {
        metric: 'reach,views',
        period: 'day',
      })
      return mapInsights(payload)
    } catch {
      return []
    }
  }
}

export async function fetchRecentMedia(accessToken: string): Promise<InstagramMediaItem[]> {
  const payload = await graphGet('me/media', accessToken, {
    fields: 'id,caption,media_type,media_product_type,permalink,thumbnail_url,media_url,timestamp,like_count,comments_count',
    limit: String(INSTAGRAM_MEDIA_LIMIT),
  })
  const root = asRecord(payload)
  const data = Array.isArray(root?.data) ? root.data : []
  const media: InstagramMediaItem[] = []
  for (const item of data) {
    const entry = asRecord(item)
    if (!entry) continue
    const id = asString(entry.id)
    if (!id) continue
    let comments: InstagramComment[] = []
    try {
      comments = mapComments(
        await graphGet(`${id}/comments`, accessToken, {
          fields: 'id,text,username,timestamp',
          limit: String(INSTAGRAM_COMMENT_LIMIT),
        })
      )
    } catch {
      comments = []
    }
    media.push({
      id,
      caption: asString(entry.caption) || '',
      mediaType: asString(entry.media_product_type) || asString(entry.media_type) || 'UNKNOWN',
      permalink: asString(entry.permalink) || '',
      thumbnailUrl: asString(entry.thumbnail_url) || asString(entry.media_url),
      timestamp: asString(entry.timestamp) || '',
      likeCount: asNumber(entry.like_count),
      commentsCount: asNumber(entry.comments_count),
      comments,
    })
  }
  return media
}
