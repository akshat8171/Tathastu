/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  // Keep firebase-admin (and its jose/jwks-rsa chain) outside the Turbopack
  // bundle. Bundling them triggers ERR_REQUIRE_ESM on Vercel and crashes
  // /api/orders (COD + post-payment order create) with a 500 HTML error page.
  serverExternalPackages: ['firebase-admin', 'jose', 'jwks-rsa'],
  // Inline small CSS files (<25KB) to eliminate render-blocking stylesheet requests
  experimental: {
    optimizeCss: true,
  },
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
        source: '/:path*',
        headers: [
          // Security: prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Security: prevent clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Security: enable HSTS (2 years, include subdomains, preload-ready)
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Security: referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Security: permissions policy (disable unused features)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Security: XSS protection (legacy browsers)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // COOP: same-origin-allow-popups for Razorpay checkout window
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // DNS prefetch control: enable for Google Fonts & CDN resources
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
