# 🎨 Shopping Cart - Visual Guide

## 🖼️ Complete Visual Walkthrough

---

## 1️⃣ Homepage - Best Sellers Section

### Before Hover
```
┌──────────────────────────────────────────────────┐
│                                                  │
│              BEST SELLERS                        │
│   Popular enough to brag about, subtle enough   │
│              to use daily.                       │
│                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │        │  │        │  │        │            │
│  │  🖼️    │  │  🖼️    │  │  🖼️    │            │
│  │        │  │        │  │        │            │
│  │Product │  │Product │  │Product │            │
│  │₹2,499  │  │₹1,999  │  │₹3,499  │            │
│  └────────┘  └────────┘  └────────┘            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### On Hover
```
┌──────────────────────────────────────────────────┐
│                                                  │
│              BEST SELLERS                        │
│                                                  │
│  ┌────────┐  ┌────────┐  ┌────────┐            │
│  │ 🔥     │  │        │  │        │            │
│  │  🖼️    │  │  🖼️    │  │  🖼️    │            │
│  │        │  │        │  │        │            │
│  │[Add to │  │Product │  │Product │            │
│  │ Cart]  │  │₹1,999  │  │₹3,499  │            │
│  └────────┘  └────────┘  └────────┘            │
│     ↑ Overlay appears                           │
└──────────────────────────────────────────────────┘
```

---

## 2️⃣ Product Detail Page

### Page Layout
```
┌──────────────────────────────────────────────────┐
│  Home / Best Sellers / Ancient Dragon           │ ← Breadcrumbs
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────┐  ┌─────────────────────────┐  │
│  │             │  │                         │  │
│  │   🖼️        │  │  Ancient Dragon         │  │
│  │   Product   │  │  Miniature              │  │
│  │   Gallery   │  │                         │  │
│  │             │  │  ⭐⭐⭐⭐⭐ (45)         │  │
│  │   [Image]   │  │                         │  │
│  │   [Image]   │  │  ₹2,499  ₹2,999        │  │
│  │   [Image]   │  │  17% off               │  │
│  │             │  │                         │  │
│  └─────────────┘  │  Quantity: [-] 1 [+]   │  │
│                   │                         │  │
│                   │  [  ADD TO CART  ]      │  │
│                   │  [   BUY IT NOW   ]     │  │
│                   │                         │  │
│                   │  📦 Delivery Info       │  │
│                   │  💳 Payment Methods     │  │
│                   │  📝 Description         │  │
│                   └─────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

### After Clicking "ADD TO CART"
```
┌──────────────────────────────────────────────────┐
│                                                  │
│  ┌─────────────┐  ┌─────────────────────────┐  │
│  │             │  │                         │  │
│  │   🖼️        │  │  Quantity: [-] 1 [+]   │  │
│  │             │  │                         │  │
│  └─────────────┘  │  [   ADDING... ⏳  ]   │  │ ← Loading
│                   │  [   BUY IT NOW   ]     │  │
│                   │                         │  │
│                   └─────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 3️⃣ Cart Sidebar (Closed)

### Header with Cart Icon
```
┌──────────────────────────────────────────────────┐
│  ☰  [LAYERIX LOGO]                    🛒 2      │
│                                         ↑        │
│                                    Cart Badge    │
└──────────────────────────────────────────────────┘
```

---

## 4️⃣ Cart Sidebar (Open)

### Desktop View
```
┌────────────────────────────┬─────────────────────┐
│                            │                     │
│                            │  YOUR CART (2)  ✕   │
│                            │─────────────────────│
│      Main Content          │ Express Delivery!   │
│      (Blurred with         │─────────────────────│
│       backdrop)            │                     │
│                            │ 🖼️ Midnight Meadow │
│                            │    Black            │
│                            │    ₹1,100  ₹1,400  │
│                            │    [🗑️] [-] 1 [+]  │
│                            │                     │
│                            │ 🖼️ Rustic Tea Set  │
│                            │    Sky Mist         │
│                            │    ₹899    ₹1,299  │
│                            │    [🗑️] [-] 2 [+]  │
│                            │                     │
│                            │ 🎟️ View Coupons →  │
│                            │                     │
│                            │─────────────────────│
│                            │ Free Sample!        │
│                            │                     │
│                            │ Total: ₹2,898       │
│                            │ Saved: ₹1,001!      │
│                            │                     │
│                            │ [   CHECKOUT   ]    │
│                            │                     │
│                            │ Powered by Cashfree │
└────────────────────────────┴─────────────────────┘
   ↑ Backdrop overlay         ↑ 400px wide
   ↑ 40px left margin for layered effect
```

### Mobile View
```
┌─────────────────────────────┐
│ YOUR CART (2)           ✕   │
│─────────────────────────────│
│ Express Delivery Banner     │
│─────────────────────────────│
│                             │
│ 🖼️ Midnight Meadow         │
│    Black                    │
│    ₹1,100  ₹1,400          │
│    [🗑️] [-] 1 [+]          │
│                             │
│ 🖼️ Rustic Tea Set          │
│    Sky Mist                 │
│    ₹899    ₹1,299          │
│    [🗑️] [-] 2 [+]          │
│                             │
│ 🎟️ View Coupons →          │
│                             │
│─────────────────────────────│
│ Free Sample Banner          │
│                             │
│ Total: ₹2,898               │
│ Saved: ₹1,001!              │
│                             │
│ [     CHECKOUT      ]       │
│                             │
│ Powered by shopflo          │
└─────────────────────────────┘
  ↑ Full width on mobile
