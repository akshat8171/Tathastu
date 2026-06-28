import 'server-only'
import { supabaseAdmin } from './admin'

/**
 * Data layer for quote_requests (see supabase/migration-006-quote-requests.sql).
 *
 * Never throws — mirrors lib/coupons.ts: all Supabase access is wrapped in
 * try/catch and returns a typed result. When the table doesn't exist yet the
 * caller receives { ok: false } so the API route can degrade gracefully.
 *
 * All access via the service-role client (server-side only).
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type QuoteType = 'keychain' | 'portrait' | 'custom_object' | 'bulk_order' | 'custom'

export interface QuoteInsert {
  name: string
  email: string
  phone?: string
  type: QuoteType
  description?: string
  file_url?: string
}

export interface QuoteRow extends QuoteInsert {
  id: string
  status: string
  created_at: string
}

export interface QuoteResult {
  ok: boolean
  id?: string
  error?: string
}

// ── Storage (env-gated) ───────────────────────────────────────────────────────

const STORAGE_BUCKET = 'quote-uploads'

/**
 * Upload a file to Supabase Storage.
 *
 * Gated behind QUOTE_STORAGE_ENABLED — when unset (mock mode) NO real upload
 * happens and this returns `null`. Returning null (rather than a fake
 * `placeholder/...` path) is deliberate: the quote row then stores
 * `file_url = null`, which is the honest state — nothing was actually stored,
 * so we must not persist a path that resolves to nothing. The owner reviews the
 * quote from the email/console notification and follows up for the file. Once
 * QUOTE_STORAGE_ENABLED is set with a real bucket, this returns the real path.
 *
 * Returns the storage path on a successful real upload, or null in mock mode /
 * on any upload error. Never throws.
 */
export async function uploadQuoteFile(
  file: File | Buffer,
  filename: string,
  contentType: string
): Promise<string | null> {
  if (!process.env.QUOTE_STORAGE_ENABLED) {
    // Mock mode: no real storage configured. Do NOT fabricate a path.
    console.log(
      `[quotes] QUOTE_STORAGE_ENABLED not set — file "${filename}" was received but not stored (mock mode)`
    )
    return null
  }

  try {
    // Build a unique storage key to avoid collisions.
    const key = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(key, file, {
        contentType,
        upsert: false,
      })

    if (error) {
      console.error('[quotes] storage upload error:', error)
      return null
    }

    return data.path
  } catch (err) {
    console.error('[quotes] unexpected storage error:', err)
    return null
  }
}

// ── Insert ────────────────────────────────────────────────────────────────────

/**
 * Insert a new quote request row.
 * Returns { ok: true, id } on success, { ok: false, error } on any failure.
 */
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
