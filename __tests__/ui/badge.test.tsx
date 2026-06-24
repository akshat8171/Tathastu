import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  describe('variant: sale', () => {
    it('renders children text', () => {
      render(<Badge variant="sale">Sale</Badge>)
      expect(screen.getByText('Sale')).toBeInTheDocument()
    })

    it('applies badge-sale CSS class', () => {
      render(<Badge variant="sale">Sale</Badge>)
      expect(screen.getByText('Sale')).toHaveClass('badge-sale')
    })

    it('does NOT apply badge-discount or badge-new class', () => {
      render(<Badge variant="sale">Sale</Badge>)
      const el = screen.getByText('Sale')
      expect(el).not.toHaveClass('badge-discount')
      expect(el).not.toHaveClass('badge-new')
    })

    it('renders as a <span>', () => {
      render(<Badge variant="sale">Sale</Badge>)
      expect(screen.getByText('Sale').tagName.toLowerCase()).toBe('span')
    })
  })

  describe('variant: discount', () => {
    it('renders children text', () => {
      render(<Badge variant="discount">18% OFF</Badge>)
      expect(screen.getByText('18% OFF')).toBeInTheDocument()
    })

    it('applies badge-discount CSS class', () => {
      render(<Badge variant="discount">18% OFF</Badge>)
      expect(screen.getByText('18% OFF')).toHaveClass('badge-discount')
    })

    it('does NOT apply badge-sale or badge-new class', () => {
      render(<Badge variant="discount">18% OFF</Badge>)
      const el = screen.getByText('18% OFF')
      expect(el).not.toHaveClass('badge-sale')
      expect(el).not.toHaveClass('badge-new')
    })
  })

  describe('variant: new', () => {
    it('renders children text', () => {
      render(<Badge variant="new">New</Badge>)
      expect(screen.getByText('New')).toBeInTheDocument()
    })

    it('applies badge-new CSS class', () => {
      render(<Badge variant="new">New</Badge>)
      expect(screen.getByText('New')).toHaveClass('badge-new')
    })

    it('does NOT apply badge-sale or badge-discount class', () => {
      render(<Badge variant="new">New</Badge>)
      const el = screen.getByText('New')
      expect(el).not.toHaveClass('badge-sale')
      expect(el).not.toHaveClass('badge-discount')
    })
  })

  describe('className prop', () => {
    it('merges extra className with the variant class', () => {
      render(<Badge variant="sale" className="absolute top-2 left-2">Sale</Badge>)
      const el = screen.getByText('Sale')
      expect(el).toHaveClass('badge-sale')
      expect(el).toHaveClass('absolute')
      expect(el).toHaveClass('top-2')
      expect(el).toHaveClass('left-2')
    })

    it('uses trimmed class string when className is empty string', () => {
      render(<Badge variant="new" className="">New</Badge>)
      // should not have extra whitespace that could cause class attribute issues
      const el = screen.getByText('New')
      expect(el).toHaveClass('badge-new')
    })
  })

  describe('custom children', () => {
    it('renders arbitrary children (e.g. percentage text)', () => {
      render(<Badge variant="discount">25% OFF</Badge>)
      expect(screen.getByText('25% OFF')).toBeInTheDocument()
    })

    it('renders Sold Out text with sale variant', () => {
      render(<Badge variant="sale">Sold Out</Badge>)
      expect(screen.getByText('Sold Out')).toBeInTheDocument()
      expect(screen.getByText('Sold Out')).toHaveClass('badge-sale')
    })
  })
})