```

---

## 5️⃣ Animation Sequence

### Opening Cart
```
Frame 1 (0ms):
Cart is off-screen left
Backdrop opacity: 0

Frame 2 (100ms):
Cart sliding in
Backdrop opacity: 0.3

Frame 3 (200ms):
Cart sliding in
Backdrop opacity: 0.7

Frame 4 (300ms):
Cart fully visible
Backdrop opacity: 1.0
```

### Closing Cart
```
Frame 1 (0ms):
Cart fully visible
Backdrop opacity: 1.0

Frame 2 (100ms):
Cart sliding out
Backdrop opacity: 0.7

Frame 3 (200ms):
Cart sliding out
Backdrop opacity: 0.3

Frame 4 (300ms):
Cart off-screen
Backdrop opacity: 0
```

---

## 6️⃣ Button States

### Product Detail "ADD TO CART" Button

**Normal State:**
```
┌─────────────────────────────┐
│      ADD TO CART            │
│                             │
└─────────────────────────────┘
Border: 2px solid charcoal
Background: transparent
Text: charcoal
Cursor: pointer
```

**Hover State:**
```
┌─────────────────────────────┐
│      ADD TO CART            │
│                             │
└─────────────────────────────┘
Border: 2px solid charcoal
Background: charcoal
Text: white
Cursor: pointer
```

**Loading State:**
```
┌─────────────────────────────┐
│   ⏳ ADDING...              │
│                             │
└─────────────────────────────┘
Border: 2px solid charcoal
Background: transparent
Text: charcoal
Cursor: not-allowed
Disabled: true
```

### Product Card "Add to Cart" Overlay

**Normal State:**
```
┌─────────────────┐
│   🛒 Add to     │
│      Cart       │
└─────────────────┘
Background: white
Text: charcoal
Opacity: 0.95
```

**Loading State:**
```
┌─────────────────┐
│   ⏳ Adding...  │
│                 │
└─────────────────┘
Background: white
Text: charcoal
Spinner: animated
```

---

## 7️⃣ Cart Item Card

### Layout
```
┌─────────────────────────────────────────┐
│  ┌────┐                                 │
│  │ 🖼️ │  Midnight Meadow Platter       │
│  │    │  Black                          │
│  └────┘  ₹1,100  ₹1,400                │
│          [🗑️] [-] 1 [+]                │
└─────────────────────────────────────────┘
```

### Components
- **Image:** 72x72px, rounded corners
- **Name:** Text truncated to 1 line
- **Variant:** Small gray text
- **Price:** Bold with strikethrough original
- **Actions:** Trash + Quantity selector

---

## 8️⃣ Responsive Breakpoints

### Mobile (< 768px)
```
Cart Width: 100vw (full screen)
Image Size: 72x72px
Font Sizes: Smaller
Padding: Compact
Touch Targets: Larger
```

### Desktop (≥ 768px)
```
Cart Width: 400px
Image Size: 72x72px
Font Sizes: Standard
Padding: Comfortable
Hover Effects: Enabled
```

---

## 9️⃣ Color Reference

### Primary Colors
```
#8B7B6C - Primary Brown (Buttons)
#99A58F - Sage Green (Banner)
#493E3E - Dark Brown (Footer)
#2C874A - Success Green (Savings)
```

### Text Colors
```
#3F3F46 - Zinc 700 (Primary text)
#71717A - Zinc 500 (Secondary text)
#A1A1AA - Zinc 400 (Tertiary text)
#E4E4E7 - Zinc 200 (Borders)
```

### Background Colors
```
#FFFFFF - White (Main)
#F4F4F5 - Zinc 100 (Card backgrounds)
#E4E4E7 - Zinc 200 (Dividers)
#00000066 - Black 40% (Backdrop)
```

---

## 🎯 Interactive Elements

### Clickable Areas

1. **Cart Icon (Header)**
   ```
   Click → Opens cart sidebar
   ```

2. **Backdrop Overlay**
   ```
   Click → Closes cart sidebar
   ```

3. **Close Button (X)**
   ```
   Click → Closes cart sidebar
   ```

4. **Add to Cart (Product Page)**
   ```
   Click → Adds item + shows loading
   ```

5. **Add to Cart (Product Card)**
   ```
   Click → Adds item + shows loading
   ```

6. **Quantity +/-**
   ```
   Click → Increases/decreases quantity
   ```

7. **Remove Item (Trash)**
   ```
   Click → Removes item from cart
   ```

8. **Checkout Button**
   ```
   Click → Proceeds to checkout (ready for integration)
   ```

---

## 🎬 Animation Timeline

### Cart Open Animation (300ms)
```
0ms:   transform: translateX(-100%)
       opacity: 0 (backdrop)

