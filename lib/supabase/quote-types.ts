export type QuoteType = 'keychain' | 'portrait' | 'custom_object' | 'bulk_order' | 'custom'

export type QuoteStatus = 'new' | 'quoted' | 'approved' | 'printing' | 'shipped' | 'closed'

export const QUOTE_STATUSES: QuoteStatus[] = [
  'new',
  'quoted',
  'approved',
  'printing',
  'shipped',
  'closed',
]

export interface QuoteInsert {
  name: string
  email: string
  phone?: string
  type: QuoteType
  description?: string
  file_url?: string
}

export interface QuoteRow extends QuoteInsert {
  id: string
  status: string
  created_at: string
  order_id?: string | null
  quoted_price?: number | null
  order_number?: string | null
  order_total?: number | null
  order_status?: string | null
}
