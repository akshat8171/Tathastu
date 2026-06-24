import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Price } from '@/components/ui/price'

describe('Price', () => {
  it('renders current price formatted in ₹ en-IN locale', () => {
    render(<Price current={2299} />)
    // en-IN Intl.NumberFormat with INR produces "₹2,299" or "₹2,299" depending on locale
    const text = screen.getByText(/2,299/)
    expect(text).toBeInTheDocument()
    // Check the ₹ symbol is present somewhere in the component
    expect(text.textContent).toMatch(/₹/)
  })

  it('renders larger prices with correct en-IN grouping (e.g. ₹1,23,456)', () => {
    render(<Price current={123456} />)
    // en-IN uses lakh-grouping: 1,23,456
    expect(screen.getByText(/1,23,456/)).toBeInTheDocument()
  })

  it('shows struck-through compare-at price when compareAt > current', () => {
    render(<Price current={2299} compareAt={2799} />)
    const strikethrough = screen.getByText(/2,799/)
    expect(strikethrough.tagName.toLowerCase()).toBe('s')
  })

  it('hides compare-at when compareAt is absent', () => {
    render(<Price current={2299} />)
    // Only one price element should be rendered
    const priceElements = screen.queryAllByText(/₹/)
    expect(priceElements).toHaveLength(1)
  })

  it('hides compare-at when compareAt equals current', () => {
    render(<Price current={2299} compareAt={2299} />)
    // No <s> element should be rendered
    expect(document.querySelector('s')).not.toBeInTheDocument()
  })

  it('hides compare-at when compareAt is less than current', () => {
    render(<Price current={2799} compareAt={2299} />)
    expect(document.querySelector('s')).not.toBeInTheDocument()
  })

  it('shows % OFF badge when showDiscount is true (default) and compareAt > current', () => {
    // 2799 → 2299: (500/2799)*100 = ~17.86 → rounds to 18%
    render(<Price current={2299} compareAt={2799} />)
    expect(screen.getByText(/18% OFF/i)).toBeInTheDocument()
  })

  it('hides % OFF badge when showDiscount is false', () => {
    render(<Price current={2299} compareAt={2799} showDiscount={false} />)
    expect(screen.queryByText(/OFF/i)).not.toBeInTheDocument()
  })

  it('computes % off correctly — 2999 vs 2499: 17% off', () => {
    // (2999 - 2499) / 2999 * 100 = 500/2999*100 ≈ 16.67 → rounds to 17
    render(<Price current={2499} compareAt={2999} />)
    expect(screen.getByText(/17% OFF/i)).toBeInTheDocument()
  })

  it('computes % off correctly — 3999 vs 3499: 13% off', () => {
    // (3999 - 3499) / 3999 * 100 = 500/3999*100 ≈ 12.5 → rounds to 13
    render(<Price current={3499} compareAt={3999} />)
    expect(screen.getByText(/13% OFF/i)).toBeInTheDocument()
  })

  it('computes % off correctly — 50% off scenario', () => {
    render(<Price current={500} compareAt={1000} />)
    expect(screen.getByText(/50% OFF/i)).toBeInTheDocument()
  })

  it('does NOT show % OFF badge when compareAt is absent (no discount scenario)', () => {
    render(<Price current={2299} />)
    expect(screen.queryByText(/OFF/i)).not.toBeInTheDocument()
  })

  it('applies custom className to wrapper', () => {
    const { container } = render(<Price current={999} className="custom-price" />)
    expect(container.firstChild).toHaveClass('custom-price')
  })
})
