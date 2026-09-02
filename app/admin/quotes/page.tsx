'use client'

import { useEffect, useState } from 'react'
import { Download, MessageCircle, Search, PackagePlus } from 'lucide-react'
import { formatAdminDate, statusBadgeClass } from '@/lib/admin/format'
import { customerWhatsAppUrl, quoteCustomerWhatsAppText } from '@/lib/admin/links'
import { QUOTE_STATUSES, type QuoteRow, type QuoteStatus } from '@/lib/supabase/quote-types'

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [creatingOrders, setCreatingOrders] = useState(false)

  useEffect(() => {
    fetchQuotes()
  }, [])

  async function fetchQuotes() {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/quotes')
      if (response.status === 401) {
        window.location.href = '/login?next=/admin/quotes'
        return
      }
      if (!response.ok) throw new Error('Failed to fetch quotes')
      const data = await response.json()
      setQuotes(data.quotes ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quotes')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatus(id: string, status: QuoteStatus) {
    const response = await fetch('/api/admin/quotes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!response.ok) {
      alert('Could not update status')
      return
    }
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)))
  }

  async function handleCreateOrder(id: string) {
    const response = await fetch('/api/admin/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await response.json()
    if (!response.ok) {
      alert(data.error || 'Could not create order')
      return
    }
    await fetchQuotes()
  }

  async function handleCreateMissingOrders() {
    setCreatingOrders(true)
    try {
      const response = await fetch('/api/admin/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.error || 'Could not create orders')
        return
      }
      alert(`Created ${data.created ?? 0} orders. Linked ${data.linked ?? 0} existing. Failed ${data.failed ?? 0}.`)
      await fetchQuotes()
    } finally {
      setCreatingOrders(false)
    }
  }

  async function handleDownload(id: string) {
    const response = await fetch(`/api/admin/quotes/${id}/file`)
    if (!response.ok) {
      alert('No file available for this quote')
      return
    }
    const data = await response.json()
    window.open(data.url, '_blank', 'noopener,noreferrer')
  }

  const filtered = quotes.filter((q) => {
    if (statusFilter !== 'all' && q.status !== statusFilter) return false
    if (!searchQuery.trim()) return true
    const hay = `${q.name} ${q.email} ${q.phone ?? ''} ${q.description ?? ''}`.toLowerCase()
    return hay.includes(searchQuery.trim().toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-ink">Custom quotes</h1>
        <p className="text-muted mt-2">STL, photos and descriptions from /customize — each request also creates an order the customer can see.</p>
      </div>

      <div className="bg-white rounded-card2 shadow-card p-6 flex flex-col lg:flex-row gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="all">All statuses</option>
          {QUOTE_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, description…"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <p className="text-sm text-muted self-center">{filtered.length} quotes</p>
        <button
          type="button"
          onClick={() => void handleCreateMissingOrders()}
          disabled={creatingOrders}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium disabled:opacity-60"
        >
          <PackagePlus className="w-4 h-4" />
          {creatingOrders ? 'Creating orders…' : 'Create orders for requests without one'}
        </button>
      </div>

      <div className="bg-white rounded-card2 shadow-card overflow-hidden">
        {loading ? (
          <p className="text-center py-12 text-muted">Loading quotes…</p>
        ) : error ? (
          <p className="text-center py-12 text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-12 text-muted">No quotes yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Details</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">File</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((quote) => {
                  const wa = customerWhatsAppUrl(
                    quote.phone,
                    quoteCustomerWhatsAppText(quote.name, quote.type)
                  )
                  return (
                    <tr key={quote.id} className="align-top">
                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-ink">{quote.name}</p>
                        <p className="text-xs text-muted">{quote.email}</p>
                        {quote.phone && <p className="text-xs text-muted">{quote.phone}</p>}
                        {wa && (
                          <a
                            href={wa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand mt-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm capitalize">{quote.type.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-4 text-sm text-ink max-w-xs">
                        <p className="whitespace-pre-wrap">{quote.description || '—'}</p>
                      </td>
                      <td className="px-4 py-4">
                        {quote.file_url ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(quote.id)}
                            className="inline-flex items-center gap-1 text-sm text-brand font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        ) : (
                          <span className="text-xs text-muted">No file</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {quote.order_number || quote.order_id ? (
                          <a
                            href={`/admin/orders/${quote.order_id}`}
                            className="text-sm text-brand font-medium"
                          >
                            {quote.order_number ?? 'View order'}
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleCreateOrder(quote.id)}
                            className="text-sm text-brand font-medium"
                          >
                            Create order
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={quote.status}
                          onChange={(e) => handleStatus(quote.id, e.target.value as QuoteStatus)}
                          className={`text-xs font-medium rounded-full px-2 py-1 ${statusBadgeClass(quote.status)}`}
                        >
                          {QUOTE_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted whitespace-nowrap">
                        {formatAdminDate(quote.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
