/**
 * Kill switch: only an explicit falsey value disables uploads.
 * Unset / empty means ON — production must actually store the customer's file.
 */
export function isQuoteStorageDisabled(): boolean {
  const raw = process.env.QUOTE_STORAGE_ENABLED
  if (raw === undefined || raw.trim() === '') return false
  return ['0', 'false', 'off', 'no'].includes(raw.trim().toLowerCase())
}
