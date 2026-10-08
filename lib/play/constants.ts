/** Crowd rhythm game for the AWBEE stall. One announced code, one winner per draw. */

export const PLAY_HANDLE = 'tathastukeepsakes'
export const DROP_COUNT = 8
export const DROP_WINDOW_MS = 1_500
export const GAME_MS = DROP_COUNT * DROP_WINDOW_MS
export const ENTRY_MS = 15_000
export const COUNTDOWN_MS = 3_000
export const SUBMIT_GRACE_MS = 5_000
export const FINALIZE_DELAY_MS = 8_000
export const PERFECT_WINDOW_MS = 80
export const MISS_WINDOW_MS = 250
export const MAX_TAPS = 24
export const MAX_PLAYERS = 80
export const DRAW_LIMIT = 5
export const TICKET_PATTERN = /^[A-HJ-NP-Z2-9]{6}$/
export const ROUND_CODE_PATTERN = /^[A-Z]{4}$/

export const DRAW_SLOTS = ['2:30 pm', '4:00 pm', '5:30 pm', '7:00 pm', '8:30 pm'] as const

export const ROUND_WORDS = [
  'LAMP',
  'GOLD',
  'MINT',
  'AGRA',
  'GLOW',
  'CLAY',
  'BOLT',
  'STAR',
  'NOVA',
  'KITE',
] as const

export const TICKET_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
