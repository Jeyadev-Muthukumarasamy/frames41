import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { AdminBanner, BannerFormData, BannerType } from '@/types/admin'

export function useAdminBanners(type?: BannerType) {
  const [banners, setBanners] = useState<AdminBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.admin.getBanners(type, true)
      setBanners(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banners')
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => { fetch() }, [fetch])

  const createBanner = useCallback(async (data: BannerFormData) => {
    await api.admin.createBanner(data)
    await fetch()
  }, [fetch])

  const updateBanner = useCallback(async (id: string, data: Partial<BannerFormData>) => {
    await api.admin.updateBanner(id, data)
    await fetch()
  }, [fetch])

  const deleteBanner = useCallback(async (id: string) => {
    await api.admin.deleteBanner(id)
    await fetch()
  }, [fetch])

  const toggleActive = useCallback(async (id: string, current: boolean) => {
    await api.admin.updateBanner(id, { isActive: !current })
    await fetch()
  }, [fetch])

  return { banners, loading, error, createBanner, updateBanner, deleteBanner, toggleActive, refresh: fetch }
}
