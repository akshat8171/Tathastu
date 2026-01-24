# Tathastu Website

A premium e-commerce website for a 3D printing miniature business, built with Next.js, Tailwind CSS, and Supabase. Inspired by the "Rustic Stone" aesthetic with a lifestyle-first approach to product presentation.

**Tagline**: If it exists, we can print it.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Language**: TypeScript
- **Deployment**: Vercel

## Design System

### Color Palette
- **Cream**: `#F5F5DC` - Primary background
- **Charcoal**: `#333333` - Text and accents
- **Sage Green**: `#87A96B` - Accent color
- **Slate Blue**: `#6B8FA8` - Alternative accent

### Typography
- **Headings**: Playfair Display (Bold Serif)
- **Body**: Montserrat (Clean Sans-Serif)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tathastu-website
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
3DPrintWebsite/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Homepage
│   ├── products/          # Product pages
│   ├── about/             # About page
│   └── watch-shop/        # Watch & Shop page
├── components/            # React components
│   ├── layout/            # Header, Footer
│   ├── homepage/          # Homepage sections
│   ├── products/          # Product components
│   └── about/             # About components
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client and types
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript type definitions
├── public/                # Static assets
│   └── images/           # Image resources
└── styles/               # Global styles
```

## Pages

### Homepage (`/`)
- Hero section with featured miniature
- Category navigation icons
- Best sellers carousel
- Watch & Shop section
- About the brand section

### Products (`/products`)
- Product listing page with filters
- Grid layout with product cards
- Category tabs

### Product Detail (`/products/[id]`)
- Product image gallery
- Product information
- Pricing and discounts
- Add to cart / Buy now
- Collapsible sections (Description, Care Guide, Shipping)

### About (`/about`)
- Brand story
- Mission and values
- Artisan workshop imagery

### Watch & Shop (`/watch-shop`)
- Process documentation
- Step-by-step production process
- Build trust through transparency

## Image Resources

See `public/images/README.md` for detailed information about image requirements and generation prompts.

All images should be placed in `public/images/` following the directory structure outlined in the README.

## Supabase Setup

1. Create a new Supabase project
2. Create a `products` table with the following schema:

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  images TEXT[] NOT NULL,
  category TEXT CHECK (category IN ('fantasy', 'sci-fi', 'terrain')) NOT NULL,
  rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  badge TEXT,
  care_guide TEXT,
  shipping_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Enable Row Level Security (RLS) and create policies as needed

## Development

### Build for Production

```bash
npm run build
# or
yarn build
```

### Start Production Server

```bash
npm start
# or
yarn start
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The site will be automatically deployed on every push to the main branch.

## Features

- ✅ Responsive design (mobile-first)
- ✅ Image optimization (WebP, lazy loading)
- ✅ SEO optimization
- ✅ Accessibility (ARIA labels, semantic HTML)
- ✅ Product listing and detail pages
- ✅ Category filtering
- ✅ Shopping cart (to be implemented)
- ✅ Supabase integration ready

## Future Enhancements

- [ ] Shopping cart functionality
- [ ] User authentication
- [ ] Order management
- [ ] Payment integration (Stripe)
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Search functionality
- [ ] Email notifications

## License

MIT
