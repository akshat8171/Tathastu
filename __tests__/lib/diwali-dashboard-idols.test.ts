import products from '@/lib/products.json'
import { DIWALI_DASHBOARD_IDOL_IDS, DIWALI_DASHBOARD_IDOL_ID_LIST } from '@/lib/catalog/diwali-dashboard-idols'

const catalog = products as Array<{ id: string; name: string }>

describe('Diwali dashboard idol feature set', () => {
  const catalogIds = new Set(catalog.map((product) => product.id))

  it('lists exactly eight Selfmini-style dashboard idols', () => {
    expect(DIWALI_DASHBOARD_IDOL_IDS).toHaveLength(8)
    expect(DIWALI_DASHBOARD_IDOL_ID_LIST).toEqual([...DIWALI_DASHBOARD_IDOL_IDS])
  })

  it('every featured idol exists in the catalog', () => {
    const missing = DIWALI_DASHBOARD_IDOL_ID_LIST.filter((id) => !catalogIds.has(id))
    expect(missing).toEqual([])
  })

  it('matches the screenshot product names', () => {
    const names = DIWALI_DASHBOARD_IDOL_ID_LIST.map(
      (id) => catalog.find((product) => product.id === id)?.name
    )
    expect(names).toEqual([
      'Baby Shiva Car Dashboard Idol',
      'Lord Shiva on Nandi Idol',
      'Lord Ganesha Car Dashboard Idol',
      'Bal Ganesha Car Dashboard Idol',
      'Krishna with Flute Car Dashboard Idol',
      'Krishna Bust Car Dashboard Idol',
      'Bal Hanuman Car Dashboard Idol',
      'Laxmi Ganesh Pair Idol',
    ])
  })
})
