export const INSTAGRAM_GRAPH_VERSION = 'v21.0'
export const INSTAGRAM_GRAPH_BASE = `https://graph.instagram.com/${INSTAGRAM_GRAPH_VERSION}`
export const INSTAGRAM_AUTHORIZE_URL = 'https://www.instagram.com/oauth/authorize'
export const INSTAGRAM_SHORT_TOKEN_URL = 'https://api.instagram.com/oauth/access_token'
export const INSTAGRAM_LONG_TOKEN_URL = 'https://graph.instagram.com/access_token'
export const INSTAGRAM_REFRESH_TOKEN_URL = 'https://graph.instagram.com/refresh_access_token'

export const INSTAGRAM_SCOPES = [
  'instagram_business_basic',
  'instagram_business_manage_insights',
  'instagram_business_manage_comments',
] as const

export const INSTAGRAM_FETCH_TIMEOUT_MS = 15_000
export const INSTAGRAM_OAUTH_STATE_MAX_AGE_SEC = 600
export const INSTAGRAM_TOKEN_REFRESH_WINDOW_MS = 7 * 24 * 60 * 60 * 1000
export const INSTAGRAM_MEDIA_LIMIT = 8
export const INSTAGRAM_COMMENT_LIMIT = 20
export const INSTAGRAM_MAX_REPLY_LENGTH = 300
export const INSTAGRAM_OAUTH_STATE_COOKIE = 'ig_oauth_state'
export const INSTAGRAM_CONNECTION_ROW_ID = 1
