import type { MetadataRoute } from 'next'

/**
 * Web App Manifest — Progressive Web App metadata.
 *
 * Provides installability hints and theming for browsers and devices
 * that support PWAs. Enables add-to-homescreen prompts and enhanced
 * mobile experience.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tathastu Keepsakes - 3D Printing India',
    short_name: 'Tathastu',
    description: 'Premium 3D printed gifts, custom keepsakes, home decor & personalised prints. Handcrafted in Agra, delivered PAN India.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0E7A66',
    icons: [
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/favicon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
