/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'shoprusticstone.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security: prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Security: prevent clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Security: enable HSTS (2 years, include subdomains)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Security: referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Security: permissions policy (disable unused features)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Security: XSS protection (legacy browsers)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // COOP: same-origin for process isolation
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
