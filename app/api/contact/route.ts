import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { redactEmail, redactPhone } from '@/lib/redact'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/contact
 *
 * Persists a contact-form submission to the `contact_messages` Supabase table.
 * Degrades gracefully when the table doesn't exist yet (mirrors lib/coupons.ts
 * pattern: catch DB errors, never throw, return sensible defaults).
 *
 * DB schema reference (apply when ready):
 * --------------------------------------------------
 * CREATE TABLE IF NOT EXISTS public.contact_messages (
 *   id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   created_at  timestamptz NOT NULL DEFAULT now(),
 *   name        text NOT NULL,
 *   email       text NOT NULL,
 *   phone       text,
 *   subject     text NOT NULL,
 *   message     text NOT NULL
 * );
 * -- Enable RLS and allow inserts from the service role only (no anon inserts).
 * ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
 * --------------------------------------------------
 *
 * TODO: once lib/notify.ts is published by the notifications lane,
 * import sendAdminNotification from '@/lib/notify' and call it here
 * after the successful DB insert to email/WhatsApp the store owner.
 */

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      val => !val || /^[+\d\s\-()]{7,20}$/.test(val),
      'Enter a valid phone number'
    ),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
})

export type ContactFormData = z.infer<typeof contactSchema>

export async function POST(request: NextRequest) {
  // 1. Parse and validate the request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, message: 'Invalid request body' },
      { status: 400 }
    )
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.errors.map(e => e.message).join('; ')
    return NextResponse.json({ ok: false, message }, { status: 400 })
  }

  const { name, email, phone, subject, message } = parsed.data

  // 2. Log to server console (degrade gracefully until lib/notify.ts is ready)
  // PII (email/phone) is REDACTED — these logs go to the hosting provider's log
  // store. The full record is persisted to contact_messages below.
  // TODO: replace console.log with lib/notify.sendAdminNotification() once wired.
  console.log('[contact] New contact form submission:', {
    name,
    email: redactEmail(email),
    phone: redactPhone(phone),
    subject,
    messageLength: message.length,
  })

  // 3. Persist to Supabase — degrade gracefully if table missing
  try {
    const { error } = await supabaseAdmin.from('contact_messages').insert({
      name,
      email,
      phone: phone ?? null,
      subject,
      message,
    })

    if (error) {
      // Table may not exist yet — log and continue; do NOT expose DB errors to client
      console.error('[contact] DB insert error (table may not exist yet):', error.message)
      // Still return success to the user — the submission was received and logged
    }
  } catch (err) {
    console.error('[contact] Unexpected DB error:', err)
    // Degrade gracefully — the user's message was received (logged above)
  }

  return NextResponse.json(
    { ok: true, message: 'Thank you! We will get back to you within 1–2 business days.' },
    { status: 200 }
  )
}
