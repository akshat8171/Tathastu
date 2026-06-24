# 🛒 Cart Quick Reference Card

## 🚀 Getting Started (30 seconds)

```bash
# 1. Start dev server
npm run dev

# 2. Visit demo
http://localhost:3000/cart-demo

# 3. Click cart icon in header or "Add to Cart" button
```

---

## 📦 Import Statements

```tsx
// Import cart hook
import { useCart } from '@/components/cart/cart-context'

// Import cart sidebar
import { CartSidebar } from '@/components/cart/cart-sidebar'

// Import add to cart button
import { AddToCartButton } from '@/components/cart/add-to-cart-button'

// Import everything
import { useCart, CartSidebar, AddToCartButton } from '@/components/cart'
```

---

## 🎯 Common Tasks

### Open/Close Cart

```tsx
const [isCartOpen, setIsCartOpen] = useState(false)

// Open
setIsCartOpen(true)

// Close
setIsCartOpen(false)

// Toggle
setIsCartOpen(!isCartOpen)
```

### Add Item

```tsx
const { addItem } = useCart()

addItem({
  id: '1',
  name: 'Product Name',
  variant: 'Size/Color',
  price: 1000,
  originalPrice: 1500,
  quantity: 1,
  image: '/path/to/image.jpg'
})
```

### Remove Item

```tsx
const { removeItem } = useCart()

removeItem('item-id')
```

### Update Quantity

```tsx
const { updateQuantity } = useCart()

updateQuantity('item-id', 5)
```

### Get Cart Info

```tsx
const { items, itemCount } = useCart()

console.log(items)      // Array of cart items
console.log(itemCount)  // Total number of items
```

---

## 🎨 Styling Cheat Sheet

### Colors

```tsx
// Primary button
bg-[#8B7B6C] hover:bg-[#7a6b5d]

// Banner strip
bg-[#99A58F] text-white

// Footer banner
bg-[#493E3E] text-white

// Success/Green
text-green-600 bg-green-100

// Text colors
text-zinc-700  // Dark text
text-zinc-500  // Medium text
text-zinc-400  // Light text
```

### Common Classes

```tsx
// Slide from left
fixed top-0 left-0 h-full
transform transition-transform duration-300
translate-x-0 | -translate-x-full

// Backdrop
fixed inset-0 bg-black/40 z-40

// Button
px-6 py-3 rounded-lg font-semibold
transition-colors

// Card
bg-white rounded-xl shadow-md p-4
```

---

## 🔧 Configuration

### Change Width

```tsx
// In cart-sidebar.tsx
className="... md:w-[400px] ..."
// Change 400px to your desired width
```

### Change Animation Speed

```tsx
// In cart-sidebar.tsx
className="... duration-300 ..."
// Change 300 to milliseconds (e.g., 500)
```

### Change Slide Direction

```tsx
// For right side instead of left
className="fixed top-0 right-0 ..."  // Change left-0 to right-0
className="... translate-x-full ..."  // Change -translate-x-full
```

---

## 🐛 Quick Fixes

### Cart Not Opening?

```tsx
// Check if CartProvider is in layout.tsx
<CartProvider>
  <YourApp />
</CartProvider>
```

### Badge Not Updating?

```tsx
// Make sure you're using the hook
const { itemCount } = useCart()
```

### Items Not Persisting?

```tsx
// Cart is in-memory. To persist:
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(items))
}, [items])
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile (default)
className="w-full"

// Desktop (≥ 768px)
className="md:w-[400px]"

// Tablet (≥ 640px)
className="sm:w-[350px]"

// Large Desktop (≥ 1024px)
className="lg:w-[450px]"
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Tab` | Navigate through cart |
| `Enter` | Activate button |
| `Esc` | Close cart (if implemented) |
| `Space` | Activate button |

---

## 🎯 TypeScript Types

```tsx
interface CartItem {
  id: string
  name: string
  variant: string
  price: number
  originalPrice: number
  quantity: number
  image: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
}
```

---

## 📊 State Flow

```
User Action
    ↓
Component calls useCart()
    ↓
Context updates state
    ↓
All components re-render
    ↓
UI updates
```

---

## 🔗 File Locations

```
components/cart/cart-sidebar.tsx       # Main UI
components/cart/cart-context.tsx       # State
components/cart/add-to-cart-button.tsx # Button
components/layout/header.tsx           # Header
app/layout.tsx                         # Provider
app/cart-demo/page.tsx                 # Demo
```

---

## 📚 Documentation Links

| Document | Purpose |
|----------|---------|
| `README_CART.md` | Main documentation |
| `CART_SUMMARY.md` | Quick overview |
| `CART_IMPLEMENTATION_GUIDE.md` | Detailed guide |
| `CART_ARCHITECTURE.md` | System design |
| `CART_TESTING_CHECKLIST.md` | Testing |

---

## 💡 Pro Tips

1. **Always wrap app with `CartProvider`**
2. **Use `useCart()` hook for all cart operations**
3. **Test on mobile and desktop**
4. **Check console for errors**
5. **Customize colors to match your brand**

---

## 🎨 Example: Complete Product Card

```tsx
'use client'

import { AddToCartButton } from '@/components/cart/add-to-cart-button'

export function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4">
      <img src={product.image} alt={product.name} />
      <h3 className="font-bold">{product.name}</h3>
      <p className="text-gray-600">{product.variant}</p>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">
          ₹{product.price}
        </span>
        <span className="text-gray-400 line-through">
          ₹{product.originalPrice}
        </span>
      </div>
      <AddToCartButton 
        product={product}
        className="w-full mt-4"
      />
    </div>
  )
}
```

---

## 🚨 Common Errors

### "Cannot read property 'items' of undefined"
**Fix:** Wrap app with `<CartProvider>`

### "useCart must be used within a CartProvider"
**Fix:** Ensure component is child of `<CartProvider>`

### Cart not sliding
**Fix:** Check Tailwind classes and transitions

### Badge showing 0
**Fix:** Verify `useCart()` hook is called in header

---

## ✅ Checklist Before Production

- [ ] Tested on mobile and desktop
- [ ] No console errors
- [ ] All animations smooth
- [ ] Prices calculate correctly
- [ ] Accessible with keyboard
- [ ] Works in all browsers
- [ ] Documentation reviewed
- [ ] Code is clean

---

**Print this page for quick reference! 📄**

*Version 1.0.0 | February 2, 2026*
