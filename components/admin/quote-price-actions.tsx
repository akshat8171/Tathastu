'use client'

import { useState } from 'react'
import { parseQuotedPriceRupees } from '@/lib/supabase/quote-order-notes'
import type { QuoteRow } from '@/lib/supabase/quote-types'

interface QuotePriceActionsProps {
  quote: QuoteRow
  onRefresh: () => Promise<void>
}

export function QuotePriceActions({ quote, onRefresh }: QuotePriceActionsProps) {
  const [draft, setDraft] = useState(
    quote.quoted_price && quote.quoted_price >= 1 ? String(quote.quoted_price) : ''
  )
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)

  const parsed = parseQuotedPriceRupees(draft)
  const hasOrder = Boolean(quote.order_id || quote.order_number)

  async function savePrice(): Promise<boolean> {
    if (parsed === null) {
      alert('Enter a quote of at least ₹1')
      return false
    }
    setSaving(true)
    try {
      const response = await fetch('/api/admin/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quote.id, quoted_price: parsed }),
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.error || 'Could not save quote price')
        return false
      }
      await onRefresh()
      return true
    } finally {
      setSaving(false)
    }
  }

  async function createOrder() {
    if (parsed === null) {
      alert('Enter a quote of at least ₹1 before creating the order')
      return
    }
    setCreating(true)
    try {
      const response = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: quote.id, quoted_price: parsed }),
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.error || 'Could not create order')
        return
      }
      await onRefresh()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-2 min-w-[11rem]">
      <label className="sr-only" htmlFor={`quote-price-${quote.id}`}>
        Quoted price in rupees
      </label>
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted">₹</span>
        <input
          id={`quote-price-${quote.id}`}
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Price"
          className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>
      <button
        type="button"
        onClick={() => void savePrice()}
        disabled={saving || parsed === null}
        className="block text-sm text-brand font-medium disabled:opacity-50"
      >
        {saving ? 'Saving…' : hasOrder ? 'Update order price' : 'Save quote'}
      </button>
      {hasOrder ? (
        <a href={`/admin/orders/${quote.order_id}`} className="block text-sm text-brand font-medium">
          {quote.order_number ?? 'View order'}
          {quote.order_total != null ? ` · ₹${quote.order_total.toLocaleString('en-IN')}` : ''}
        </a>
      ) : (
        <button
          type="button"
          onClick={() => void createOrder()}
          disabled={creating || parsed === null}
          className="block text-sm text-brand font-medium disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'Create order'}
        </button>
      )}
    </div>
  )
}
