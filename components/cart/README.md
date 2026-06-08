# Shopping Cart Component

A modern, sliding cart sidebar component with a smooth animation that slides in from the left side of the screen.

## Features

- ✅ Sliding sidebar animation from left
- ✅ Backdrop overlay with click-to-close
- ✅ Product quantity management (increase/decrease)
- ✅ Remove items from cart
- ✅ Real-time price calculations
- ✅ Savings display
- ✅ Responsive design (mobile & desktop)
- ✅ Context API for global cart state
- ✅ Body scroll lock when cart is open
- ✅ Smooth transitions and animations

## Components

### 1. `CartProvider`
Context provider that manages cart state globally.

**Location:** `components/cart/cart-context.tsx`

**Usage:**
```tsx
import { CartProvider } from '@/components/cart/cart-context'

// Wrap your app with CartProvider
<CartProvider>
  <YourApp />
</CartProvider>
```

### 2. `CartSidebar`
The main cart UI component that slides in from the left.

**Location:** `components/cart/cart-sidebar.tsx`

**Props:**
- `isOpen` (boolean): Controls whether the cart is visible
- `onClose` (function): Callback function to close the cart

**Usage:**
```tsx
import { CartSidebar } from '@/components/cart/cart-sidebar'

const [isCartOpen, setIsCartOpen] = useState(false)

<CartSidebar 
  isOpen={isCartOpen} 
  onClose={() => setIsCartOpen(false)} 
/>
```

### 3. `useCart` Hook
Custom hook to access cart functionality anywhere in your app.

**Available Methods:**
- `items`: Array of cart items
- `addItem(item)`: Add a new item to cart
- `removeItem(id)`: Remove item by ID
- `updateQuantity(id, quantity)`: Update item quantity
- `clearCart()`: Remove all items
- `itemCount`: Total number of items in cart

**Usage:**
```tsx
import { useCart } from '@/components/cart/cart-context'

function MyComponent() {
  const { items, addItem, removeItem, itemCount } = useCart()
  
  // Use cart methods
  const handleAddToCart = () => {
    addItem({
      id: '1',
      name: 'Product Name',
      variant: 'Color/Size',
      price: 1000,
      originalPrice: 1500,
      quantity: 1,
      image: '/path/to/image.jpg'
    })
  }
  
  return <button onClick={handleAddToCart}>Add to Cart ({itemCount})</button>
}
```

## Styling

The component uses Tailwind CSS for styling. Key design elements:

- **Width:** Full width on mobile, 400px on desktop
- **Animation:** Smooth slide-in from left (300ms)
- **Colors:** Customizable via Tailwind classes
- **Z-index:** 
  - Backdrop: `z-40`
  - Sidebar: `z-50`

## Customization

### Change Slide Direction
To make the cart slide from the right instead:

```tsx
// In cart-sidebar.tsx, change:
className={`... ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}

// To:
className={`... right-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
```

### Modify Colors
Update the banner strip colors:
```tsx
<div className="bg-[#99A58F] text-white ...">
  Want Express Delivery? WhatsApp Us Now!
</div>
```

### Change Checkout Button Style
```tsx
<button className="... bg-[#8B7B6C] hover:bg-[#7a6b5d] ...">
  CHECKOUT
</button>
```

## Integration Example

Here's a complete example of integrating the cart into a product page:

```tsx
'use client'

import { useCart } from '@/components/cart/cart-context'
import { useState } from 'react'

export function ProductCard({ product }) {
  const { addItem } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      variant: product.selectedVariant,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: 1,
      image: product.image
    })
    
    // Optionally open cart after adding
    setIsCartOpen(true)
  }
  
  return (
    <div>
      <button onClick={handleAddToCart}>
        Add to Cart
      </button>
      
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </div>
  )
}
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Body scroll is locked when cart is open to prevent background scrolling
- Smooth CSS transitions for optimal performance
- No external dependencies (uses native SVG icons)

## Future Enhancements

Potential features to add:
- [ ] Persist cart to localStorage
- [ ] Add animations for item add/remove
- [ ] Implement coupon code functionality
- [ ] Add shipping calculator
- [ ] Integrate with payment gateway
- [ ] Add product recommendations/upsells