100ms: transform: translateX(-66%)
       opacity: 0.33 (backdrop)

200ms: transform: translateX(-33%)
       opacity: 0.66 (backdrop)

300ms: transform: translateX(0)
       opacity: 1.0 (backdrop)
       ✅ Animation complete
```

### Add to Cart Button (500-800ms)
```
0ms:   Text: "ADD TO CART"
       Icon: 🛒
       State: enabled

0ms:   User clicks
       ↓
10ms:  Text: "ADDING..."
       Icon: ⏳ (spinning)
       State: disabled

500ms: Item added to cart
       ↓
510ms: Text: "ADD TO CART"
       Icon: 🛒
       State: enabled
       ✅ Animation complete
```

---

## 📐 Dimensions Reference

### Cart Sidebar
```
Desktop:
- Width: 400px
- Height: 100vh
- Position: Fixed left

Mobile:
- Width: 100vw
- Height: 100vh
- Position: Fixed left
```

### Product Images in Cart
```
Size: 72x72px
Border: 1px solid #E4E4E7
Border Radius: 8px
Object Fit: cover
```

### Buttons
```
Quantity Buttons:
- Width: 32px (8 * 4px)
- Height: 28px (7 * 4px)

Checkout Button:
- Height: 56px (14 * 4px)
- Width: 100%
- Border Radius: 12px
```

---

## 🎨 Typography Scale

### Cart Header
```
Font: 12px
Weight: 600
Letter Spacing: 0.04em
Text: "YOUR CART"
```

### Product Name
```
Font: 12px
Weight: 500
Letter Spacing: -0.01em
Line Height: 18px
```

### Prices
```
Current Price:
- Font: 14px
- Weight: 600

Original Price:
- Font: 12px
- Weight: 400
- Decoration: line-through
```

### Total
```
Font: 18px
Weight: 600
Letter Spacing: -0.01em
```

---

## 🎯 Z-Index Layers

```
Layer 5: Cart Sidebar (z-50)
Layer 4: Backdrop (z-40)
Layer 3: Header (z-30)
Layer 2: Product Cards (z-20)
Layer 1: Page Content (z-10)
```

---

## 📱 Touch Targets (Mobile)

```
Minimum Touch Target: 44x44px

✅ Cart Icon: 48x48px
✅ Close Button: 44x44px
✅ Quantity Buttons: 44x44px
✅ Remove Button: 44x44px
✅ Checkout Button: 56x full width
```

---

## 🎨 Hover Effects

### Desktop Only

1. **Cart Icon**
   ```
   Normal: opacity 1.0
   Hover: background gray-100
   ```

2. **Close Button**
   ```
   Normal: transparent
   Hover: background gray-100
   ```

3. **Quantity Buttons**
   ```
   Normal: transparent
   Hover: background gray-100
   ```

4. **Remove Button**
   ```
   Normal: transparent
   Hover: background gray-200
   ```

5. **Checkout Button**
   ```
   Normal: #8B7B6C
   Hover: #7a6b5d (darker)
   ```

---

## 🎭 Empty State

### When Cart is Empty
```
┌─────────────────────┐
│ YOUR CART (0)   ✕   │
│─────────────────────│
│                     │
│                     │
│      🛒             │
│   (large icon)      │
│                     │
│  Your cart is       │
│     empty           │
│                     │
│                     │
└─────────────────────┘
```

---

## 🎨 Loading States

### Button Loading
```
[  ⏳ ADDING...  ]
    ↑ Spinning animation
```

### Spinner SVG
```
<svg className="animate-spin">
  <circle /> ← Faded background
  <path />   ← Animated foreground
</svg>

Animation: 1s linear infinite
```

---

## 📏 Spacing System

```
Gap between items: 20px (gap-5)
Padding inside cart: 12px (p-3)
Margin around sections: 12px (space-y-3)
Border radius: 8-12px
```

---

## 🎯 Accessibility

### ARIA Labels
```
Cart Button: "Shopping cart"
Close Button: "Close cart"
Decrease Qty: "Decrease quantity"
Increase Qty: "Increase quantity"
Remove Item: "Remove item"
```

### Keyboard Navigation
```
Tab: Move between elements
Enter/Space: Activate button
Escape: Close cart (optional)
```

---

## 🎨 Design Tokens

### Border Radius
```
Small: 4px (buttons)
Medium: 8px (cards, inputs)
Large: 12px (containers)
XLarge: 16px (modals)
```

### Shadows
```
Small: 0 1px 2px rgba(0,0,0,0.05)
Medium: 0 0 10px rgba(0,0,0,0.1)
Large: 0 10px 15px rgba(0,0,0,0.1)
```

### Transitions
```
Fast: 150ms
Normal: 300ms
Slow: 500ms

Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

---

## 🎊 Final Result

Your cart now has:
- ✅ Beautiful sliding animation
- ✅ Professional design
- ✅ Smooth interactions
- ✅ Perfect responsiveness
- ✅ Accessible interface
- ✅ Production-ready code

---

**Ready to use! Test it now! 🚀**

```bash
npm run dev
# Visit http://localhost:3000
# Add products to cart
# Enjoy! 🎉
```
