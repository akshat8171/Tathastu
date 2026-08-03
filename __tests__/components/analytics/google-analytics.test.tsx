import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'

// Mock next/script so we can inspect exactly what the component emits. The real
// afterInteractive Script renders null during SSR/test and appends to
// document.body via an effect, which is hard to assert on; a passthrough <script>
// lets us verify the loader src and the inline gtag config string directly.
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ id, src, children }: { id?: string; src?: string; children?: React.ReactNode }) => (
    <script data-testid={id} data-src={src}>
      {children}
    </script>
  ),
}))

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

    const loader = container.querySelector('[data-testid="ga4-lib"]')
    expect(loader).not.toBeNull()
    expect(loader).toHaveAttribute(
      'data-src',
      'https://www.googletagmanager.com/gtag/js?id=G-TESTID123',
    )

    const init = container.querySelector('[data-testid="ga4-init"]')
    expect(init).not.toBeNull()
    expect(init?.textContent).toContain("gtag('config', 'G-TESTID123')")
    expect(init?.textContent).toContain('dataLayer')
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
