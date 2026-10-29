/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  // `npm run dev` only: let phones on the same Wi-Fi load the dev server, e.g.
  // DEV_ORIGINS=192.168.1.10 npm run dev -- -H 0.0.0.0 (comma-separated). No effect in production.
  allowedDevOrigins: (process.env.DEV_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
  // Keep firebase-admin (and its jose/jwks-rsa chain) outside the Turbopack
  // bundle. Bundling them triggers ERR_REQUIRE_ESM on Vercel and crashes
  // /api/orders (COD + post-payment order create) with a 500 HTML error page.
  serverExternalPackages: ['firebase-admin', 'jose', 'jwks-rsa'],
  // /api/products used to readdir() public/images/products — NFT then packed
  // ~250MB+ of PNGs into the serverless zip and failed the 250MB limit.
  // Catalog API reads lib/products.json now; keep images out of every function.
  outputFileTracingExcludes: {
    '*': [
      './public/images/products/**',
      './docs/catalog/generated/**',
      './docs/catalog/pages/**',
      './docs/catalog/research/**',
      './pinterest-pins/**',
      './meesho-image-kit/**',
    ],
  },
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
  async redirects() {
    return [
      // Consolidate /shop → /products (primary catalog URL)
      { source: '/shop', destination: '/products', permanent: true },
      // Legacy query category URLs → path hubs
      {
        source: '/products',
        has: [{ type: 'query', key: 'category', value: 'rakhi' }],
        destination: '/rakhi',
        permanent: true,
      },
      {
        source: '/products',
        has: [{ type: 'query', key: 'category', value: '(?<slug>[a-z0-9-]+)' }],
        destination: '/shop/:slug',
        permanent: true,
      },
    ]
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
          // CSP Report-Only first — tighten after verifying Razorpay/GA/AdSense/Vercel
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com https://www.google.com https://googleads.g.doubleclick.net",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://checkout.razorpay.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
