# 🎨 Z-Index Hierarchy - Complete Reference

## 📊 Current Z-Index Map

### Layer 10: Cart System (Highest)
```
z-[9999] - Cart Sidebar
z-[9998] - Cart Backdrop
```
**Purpose:** Always on top, no overlaps

---

### Layer 9: Reserved for Future Modals
```
z-[1000-9997] - Available for future use
```
**Purpose:** Critical overlays, alerts, notifications

---

### Layer 8: Navigation & UI Elements
```
z-10 - Banner arrows (homepage)
z-10 - Product gallery arrows
z-10 - Best sellers carousel arrows
z-10 - Reviews section elements
z-10 - Skeleton loaders
```
**Purpose:** Interactive navigation elements

---

### Layer 7: Content Overlays
```
z-2 - Banner content overlay
z-2 - Watch shop overlay
```
**Purpose:** Text and content over images

---

### Layer 6: Base Images
```
z-1 - Banner images
```
**Purpose:** Background images

---

### Layer 5: Header & Footer
```
(default) - Header
(default) - Footer
```
**Purpose:** Main navigation, uses natural stacking

---

### Layer 4: Page Content
```
(default) - All page content
(default) - Product cards
(default) - Text sections
```
**Purpose:** Main content area

---

## 🎯 Z-Index Rules

### DO ✅
1. **Cart System:** Use 9998-9999 (highest)
2. **Critical Modals:** Use 1000-9997
3. **Navigation Elements:** Use 10-100
4. **Content Overlays:** Use 1-10
5. **Default Content:** Use natural stacking (no z-index)

### DON'T ❌
1. **Never exceed 9999** (cart is highest)
2. **Don't use 100-999** (reserved for future)
3. **Don't use negative z-index** (causes issues)
4. **Don't stack unnecessarily** (use natural flow)

---

## 📁 File-by-File Breakdown

### Cart System
**File:** `components/cart/cart-sidebar.tsx`
```tsx
z-[9998] - Backdrop
z-[9999] - Sidebar
```
**Why:** Must be above everything

---

### Homepage Banner
**File:** `components/homepage/banner-section.tsx`
```css
z-index: 1  - Banner images
z-index: 2  - Content overlay
z-index: 10 - Navigation arrows ✅ FIXED
z-index: 10 - Skeleton loader
```
**Why:** Arrows stay below cart

---

### Product Gallery
**File:** `components/products/product-gallery.tsx`
```tsx
z-10 - Left arrow
z-10 - Right arrow
```
**Why:** Navigation within content

---

### Best Sellers
**File:** `components/homepage/best-sellers.tsx`
```tsx
z-10 - Left arrow
z-10 - Right arrow
```
**Why:** Carousel navigation

---

### Watch Shop
**File:** `components/homepage/watch-shop-section.tsx`
```css
z-index: 2 - Content overlay
```
**Why:** Text over image

---

### Reviews
**File:** `components/homepage/reviews-section.tsx`
```css
z-index: 10 - Review elements
```
**Why:** Interactive content

---

## 🔧 How to Add New Elements

### For Navigation Arrows
```tsx
className="... z-10"
```

### For Content Overlays
```tsx
className="... z-2"
```

### For Critical Modals
```tsx
className="... z-[5000]"
```

### For Tooltips/Dropdowns
```tsx
className="... z-50"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Element appears over cart
**Problem:** Z-index too high
**Solution:** Reduce to z-10 or lower

### Issue 2: Arrows not clickable
**Problem:** Z-index too low
**Solution:** Set to z-10

### Issue 3: Content behind overlay
**Problem:** Missing z-index
**Solution:** Add z-2 to overlay

---

## 📊 Visual Hierarchy

```
┌─────────────────────────────────────────────┐
│  Layer 10: Cart (z-9999)                    │ ← Highest
├─────────────────────────────────────────────┤
│  Layer 9: Future Modals (z-1000-9997)       │
├─────────────────────────────────────────────┤
│  Layer 8: Navigation (z-10-100)             │
│  - Arrows                                   │
│  - Buttons                                  │
├─────────────────────────────────────────────┤
│  Layer 7: Overlays (z-1-10)                 │
│  - Text over images                         │
│  - Content overlays                         │
├─────────────────────────────────────────────┤
│  Layer 6: Images (z-1)                      │
├─────────────────────────────────────────────┤
│  Layer 5: Header/Footer (default)           │
├─────────────────────────────────────────────┤
│  Layer 4: Content (default)                 │ ← Lowest
└─────────────────────────────────────────────┘
```

---

## ✅ Current Status

### Fixed Issues
- ✅ Banner arrows (was z-100, now z-10)
- ✅ Cart sidebar (z-9999, highest)
- ✅ Cart backdrop (z-9998)
- ✅ All navigation elements (z-10)

### No Issues
- ✅ Product gallery arrows (z-10)
- ✅ Best sellers arrows (z-10)
- ✅ Reviews section (z-10)
- ✅ Header (default)
- ✅ Footer (default)

---

## 🎯 Testing Checklist

- [x] Cart opens above all elements
- [x] No arrows visible over cart
- [x] Banner arrows clickable
- [x] Product gallery arrows work
- [x] Best sellers carousel works
- [x] Header remains accessible
- [x] No z-index conflicts

---

## 📝 Quick Reference

| Element | Z-Index | Layer |
|---------|---------|-------|
| **Cart Sidebar** | 9999 | 10 |
| **Cart Backdrop** | 9998 | 10 |
| **Future Modals** | 1000-9997 | 9 |
| **Navigation Arrows** | 10 | 8 |
| **Skeleton Loaders** | 10 | 8 |
| **Content Overlays** | 2 | 7 |
| **Images** | 1 | 6 |
| **Header/Footer** | default | 5 |
| **Page Content** | default | 4 |

---

## 🎨 Best Practices

1. **Start Low:** Use lowest z-index possible
2. **Be Consistent:** Same elements = same z-index
3. **Document Changes:** Update this file
4. **Test Thoroughly:** Check all interactions
5. **Avoid Magic Numbers:** Use meaningful values

---

## 🔄 Update History

**2026-02-02:**
- ✅ Fixed banner arrows (z-100 → z-10)
- ✅ Set cart sidebar (z-9999)
- ✅ Set cart backdrop (z-9998)
- ✅ Documented all z-indexes

---

## 🎊 Summary

**Highest:** Cart (z-9999)
**Lowest:** Content (default)

**All elements properly layered!** ✅

---

**Status:** ✅ Complete & Documented

**Last Updated:** February 2, 2026
