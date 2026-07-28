import { useReferral } from '@/hooks/useReferral'
import Refer from '@/components/refer/Refer'

export default function ReferPage() {
  const { data, loading, createCode } = useReferral()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data || !data.code) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#6B6B6B] text-sm">You don't have a referral code yet.</p>
        <button
          onClick={createCode}
          className="px-6 py-2 bg-[#800020] text-white text-sm rounded-lg"
        >
          Create Referral Code
        </button>
      </div>
    )
  }

  return (
    <Refer
      data={data}
      onExportHistory={() => {}}
      onViewAllHistory={() => {}}
      onUpgrade={() => {}}
    />
  )
}
