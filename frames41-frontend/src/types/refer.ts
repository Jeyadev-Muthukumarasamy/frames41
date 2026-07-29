export type ReferralStatus = 'completed' | 'pending'

export interface ReferralEntry {
  readonly id: string
  readonly name: string
  readonly date: string
  readonly status: ReferralStatus
  readonly rewardInr: number
}

export interface ReferralStats {
  readonly totalEarnedInr: number
  readonly successfulReferrals: number
  readonly pendingRewardsInr: number
}

export interface ReferralData {
  readonly code: string
  readonly stats: ReferralStats
  readonly history: ReadonlyArray<ReferralEntry>
  readonly heroImageUrl: string
  readonly heroImageAlt: string
}
