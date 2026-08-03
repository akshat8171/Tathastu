import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'

describe('GoogleAnalytics — OFF path', () => {
  it('renders nothing in the test / non-production environment', () => {
    // Under jest NODE_ENV === 'test', so analytics is gated off and the
    // component must emit no <script> tags — CI and local test runs send zero
    // hits to the production GA property.
    const { container } = render(<GoogleAnalytics />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('GoogleAnalytics — production ON path', () => {
  const OLD_ENV = process.env
  // `process.env.NODE_ENV` is typed read-only by @types/node; this mutable view
  // lets the tests simulate a production build without a `tsc` error.
  const mutableEnv = () => process.env as Record<string, string | undefined>

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('emits the gtag.js loader + inline config with the resolved GA id', async () => {
    // Simulate a self-hosted production build (no Vercel env -> NODE_ENV gate).
    mutableEnv().NODE_ENV = 'production'
    delete process.env.NEXT_PUBLIC_VERCEL_ENV
    delete process.env.NEXT_PUBLIC_ANALYTICS_DISABLED
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123'

    // Re-import against the mutated env so the module-under-test sees prod.
    const { GoogleAnalytics: ProdGA } = await import(
      '@/components/analytics/google-analytics'
    )
    const { container } = render(<ProdGA />)

    // React 19 hoists `<script async src>` out of the render tree into
    // <head> (and dedupes it), so query the whole document, not `container`.
    const loader = document.querySelector(
      'script[src^="https://www.googletagmanager.com/gtag/js"]',
    )
    expect(loader).not.toBeNull()
    expect(loader).toHaveAttribute(
      'src',
      'https://www.googletagmanager.com/gtag/js?id=G-TESTID123',
    )
    expect(loader).toHaveAttribute('async')

    // The inline bootstrap <script> must configure the resolved ID.
    const inline = Array.from(container.querySelectorAll('script')).find(
      (s) => !s.getAttribute('src') && s.textContent?.includes('gtag('),
    )
    expect(inline).toBeDefined()
    expect(inline?.textContent).toContain("gtag('config', 'G-TESTID123')")
    expect(inline?.textContent).toContain('dataLayer')
  })

  it('renders nothing on a Vercel preview deployment (NODE_ENV=production)', async () => {
    mutableEnv().NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_VERCEL_ENV = 'preview'
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123'

    const { GoogleAnalytics: PreviewGA } = await import(
      '@/components/analytics/google-analytics'
    )
    const { container } = render(<PreviewGA />)
    expect(container).toBeEmptyDOMElement()
  })
})
