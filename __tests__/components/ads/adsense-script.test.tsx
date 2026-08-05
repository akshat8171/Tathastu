import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { AdSenseScript } from '@/components/ads/adsense-script'

describe('AdSenseScript — OFF path', () => {
  it('renders nothing in the test / non-production environment', () => {
    const { container } = render(<AdSenseScript />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('AdSenseScript — production ON path', () => {
  const OLD_ENV = process.env
  const mutableEnv = () => process.env as Record<string, string | undefined>

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
    // React 19 may hoist async scripts into document.head; clear leftovers
    // so assertions do not see a prior test's adsbygoogle loader.
    document
      .querySelectorAll(
        'script[src*="pagead2.googlesyndication.com"], script[src*="googletagmanager.com"]',
      )
      .forEach((el) => el.remove())
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('emits adsbygoogle.js with the configured client id', async () => {
    mutableEnv().NODE_ENV = 'production'
    delete process.env.NEXT_PUBLIC_VERCEL_ENV
    delete process.env.NEXT_PUBLIC_ADSENSE_DISABLED
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = 'ca-pub-1234567890123456'

    const { AdSenseScript: ProdAdSense } = await import(
      '@/components/ads/adsense-script'
    )
    render(<ProdAdSense />)

    const loader = document.querySelector(
      'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
    )
    expect(loader).not.toBeNull()
    expect(loader).toHaveAttribute(
      'src',
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456',
    )
    expect(loader).toHaveAttribute('async')
    expect(loader).toHaveAttribute('crossorigin', 'anonymous')
  })

  it('renders nothing on a Vercel preview deployment', async () => {
    mutableEnv().NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview'
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = 'ca-pub-1234567890123456'

    const { AdSenseScript: PreviewAdSense } = await import(
      '@/components/ads/adsense-script'
    )
    const { container } = render(<PreviewAdSense />)
    expect(container).toBeEmptyDOMElement()
  })

  it('falls back to the built-in publisher id when env is unset', async () => {
    mutableEnv().NODE_ENV = 'production'
    delete process.env.NEXT_PUBLIC_VERCEL_ENV
    delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
    delete process.env.NEXT_PUBLIC_ADSENSE_DISABLED

    const { AdSenseScript: DefaultAdSense } = await import(
      '@/components/ads/adsense-script'
    )
    const { DEFAULT_ADSENSE_CLIENT_ID } = await import('@/lib/ads/adsense')
    render(<DefaultAdSense />)

    const loader = document.querySelector(
      'script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]',
    )
    expect(loader).not.toBeNull()
    expect(loader).toHaveAttribute(
      'src',
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${DEFAULT_ADSENSE_CLIENT_ID}`,
    )
  })
})
