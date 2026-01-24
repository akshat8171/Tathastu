export type ProductCategory = 'fantasy' | 'sci-fi' | 'terrain' | 'all'
export type ProductLabelType = 'trending' | 'editors-choice' | 'lightning-deal' | 'sold-out' | 'new'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  comparePrice?: number
  discountPercentage?: number
  images: string[]
  secondImageUrl?: string
  category: ProductCategory
  rating: number
  reviewCount: number
  badge?: string
  labelType?: ProductLabelType
  isSoldOut?: boolean
  isTrending?: boolean
  isEditorsChoice?: boolean
  isLightningDeal?: boolean
  careGuide?: string
  shippingInfo?: string
  createdAt?: string
  updatedAt?: string
}

export interface ProductFilters {
  category?: ProductCategory
  minPrice?: number
  maxPrice?: number
  search?: string
}
