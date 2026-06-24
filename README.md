# Tathastu

> **"If it exists, we can print it."**

An e-commerce website for 3D-printed miniatures and home decor, built with Next.js 14 App Router, TypeScript, Tailwind CSS, Supabase, and Razorpay.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth & Database**: Supabase (phone-OTP authentication, PostgreSQL)
- **Payments**: Razorpay
- **Deployment**: Vercel

## Features

- Responsive mobile-first design
- Phone-OTP authentication via Supabase
- Product listing with category filters (Miniatures, Lamps, Signs, Organizers, Planters)
- Product detail pages with image gallery
- Shopping cart (persistent via localStorage)
- Razorpay checkout with order creation and webhook verification
- Orders management
- Watch & Shop video section
- Custom order enquiry

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project
- Razorpay account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tathastu-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in all values — see `.env.example` for the complete list with comments.

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
tathastu-website/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── orders/        # Order creation
│   │   ├── payment/       # Razorpay create-order, verify, webhook
│   │   └── products/      # Product API endpoints
│   ├── checkout/          # Checkout page
│   ├── login/             # Phone-OTP login
│   ├── products/          # Product listing & detail pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── auth/              # Phone-OTP form, logout button
│   ├── cart/              # Cart context, sidebar, add-to-cart
│   ├── checkout/          # Checkout form, order summary
│   ├── layout/            # Header, Footer
│   ├── payment/           # Razorpay checkout component
│   └── products/          # Product card, gallery, info
├── lib/                   # Utilities
│   ├── supabase/          # Supabase client, auth helpers, orders, products
│   ├── razorpay.ts        # Razorpay client
│   └── utils.ts           # Helper functions
├── supabase/              # Database schema and seed files
├── types/                 # TypeScript type definitions
└── public/                # Static assets and product images
```

## Supabase Setup

Run the schema file against your Supabase project:

```bash
# In Supabase SQL editor, run:
# supabase/schema.sql
# supabase/seed-all-products.sql  (optional: seed sample data)
```

Enable Row Level Security and phone auth in the Supabase dashboard.

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Deploy

The site deploys automatically on every push to the main branch.

## Running Tests

```bash
npm test
npm run test:coverage
```

## Documentation

Historical implementation notes and planning documents are archived in [`docs/archive/`](docs/archive/). See [`DEPLOYMENT.md`](DEPLOYMENT.md) for deployment details and [`QUICK-START.md`](QUICK-START.md) for a quick reference.

## License

MIT
