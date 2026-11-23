import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { Price } from '@/components/ui/price'

describe('Price', () => {
  it('renders current price formatted in ₹ en-IN locale', () => {
    render(<Price current={2299} />)
    const text = screen.getByText(/2,299/)
    expect(text).toBeInTheDocument()
    expect(text.textContent).toMatch(/₹/)
  })

  it('renders larger prices with correct en-IN grouping (e.g. ₹1,23,456)', () => {
    render(<Price current={123456} />)
    expect(screen.getByText(/1,23,456/)).toBeInTheDocument()
  })

  it('does not show struck-through compare-at price', () => {
    render(<Price current={2299} compareAt={2799} />)
    expect(document.querySelector('s')).not.toBeInTheDocument()
    expect(screen.queryByText(/2,799/)).not.toBeInTheDocument()
  })

  it('does not show % OFF badge even when compareAt is higher', () => {
    render(<Price current={2299} compareAt={2799} showDiscount />)
    expect(screen.queryByText(/OFF/i)).not.toBeInTheDocument()
  })

  it('applies custom className to wrapper', () => {
    const { container } = render(<Price current={999} className="custom-price" />)
    expect(container.firstChild).toHaveClass('custom-price')
  })
})
