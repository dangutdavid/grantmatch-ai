import { pricingPlans } from '@/data/pricingPlans';
import { SubscriptionTier, UsageSummary } from '@/types';

export function getPricingPlan(tier: SubscriptionTier) {
  return pricingPlans.find((plan) => plan.tier === tier) ?? pricingPlans[0];
}

export function buildUsageSummary(input: {
  tier: SubscriptionTier;
  savedGrantCount: number;
  proposalDraftCount: number;
  workspaceMemberCount: number;
}): UsageSummary {
  const plan = getPricingPlan(input.tier);
  const limits: UsageSummary['limits'] = [
    { entity: 'Saved grants', used: input.savedGrantCount, limit: plan.savedGrantLimit },
    { entity: 'Proposal drafts', used: input.proposalDraftCount, limit: plan.proposalDraftLimit },
    { entity: 'Workspace members', used: input.workspaceMemberCount, limit: input.tier === 'Free' ? 1 : 'Unlimited' },
  ];

  return {
    tier: input.tier,
    limits,
    warnings: getUsageWarnings(input),
  };
}

export function getUsageWarnings(input: {
  tier: SubscriptionTier;
  savedGrantCount: number;
  proposalDraftCount: number;
  workspaceMemberCount: number;
}) {
  if (input.tier !== 'Free') {
    return input.tier === 'Institutional'
      ? ['Institution features are mock-enabled until payments and entitlements are connected.']
      : [];
  }

  const warnings: string[] = [];
  if (input.savedGrantCount >= 5) warnings.push('Free plan saved grant usage is high.');
  if (input.proposalDraftCount >= 3) warnings.push('Free plan proposal draft usage is high.');
  if (input.workspaceMemberCount > 1) warnings.push('Team workspace features are mock-enabled on Free.');
  return warnings;
}
