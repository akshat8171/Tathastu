# Shopping Cart Implementation Guide

## 🎯 Overview

This guide explains the complete shopping cart implementation with a sliding sidebar that appears from the left when users click the cart button in the header.

## 📁 File Structure

```
components/
├── cart/
│   ├── cart-sidebar.tsx          # Main cart UI component
│   ├── cart-context.tsx           # Global cart state management
│   ├── add-to-cart-button.tsx    # Reusable add to cart button
│   └── README.md                  # Component documentation
├── layout/
│   └── header.tsx                 # Updated with cart integration
app/
├── layout.tsx                     # Root layout with CartProvider
└── cart-demo/
    └── page.tsx                   # Demo page showcasing cart
```

## 🚀 Quick Start

### 1. View the Demo

Navigate to `/cart-demo` in your browser to see the cart in action:

```bash
npm run dev
# Visit http://localhost:3000/cart-demo
```

### 2. Click Cart Button

Click the cart icon in the header (top right) to open the cart sidebar.

### 3. Test Features

- ✅ Add items to cart from demo page
- ✅ Increase/decrease quantities
- ✅ Remove items
- ✅ View real-time price updates
- ✅ See savings calculations

## 🎨 Design Features

### Visual Elements

1. **Sliding Animation**
   - Slides in from the left
   - 300ms smooth transition
   - Backdrop overlay with blur effect

2. **Header Section**
   - Cart count badge
   - Close button (X icon)
   - Banner strip with promotional message

3. **Cart Items**
   - Product image (72x72px)
   - Product name and variant
   - Price with original price strikethrough
   - Quantity selector with +/- buttons
   - Remove item button (trash icon)

4. **Footer Section**
   - Promotional banner
   - Estimated total with savings
   - Checkout button
   - "Powered by Shopflo" branding

### Color Scheme

```css
Primary: #8B7B6C (Brown/Taupe)
Banner: #99A58F (Sage Green)
Footer Banner: #493E3E (Dark Brown)
Success: #2C874A (Green)
Text: Zinc scale (400-900)
```

## 💻 Implementation Details

### Cart Context (State Management)

The cart uses React Context API for global state:

```tsx
// components/cart/cart-context.tsx
interface CartItem {
  id: string
  name: string
  variant: string
  price: number
  originalPrice: number
  quantity: number
  image: string
}
```

**Available Methods:**
- `addItem(item)` - Add new item or increase quantity
- `removeItem(id)` - Remove item from cart
- `updateQuantity(id, quantity)` - Update item quantity
- `clearCart()` - Empty the cart
- `itemCount` - Total items in cart

### Cart Sidebar Component

**Props:**
- `isOpen: boolean` - Controls visibility
- `onClose: () => void` - Close callback

**Features:**
- Body scroll lock when open
- Click outside to close
- Smooth animations
- Responsive design

### Header Integration

The header component:
1. Uses `useCart()` hook to get item count
2. Manages cart open/close state
3. Displays cart badge with item count
4. Renders `<CartSidebar />` component

## 🔧 Customization Guide

### Change Slide Direction (Right Side)

In `cart-sidebar.tsx`:

```tsx
// Change from left to right
className={`
  fixed top-0 right-0 h-full  // Change left-0 to right-0
  ${isOpen ? 'translate-x-0' : 'translate-x-full'}  // Change -translate-x-full
`}
```

### Modify Colors

```tsx
// Banner strip
<div className="bg-[#YOUR_COLOR] text-white ...">

// Checkout button
<button className="bg-[#YOUR_COLOR] hover:bg-[#YOUR_HOVER_COLOR] ...">
```

### Adjust Width

```tsx
// Desktop width
className="... md:w-[400px] ..."  // Change 400px to your preferred width
```

### Custom Animations

```tsx
// Change animation duration
className="... transition-transform duration-300 ..."  // Change 300 to your value
```

## 📱 Responsive Behavior

### Mobile (< 768px)
- Full width sidebar
- Touch-friendly buttons
- Optimized spacing

### Desktop (≥ 768px)
- Fixed 400px width
- Hover effects
- Larger touch targets

## 🎯 Usage Examples

### Basic Add to Cart

```tsx
import { useCart } from '@/components/cart/cart-context'

function ProductCard() {
  const { addItem } = useCart()
  
  const handleAdd = () => {
    addItem({
      id: 'product-1',
      name: 'Product Name',
      variant: 'Size M',
      price: 1000,
      originalPrice: 1500,
      quantity: 1,
      image: '/path/to/image.jpg'
    })
  }
  
  return <button onClick={handleAdd}>Add to Cart</button>
}
```

### Using AddToCartButton Component

```tsx
import { AddToCartButton } from '@/components/cart/add-to-cart-button'

function ProductCard({ product }) {
  return (
    <AddToCartButton
      product={product}
      className="w-full"
      onAddSuccess={() => console.log('Added!')}
    />
  )
}
```

### Open Cart Programmatically

```tsx
import { useState } from 'react'
import { CartSidebar } from '@/components/cart/cart-sidebar'

function MyComponent() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  
  return (
    <>
      <button onClick={() => setIsCartOpen(true)}>
        View Cart
      </button>
      
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </>
  )
}
```

## 🔒 Best Practices

1. **Always wrap app with CartProvider**
   ```tsx
   // app/layout.tsx
   <CartProvider>
     <YourApp />
   </CartProvider>
   ```

2. **Use the useCart hook for cart operations**
   ```tsx
   const { addItem, removeItem, items } = useCart()
   ```

3. **Handle loading states**
   ```tsx
   const [isAdding, setIsAdding] = useState(false)
   ```

4. **Provide user feedback**
   - Show success messages
   - Display loading spinners
   - Animate cart badge

## 🐛 Troubleshooting

### Cart not opening?
- Check if `CartProvider` is wrapping your app
- Verify `isOpen` state is being updated
- Check z-index conflicts

### Items not persisting?
- Cart state is in-memory only
- To persist, add localStorage integration
- Consider using a state management library

### Styling issues?
- Ensure Tailwind CSS is properly configured
- Check for conflicting CSS
- Verify all required classes are available

## 🚀 Future Enhancements

### Recommended Features

1. **Persistence**
   ```tsx
   // Save to localStorage
   useEffect(() => {
     localStorage.setItem('cart', JSON.stringify(items))
   }, [items])
   ```

2. **Animations**
   - Item add animation
   - Quantity change animation
   - Cart badge bounce

3. **Features**
   - Coupon codes
   - Shipping calculator
   - Product recommendations
   - Wishlist integration

4. **Analytics**
   - Track cart additions
   - Monitor abandonment
   - Conversion tracking

## 📚 Additional Resources

- [React Context API](https://react.dev/reference/react/useContext)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Support

For issues or questions:
1. Check the component README
2. Review the demo page
3. Inspect browser console for errors
4. Check Tailwind configuration

---

**Last Updated:** February 2, 2026
**Version:** 1.0.0
