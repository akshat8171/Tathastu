import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiwaliIdolsBanner } from '@/components/homepage/diwali-idols-banner'
import type { ProductCardData } from '@/components/ui'

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} src={props.src} />
  ),
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
    className?: string
    'aria-label'?: string
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

const products: ProductCardData[] = [
  {
    id: 'pooja-decor-dashboard-baby-shiva',
    name: 'Baby Shiva Car Dashboard Idol',
    price: 850,
    images: ['/images/products/pooja-decor/pooja-decor-dashboard-baby-shiva/01-hero.png'],
    category: 'pooja-decor',
    rating: 5,
    reviewCount: 0,
  },
  {
    id: 'pooja-decor-dashboard-ganesha',
    name: 'Lord Ganesha Car Dashboard Idol',
    price: 850,
    images: ['/images/products/pooja-decor/pooja-decor-dashboard-ganesha/01-hero.png'],
    category: 'pooja-decor',
    rating: 5,
    reviewCount: 0,
  },
]

describe('DiwaliIdolsBanner', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('starts expanded with Shop Now links to each PDP', () => {
    render(<DiwaliIdolsBanner products={products} />)

    expect(screen.getByTestId('diwali-idols-banner')).toHaveAttribute('data-expanded', 'true')
    expect(screen.getByText(/This Diwali, order these idols from Tathastu/i)).toBeInTheDocument()

    const shopLinks = screen.getAllByRole('link', { name: 'Shop Now' })
    expect(shopLinks).toHaveLength(2)
    expect(shopLinks[0]).toHaveAttribute('href', '/products/pooja-decor-dashboard-baby-shiva')
    expect(shopLinks[1]).toHaveAttribute('href', '/products/pooja-decor-dashboard-ganesha')
  })

  it('collapses on dismiss and can re-expand', async () => {
    const user = userEvent.setup()
    render(<DiwaliIdolsBanner products={products} />)

    await user.click(screen.getByRole('button', { name: /Collapse Diwali idols banner/i }))
    expect(screen.getByTestId('diwali-idols-banner')).toHaveAttribute('data-expanded', 'false')
    expect(window.sessionStorage.getItem('tathastu-diwali-idols-banner')).toBe('collapsed')

    await user.click(screen.getByRole('button', { name: /View idols/i }))
    expect(screen.getByTestId('diwali-idols-banner')).toHaveAttribute('data-expanded', 'true')
    expect(window.sessionStorage.getItem('tathastu-diwali-idols-banner')).toBe('expanded')
  })

  it('renders nothing when there are no products', () => {
    const { container } = render(<DiwaliIdolsBanner products={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
