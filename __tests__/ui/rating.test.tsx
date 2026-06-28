import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { screen } from '@testing-library/dom'
import { Rating } from '@/components/ui/rating'

describe('Rating', () => {
  it('renders the numeric value to one decimal place', () => {
    render(<Rating value={4.6} />)
    expect(screen.getByText(/4\.6/)).toBeInTheDocument()
  })

  it('renders aria-label with value and no count when count is absent', () => {
    render(<Rating value={4.5} />)
    // The outer div has aria-label "Rating: 4.5 out of 5"
    const container = document.querySelector('[aria-label]')
    expect(container?.getAttribute('aria-label')).toBe('Rating: 4.5 out of 5')
  })

  it('renders aria-label with review count when count is provided', () => {
    render(<Rating value={4.6} count={32} />)
    const container = document.querySelector('[aria-label]')
    expect(container?.getAttribute('aria-label')).toBe('Rating: 4.6 out of 5, 32 reviews')
  })

  it('shows review count in parentheses when count is provided', () => {
    render(<Rating value={4.6} count={32} />)
    expect(screen.getByText('(32)')).toBeInTheDocument()
  })

  it('does NOT show parenthetical count when count is absent', () => {
    render(<Rating value={4.6} />)
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument()
  })

  it('renders 5 SVG stars total for a round integer value', () => {
    render(<Rating value={5} />)
    // Stars are inside the aria-hidden div; query all SVGs in the star container
    const svgs = document.querySelectorAll('svg')
    // 5 full stars = 5 svgs in star display
    expect(svgs.length).toBeGreaterThanOrEqual(5)
  })

  it('renders value 0 without crashing', () => {
    render(<Rating value={0} />)
    expect(screen.getByText(/0\.0/)).toBeInTheDocument()
  })

  it('renders a perfect 5 rating without crashing', () => {
    render(<Rating value={5} />)
    expect(screen.getByText(/5\.0/)).toBeInTheDocument()
  })

  it('renders a half-star rating (e.g. 4.5) without crashing', () => {
    render(<Rating value={4.5} />)
    expect(screen.getByText(/4\.5/)).toBeInTheDocument()
  })

  it('renders a near-boundary rating (e.g. 4.9) without crashing', () => {
    render(<Rating value={4.9} />)
    expect(screen.getByText(/4\.9/)).toBeInTheDocument()
  })

  it('applies custom className to wrapper', () => {
    const { container } = render(<Rating value={4.0} className="my-rating" />)
    expect(container.firstChild).toHaveClass('my-rating')
  })

  it('renders count of 0 when count is 0', () => {
    render(<Rating value={3.0} count={0} />)
    expect(screen.getByText('(0)')).toBeInTheDocument()
  })

  it('displays value 4.8 correctly', () => {
    render(<Rating value={4.8} count={48} />)
    expect(screen.getByText(/4\.8/)).toBeInTheDocument()
    expect(screen.getByText('(48)')).toBeInTheDocument()
  })
})
