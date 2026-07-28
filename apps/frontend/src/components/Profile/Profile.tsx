import { useState, useCallback } from 'react'
import type { ProfileAddress, ProfileData, ProfileSection } from '../../types/profile'
import { PROFILE_NAV_ITEMS } from '../../constants/profile'
import ProfileSidebarNav from './ProfileSidebarNav'
import ProfileSupportCard from './ProfileSupportCard'
import ProfilePersonalInfo from './ProfilePersonalInfo'
import ProfileAddressSection from './ProfileAddressSection'
import ProfileNewsletterSection from './ProfileNewsletterSection'
import ProfileSecuritySection from './ProfileSecuritySection'
import ProfileOrdersSection from './ProfileOrdersSection'
import ProfilePreferencesSection from './ProfilePreferencesSection'

export interface ProfileSaveParams {
  readonly addresses: ReadonlyArray<ProfileAddress>
  readonly isNewsletterSubscribed: boolean
}

interface ProfileProps {
  data: ProfileData
  onSaveAll?: (params: ProfileSaveParams) => void
  onEditPersonalInfo?: () => void
  onContactSupport?: () => void
  onAddAddress?: () => void
  onEditAddress?: (id: string) => void
  onLogout?: () => void
  isLoggingOut?: boolean
}

export default function Profile({
  data,
  onSaveAll,
  onEditPersonalInfo,
  onContactSupport,
  onAddAddress,
  onEditAddress,
  onLogout,
  isLoggingOut = false,
}: ProfileProps) {
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal')
  const [addresses, setAddresses] = useState<ReadonlyArray<ProfileAddress>>(data.addresses)
  const [isNewsletterSubscribed, setIsNewsletterSubscribed] = useState(
    data.isNewsletterSubscribed,
  )

  const handleRemoveAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const handleSetDefaultAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
  }, [])

  const handleToggleNewsletter = useCallback(() => {
    setIsNewsletterSubscribed((prev) => !prev)
  }, [])

  const handleSaveAll = useCallback(() => {
    onSaveAll?.({ addresses, isNewsletterSubscribed })
  }, [onSaveAll, addresses, isNewsletterSubscribed])

  return (
    <main className="pt-32 pb-section max-w-container-max mx-auto px-6 lg:px-gutter">
      <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg mb-2">Profile Settings</h1>
          <p className="text-[#8A8A85] font-body-md">
            Manage your account preferences and delivery locations.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="border border-[#800020] text-[#800020] px-8 py-3 font-label-bold text-label-bold uppercase tracking-widest hover:bg-[#800020] hover:text-white transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? 'Logging Out...' : 'Logout'}
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="bg-[#800020] text-white px-8 py-3 font-label-bold text-label-bold uppercase tracking-widest hover:opacity-90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Save All Changes
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <div className="md:col-span-3 space-y-4">
          <ProfileSidebarNav
            items={PROFILE_NAV_ITEMS}
            activeSection={activeSection}
            onSelect={setActiveSection}
          />
          <ProfileSupportCard onContactSupport={onContactSupport} />
        </div>

        <div className="md:col-span-9 space-y-gutter">
          {activeSection === 'personal' && (
            <>
              <ProfilePersonalInfo user={data.user} onEdit={onEditPersonalInfo} />
              <ProfileAddressSection
                addresses={addresses}
                onAddAddress={onAddAddress}
                onEditAddress={(id) => onEditAddress?.(id)}
                onRemoveAddress={handleRemoveAddress}
                onSetDefaultAddress={handleSetDefaultAddress}
              />
              <ProfileNewsletterSection
                isSubscribed={isNewsletterSubscribed}
                onToggle={handleToggleNewsletter}
              />
            </>
          )}
          {activeSection === 'security' && <ProfileSecuritySection />}
          {activeSection === 'orders' && <ProfileOrdersSection />}
          {activeSection === 'preferences' && (
            <ProfilePreferencesSection
              isNewsletterSubscribed={isNewsletterSubscribed}
              onToggle={handleToggleNewsletter}
            />
          )}
        </div>
      </div>
    </main>
  )
}
