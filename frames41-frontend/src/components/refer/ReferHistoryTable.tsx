import type { ReferralEntry } from '../../types/refer'
import ReferHistoryRow from './ReferHistoryRow'

interface ReferHistoryTableProps {
  entries: ReadonlyArray<ReferralEntry>
  onExport?: () => void
  onViewAll?: () => void
}

const COLUMNS = ['Invited User', 'Date', 'Status', 'Reward'] as const

export default function ReferHistoryTable({
  entries,
  onExport,
  onViewAll,
}: ReferHistoryTableProps) {
  return (
    <section
      aria-labelledby="referral-history-heading"
      className="max-w-container-max mx-auto px-6 md:px-12 py-12"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2
            id="referral-history-heading"
            className="text-headline-md font-headline-md text-on-background"
          >
            Referral History
          </h2>
          <p className="text-body-md text-on-surface-variant mt-2">
            Track your invitations and reward status.
          </p>
        </div>

        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="border border-on-background px-6 py-2 font-label-bold text-label-sm uppercase hover:bg-on-background hover:text-surface transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-on-background"
          >
            Export Data
          </button>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-low">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className={`px-8 py-4 font-label-bold text-label-sm uppercase tracking-widest text-on-surface-variant ${
                    col === 'Reward' ? 'text-right' : ''
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {entries.map((entry) => (
              <ReferHistoryRow key={entry.id} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>

      {onViewAll && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onViewAll}
            className="text-label-sm font-label-bold uppercase tracking-widest text-on-surface-variant hover:text-on-background transition-colors underline underline-offset-8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-on-background"
          >
            View full referral history
          </button>
        </div>
      )}
    </section>
  )
}
