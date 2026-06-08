import { requireAuth } from '@/lib/supabase/auth-helpers'
import { LogoutButton } from '@/components/auth/logout-button'
import Link from 'next/link'

export default async function AccountPage() {
  const user = await requireAuth()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-display font-bold mb-8">My Account</h1>

      <div className="card p-6 mb-6">
        <h2 className="font-display font-semibold text-lg mb-4">Profile</h2>
        <div className="space-y-2 text-gray-300">
          <p><span className="text-gray-500">Phone:</span> {user.phone}</p>
          <p><span className="text-gray-500">Member since:</span> {new Date(user.created_at).toLocaleDateString('en-IN')}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link href="/account/orders" className="card p-6 hover:scale-105 transition-transform">
          <h3 className="font-display font-semibold mb-1">My Orders</h3>
          <p className="text-sm text-gray-400">Track and view your orders</p>
        </Link>
        <Link href="/account/addresses" className="card p-6 hover:scale-105 transition-transform">
          <h3 className="font-display font-semibold mb-1">Addresses</h3>
          <p className="text-sm text-gray-400">Manage delivery addresses</p>
        </Link>
      </div>

      <LogoutButton />
    </div>
  )
}
