import 'server-only'

import { graphGet } from '@/lib/instagram/graph'
import { getUsableAccessToken } from '@/lib/instagram/tokens'
import { gateFromProfile } from '@/lib/play/webhook'

export class FollowCheckError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FollowCheckError'
  }
}

/** Meta only returns this field after the person messages the professional account. */
export async function readFollowStatus(
  igScopedId: string
): Promise<{ follows: boolean; username: string | null }> {
  const token = await getUsableAccessToken()
  if (!token.ok) throw new FollowCheckError(token.error)
  const body = await graphGet(igScopedId, token.connection.accessToken, {
    fields: 'username,is_user_follow_business',
  })
  return gateFromProfile(body)
}
