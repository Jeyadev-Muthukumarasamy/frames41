export type ProfileSection = 'personal' | 'security' | 'orders' | 'preferences'

export interface ProfileNavItem {
  readonly id: ProfileSection
  readonly label: string
}

export interface ProfileUser {
  readonly legalName: string
  readonly email: string
  readonly phone: string
  readonly timezone: string
}

export interface ProfileAddress {
  readonly id: string
  readonly label: string
  readonly fullName: string
  readonly line1: string
  readonly line2?: string
  readonly city: string
  readonly state: string
  readonly zip: string
  readonly country: string
  readonly isDefault: boolean
}

export interface ProfileData {
  readonly user: ProfileUser
  readonly addresses: ReadonlyArray<ProfileAddress>
  readonly isNewsletterSubscribed: boolean
}
