import type { ProfileNavItem } from '../types/profile'

export const PROFILE_NAV_ITEMS: ReadonlyArray<ProfileNavItem> = [
  { id: 'personal', label: 'Personal Details' },
  { id: 'security', label: 'Security & Password' },
  { id: 'orders', label: 'Order History' },
  { id: 'preferences', label: 'Preferences' },
]
