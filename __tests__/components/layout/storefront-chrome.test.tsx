import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import {
  isAdminPath,
  StorefrontChrome,
} from '@/components/layout/storefront-chrome'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}))

jest.mock('@/components/layout/announcement-bar', () => ({
  AnnouncementBar: () => <div data-testid="announcement-bar" />,
}))

jest.mock('@/components/layout/header', () => ({
  Header: () => <header data-testid="site-header" />,
}))

jest.mock('@/components/layout/footer', () => ({
  Footer: () => <footer data-testid="site-footer" />,
}))

jest.mock('@/components/layout/whatsapp-float', () => ({
  WhatsAppFloat: () => <a data-testid="whatsapp-float" href="#wa" />,
}))

const mockedUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('isAdminPath', () => {
  it('matches the admin tree and nothing else', () => {
    expect(isAdminPath('/admin')).toBe(true)
    expect(isAdminPath('/admin/quotes')).toBe(true)
    expect(isAdminPath('/account')).toBe(false)
    expect(isAdminPath('/')).toBe(false)
    expect(isAdminPath(null)).toBe(false)
  })
})

describe('StorefrontChrome', () => {
  afterEach(() => {
    mockedUsePathname.mockReset()
  })

  it('omits storefront chrome on admin routes', () => {
    mockedUsePathname.mockReturnValue('/admin')
    render(
      <StorefrontChrome>
        <div>Dashboard</div>
      </StorefrontChrome>,
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.queryByTestId('site-footer')).not.toBeInTheDocument()
    expect(screen.queryByTestId('site-header')).not.toBeInTheDocument()
    expect(screen.queryByTestId('announcement-bar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('whatsapp-float')).not.toBeInTheDocument()
  })

  it('renders storefront chrome on shopper routes', () => {
    mockedUsePathname.mockReturnValue('/')
    render(
      <StorefrontChrome>
        <div>Home</div>
      </StorefrontChrome>,
    )

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByTestId('site-footer')).toBeInTheDocument()
    expect(screen.getByTestId('site-header')).toBeInTheDocument()
  })
})
