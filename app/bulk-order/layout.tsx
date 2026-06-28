import type { Metadata } from 'next'
import { SITE } from '@/lib/site'

export const metadata: Metadata = {
  title: `Bulk & Corporate 3D Printing Orders India | Wholesale Custom Gifts | ${SITE.name}`,
  description: 'Bulk 3D printing orders for corporate gifts, events, and wholesale. Minimum 10 pieces, custom branding available. Get a tailored quote for branded 3D printed items with PAN India delivery from Agra.',
  keywords: [
    'bulk 3D printing orders India',
    'corporate gifts 3D printed',
    'wholesale custom gifts',
    'bulk customized keychains',
    'corporate 3D printing service',
    'event gifts bulk order',
    'branded 3D printed items',
  ],
  openGraph: {
    title: `Bulk & Corporate 3D Printing Orders | Wholesale Custom Gifts India | ${SITE.name}`,
    description: 'Corporate and bulk 3D printing solutions for events, gifts, and wholesale. Custom branding, minimum 10 pieces, PAN India delivery.',
    type: 'website',
    locale: 'en_IN',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function BulkOrderLayout({ children }: { children: React.ReactNode }) {
  return children
}
