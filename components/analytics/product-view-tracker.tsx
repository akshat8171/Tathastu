'use client'

import { useEffect } from 'react'
import { trackViewProduct } from '@/lib/analytics'

interface ProductViewTrackerProps {
  productId: string
  productName: string
  category: string
  price: number
}

export function ProductViewTracker(props: ProductViewTrackerProps) {
  useEffect(() => {
    trackViewProduct(props)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.productId])
  return null
}
