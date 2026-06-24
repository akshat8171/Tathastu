/**
 * Thin re-export — the canonical ProductCard now lives in components/ui/product-card.tsx.
 *
 * This file exists to keep legacy imports like:
 *   import { ProductCard } from '@/components/products/product-card'
 * working without changes.
 *
 * Do NOT add logic here; update components/ui/product-card.tsx instead.
 */
export { ProductCard } from '@/components/ui/product-card'
export type { ProductCardProps, ProductCardData } from '@/components/ui/product-card'
