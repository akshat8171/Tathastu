import type { CatalogListItem, CatalogProduct, CatalogSource } from './types'

export interface CatalogDbRow {
  id: string
  payload: CatalogProduct
  published: boolean
}

/**
 * JSON seed is the baseline. Admin rows overlay the same id; unpublished admin
 * rows hide a seed SKU. Admin-only ids appear when published.
 */
export function mergeCatalog(
  jsonProducts: CatalogProduct[],
  dbRows: CatalogDbRow[]
): CatalogProduct[] {
  const byId = new Map<string, CatalogProduct>()
  for (const product of jsonProducts) byId.set(product.id, product)

  for (const row of dbRows) {
    if (!row.published) {
      byId.delete(row.id)
      continue
    }
    byId.set(row.id, { ...row.payload, id: row.id })
  }

  return Array.from(byId.values())
}

export function listCatalogForAdmin(
  jsonProducts: CatalogProduct[],
  dbRows: CatalogDbRow[]
): CatalogListItem[] {
  const dbById = new Map(dbRows.map((row) => [row.id, row]))
  const seen = new Set<string>()
  const items: CatalogListItem[] = []

  for (const product of jsonProducts) {
    seen.add(product.id)
    const overlay = dbById.get(product.id)
    if (overlay) {
      items.push({
        ...overlay.payload,
        id: overlay.id,
        source: 'admin',
        published: overlay.published,
      })
    } else {
      items.push({ ...product, source: 'json', published: true })
    }
  }

  for (const row of dbRows) {
    if (seen.has(row.id)) continue
    items.push({
      ...row.payload,
      id: row.id,
      source: 'admin' as CatalogSource,
      published: row.published,
    })
  }

  return items
}
