import { supabase, Product } from './client'

/**
 * Get all active products
 */
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data || []
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products by category:', error)
    return []
  }

  return data || []
}

/**
 * Get single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data
}

/**
 * Get featured products (trending, editors-choice, etc.)
 */
export async function getFeaturedProducts(labelType?: string): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)

  if (labelType) {
    query = query.eq('label_type', labelType)
  } else {
    query = query.not('label_type', 'is', null)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching featured products:', error)
    return []
  }

  return data || []
}

/**
 * Search products
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching products:', error)
    return []
  }

  return data || []
}

/**
 * Update product stock
 */
export async function updateProductStock(
  productId: string,
  quantity: number
): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .update({ stock_quantity: quantity })
    .eq('id', productId)

  if (error) {
    console.error('Error updating product stock:', error)
    return false
  }

  return true
}

/**
 * Check product availability
 */
export async function checkProductAvailability(
  productId: string,
  quantity: number
): Promise<boolean> {
  const product = await getProductById(productId)
  
  if (!product) return false
  if (product.is_sold_out) return false
  if (product.stock_quantity < quantity) return false

  return true
}
