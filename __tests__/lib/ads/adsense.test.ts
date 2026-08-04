import {
  buildAdsTxtBody,
  isValidAdsenseClientId,
  resolveAdsenseClientId,
  shouldLoadAdsense,
  toAdsTxtPublisherId,
} from '@/lib/ads/adsense'

describe('isValidAdsenseClientId', () => {
  it('accepts a standard ca-pub id', () => {
    expect(isValidAdsenseClientId('ca-pub-1234567890123456')).toBe(true)
  })

  it('rejects malformed ids', () => {
    expect(isValidAdsenseClientId('pub-123')).toBe(false)
    expect(isValidAdsenseClientId('ca-pub-abc')).toBe(false)
    expect(isValidAdsenseClientId('')).toBe(false)
    expect(isValidAdsenseClientId(null)).toBe(false)
  })
})

describe('resolveAdsenseClientId', () => {
  it('returns null when unset', () => {
    expect(resolveAdsenseClientId(undefined)).toBeNull()
    expect(resolveAdsenseClientId('')).toBeNull()
    expect(resolveAdsenseClientId('   ')).toBeNull()
  })

  it('returns the trimmed valid id', () => {
    expect(resolveAdsenseClientId('  ca-pub-999  ')).toBe('ca-pub-999')
  })

  it('returns null for invalid override', () => {
    expect(resolveAdsenseClientId('not-a-pub')).toBeNull()
  })
})

describe('toAdsTxtPublisherId / buildAdsTxtBody', () => {
  it('strips ca- for ads.txt', () => {
    expect(toAdsTxtPublisherId('ca-pub-1234567890123456')).toBe(
      'pub-1234567890123456',
    )
  })

  it('builds the Google DIRECT line', () => {
    expect(buildAdsTxtBody('ca-pub-1234567890123456')).toBe(
      'google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n',
    )
  })
})

describe('shouldLoadAdsense', () => {
  it('is off when kill-switch is true', () => {
    expect(
      shouldLoadAdsense({
        nodeEnv: 'production',
        vercelEnv: 'production',
        disabled: 'true',
      }),
    ).toBe(false)
  })

  it('is on only for Vercel production', () => {
    expect(
      shouldLoadAdsense({
        nodeEnv: 'production',
        vercelEnv: 'production',
        disabled: undefined,
      }),
    ).toBe(true)
    expect(
      shouldLoadAdsense({
        nodeEnv: 'production',
        vercelEnv: 'preview',
        disabled: undefined,
      }),
    ).toBe(false)
  })

  it('falls back to NODE_ENV off Vercel', () => {
    expect(
      shouldLoadAdsense({
        nodeEnv: 'production',
        vercelEnv: undefined,
        disabled: undefined,
      }),
    ).toBe(true)
    expect(
      shouldLoadAdsense({
        nodeEnv: 'development',
        vercelEnv: undefined,
        disabled: undefined,
      }),
    ).toBe(false)
  })
})
