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
  title: `Custom 3D Printing India | 3D Print My Design Online | ${SITE.name}`,
  description:
    `Custom 3D printing service in India. Upload design for 3D printing or send your photo/STL file. ` +
    `3D print my design India - keychains, portraits, nameplates, corporate gifts & more. Free quote 24hrs. Order custom 3D prints online with PAN India delivery from Agra.`,
  keywords: [
    'custom 3D printing India',
    '3D print my design India',
    'upload design for 3D printing',
    'custom 3D prints online',
    '3D printing service India',
    'custom 3D printed keychain India',
    'personalised 3D printing',
    '3D photo portrait India',
    'STL file printing India',
    'bulk 3D printing service',
    '3D printing Agra',
    'custom 3D gifts online India',
    'order 3D prints online',
  ],
  openGraph: {
    title: `Custom 3D Printing Service India | Upload Your Design | ${SITE.name}`,
    description: '3D print your design in India. Upload photo, STL or describe idea. Free quote within 24 hours. PAN India shipping.',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function Custom3DPrintingPage() {
  return <CustomizePageClient />
}
