import 'server-only'
import { supabaseAdmin } from './admin'
import type { QuoteInsert, QuoteRow, QuoteStatus } from './quote-types'
import { QUOTE_STATUSES } from './quote-types'
import { isQuoteStorageDisabled } from './quote-storage-flag'

export type { QuoteInsert, QuoteRow, QuoteStatus, QuoteType } from './quote-types'
export { QUOTE_STATUSES, isQuoteStorageDisabled }

/**
 * Data layer for quote_requests (see supabase/migration-006-quote-requests.sql).
 *
 * Never throws — mirrors lib/coupons.ts: all Supabase access is wrapped in
 * try/catch and returns a typed result. When the table doesn't exist yet the
 * caller receives { ok: false } so the API route can degrade gracefully.
 *
 * All access via the service-role client (server-side only).
 */

export interface QuoteResult {
  ok: boolean
  id?: string
  error?: string
}

export type QuoteUploadResult =
  | { ok: true; path: string }
  | { ok: false; error: string; skipped?: boolean }

export const QUOTE_STORAGE_BUCKET = 'quote-uploads'

const SIGNED_URL_TTL_SECONDS = 60 * 60

export async function uploadQuoteFile(
  file: File | Buffer,
  filename: string,
  contentType: string
): Promise<QuoteUploadResult> {
  if (isQuoteStorageDisabled()) {
    console.log(
      `[quotes] QUOTE_STORAGE_ENABLED=false — file "${filename}" received but not stored (kill switch)`
    )
    return { ok: false, skipped: true, error: 'Quote storage is disabled' }
  }

  try {
    const key = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { data, error } = await supabaseAdmin.storage
      .from(QUOTE_STORAGE_BUCKET)
      .upload(key, file, {
        contentType,
        upsert: false,
      })

    if (error || !data?.path) {
      console.error('[quotes] storage upload error:', error)
      return {
        ok: false,
        error:
          error?.message ||
          `Could not save file to ${QUOTE_STORAGE_BUCKET}. Create that private bucket in Supabase Storage.`,
      }
    }

    return { ok: true, path: data.path }
  } catch (err) {
    console.error('[quotes] unexpected storage error:', err)
    return { ok: false, error: 'Unexpected error saving the uploaded file' }
  }
}

export async function insertQuoteRequest(payload: QuoteInsert): Promise<QuoteResult> {
  try {
    const { data, error } = await supabaseAdmin
      .from('quote_requests')
      .insert({
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone?.trim() ?? null,
        type: payload.type,
        description: payload.description?.trim() ?? null,
        file_url: payload.file_url ?? null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('[quotes] insertQuoteRequest DB error:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true, id: data.id as string }
  } catch (err) {
    console.error('[quotes] insertQuoteRequest unexpected error:', err)
    return { ok: false, error: 'Unexpected error saving quote request' }
  }
}

export async function listQuoteRequests(): Promise<{ ok: true; quotes: QuoteRow[] } | { ok: false; error: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[quotes] listQuoteRequests error:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true, quotes: (data ?? []) as QuoteRow[] }
  } catch (err) {
    console.error('[quotes] listQuoteRequests unexpected error:', err)
    return { ok: false, error: 'Unexpected error listing quotes' }
  }
}

export async function getQuoteById(id: string): Promise<QuoteRow | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('quote_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as QuoteRow
  } catch {
    return null
  }
}

export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus
): Promise<QuoteResult> {
  if (!QUOTE_STATUSES.includes(status)) {
    return { ok: false, error: 'Invalid status' }
  }

  try {
    const { error } = await supabaseAdmin
      .from('quote_requests')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('[quotes] updateQuoteStatus error:', error)
      return { ok: false, error: error.message }
    }

    return { ok: true, id }
  } catch (err) {
    console.error('[quotes] updateQuoteStatus unexpected error:', err)
    return { ok: false, error: 'Unexpected error updating quote' }
  }
}

export async function createQuoteFileSignedUrl(
  storagePath: string
): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(QUOTE_STORAGE_BUCKET)
      .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS)

    if (error || !data?.signedUrl) {
      console.error('[quotes] signed URL error:', error)
      return null
    }

    return data.signedUrl
  } catch (err) {
    console.error('[quotes] signed URL unexpected error:', err)
    return null
  }
}
