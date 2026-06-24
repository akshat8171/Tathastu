import { requireAuth } from '@/lib/supabase/auth-helpers'
import { LogoutButton } from '@/components/auth/logout-button'
import Link from 'next/link'

const quickLinks = [
  {
    href: '/account/orders',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    label: 'My Orders',
    desc: 'Track and view your orders',
  },
  {
    href: '/account/addresses',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    label: 'Addresses',
    desc: 'Manage delivery addresses',
  },
  {
    href: '/wishlist',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
    label: 'Wishlist',
    desc: 'Items you\'ve saved',
  },
  {
    href: '/account/settings',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Settings',
    desc: 'Account preferences',
  },
]

export default async function AccountPage() {
  const user = await requireAuth()

  return (
    <main className="bg-surface min-h-screen py-12 px-4">
      <div className="container-page max-w-3xl">

        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-ink text-3xl sm:text-4xl">My Account</h1>
          <p className="font-sans text-muted text-sm mt-1">Manage your profile, orders, and preferences.</p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-card2 shadow-card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-semibold text-ink text-lg mb-1">Profile</h2>
              <div className="space-y-1 font-sans text-sm">
                <p>
                  <span className="text-muted">Phone:&nbsp;</span>
                  <span className="text-ink font-medium">{user.phone}</span>
                </p>
                <p>
                  <span className="text-muted">Member since:&nbsp;</span>
                  <span className="text-ink font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick links grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {quickLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white rounded-card2 shadow-card p-5 flex items-center gap-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-11 h-11 rounded-xl bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 group-hover:bg-brand group-hover:text-white transition-colors duration-200">
                {link.icon}
              </div>
              <div>
                <h3 className="font-display font-semibold text-ink text-sm mb-0.5">{link.label}</h3>
                <p className="font-sans text-muted text-xs">{link.desc}</p>
              </div>
              <svg className="w-4 h-4 text-muted ml-auto flex-shrink-0 group-hover:text-brand transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <div className="bg-white rounded-card2 shadow-card p-5 flex items-center justify-between">
          <div>
            <p className="font-display font-semibold text-ink text-sm">Sign out</p>
            <p className="font-sans text-muted text-xs mt-0.5">Log out of your Layerix account</p>
          </div>
          <LogoutButton />
        </div>

      </div>
    </main>
  )
}
