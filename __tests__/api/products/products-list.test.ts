/**
 * @jest-environment node
 *
 * Guards the /api/products list route: it must serve the JSON catalog and
 * must not filesystem-scan public/images (that balloons the Vercel function).
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('GET /api/products source', () => {
  const routeSource = readFileSync(
    join(process.cwd(), 'app/api/products/route.ts'),
    'utf8',
  )

  it('reads the catalog store instead of scanning public/images', () => {
    expect(routeSource).toContain("from '@/lib/catalog/store'")
    expect(routeSource).toContain('getCatalogProducts')
    expect(routeSource).not.toMatch(/from ['"]fs\/promises['"]/)
    expect(routeSource).not.toContain("readdir")
    expect(routeSource).not.toContain("public', 'images', 'products'")
  })
})
