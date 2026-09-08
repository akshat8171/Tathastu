import 'server-only'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { INSTAGRAM_CONNECTION_ROW_ID } from '@/lib/instagram/constants'
import { getInstagramAppConfig } from '@/lib/instagram/config'
import { exchangeLongLivedToken, refreshLongLivedToken } from '@/lib/instagram/graph'
import { parseLongLivedToken, shouldRefreshToken } from '@/lib/instagram/oauth'

export interface InstagramConnection {
  igUserId: string
  username: string | null
  accessToken: string
  tokenExpiresAt: string | null
}

function isMissingRelation(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false
  const message = (error.message || '').toLowerCase()
  return (
    error.code === '42P01' ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  )
}

function mapRow(row: {
  ig_user_id: string
  username: string | null
  access_token: string
  token_expires_at: string | null
}): InstagramConnection {
  return {
    igUserId: row.ig_user_id,
    username: row.username,
    accessToken: row.access_token,
    tokenExpiresAt: row.token_expires_at,
  }
}

export async function loadInstagramConnection(): Promise<
  { ok: true; connection: InstagramConnection | null } | { ok: false; error: string }
> {
  try {
    const { data, error } = await supabaseAdmin
      .from('instagram_connection')
      .select('ig_user_id, username, access_token, token_expires_at')
      .eq('id', INSTAGRAM_CONNECTION_ROW_ID)
      .maybeSingle()
    if (error) {
      if (isMissingRelation(error)) {
        return { ok: false, error: 'Run supabase/migration-014-instagram-connection.sql in the SQL editor' }
      }
      return { ok: false, error: 'Could not load Instagram connection' }
    }
    if (!data) return { ok: true, connection: null }
    return { ok: true, connection: mapRow(data) }
  } catch {
    return { ok: false, error: 'Could not load Instagram connection' }
  }
}

export async function saveInstagramConnection(input: {
  igUserId: string
  username: string | null
  accessToken: string
  expiresInSec: number
  connectedByEmail: string | null
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const expiresAt = new Date(Date.now() + input.expiresInSec * 1000).toISOString()
  const { error } = await supabaseAdmin.from('instagram_connection').upsert(
    {
      id: INSTAGRAM_CONNECTION_ROW_ID,
      ig_user_id: input.igUserId,
      username: input.username,
      access_token: input.accessToken,
      token_expires_at: expiresAt,
      connected_by_email: input.connectedByEmail,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )
  if (error) {
    if (isMissingRelation(error)) {
      return { ok: false, error: 'Run supabase/migration-014-instagram-connection.sql in the SQL editor' }
    }
    return { ok: false, error: 'Could not save Instagram connection' }
  }
  return { ok: true }
}

export async function deleteInstagramConnection(): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabaseAdmin
    .from('instagram_connection')
    .delete()
    .eq('id', INSTAGRAM_CONNECTION_ROW_ID)
  if (error && !isMissingRelation(error)) {
    return { ok: false, error: 'Could not disconnect Instagram' }
  }
  return { ok: true }
}

export async function getUsableAccessToken(): Promise<
  { ok: true; connection: InstagramConnection } | { ok: false; error: string }
> {
  const loaded = await loadInstagramConnection()
  if (!loaded.ok) return loaded
  if (!loaded.connection) return { ok: false, error: 'Instagram is not connected' }
  if (!shouldRefreshToken(loaded.connection.tokenExpiresAt)) {
    return { ok: true, connection: loaded.connection }
  }
  try {
    const refreshed = parseLongLivedToken(
      await refreshLongLivedToken(loaded.connection.accessToken)
    )
    if (!refreshed) return { ok: true, connection: loaded.connection }
    await saveInstagramConnection({
      igUserId: loaded.connection.igUserId,
      username: loaded.connection.username,
      accessToken: refreshed.accessToken,
      expiresInSec: refreshed.expiresIn,
      connectedByEmail: null,
    })
    return {
      ok: true,
      connection: {
        ...loaded.connection,
        accessToken: refreshed.accessToken,
        tokenExpiresAt: new Date(Date.now() + refreshed.expiresIn * 1000).toISOString(),
      },
    }
  } catch {
    return { ok: true, connection: loaded.connection }
  }
}

export async function persistExchangedToken(input: {
  shortLivedToken: string
  userId: string
  connectedByEmail: string | null
}): Promise<{ ok: true; username: string | null } | { ok: false; error: string }> {
  const config = getInstagramAppConfig()
  if (!config) return { ok: false, error: 'Instagram app is not configured' }
  const longLived = parseLongLivedToken(
    await exchangeLongLivedToken({
      appSecret: config.appSecret,
      shortLivedToken: input.shortLivedToken,
    })
  )
  if (!longLived) return { ok: false, error: 'Could not exchange Instagram token' }
  const saved = await saveInstagramConnection({
    igUserId: input.userId,
    username: null,
    accessToken: longLived.accessToken,
    expiresInSec: longLived.expiresIn,
    connectedByEmail: input.connectedByEmail,
  })
  if (!saved.ok) return saved
  return { ok: true, username: null }
}
