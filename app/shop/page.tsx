/**
 * /shop — all-products landing (alias for /products with clean URL).
 * Redirects to /products so we don't duplicate the catalog logic.
 */
import { redirect } from 'next/navigation'

export default function ShopPage() {
  redirect('/products')
}
