import { renderHook, act } from '@testing-library/react'
import { CartProvider, useCart } from '@/components/cart/cart-context'
import { ReactNode } from 'react'

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
)

describe('useCart', () => {
  it('adds an item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({
        id: 'test-1',
        name: 'Dragon Miniature',
        variant: 'Default',
        price: 2499,
        originalPrice: 2999,
        quantity: 1,
        image: '/test.jpg',
      })
    })
    expect(result.current.items.find(i => i.id === 'test-1')).toBeTruthy()
  })

  it('increments quantity for existing item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 'dup-1', name: 'Test', variant: '', price: 100, originalPrice: 100, quantity: 1, image: '' })
    })
    act(() => {
      result.current.addItem({ id: 'dup-1', name: 'Test', variant: '', price: 100, originalPrice: 100, quantity: 1, image: '' })
    })
    const item = result.current.items.find(i => i.id === 'dup-1')
    expect(item?.quantity).toBe(2)
  })

  it('removes an item', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 'rm-1', name: 'Remove Me', variant: '', price: 50, originalPrice: 50, quantity: 1, image: '' })
    })
    act(() => {
      result.current.removeItem('rm-1')
    })
    expect(result.current.items.find(i => i.id === 'rm-1')).toBeUndefined()
  })

  it('updates quantity with minimum of 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 'qty-1', name: 'Qty Test', variant: '', price: 100, originalPrice: 100, quantity: 3, image: '' })
    })
    act(() => {
      result.current.updateQuantity('qty-1', 0)
    })
    const item = result.current.items.find(i => i.id === 'qty-1')
    expect(item?.quantity).toBe(1)
  })

  it('clears all items', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => {
      result.current.addItem({ id: 'clear-1', name: 'A', variant: '', price: 10, originalPrice: 10, quantity: 1, image: '' })
    })
    act(() => {
      result.current.clearCart()
    })
    expect(result.current.items.length).toBe(0)
    expect(result.current.itemCount).toBe(0)
  })

  it('calculates itemCount correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper })
    act(() => { result.current.clearCart() })
    act(() => {
      result.current.addItem({ id: 'c1', name: 'A', variant: '', price: 10, originalPrice: 10, quantity: 2, image: '' })
    })
    act(() => {
      result.current.addItem({ id: 'c2', name: 'B', variant: '', price: 20, originalPrice: 20, quantity: 3, image: '' })
    })
    expect(result.current.itemCount).toBe(5)
  })
})
