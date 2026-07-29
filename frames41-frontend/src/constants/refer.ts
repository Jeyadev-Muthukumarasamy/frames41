import type { ReferralData } from '../types/refer'

export const REFERRAL_DATA: ReferralData = {
  code: 'FRAMES41-ART-2024',
  stats: {
    totalEarnedInr: 1240,
    successfulReferrals: 18,
    pendingRewardsInr: 150,
  },
  history: [
    { id: 'ref-001', name: 'Julianne Moore', date: 'Oct 12, 2024', status: 'completed', rewardInr: 80 },
    { id: 'ref-002', name: 'Arjun Sharma', date: 'Oct 08, 2024', status: 'completed', rewardInr: 80 },
    { id: 'ref-003', name: 'Elena Rodriguez', date: 'Oct 05, 2024', status: 'pending', rewardInr: 80 },
    { id: 'ref-004', name: 'Thomas Wright', date: 'Sep 28, 2024', status: 'completed', rewardInr: 80 },
  ],
  heroImageUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBjAGbg6knWgfNhnylJH9qhCv4zVZweWLBn3CHZ-qRl5fABsOnXhrSGHEmFpBaUZJM3TdZ6z9I-poQ6uraapOY1MQZOtTKiFCMb_TYJL8ZJ1wII_AschnlbZkic-bYCc0e7_Oz5iCIIEjnbNloHfpMT_xoJqUC59kcpFFz5RSEbiTy5jN3_QyN_ph9c3XTuTgYztVO2zpj6tJKYJn2JnsvWpeQP4eHxvC6qmcbJWfuf_zsUGs9DLOmgKV7pwPU-Dm4jd1smFmo3_mI',
  heroImageAlt:
    'A sophisticated editorial photograph of a handcrafted ceramic vase on a minimalist dark wood table, soft natural lighting, serene and luxurious mood.',
} as const
