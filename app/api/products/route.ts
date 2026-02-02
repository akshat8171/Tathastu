import { NextRequest, NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import { join } from 'path'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  badge?: string
  category: string
}

// Helper function to get first image from a directory
async function getFirstImageFromFolder(folderPath: string): Promise<string | null> {
  try {
    const files = await readdir(folderPath)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic']
    
    // Prefer jpg/jpeg over webp, then other formats
    const priorityOrder = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic']
    
    // Find first image file, prioritizing jpg/jpeg
    let imageFile = null
    for (const ext of priorityOrder) {
      imageFile = files.find(file => {
        const fileExt = file.toLowerCase().substring(file.lastIndexOf('.'))
        return fileExt === ext && imageExtensions.includes(fileExt)
      })
      if (imageFile) break
    }
    
    // Fallback: find any image file if priority search didn't find one
    if (!imageFile) {
      imageFile = files.find(file => {
        const ext = file.toLowerCase().substring(file.lastIndexOf('.'))
        return imageExtensions.includes(ext)
      })
    }
    
    if (imageFile) {
      // Convert absolute path to public URL path
      // The filesystem returns actual filenames, which may contain special characters
      // We'll use them as-is and let the browser handle encoding when making requests
      const relativePath = folderPath.replace(process.cwd() + '/public', '')
      return `${relativePath}/${imageFile}`.replace(/\\/g, '/')
    }
  } catch (error) {
    console.error(`Error reading folder ${folderPath}:`, error)
  }
  return null
}

// Helper function to generate product name from folder name
function generateProductName(folderName: string, categoryName: string): string {
  // Handle URL-encoded names (e.g., "Hidden%20magnets" -> "Hidden magnets")
  let decoded = decodeURIComponent(folderName)
  
  // Convert camelCase or kebab-case to Title Case
  // e.g., "organizer1" -> "Organizer 1", "lamp2" -> "Lamp 2"
  let cleaned = decoded
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase
    .replace(/-/g, ' ') // kebab-case
    .replace(/(\d+)/g, ' $1 ') // Add space around numbers
    .replace(/\s+/g, ' ') // Multiple spaces to single
    .trim()
  
  // Capitalize first letter of each word
  cleaned = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  // If it's just a number, add category name
  if (/^\d+$/.test(decoded)) {
    const categoryTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1)
    return `${categoryTitle} ${decoded}`
  }
  
  return cleaned || decoded
}

// Scan products directory and return products
async function scanProductsDirectory(category?: string): Promise<Product[]> {
  const products: Product[] = []
  const productsDir = join(process.cwd(), 'public', 'images', 'products')
  
  try {
    // Get all category folders
    const categoryFolders = await readdir(productsDir, { withFileTypes: true })
    
    for (const categoryFolder of categoryFolders) {
      if (!categoryFolder.isDirectory()) continue
      
      const categoryName = categoryFolder.name.toLowerCase()
      
      // Filter by category if specified
      if (category && categoryName !== category.toLowerCase()) continue
      
      const categoryPath = join(productsDir, categoryFolder.name)
      
      // Get all product folders in this category
      const productFolders = await readdir(categoryPath, { withFileTypes: true })
      
      for (const productFolder of productFolders) {
        if (!productFolder.isDirectory()) continue
        
        const productPath = join(categoryPath, productFolder.name)
        const imagePath = await getFirstImageFromFolder(productPath)
        
        if (imagePath) {
          const productName = generateProductName(productFolder.name, categoryFolder.name)
          
          products.push({
            id: `${categoryName}-${productFolder.name}`,
            name: productName,
            price: Math.floor(Math.random() * 2000) + 1000, // Random price between 1000-3000
            originalPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 1000) + 3000 : undefined,
            image: imagePath,
            badge: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'Trending Now' : 'Customer Favourite') : undefined,
            category: categoryName,
          })
        }
      }
    }
  } catch (error) {
    console.error('Error scanning products directory:', error)
  }
  
  return products
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    
    const products = await scanProductsDirectory(category || undefined)
    
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
