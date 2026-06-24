# Shopping Cart Testing Checklist

## ✅ Pre-Testing Setup

- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Start development server with `npm run dev`
- [ ] Open browser to `http://localhost:3000`
- [ ] Open browser console (F12) to check for errors

## 🧪 Functional Tests

### Cart Opening/Closing

- [ ] Click cart icon in header - cart should slide in from left
- [ ] Click X button - cart should close
- [ ] Click backdrop (dark area) - cart should close
- [ ] Press ESC key - cart should close (if implemented)
- [ ] Cart animation is smooth (no jank)
- [ ] Body scroll is locked when cart is open
- [ ] Body scroll is restored when cart closes

### Adding Items

- [ ] Navigate to `/cart-demo` page
- [ ] Click "Add to Cart" on first product
- [ ] Cart opens automatically
- [ ] Item appears in cart with correct details
- [ ] Cart badge in header updates to show "1"
- [ ] Click "Add to Cart" on same product again
- [ ] Quantity increases to "2" (doesn't duplicate)
- [ ] Click "Add to Cart" on different product
- [ ] Both items appear in cart
- [ ] Cart badge shows correct total count

### Quantity Management

- [ ] Click "+" button on an item
- [ ] Quantity increases by 1
- [ ] Price updates correctly
- [ ] Total price updates
- [ ] Savings amount updates
- [ ] Click "-" button on an item
- [ ] Quantity decreases by 1
- [ ] Price updates correctly
- [ ] Click "-" when quantity is 1
- [ ] Button is disabled (can't go below 1)
- [ ] Manually test with multiple items

### Removing Items

- [ ] Click trash icon on an item
- [ ] Item is removed immediately
- [ ] Cart updates smoothly
- [ ] Total price recalculates
- [ ] Cart badge updates
- [ ] Remove all items
- [ ] "Your cart is empty" message appears
- [ ] Empty cart icon is displayed

### Price Calculations

- [ ] Add item with original price ₹1400, sale price ₹1100
- [ ] Verify savings shows ₹300
- [ ] Add quantity to 2
- [ ] Verify total is ₹2200
- [ ] Verify savings is ₹600
- [ ] Add different item
- [ ] Verify all calculations are correct

## 📱 Responsive Tests

### Mobile (< 768px)

- [ ] Open on mobile device or resize browser
- [ ] Cart takes full width
- [ ] All buttons are easily tappable
- [ ] Text is readable
- [ ] Images display correctly
- [ ] Scrolling works smoothly
- [ ] Quantity buttons are large enough

### Tablet (768px - 1024px)

- [ ] Cart is 400px wide
- [ ] Backdrop covers remaining space
- [ ] Layout looks good
- [ ] All features work

### Desktop (> 1024px)

- [ ] Cart is 400px wide
- [ ] Hover effects work on buttons
- [ ] Backdrop covers remaining space
- [ ] All features work

## 🎨 Visual Tests

### Styling

- [ ] Colors match design (#8B7B6C, #99A58F, etc.)
- [ ] Fonts are consistent
- [ ] Spacing looks good
- [ ] Borders and shadows are subtle
- [ ] Icons are clear and visible
- [ ] Images don't distort

### Animations

- [ ] Slide-in animation is smooth (300ms)
- [ ] Backdrop fade-in is smooth
- [ ] No flickering or jumps
- [ ] Hover effects are smooth
- [ ] Loading states work (if applicable)

### Layout

- [ ] Header section is fixed at top
- [ ] Cart items scroll independently
- [ ] Footer is fixed at bottom
- [ ] No content overflow
- [ ] All elements are aligned properly

## 🔧 Edge Cases

### Empty States

- [ ] Empty cart shows appropriate message
- [ ] Empty cart icon displays
- [ ] Checkout button is hidden or disabled
- [ ] No JavaScript errors

### Large Numbers

- [ ] Add item with quantity 99
- [ ] UI handles large numbers
- [ ] Calculations are correct
- [ ] No layout breaks

### Long Text

- [ ] Add item with very long name
- [ ] Text truncates with ellipsis
- [ ] Layout doesn't break
- [ ] All text is readable

### Multiple Items

- [ ] Add 10+ different items
- [ ] Cart scrolls properly
- [ ] Performance is good
- [ ] All items display correctly

## 🌐 Browser Compatibility

### Chrome

- [ ] All features work
- [ ] Animations are smooth
- [ ] No console errors

### Firefox

- [ ] All features work
- [ ] Animations are smooth
- [ ] No console errors

### Safari

- [ ] All features work
- [ ] Animations are smooth
- [ ] No console errors

### Edge

- [ ] All features work
- [ ] Animations are smooth
- [ ] No console errors

## ♿ Accessibility

### Keyboard Navigation

- [ ] Can tab to cart button
- [ ] Can press Enter to open cart
- [ ] Can tab through cart items
- [ ] Can use keyboard to close cart
- [ ] Focus indicators are visible

### Screen Readers

- [ ] Cart button has aria-label
- [ ] Close button has aria-label
- [ ] Quantity buttons have aria-labels
- [ ] Important updates are announced

### Color Contrast

- [ ] Text is readable on all backgrounds
- [ ] Buttons have sufficient contrast
- [ ] Links are distinguishable

## 🚀 Performance

### Load Time

- [ ] Cart opens quickly (< 100ms)
- [ ] No lag when adding items
- [ ] Smooth animations
- [ ] No memory leaks

### Network

- [ ] Works offline (state is local)
- [ ] No unnecessary API calls
- [ ] Images load efficiently

## 🐛 Error Handling

### Invalid Data

- [ ] Try adding item with missing fields
- [ ] Try negative quantity
- [ ] Try invalid price
- [ ] App handles gracefully

### Console Errors

- [ ] No errors in console
- [ ] No warnings in console
- [ ] No network errors

## 📊 Integration Tests

### Header Integration

- [ ] Cart icon shows in header
- [ ] Badge updates correctly
- [ ] Click opens cart
- [ ] Works from all pages

### Context Integration

- [ ] useCart hook works anywhere
- [ ] State persists across components
- [ ] Multiple components can read state
- [ ] Updates propagate correctly

### Demo Page Integration

- [ ] All products can be added
- [ ] AddToCartButton works
- [ ] Cart opens after adding
- [ ] All features work from demo

## ✨ User Experience

### Feedback

- [ ] User knows when item is added
- [ ] Loading states are clear
- [ ] Success states are clear
- [ ] Error states are clear

### Intuitive

- [ ] Cart behavior is predictable
- [ ] Buttons are clearly labeled
- [ ] Icons are recognizable
- [ ] Flow makes sense

### Smooth

- [ ] No jarring transitions
- [ ] No unexpected behaviors
- [ ] Everything feels polished

## 📝 Final Checks

- [ ] All tests pass
- [ ] No console errors
- [ ] No console warnings
- [ ] Performance is good
- [ ] Code is clean
- [ ] Documentation is complete
- [ ] Ready for production

---

## 🎯 Test Results

**Date Tested:** _________________

**Tested By:** _________________

**Browser:** _________________

**Device:** _________________

**Pass Rate:** _____ / _____ (___%)

**Issues Found:**
1. _________________________________
2. _________________________________
3. _________________________________

**Notes:**
_________________________________________
_________________________________________
_________________________________________

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Failed
