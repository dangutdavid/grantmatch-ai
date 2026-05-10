import { SubscriptionFeature, SubscriptionTier } from '@/types';

export interface PricingPlan {
  tier: SubscriptionTier;
  name: string;
  priceLabel: string;
  savedGrantLimit: number | 'Unlimited';
  proposalDraftLimit: number | 'Unlimited';
  features: SubscriptionFeature[];
}

export const pricingPlans: PricingPlan[] = [
  {
    tier: 'Free',
    name: 'Free',
    priceLabel: '$0 demo',
    savedGrantLimit: 5,
    proposalDraftLimit: 3,
    features: [
      { id: 'saved-grants', label: 'Limited saved grants', included: true },
      { id: 'drafts', label: 'Limited proposal drafts', included: true },
      { id: 'tracker', label: 'Basic tracker', included: true },
      { id: 'team', label: 'Team collaboration', included: false },
    ],
  },
  {
    tier: 'Pro',
    name: 'Pro',
    priceLabel: 'Mock upgrade',
    savedGrantLimit: 25,
    proposalDraftLimit: 20,
    features: [
      { id: 'saved-grants', label: 'More saved grants', included: true },
      { id: 'proposal-support', label: 'Advanced proposal support', included: true },
      { id: 'deadline-risk', label: 'Deadline risk guidance', included: true },
      { id: 'exports', label: 'Export summaries', included: true },
    ],
  },
  {
    tier: 'Institutional',
    name: 'Institution',
    priceLabel: 'Mock institutional',
    savedGrantLimit: 'Unlimited',
    proposalDraftLimit: 'Unlimited',
    features: [
      { id: 'team', label: 'Team workspace', included: true },
      { id: 'review-comments', label: 'Review comments', included: true },
      { id: 'admin', label: 'Admin dashboard', included: true },
      { id: 'collaboration', label: 'Collaboration features', included: true },
    ],
  },
];
