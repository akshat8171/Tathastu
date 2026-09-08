/**
 * @jest-environment node
 */

import { Config } from '@/lib/config'
import { getSiteUrl, orderConfirmationUrl } from '@/lib/admin/links'
import { getOrganizationSchema, getWebSiteSchema } from '@/lib/schema'

describe('Config.appUrl', () => {
  const previousAppUrl = process.env.APP_URL
  const previousVercelUrl = process.env.VERCEL_URL

  afterEach(() => {
    if (previousAppUrl === undefined) delete process.env.APP_URL
    else process.env.APP_URL = previousAppUrl
    if (previousVercelUrl === undefined) delete process.env.VERCEL_URL
    else process.env.VERCEL_URL = previousVercelUrl
  })

  it('uses APP_URL and strips a trailing slash', () => {
    delete process.env.VERCEL_URL
    process.env.APP_URL = 'https://www.tathastukeepsakes.in/'
    expect(Config.appUrl).toBe('https://www.tathastukeepsakes.in')
    expect(getSiteUrl()).toBe('https://www.tathastukeepsakes.in')
  })

  it('falls back to https://VERCEL_URL when APP_URL is unset', () => {
    delete process.env.APP_URL
    process.env.VERCEL_URL = 'tathastu-preview.vercel.app'
    expect(Config.appUrl).toBe('https://tathastu-preview.vercel.app')
  })

  it('falls back to localhost when no env is set', () => {
    delete process.env.APP_URL
    delete process.env.VERCEL_URL
    expect(Config.appUrl).toBe('http://localhost:3000')
  })
})

describe('schema.org URLs', () => {
  const previousAppUrl = process.env.APP_URL

  afterEach(() => {
    if (previousAppUrl === undefined) delete process.env.APP_URL
    else process.env.APP_URL = previousAppUrl
  })

  it('builds organization and website URLs from Config', () => {
    process.env.APP_URL = 'https://www.tathastukeepsakes.in'
    expect(getOrganizationSchema().url).toBe('https://www.tathastukeepsakes.in')
    expect(getWebSiteSchema().url).toBe('https://www.tathastukeepsakes.in')
  })
})

describe('order confirmation URL', () => {
  const previousAppUrl = process.env.APP_URL

  afterEach(() => {
    if (previousAppUrl === undefined) delete process.env.APP_URL
    else process.env.APP_URL = previousAppUrl
  })

  it('prefixes the configured origin', () => {
    process.env.APP_URL = 'https://www.tathastukeepsakes.in'
    expect(orderConfirmationUrl('TK-1001')).toBe(
      'https://www.tathastukeepsakes.in/order-confirmation/TK-1001'
    )
  })
})
