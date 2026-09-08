export function describeInstagramConnectError(raw: string | null): string {
  const error = (raw || '').trim()
  if (!error) return ''
  if (error === 'invalid_oauth_state') {
    return 'Instagram login did not return to this same site/session. Click Connect again on the production URL and finish in the same browser (not Instagram in-app).'
  }
  if (error === 'instagram_not_configured') {
    return 'INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET are missing on this environment.'
  }
  if (error === 'token_exchange_failed' || error === 'instagram_connect_failed') {
    return 'Instagram accepted login but token exchange failed. The redirect URI sent to Meta must match App Dashboard → Instagram → API setup → OAuth redirect URIs exactly.'
  }
  if (error === 'access_denied') return 'Instagram permission was denied.'
  if (error === 'unauthorized') return 'Stay logged in as admin, then click Connect again.'
  return error
}
