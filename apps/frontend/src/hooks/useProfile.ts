import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { adaptProfileUser, adaptProfileAddress } from '@/lib/adapters'
import type { ProfileData, ProfileUser, ProfileAddress } from '@/types/profile'
import { getAccessToken } from '@/lib/token'

export function useProfile() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const [user, addresses] = await Promise.all([
        api.users.getProfile(),
        api.users.getAddresses(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]) as any[]
      setProfileData({
        user: adaptProfileUser(user),
        addresses: (addresses ?? []).map(adaptProfileAddress),
        isNewsletterSubscribed: false,
      })
    } catch {
      // keep null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = useCallback(async (data: Partial<ProfileUser>) => {
    await api.users.updateProfile({
      name: data.legalName,
      email: data.email,
    })
    await fetchProfile()
  }, [fetchProfile])

  const createAddress = useCallback(async (data: Omit<ProfileAddress, 'id'>) => {
    await api.users.createAddress({
      line1: data.line1,
      line2: data.line2,
      city: data.city,
      state: data.state,
      pincode: data.zip,
      isDefault: data.isDefault,
    })
    await fetchProfile()
  }, [fetchProfile])

  const updateAddress = useCallback(async (id: string, data: Partial<ProfileAddress>) => {
    await api.users.updateAddress(id, {
      line1: data.line1,
      line2: data.line2,
      city: data.city,
      state: data.state,
      pincode: data.zip,
      isDefault: data.isDefault,
    })
    await fetchProfile()
  }, [fetchProfile])

  const deleteAddress = useCallback(async (id: string) => {
    await api.users.deleteAddress(id)
    await fetchProfile()
  }, [fetchProfile])

  return { profileData, loading, updateProfile, createAddress, updateAddress, deleteAddress }
}
