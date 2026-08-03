import {
  DEFAULT_GA_MEASUREMENT_ID,
  isValidGaId,
  resolveGaId,
  shouldLoadAnalytics,
} from '@/lib/analytics/ga'

describe('isValidGaId', () => {
  it('accepts well-formed GA4 Measurement IDs', () => {
    expect(isValidGaId('G-X8RL0R1YNH')).toBe(true)
    expect(isValidGaId('G-ABC123')).toBe(true)
  })

  it('rejects malformed, legacy and unsafe IDs', () => {
    expect(isValidGaId('')).toBe(false)
    expect(isValidGaId(undefined)).toBe(false)
    expect(isValidGaId(null)).toBe(false)
    expect(isValidGaId('G-')).toBe(false)
    expect(isValidGaId('UA-12345-1')).toBe(false) // Universal Analytics, not GA4
    expect(isValidGaId('G-abc')).toBe(false) // lowercase disallowed by strict check
    // eslint-disable-next-line no-script-url
    expect(isValidGaId("G-X');alert(1)//")).toBe(false) // injection attempt
  })
})

describe('resolveGaId', () => {
  it('returns the env override when it is valid', () => {
    expect(resolveGaId('G-STAGING99')).toBe('G-STAGING99')
  })

  it('trims surrounding whitespace on the env value', () => {
    expect(resolveGaId('  G-TRIMMED1  ')).toBe('G-TRIMMED1')
  })

  it('falls back to the default when the override is absent or blank', () => {
    expect(resolveGaId(undefined)).toBe(DEFAULT_GA_MEASUREMENT_ID)
    expect(resolveGaId('')).toBe(DEFAULT_GA_MEASUREMENT_ID)
    expect(resolveGaId('   ')).toBe(DEFAULT_GA_MEASUREMENT_ID)
  })

  it('fails safe (null) when an explicit override is malformed', () => {
    expect(resolveGaId('not-a-ga-id')).toBeNull()
    expect(resolveGaId('UA-12345-1')).toBeNull()
  })
})

describe('shouldLoadAnalytics', () => {
  it('is enabled in production (self-hosted, no Vercel env)', () => {
    expect(shouldLoadAnalytics({ nodeEnv: 'production' })).toBe(true)
  })

  it('is disabled in development and test', () => {
    expect(shouldLoadAnalytics({ nodeEnv: 'development' })).toBe(false)
    expect(shouldLoadAnalytics({ nodeEnv: 'test' })).toBe(false)
  })

  it('is enabled on Vercel production', () => {
    expect(
      shouldLoadAnalytics({ nodeEnv: 'production', vercelEnv: 'production' }),
    ).toBe(true)
  })

  it('is DISABLED on Vercel preview even though NODE_ENV=production', () => {
    // Preview deploys build with NODE_ENV=production; VERCEL_ENV is the only
    // signal that keeps preview traffic out of the production GA property.
    expect(
      shouldLoadAnalytics({ nodeEnv: 'production', vercelEnv: 'preview' }),
    ).toBe(false)
  })

  it('is disabled on Vercel development', () => {
    expect(
      shouldLoadAnalytics({ nodeEnv: 'production', vercelEnv: 'development' }),
    ).toBe(false)
  })

  it('honours the kill-switch even in production', () => {
    expect(
      shouldLoadAnalytics({ nodeEnv: 'production', disabled: 'true' }),
    ).toBe(false)
    expect(
      shouldLoadAnalytics({
        nodeEnv: 'production',
        vercelEnv: 'production',
        disabled: 'true',
      }),
    ).toBe(false)
  })
})
