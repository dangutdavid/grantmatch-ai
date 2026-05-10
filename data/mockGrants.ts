import { Grant, Recommendation } from '@/types';

export const mockGrants: Grant[] = [
  {
    id: 'grant-001',
    title: 'Global Health AI Innovation Fund',
    funder: 'Wellcome Applied Research Programme',
    description:
      'Supports responsible AI projects that improve health outcomes in underserved communities through applied research, validation, and implementation partnerships.',
    eligibility:
      'Open to universities, research institutes, NGOs, and health technology startups with a named research lead and an implementation partner.',
    deadline: '2026-08-15',
    fundingAmount: '$250,000 - $750,000',
    regionEligibility: 'Global, with priority for LMIC implementation sites',
    requiredDocuments: ['Concept note', 'Budget', 'Team CVs', 'Ethics plan', 'Implementation partner letter'],
    topics: ['public health', 'AI diagnostics', 'health equity', 'implementation science'],
    sectors: ['Health technology', 'Research', 'NGO'],
  },
  {
    id: 'grant-002',
    title: 'Climate Resilience Community Grants',
    funder: 'Green Futures Foundation',
    description:
      'Funds community-led climate adaptation, resilience planning, and digital tools that help vulnerable regions prepare for environmental risk.',
    eligibility:
      'Open to NGOs, local governments, universities, and social enterprises working with community stakeholders.',
    deadline: '2026-07-02',
    fundingAmount: '$50,000 - $300,000',
    regionEligibility: 'Africa, South Asia, Latin America, and small island states',
    requiredDocuments: ['Project plan', 'Community engagement strategy', 'Budget', 'Risk assessment'],
    topics: ['climate resilience', 'community data', 'adaptation', 'policy'],
    sectors: ['Climate', 'NGO', 'Public policy'],
  },
  {
    id: 'grant-003',
    title: 'Digital Inclusion Research Challenge',
    funder: 'Open Society Technology Initiative',
    description:
      'Backs research and pilot programmes that expand access to digital services, reduce exclusion, and strengthen equitable technology adoption.',
    eligibility:
      'Open to research teams, nonprofits, and startups with a measurable inclusion outcome and clear user research plan.',
    deadline: '2026-09-30',
    fundingAmount: '$100,000 - $500,000',
    regionEligibility: 'United States, Europe, and partner countries',
    requiredDocuments: ['Research summary', 'Impact metrics', 'Budget', 'Data protection statement'],
    topics: ['digital inclusion', 'equity', 'AI governance', 'user research'],
    sectors: ['Technology', 'Research', 'Social impact'],
  },
  {
    id: 'grant-004',
    title: 'Women-Led Startup Science Fund',
    funder: 'Catalyst Ventures Philanthropy',
    description:
      'Provides non-dilutive funding for women-led startups translating scientific research into scalable products with public benefit.',
    eligibility:
      'Open to early-stage startups with at least one woman founder in a scientific or technical leadership role.',
    deadline: '2026-06-20',
    fundingAmount: '$75,000 - $200,000',
    regionEligibility: 'United States, Canada, United Kingdom, and European Union',
    requiredDocuments: ['Pitch deck', 'Use of funds', 'Founder bios', 'Market validation summary'],
    topics: ['commercialisation', 'startup', 'science translation', 'impact'],
    sectors: ['Startup', 'Science', 'Technology'],
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec-001',
    grantId: 'grant-001',
    matchScore: {
      relevanceScore: 94,
      eligibilityScore: 88,
      urgencyScore: 74,
      fundingFitScore: 91,
      overallConfidence: 87,
    },
    matchExplanation:
      'Strong alignment with AI diagnostics, public health implementation, and health equity interests.',
    saved: false,
  },
  {
    id: 'rec-002',
    grantId: 'grant-003',
    matchScore: {
      relevanceScore: 82,
      eligibilityScore: 79,
      urgencyScore: 69,
      fundingFitScore: 84,
      overallConfidence: 79,
    },
    matchExplanation:
      'Good fit for equitable AI adoption and user research, with moderate sector overlap.',
    saved: false,
  },
  {
    id: 'rec-003',
    grantId: 'grant-002',
    matchScore: {
      relevanceScore: 68,
      eligibilityScore: 76,
      urgencyScore: 86,
      fundingFitScore: 72,
      overallConfidence: 75,
    },
    matchExplanation:
      'Relevant if the project includes community health resilience or climate-health outcomes.',
    saved: true,
  },
  {
    id: 'rec-004',
    grantId: 'grant-004',
    matchScore: {
      relevanceScore: 58,
      eligibilityScore: 61,
      urgencyScore: 93,
      fundingFitScore: 63,
      overallConfidence: 69,
    },
    matchExplanation:
      'Potential commercialisation fit, but eligibility depends on startup structure and founder criteria.',
    saved: false,
  },
];

// TODO: Replace static grants with an ingestion pipeline from funder portals and grant databases.
// TODO: Add embedding-based semantic search and ranking through the future Matching Agent.
