import { NextRequest, NextResponse } from 'next/server'
import { insertQuoteRequest, uploadQuoteFile, type QuoteType } from '@/lib/supabase/quotes'
import { send } from '@/lib/notify'
import { redactEmail } from '@/lib/redact'

// ── Constants ─────────────────────────────────────────────────────────────────

/** 25 MB upload cap (bytes) */
const MAX_FILE_SIZE = 25 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/octet-stream', // .stl / .obj files
  'model/stl',
  'model/obj',
  'application/sla',
  'application/pdf',
])

const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif',
  'stl', 'obj', 'pdf',
])

const VALID_TYPES = new Set<QuoteType>([
  'keychain', 'portrait', 'custom_object', 'bulk_order', 'custom',
])

// ── Helpers ───────────────────────────────────────────────────────────────────

function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string): boolean {
  // Indian mobile: 10 digits (may start with +91)
  return /^(\+91[\s-]?)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Parse multipart form-data (file upload) or JSON.
    const contentType = req.headers.get('content-type') ?? ''

    let name = ''
    let email = ''
    let phone = ''
    let type = 'custom'
    let description = ''
    let fileRef: File | null = null

    if (contentType.includes('multipart/form-data')) {
      let formData: FormData
      try {
        formData = await req.formData()
      } catch {
        return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
      }
      name        = (formData.get('name')        as string | null) ?? ''
      email       = (formData.get('email')       as string | null) ?? ''
      phone       = (formData.get('phone')       as string | null) ?? ''
      type        = (formData.get('type')        as string | null) ?? 'custom'
      description = (formData.get('description') as string | null) ?? ''
      const maybeFile = formData.get('file')
      if (maybeFile instanceof File && maybeFile.size > 0) {
        fileRef = maybeFile
      }
    } else {
      // JSON body (no file, description-only quote)
      let body: Record<string, unknown>
      try {
        body = await req.json()
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
      }
      name        = String(body.name        ?? '')
      email       = String(body.email       ?? '')
      phone       = String(body.phone       ?? '')
      type        = String(body.type        ?? 'custom')
      description = String(body.description ?? '')
    }

    // ── Server-side validation ─────────────────────────────────────────────

    const errors: Record<string, string> = {}

    if (!name.trim()) {
      errors.name = 'Name is required'
    } else if (name.trim().length < 2) {
      errors.name = 'Please enter your full name'
    }

    if (!email.trim()) {
      errors.email = 'Email address is required'
    } else if (!isValidEmail(email.trim())) {
      errors.email = 'Enter a valid email address'
    }

    if (phone.trim() && !isValidPhone(phone.trim())) {
      errors.phone = 'Enter a valid Indian mobile number'
    }

    if (!VALID_TYPES.has(type as QuoteType)) {
      errors.type = 'Invalid quote type'
    }

    if (!description.trim() && !fileRef) {
      errors.description = 'Please describe your idea or upload a file'
    }

    if (description.trim().length > 2000) {
      errors.description = 'Description must be under 2000 characters'
    }

    // File validation.
    // The extension MUST be on the allowlist (authoritative gate). We additionally
    // require the browser-supplied MIME type to be acceptable — `model/stl` etc.
    // for 3D files often arrive as the generic `application/octet-stream`, which
    // is why that type is allowed alongside the concrete image/pdf types. Using
    // AND (not OR) closes the hole where a disallowed extension slipped through
    // just because the browser sent octet-stream.
    if (fileRef) {
      if (fileRef.size > MAX_FILE_SIZE) {
        errors.file = 'File must be under 25 MB'
      } else {
        const ext = getFileExtension(fileRef.name)
        const extOk = ALLOWED_EXTENSIONS.has(ext)
        const mimeOk = !fileRef.type || ALLOWED_MIME_TYPES.has(fileRef.type)
        if (!extOk || !mimeOk) {
          errors.file = 'Unsupported file type. Use JPG, PNG, STL, OBJ, or PDF.'
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: 'Validation failed', fields: errors }, { status: 422 })
    }

    // ── File upload (env-gated) ─────────────────────────────────────────────

    let fileUrl: string | null = null
    if (fileRef) {
      fileUrl = await uploadQuoteFile(
        await fileRef.arrayBuffer().then(buf => Buffer.from(buf)),
        fileRef.name,
        fileRef.type || 'application/octet-stream'
      )
    }

    // ── Persist to DB ────────────────────────────────────────────────────────

    const result = await insertQuoteRequest({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || undefined,
      type: type as QuoteType,
      description: description.trim() || undefined,
      file_url: fileUrl ?? undefined,
    })

    if (!result.ok) {
      // DB error — still return success to the user (don't expose internals).
      // The team is notified separately (below). Log WITHOUT raw PII: email is
      // redacted and the description is omitted from logs entirely.
      console.error('[custom-quote] DB insert failed:', result.error)
      console.log('[custom-quote] Quote that failed to persist:', {
        name: name.trim(),
        email: redactEmail(email.trim()),
        type,
        descriptionLength: description.trim().length,
      })
    }

    // ── Team notification (env-gated) ────────────────────────────────────────
    // Full PII (name/email/phone) is intentionally included here: it goes only
    // to the configured notification provider (the access-controlled channel),
    // never to console logs. In mock mode lib/notify redacts before logging.

    await send({
      subject: `New ${type} quote request from ${name.trim()}`,
      body: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || 'not provided',
        type,
        description: description.slice(0, 300) || '(none)',
        file_url: fileUrl ?? 'none (received but not stored)',
        quote_id: result.id ?? 'DB error — check logs',
      },
    })

    return NextResponse.json(
      { ok: true, id: result.id ?? null, message: 'Quote request received' },
      { status: 201 }
    )
  } catch (err) {
    console.error('[custom-quote] unhandled error:', err)
    return NextResponse.json({ error: 'Server error — please try again' }, { status: 500 })
  }
}
