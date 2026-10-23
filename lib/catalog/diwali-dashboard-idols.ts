/**
 * Seasonal Diwali feature set — Selfmini-style car dashboard idols.
 * Used by the homepage expandable banner, hero photography slide,
 * and Top & Best Selling rail. Keep this list in sync across all three.
 */
export const DIWALI_DASHBOARD_IDOL_IDS = [
  'pooja-decor-dashboard-baby-shiva',
  'pooja-decor-dashboard-shiva-nandi',
  'pooja-decor-dashboard-ganesha',
  'pooja-decor-dashboard-bal-ganesha',
  'pooja-decor-dashboard-krishna-flute',
  'pooja-decor-dashboard-krishna-bust',
  'pooja-decor-dashboard-hanuman',
  'pooja-decor-dashboard-laxmi-ganesh',
] as const

export type DiwaliDashboardIdolId = (typeof DIWALI_DASHBOARD_IDOL_IDS)[number]

export const DIWALI_DASHBOARD_IDOL_ID_LIST: string[] = [...DIWALI_DASHBOARD_IDOL_IDS]
