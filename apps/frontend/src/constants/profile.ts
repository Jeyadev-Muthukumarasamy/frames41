import type { ProfileNavItem, ProfileData } from '../types/profile'

export const PROFILE_NAV_ITEMS: ReadonlyArray<ProfileNavItem> = [
  { id: 'personal', label: 'Personal Details' },
  { id: 'security', label: 'Security & Password' },
  { id: 'orders', label: 'Order History' },
  { id: 'preferences', label: 'Preferences' },
]

export const PROFILE_DATA: ProfileData = {
  user: {
    legalName: 'Ananya Sharma',
    email: 'ananya.s@vakya.studio',
    phone: '+91 98765 43210',
    timezone: 'India Standard Time (GMT+5:30)',
  },
  addresses: [
    {
      id: 'addr_home',
      label: 'Home',
      fullName: 'Ananya Sharma',
      line1: 'Apt 402, Heritage Heights',
      line2: '8th Main Road, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560038',
      country: 'India',
      isDefault: true,
    },
    {
      id: 'addr_studio',
      label: 'Studio',
      fullName: 'Vakya Handcrafted Studio',
      line1: '12/A, Creative Block, Design District',
      line2: 'Koramangala 4th Block',
      city: 'Bengaluru',
      state: 'Karnataka',
      zip: '560034',
      country: 'India',
      isDefault: false,
    },
  ],
  isNewsletterSubscribed: true,
}
