/**
 * IndexNow helpers — notify Bing/Yandex/Naver when URLs change.
 * Key file must be published at /{key}.txt (see public/).
 */

export const INDEXNOW_KEY = '904a09f9906241f880e1f6fcf7133d56'

const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

export async function submitIndexNow(urls: string[]): Promise<{ ok: boolean; status: number; body: string }> {
  const host = 'www.tathastukeepsakes.in'
  const unique = [...new Set(urls)].filter(Boolean).slice(0, 10000)
  if (unique.length === 0) {
    return { ok: false, status: 0, body: 'no urls' }
  }

  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation: `https://${host}/${INDEXNOW_KEY}.txt`,
    urlList: unique,
  }

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  })

  const body = await res.text().catch(() => '')
  return { ok: res.ok || res.status === 202, status: res.status, body }
}
