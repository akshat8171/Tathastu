# 3D Printing Miniature Website - Development Plan

## Project Overview
Building a premium e-commerce website for a 3D printing miniature business, inspired by the "Rustic Stone" aesthetic with a lifestyle-first approach.

## Tech Stack
- **Frontend**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Node.js
- **Database**: Supabase
- **Deployment**: Vercel

## Design System

### Color Palette
- **Cream**: `#F5F5DC` - Primary background
- **Charcoal**: `#333333` - Text and accents
- **Sage Green**: `#87A96B` - Accent color (alternative: Slate Blue `#6B8FA8`)

### Typography
- **Headings**: Playfair Display (Bold Serif)
- **Body**: Montserrat (Clean Sans-Serif)

### Design Principles
- Lifestyle-first product presentation
- Premium, rustic aesthetic
- High-quality imagery focus
- Clean, minimalist layout with ample white space

## Project Structure

```
3DPrintWebsite/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── products/
│   │   ├── page.tsx            # Product listing page
│   │   └── [id]/
│   │       └── page.tsx        # Product detail page
│   ├── about/
│   │   └── page.tsx            # About the brand page
│   └── watch-shop/
│       └── page.tsx            # Watch & Shop interactive page
├── components/
│   ├── layout/
│   │   ├── header.tsx          # Site header with navigation
│   │   └── footer.tsx          # Site footer
│   ├── homepage/
│   │   ├── hero-section.tsx    # Homepage hero banner
│   │   ├── category-icons.tsx  # Product category icons
│   │   └── watch-shop-section.tsx # Watch & Shop section
│   ├── products/
│   │   ├── product-card.tsx    # Product card component
│   │   ├── product-gallery.tsx # Product image gallery
│   │   └── product-info.tsx    # Product information section
│   └── about/
│       └── brand-story.tsx     # About the brand component
├── public/
│   └── images/
│       ├── hero/
│       │   └── hero-banner.jpg
│       ├── categories/
│       │   ├── fantasy-warrior.jpg
│       │   ├── terrain-piece.jpg
│       │   └── sci-fi-mech.jpg
│       ├── watch-shop/
│       │   ├── printer-nozzle.jpg
│       │   ├── removing-supports.jpg
│       │   └── texture-closeup.jpg
│       ├── products/
│       │   └── [product-images]
│       └── about/
│           └── artisan-workshop.jpg
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Supabase client
│   │   └── types.ts            # Database types
│   └── utils.ts                # Utility functions
├── types/
│   └── product.ts              # Product type definitions
└── styles/
    └── globals.css             # Global styles

```

## Pages & Components

### 1. Homepage (`app/page.tsx`)
- **Hero Section**: Large banner with hand-painted miniature, establishing the vibe
- **Category Icons**: Circular navigation icons for genre/scale
- **Watch & Shop Section**: Process showcase grid
- **Best Sellers**: Product carousel
- **About the Brand**: Brief brand story section

### 2. Product Listing Page (`app/products/page.tsx`)
- Grid layout of product cards
- Filter by category/genre/scale
- Clean, art-gallery style presentation
- Products on pedestals (grey resin to show detail)

### 3. Product Detail Page (`app/products/[id]/page.tsx`)
- Large product image carousel
- Product information (title, price, description)
- Customer reviews/ratings
- Add to cart / Buy now buttons
- Related products section
- Promotional offers section
- Delivery information
- Payment methods
- Collapsible sections (Description, Care Guide, Shipping)

### 4. About Page (`app/about/page.tsx`)
- Brand story section
- Artisan workshop imagery
- Craftsmanship focus
- Mission and values

### 5. Watch & Shop Page (`app/watch-shop/page.tsx`)
- Interactive process showcase
- Video/image grid of production process
- Build trust through transparency

## Image Resources

All images should be placed in `public/images/` with the following structure:
- High-resolution (8K where possible)
- Lifestyle-first presentation
- Real-world settings (gaming tables, bookshelves)
- Close-ups to highlight detail and texture

## Implementation Phases

1. **Phase 1**: Project setup and configuration
2. **Phase 2**: Core layout components (Header, Footer)
3. **Phase 3**: Homepage components
4. **Phase 4**: Product pages
5. **Phase 5**: About page
6. **Phase 6**: Supabase integration
7. **Phase 7**: Polish and optimization

## Key Features

- Responsive design (mobile-first)
- Image optimization (WebP, lazy loading)
- SEO optimization
- Accessibility (ARIA labels, semantic HTML)
- Performance optimization
- Error handling and loading states
