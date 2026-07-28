import type { ReferralStats } from '../../types/refer'
import { formatINR } from '../../utils/format'
import ReferStatCard from './ReferStatCard'

interface ReferStatsGridProps {
  stats: ReferralStats
}

export default function ReferStatsGrid({ stats }: ReferStatsGridProps) {
  return (
    <section
      aria-label="Referral statistics"
      className="max-w-container-max mx-auto px-6 md:px-12 py-12"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReferStatCard
          icon="account_balance_wallet"
          label="Total Earned"
          value={formatINR(stats.totalEarnedInr)}
        />
        <ReferStatCard
          icon="group"
          label="Successful Referrals"
          value={String(stats.successfulReferrals)}
          variant="dark"
        />
        <ReferStatCard
          icon="pending_actions"
          label="Pending Rewards"
          value={formatINR(stats.pendingRewardsInr)}
        />
      </div>
    </section>
  )
}
