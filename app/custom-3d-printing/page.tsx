/**
 * /custom-3d-printing — SEO/IA-parity alias for the custom-print quote flow.
 *
 * Mirrors 3dprintshop.in's /custom-3d-printing route.
 * This is a thin server page that passes ?type= through to the customize page's
 * client component so deep-links work: /custom-3d-printing?type=portrait
 */

import type { Metadata } from 'next'
import { SITE } from '@/lib/site'
import CustomizePageClient from './client'

export const metadata: Metadata = {
  title: `Custom 3D Printing in India | ${SITE.name}`,
  description:
    `Get your custom 3D print from ${SITE.name}. Upload a photo, STL file or describe your idea. ` +
    `We print keychains, portraits, nameplates, gifts & more. Free quote within 24 hours. Pan-India shipping.`,
  keywords: [
    'custom 3D printing India',
    '3D printed keychain',
    '3D photo portrait',
    'custom 3D print Hyderabad',
    'personalised 3D print',
    'STL printing India',
    'bulk 3D printing',
  ],
  openGraph: {
    title: `Custom 3D Printing | ${SITE.name}`,
    description: 'Upload your design and get a free quote within 24 hours.',
    type: 'website',
  },
}

export default function Custom3DPrintingPage() {
  return <CustomizePageClient />
}
