/** URL-safe catalog id: `{category}-{name}` clipped to 80 chars. */
export function slugifyCatalogId(category: string, name: string): string {
  const cat = category
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const rest = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const id = [cat, rest].filter(Boolean).join('-')
  return id.slice(0, 80) || 'product'
}

export function isValidCatalogId(id: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && id.length >= 3 && id.length <= 80
}
