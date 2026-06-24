# Cart System Architecture

## 🏗️ Component Hierarchy

```
app/layout.tsx
└── CartProvider (Context)
    ├── Header
    │   ├── Cart Button (with badge)
    │   └── CartSidebar
    │       ├── Backdrop Overlay
    │       └── Sliding Panel
    │           ├── Header Section
    │           ├── Banner Strip
    │           ├── Cart Items List
    │           │   └── CartItem
    │           │       ├── Image
    │           │       ├── Details
    │           │       ├── Price
    │           │       └── Quantity Controls
    │           └── Footer
    │               ├── Promo Banner
    │               ├── Total Section
    │               └── Checkout Button
    └── Page Content
        └── AddToCartButton (optional)
```

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    CartProvider                          │
│  (Global State Management)                               │
│                                                          │
│  State:                                                  │
│  - items: CartItem[]                                     │
│  - itemCount: number                                     │
│                                                          │
│  Methods:                                                │
│  - addItem(item)                                         │
│  - removeItem(id)                                        │
│  - updateQuantity(id, qty)                               │
│  - clearCart()                                           │
└────────────┬────────────────────────────────────────────┘
             │
             │ useCart() hook
             │
    ┌────────┴────────┬──────────────┬────────────────┐
    │                 │              │                │
    ▼                 ▼              ▼                ▼
┌─────────┐    ┌─────────────┐  ┌──────────┐  ┌──────────┐
│ Header  │    │ CartSidebar │  │ Product  │  │   Any    │
│         │    │             │  │  Page    │  │Component │
│ Badge:  │    │ Display:    │  │          │  │          │
│ {count} │    │ - items     │  │ Add Item │  │ Use Cart │
└─────────┘    │ - total     │  └──────────┘  └──────────┘
               │ - savings   │
               │             │
               │ Actions:    │
               │ - update    │
               │ - remove    │
               └─────────────┘
```

## 🎯 State Management Flow

### Adding Item to Cart

```
User clicks "Add to Cart"
        ↓
AddToCartButton component
        ↓
Calls useCart().addItem()
        ↓
CartContext updates state
        ↓
All components re-render
        ↓
├─→ Header badge updates
├─→ CartSidebar updates
└─→ Any component using useCart() updates
```

### Opening Cart

```
User clicks cart icon
        ↓
Header sets isCartOpen = true
        ↓
CartSidebar receives isOpen prop
        ↓
Sidebar slides in (transform: translateX(0))
        ↓
Body scroll locked
        ↓
Backdrop overlay appears
```

### Updating Quantity

```
User clicks +/- button
        ↓
CartSidebar calls handleUpdateQuantity()
        ↓
Calls useCart().updateQuantity(id, newQty)
        ↓
CartContext updates item quantity
        ↓
All prices recalculate
        ↓
UI updates automatically
```

## 🗂️ File Dependencies

```
app/layout.tsx
├── imports CartProvider
│
components/layout/header.tsx
├── imports CartSidebar
├── imports useCart
│
components/cart/cart-sidebar.tsx
├── imports useCart
│
components/cart/cart-context.tsx
├── exports CartProvider
├── exports useCart
├── exports CartItem type
├── exports CartContextType
│
components/cart/add-to-cart-button.tsx
├── imports useCart
│
components/cart/index.ts
├── re-exports all cart components
```

## 🎨 Styling Architecture

```
Tailwind CSS Classes
├── Layout
│   ├── fixed positioning
│   ├── z-index layers (backdrop: 40, sidebar: 50)
│   └── responsive widths
│
├── Animations
│   ├── transform transitions (300ms)
│   ├── opacity transitions
│   └── hover effects
│
├── Colors
│   ├── Primary: #8B7B6C
│   ├── Banner: #99A58F
│   ├── Success: #2C874A
│   └── Zinc scale for text
│
└── Responsive
    ├── Mobile: full width
    └── Desktop: 400px width
```

## 🔐 Security & Performance

### Performance Optimizations
- ✅ Minimal re-renders (Context API)
- ✅ No external dependencies
- ✅ Inline SVG icons (no HTTP requests)
- ✅ CSS transitions (GPU accelerated)
- ✅ Conditional rendering

### State Management
- ✅ Single source of truth (Context)
- ✅ Immutable state updates
- ✅ Type-safe with TypeScript
- ✅ Predictable state changes

## 🔄 Lifecycle

### Component Mount
```
1. App loads
2. CartProvider initializes with default items
3. Header subscribes to cart state
4. CartSidebar is rendered but hidden
```

### User Interaction
```
1. User adds item
2. Context state updates
3. All subscribers re-render
4. Animations trigger
5. UI reflects new state
```

### Component Unmount
```
1. User closes cart
2. Body scroll restored
3. Sidebar slides out
4. State persists in Context
```

## 📊 Data Structure

### CartItem Interface
```typescript
interface CartItem {
  id: string              // Unique identifier
  name: string            // Product name
  variant: string         // Size, color, etc.
  price: number           // Current price
  originalPrice: number   // Original price (for savings)
  quantity: number        // Item quantity
  image: string           // Product image URL
}
```

### CartContext State
```typescript
{
  items: CartItem[],      // Array of cart items
  itemCount: number,      // Total items (sum of quantities)
  addItem: Function,      // Add or increment item
  removeItem: Function,   // Remove item by ID
  updateQuantity: Function, // Update item quantity
  clearCart: Function     // Empty cart
}
```

## 🎯 Event Flow

```
┌──────────────────────────────────────────────────────┐
│                   User Actions                        │
└──────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   Add Item      Update Qty      Remove Item
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   CartContext         │
            │   State Update        │
            └───────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
    Header          Sidebar         Other
    Badge           Content       Components
    Updates         Updates        Update
```

## 🚀 Scalability

### Easy to Extend
- ✅ Add new cart methods to Context
- ✅ Create new cart-related components
- ✅ Integrate with backend API
- ✅ Add persistence layer
- ✅ Implement analytics

### Modular Design
- ✅ Components are independent
- ✅ Context is separate from UI
- ✅ Easy to test
- ✅ Easy to maintain

---

This architecture provides a solid foundation for a production-ready shopping cart system!
