import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { ReactNode } from 'react'
import { CartProvider } from '@/components/cart/cart-context'
import { ProductCard } from '@/components/ui/product-card'

// ── Mock next/image ──────────────────────────────────────────────────────────
// Strip Next.js-specific props (fill, unoptimized, sizes) that are not valid
// HTML attributes — passing them to a real <img> triggers React warnings.
jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ src, alt, fill: _fill, sizes: _sizes, unoptimized: _unopt, ...rest }: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img src={src} alt={alt} {...rest} />
  },
}))

// ── Mock next/link ───────────────────────────────────────────────────────────
jest.mock('next/link', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

// ── Mock next/navigation (ProductCard uses useRouter for the wishlist redirect) ─
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/',
}))

// ── Mock the wishlist context ─────────────────────────────────────────────────
// ProductCard's heart button calls useWishlist(). A unit test for card rendering
// should not exercise the context's /api/account/wishlist fetch, so stub the hook
// (same philosophy as the next/* mocks above).
jest.mock('@/components/wishlist/wishlist-context', () => ({
  __esModule: true,
  useWishlist: () => ({
    ids: new Set(),
    isWishlisted: () => false,
    toggle: jest.fn(),
    count: 0,
    isReady: true,
    requiresAuth: false,
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  WishlistProvider: ({ children }: any) => children,
}))

// ── Wrapper ──────────────────────────────────────────────────────────────────
const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
)

// ── Shared test props ────────────────────────────────────────────────────────
const baseProps = {
  id: 'lamps-lamp1',
  name: 'Rustic Charm Lamp',
  price: 2299,
  images: ['/images/products/lamps/lamp1/img1.jpg', '/images/products/lamps/lamp1/img2.jpg'],
  category: 'lamps',
  rating: 4.6,
  reviewCount: 32,
}

function renderCard(overrides = {}) {
  return render(<ProductCard {...baseProps} {...overrides} />, { wrapper })
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ProductCard', () => {
  describe('basic rendering', () => {
    it('renders the product name', () => {
      renderCard()
      expect(screen.getAllByText('Rustic Charm Lamp').length).toBeGreaterThan(0)
    })

    it('renders the current price in ₹', () => {
      renderCard()
      // Price component renders 2299 as ₹2,299
      expect(screen.getByText(/2,299/)).toBeInTheDocument()
    })

    it('renders an image with alt text matching the product name', () => {
      renderCard()
      const img = screen.getByRole('img', { name: 'Buy Rustic Charm Lamp - 3D printed lamps online India' })
      expect(img).toBeInTheDocument()
    })

    it('links to /products/[id]', () => {
      renderCard()
      const links = screen.getAllByRole('link')
      const productLinks = links.filter((l: HTMLElement) =>
        l.getAttribute('href') === '/products/lamps-lamp1'
      )
      expect(productLinks.length).toBeGreaterThan(0)
    })

    it('renders "Add to cart" button', () => {
      renderCard()
      expect(
        screen.getByRole('button', { name: /add rustic charm lamp to cart/i })
      ).toBeInTheDocument()
    })

    it('renders the rating component', () => {
      renderCard()
      expect(screen.getByText(/4\.6/)).toBeInTheDocument()
    })

    it('renders the review count', () => {
      renderCard()
      expect(screen.getByText('(32)')).toBeInTheDocument()
    })
  })

  describe('sale / discount badge behaviour', () => {
    it('shows Sale badge and % OFF badge when originalPrice is present and > price', () => {
      renderCard({ originalPrice: 2799 })
      // Should show a "Sale" badge (the showSaleBadge logic)
      expect(screen.getByText('Sale')).toBeInTheDocument()
      // Should show a % OFF badge via the discount badge
      // (2799-2299)/2799*100 ≈ 17.86 → 18%
      expect(screen.getByText(/18% OFF/i)).toBeInTheDocument()
    })

    it('does NOT show Sale or % OFF badge when originalPrice is absent', () => {
      renderCard()
      expect(screen.queryByText('Sale')).not.toBeInTheDocument()
      expect(screen.queryByText(/OFF/i)).not.toBeInTheDocument()
    })

    it('shows Sold Out badge and disables cart button when isSoldOut is true', () => {
      renderCard({ isSoldOut: true, originalPrice: 2799 })
      // Multiple elements may say "Sold Out" (badge + button text), use getAllByText
      const soldOutEls = screen.getAllByText('Sold Out')
      expect(soldOutEls.length).toBeGreaterThan(0)
      const cartBtn = screen.getByRole('button', { name: /rustic charm lamp is sold out/i })
      expect(cartBtn).toBeDisabled()
    })

    it('shows New badge when labelType is new and no discount', () => {
      renderCard({ labelType: 'new' })
      // No originalPrice → discountPct is null → showNewBadge = true
      expect(screen.getByText('New')).toBeInTheDocument()
    })
  })

  describe('image rendering', () => {
    it('uses the first image as primary', () => {
      renderCard()
      const img = screen.getByRole('img', { name: 'Buy Rustic Charm Lamp - 3D printed lamps online India' })
      expect(img.getAttribute('src')).toBe(
        '/images/products/lamps/lamp1/img1.jpg'
      )
    })
  })
})
