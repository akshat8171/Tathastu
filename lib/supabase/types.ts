export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          original_price: number | null
          images: string[]
          category: 'fantasy' | 'sci-fi' | 'terrain'
          rating: number
          review_count: number
          badge: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          original_price?: number | null
          images: string[]
          category: 'fantasy' | 'sci-fi' | 'terrain'
          rating?: number
          review_count?: number
          badge?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          original_price?: number | null
          images?: string[]
          category?: 'fantasy' | 'sci-fi' | 'terrain'
          rating?: number
          review_count?: number
          badge?: string | null
          updated_at?: string
        }
      }
    }
  }
}
