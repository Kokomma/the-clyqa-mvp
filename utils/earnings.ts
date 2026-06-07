import { SubmissionMetrics, CampaignRates } from '@/types';

export function calculateEarnings(metrics: SubmissionMetrics, rates: CampaignRates): number {
  const viewEarnings = rates.perView ? (metrics.views / 1000) * rates.perView : 0;
  const likeEarnings = rates.perLike ? metrics.likes * rates.perLike : 0;
  const commentEarnings = rates.perComment ? metrics.comments * rates.perComment : 0;
  const fixed = rates.fixedRate ?? 0;
  return viewEarnings + likeEarnings + commentEarnings + fixed;
}
