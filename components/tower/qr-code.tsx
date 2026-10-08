'use client'

import { useEffect, useState } from 'react'

/**
 * QR code for a path on this site. Built in the browser from the current origin,
 * so it is right on localhost, a preview URL, or the live domain.
 */
export function QrCode({ path, className, label }: { path: string; className?: string; label?: string }) {
  const [svg, setSvg] = useState('')
  const [url, setUrl] = useState('')

  useEffect(() => {
    const target = `${window.location.origin}${path}`
    setUrl(target)
    let cancelled = false
    void import('qrcode')
      .then((QR) => QR.toString(target, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0b1220', light: '#ffffff' } }))
      .then((markup) => {
        if (!cancelled) setSvg(markup)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [path])

  return (
    <figure className={className}>
      <div
        className="aspect-square w-full overflow-hidden rounded-2xl bg-white p-2 [&>svg]:h-full [&>svg]:w-full"
        role="img"
        aria-label={label ?? `QR code for ${url}`}
        // The SVG is generated locally by the qrcode library from our own URL.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {url && <figcaption className="mt-2 break-all text-center text-xs opacity-70">{url.replace(/^https?:\/\//, '')}</figcaption>}
    </figure>
  )
}
