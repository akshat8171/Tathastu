import 'server-only'
import { redactPII } from './redact'

/**
 * Team notification interface.
 *
 * Gated behind NOTIFY_PROVIDER — when unset, console.logs the notification
 * (no external call). A real email/SMS/WhatsApp provider drops in later by
 * setting NOTIFY_PROVIDER and adding a branch below.
 *
 * Supported NOTIFY_PROVIDER values (future):
 *   'resend'      — transactional email via Resend
 *   'twilio'      — SMS/WhatsApp via Twilio
 *   'sendgrid'    — transactional email via SendGrid
 *
 * Never throws — all errors are caught and logged.
 */

export interface NotifyPayload {
  /** Short, human-readable subject / headline */
  subject: string
  /** Rich context block — key/value pairs for the notification body */
  body: Record<string, string | number | undefined | null>
  /** Optional: channel / recipient override (e.g. team Slack channel, email) */
  to?: string
}

/**
 * Send a notification to the team.
 *
 * In mock mode (NOTIFY_PROVIDER unset) → console.log only.
 * In real mode → routes to the configured provider (extendable below).
 */
export async function send(payload: NotifyPayload): Promise<void> {
  const provider = process.env.NOTIFY_PROVIDER

  if (!provider) {
    // Mock / local-dev mode — log so the flow is visible, but REDACT PII first:
    // these logs go to the hosting provider's log store, not a private inbox.
    console.log('[notify] NOTIFY_PROVIDER not set — notification suppressed (mock mode)')
    console.log(
      '[notify]',
      JSON.stringify({ subject: payload.subject, body: redactPII(payload.body) }, null, 2)
    )
    return
  }

  try {
    switch (provider.toLowerCase()) {
      case 'resend': {
        await sendViaResend(payload)
        break
      }
      case 'sendgrid': {
        await sendViaSendGrid(payload)
        break
      }
      case 'twilio': {
        await sendViaTwilio(payload)
        break
      }
      default: {
        console.warn(`[notify] Unknown NOTIFY_PROVIDER="${provider}" — logging only`)
        console.log('[notify]', payload)
      }
    }
  } catch (err) {
    // Never propagate — a notification failure must not break the user flow.
    console.error('[notify] send() error (suppressed):', err)
  }
}

// ── Provider stubs (implement when real credentials are available) ─────────────

/**
 * Send via Resend (https://resend.com).
 * Requires: NOTIFY_RESEND_API_KEY, NOTIFY_FROM_EMAIL, NOTIFY_TO_EMAIL
 */
async function sendViaResend(payload: NotifyPayload): Promise<void> {
  // Real implementation:
  //   import { Resend } from 'resend'
  //   const resend = new Resend(process.env.NOTIFY_RESEND_API_KEY)
  //   await resend.emails.send({ from: ..., to: ..., subject: ..., text: ... })
  console.log('[notify:resend] stub — configure NOTIFY_RESEND_API_KEY to activate', payload.subject)
}

/**
 * Send via SendGrid.
 * Requires: NOTIFY_SENDGRID_API_KEY, NOTIFY_FROM_EMAIL, NOTIFY_TO_EMAIL
 */
async function sendViaSendGrid(payload: NotifyPayload): Promise<void> {
  // Real implementation:
  //   const sgMail = require('@sendgrid/mail')
  //   sgMail.setApiKey(process.env.NOTIFY_SENDGRID_API_KEY)
  //   await sgMail.send({ to: ..., from: ..., subject: ..., text: ... })
  console.log('[notify:sendgrid] stub — configure NOTIFY_SENDGRID_API_KEY to activate', payload.subject)
}

/**
 * Send via Twilio SMS/WhatsApp.
 * Requires: NOTIFY_TWILIO_ACCOUNT_SID, NOTIFY_TWILIO_AUTH_TOKEN, NOTIFY_TWILIO_FROM
 */
async function sendViaTwilio(payload: NotifyPayload): Promise<void> {
  // Real implementation:
  //   import Twilio from 'twilio'
  //   const client = Twilio(process.env.NOTIFY_TWILIO_ACCOUNT_SID, process.env.NOTIFY_TWILIO_AUTH_TOKEN)
  //   await client.messages.create({ body: formatBody(payload), from: ..., to: ... })
  console.log('[notify:twilio] stub — configure NOTIFY_TWILIO_ACCOUNT_SID to activate', payload.subject)
}
