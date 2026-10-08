/**
 * @jest-environment node
 */

import type { AppUser } from '@/lib/auth/session'

const getCurrentUser = jest.fn<Promise<AppUser | null>, []>()
const getSupabaseUser = jest.fn<Promise<AppUser | null>, []>()

jest.mock('@/lib/auth/session', () => ({
  getCurrentUser: () => getCurrentUser(),
  getSupabaseUser: () => getSupabaseUser(),
}))

import { getAdminUser, isAdminUser } from '@/lib/auth/admin'

const owner: AppUser = {
  id: 'sb-owner',
  provider: 'supabase',
  email: 'tathastukeepsakes@gmail.com',
  emailVerified: true,
}
const phoneSession: AppUser = { id: 'fb-1', provider: 'firebase', phone: '+919876543210', emailVerified: false }

describe('admin access', () => {
  beforeEach(() => {
    delete process.env.ADMIN_EMAILS
    getCurrentUser.mockReset()
    getSupabaseUser.mockReset()
  })

  it('lets the verified owner in', async () => {
    getCurrentUser.mockResolvedValue(owner)
    await expect(getAdminUser()).resolves.toEqual(owner)
  })

  it('still finds the owner when an old phone login is also active in the browser', async () => {
    getCurrentUser.mockResolvedValue(phoneSession)
    getSupabaseUser.mockResolvedValue(owner)
    await expect(getAdminUser()).resolves.toEqual(owner)
  })

  it('keeps everyone else out', async () => {
    getCurrentUser.mockResolvedValue(phoneSession)
    getSupabaseUser.mockResolvedValue({ ...owner, email: 'customer@example.com' })
    await expect(getAdminUser()).resolves.toBeNull()

    getCurrentUser.mockResolvedValue({ ...owner, emailVerified: false })
    await expect(getAdminUser()).resolves.toBeNull()
    expect(getSupabaseUser).toHaveBeenCalledTimes(1)

    getCurrentUser.mockResolvedValue(null)
    await expect(getAdminUser()).resolves.toBeNull()
  })

  it('never treats an unverified owner address as admin', () => {
    expect(isAdminUser({ ...owner, emailVerified: false })).toBe(false)
    expect(isAdminUser(null)).toBe(false)
  })
})
