import type { ReferralData } from '../../types/refer'
import ReferHero from './ReferHero'
import ReferStatsGrid from './ReferStatsGrid'
import ReferHistoryTable from './ReferHistoryTable'
import ReferUpgradeCTA from './ReferUpgradeCTA'

interface ReferProps {
  data: ReferralData
  onExportHistory?: () => void
  onViewAllHistory?: () => void
  onUpgrade?: () => void
}

export default function Refer({ data, onExportHistory, onViewAllHistory, onUpgrade }: ReferProps) {
  return (
    <main className="pt-24 pb-section">
      <ReferHero
        code={data.code}
        imageUrl={data.heroImageUrl}
        imageAlt={data.heroImageAlt}
      />
      <ReferStatsGrid stats={data.stats} />
      <ReferHistoryTable
        entries={data.history}
        onExport={onExportHistory}
        onViewAll={onViewAllHistory}
      />
      <ReferUpgradeCTA onUpgrade={onUpgrade} />
    </main>
  )
}
