import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { adaptReferralEntry, adaptReferralStats } from '@/lib/adapters'
import type { ReferralData } from '@/types/refer'

export function useReferral() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReferral = useCallback(async () => {
    try {
      const [codeRes, historyRes] = await Promise.all([
        api.referrals.getMyCode().catch(() => null),
        api.referrals.getHistory().catch(() => []),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ]) as any[]

      const history = historyRes ?? []
      setData({
        code: codeRes?.code ?? '',
        stats: adaptReferralStats(codeRes, history),
        history: history.map(adaptReferralEntry),
        heroImageUrl: '',
        heroImageAlt: 'Refer a friend',
      })
    } catch {
      // keep null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReferral() }, [fetchReferral])

  const createCode = useCallback(async () => {
    await api.referrals.createCode({ discountPercent: 10, commissionPercent: 5 })
    await fetchReferral()
  }, [fetchReferral])

  return { data, loading, createCode }
}
