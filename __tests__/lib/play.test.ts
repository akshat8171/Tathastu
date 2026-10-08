/**
 * @jest-environment node
 */

import { createHmac } from 'crypto'
import { derivePhase } from '@/lib/play/phase'
import { idealTapMs, scoreTaps, validateTaps } from '@/lib/play/scoring'
import { gateFromProfile, isValidMetaSignature, readPlayMessages } from '@/lib/play/webhook'
import { pickWinner } from '@/lib/play/winner'
import { DROP_COUNT } from '@/lib/play/constants'

describe('Layer Rush scoring', () => {
  const perfectTaps = Array.from({ length: DROP_COUNT }, (_, index) => idealTapMs(index))

  it('scores a centered stack above a stack of misses', () => {
    const perfect = scoreTaps({ seed: 7, tapsMs: perfectTaps })
    const missed = scoreTaps({ seed: 7, tapsMs: [] })
    expect(perfect.accuracy).toBe(800)
    expect(perfect.combo).toBe(8)
    expect(perfect.clutchBonus).toBe(80)
    expect(perfect.composite).toBeGreaterThan(missed.composite)
    expect(missed.composite).toBe(0)
    expect(perfect.composite).toBe(
      perfect.accuracy + perfect.comboBonus + perfect.speed + perfect.stability + perfect.clutchBonus
    )
  })

  it('rejects taps that run backwards', () => {
    expect(validateTaps([100, 50])).toMatch(/forward/)
  })

  it('keeps one winner and skips someone who already drew', () => {
    const winner = pickWinner([
      { passId: 'a', username: 'ana', composite: 900, accuracy: 700, clutch: 100, submittedAtMs: 10, alreadyWon: true },
      { passId: 'b', username: 'mia', composite: 800, accuracy: 600, clutch: 80, submittedAtMs: 20, alreadyWon: false },
      { passId: 'c', username: 'zia', composite: 800, accuracy: 600, clutch: 80, submittedAtMs: 30, alreadyWon: false },
    ])
    expect(winner?.passId).toBe('b')
  })
})

describe('round phase', () => {
  const timing = { entryClosesAtMs: 1_000, startsAtMs: 1_300, endsAtMs: 2_000 }

  it('walks entry, countdown, live, then due', () => {
    expect(derivePhase({ status: 'open', nowMs: 500, ...timing })).toBe('entry')
    expect(derivePhase({ status: 'open', nowMs: 1_100, ...timing })).toBe('countdown')
    expect(derivePhase({ status: 'open', nowMs: 1_500, ...timing })).toBe('live')
    expect(derivePhase({ status: 'open', nowMs: 12_000, ...timing })).toBe('due')
    expect(derivePhase({ status: 'closed', nowMs: 500, ...timing })).toBe('closed')
  })
})

describe('Instagram follow webhook', () => {
  it('rejects a signature that was not signed with the app secret', () => {
    const body = '{"ok":true}'
    const signature = `sha256=${createHmac('sha256', 'right-secret').update(body).digest('hex')}`
    expect(isValidMetaSignature(body, signature, 'right-secret')).toBe(true)
    expect(isValidMetaSignature(body, signature, 'wrong-secret')).toBe(false)
    expect(isValidMetaSignature(body, null, 'right-secret')).toBe(false)
  })

  it('reads a PLAY ticket and ignores the business echo', () => {
    const messages = readPlayMessages({
      object: 'instagram',
      entry: [
        {
          id: 'business',
          messaging: [
            { sender: { id: 'business' }, message: { text: 'PLAY AB23CD', is_echo: true } },
            { sender: { id: 'visitor' }, message: { text: 'play ab23cd' } },
            { sender: { id: 'visitor-2' }, referral: { ref: 'ZX98QW' } },
          ],
        },
      ],
    })
    expect(messages.map((message) => message.ticket)).toEqual([null, 'AB23CD', 'ZX98QW'])
  })

  it('treats a missing follow flag as not following', () => {
    expect(gateFromProfile({ username: 'mia', is_user_follow_business: true })).toEqual({
      follows: true,
      username: 'mia',
    })
    expect(gateFromProfile({ username: 'mia', is_user_follow_business: false }).follows).toBe(false)
    expect(gateFromProfile({ username: 'mia' }).follows).toBe(false)
  })
})
