/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Primary action: teal / deep-green ──────────────────────────────
        brand: {
          50:  '#e6f4f1',
          100: '#c0e4dd',
          200: '#8ecec5',
          300: '#52b5a9',
          400: '#23a191',
          DEFAULT: '#0E7A66', // primary CTA, buttons, links
          600: '#0B6E5C',     // hover darken
          700: '#095748',
          800: '#073f34',
          900: '#042720',
        },
        teal: '#0E7A66',      // alias – use `brand` tokens above

        // ── Promo / announcement / violet ──────────────────────────────────
        violet: {
          DEFAULT: '#4C2A86', // announcement bar bg, promo gradient start
          dark:    '#3B1F6A', // deeper violet for hover / gradient end
          light:   '#6B45A8',
        },
        indigo: {
          promo: '#3730A3',   // promo gradient end
        },

        // ── Typography ─────────────────────────────────────────────────────
        ink: {
          DEFAULT: '#16182B', // headings / near-black
          soft:    '#2D2F45',
        },
        muted: '#4B5563',     // body text / slate-gray (Tailwind gray-600 — passes WCAG AA at all sizes)

        // ── Backgrounds & surfaces ─────────────────────────────────────────
        panel: '#EDF1F6',     // product image background
        surface: '#F8FAFC',   // off-white page sections

        // ── Badges ────────────────────────────────────────────────────────
        sale:     '#E63946',  // "Sale" badge  (red)
        discount: '#16A34A',  // "%OFF" badge  (green – Tailwind green-600)
      },

      fontFamily: {
        display: ['var(--font-poppins)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans:    ['var(--font-inter)',   'ui-sans-serif', 'system-ui', 'sans-serif'],
        // keep serif alias in case old pages still reference it transitionally
        serif:   ['var(--font-poppins)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },

      borderRadius: {
        card:  '12px',
        card2: '16px',
        pill:  '9999px',
      },

      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)',
        'card-hover': '0 8px 24px rgba(0,0,0,.10), 0 2px 6px rgba(0,0,0,.06)',
        badge:      '0 1px 4px rgba(0,0,0,.15)',
      },

      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
      },

      // ── Legacy compat ── builders may encounter these; map to new values ──
      // (kept so existing components don't throw "unknown utility" in dev mode)
      // Builders should migrate these away during component rewrites.
    },
  },
  plugins: [],
}
