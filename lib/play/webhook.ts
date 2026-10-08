import { createHmac, timingSafeEqual } from 'crypto'
import { TICKET_PATTERN } from '@/lib/play/constants'

export interface InboundPlayMessage {
  senderId: string
  ticket: string | null
  isEcho: boolean
}

export function isValidMetaSignature(rawBody: string, header: string | null, appSecret: string): boolean {
  if (!header?.startsWith('sha256=')) return false
  const received = header.slice('sha256='.length).trim().toLowerCase()
  const expected = createHmac('sha256', appSecret).update(rawBody).digest('hex')
  if (received.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected))
}

export function readPlayMessages(body: unknown): InboundPlayMessage[] {
  const packets = Array.isArray(body) ? body : [body]
  const messages: InboundPlayMessage[] = []
  for (const packet of packets) {
    messages.push(...messagesInPacket(packet))
  }
  return messages
}

export function gateFromProfile(body: unknown): { follows: boolean; username: string | null } {
  if (!body || typeof body !== 'object') return { follows: false, username: null }
  const row = body as { is_user_follow_business?: unknown; username?: unknown }
  const username = typeof row.username === 'string' && row.username.trim() ? row.username.trim() : null
  return { follows: row.is_user_follow_business === true, username }
}

function messagesInPacket(packet: unknown): InboundPlayMessage[] {
  if (!packet || typeof packet !== 'object') return []
  const entries = (packet as { entry?: unknown }).entry
  if (!Array.isArray(entries)) return []
  return entries.flatMap((entry) => messagesInEntry(entry))
}

function messagesInEntry(entry: unknown): InboundPlayMessage[] {
  if (!entry || typeof entry !== 'object') return []
  const row = entry as { id?: unknown; messaging?: unknown }
  const businessId = typeof row.id === 'string' ? row.id : ''
  if (!Array.isArray(row.messaging)) return []
  return row.messaging.map((item) => messageFromItem(item, businessId))
}

function messageFromItem(item: unknown, businessId: string): InboundPlayMessage {
  const row = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
  const senderId = nestedId(row.sender)
  const message = recordOf(row.message)
  const isEcho = message?.is_echo === true || (senderId !== '' && senderId === businessId)
  const text = typeof message?.text === 'string' ? message.text : ''
  const ref = firstRef(row, message)
  return { senderId, isEcho, ticket: isEcho ? null : ticketFrom(ref, text) }
}

function ticketFrom(ref: string, text: string): string | null {
  const fromRef = normalizeTicket(ref)
  if (fromRef) return fromRef
  const match = text.toUpperCase().match(/\bPLAY\s+([A-HJ-NP-Z2-9]{6})\b/)
  return match ? normalizeTicket(match[1]) : null
}

function normalizeTicket(value: string): string | null {
  const ticket = value.trim().toUpperCase()
  return TICKET_PATTERN.test(ticket) ? ticket : null
}

function firstRef(row: Record<string, unknown>, message: Record<string, unknown> | null): string {
  const candidates = [row.referral, message?.referral, recordOf(row.postback)?.referral]
  for (const candidate of candidates) {
    const ref = recordOf(candidate)?.ref
    if (typeof ref === 'string') return ref
  }
  return ''
}

function nestedId(value: unknown): string {
  const id = recordOf(value)?.id
  return typeof id === 'string' ? id : ''
}

function recordOf(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null
  return value as Record<string, unknown>
}
