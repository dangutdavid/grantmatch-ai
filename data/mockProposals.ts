import { ProposalDraft } from '@/types';

export const mockProposalDrafts: ProposalDraft[] = [
  {
    id: 'proposal-001',
    grantId: 'grant-001',
    proposalTitle: 'AI-Enabled Community Diagnostics for Earlier Public Health Intervention',
    abstract:
      'This project will validate an AI-assisted diagnostic workflow with community health partners to improve early detection and referral in underserved settings.',
    problemStatement:
      'Many underserved communities face delayed diagnosis because clinical capacity, specialist access, and referral pathways are limited.',
    methodology:
      'The team will run a mixed-methods pilot, combining model validation, workflow design, clinician interviews, and implementation readiness assessment.',
    expectedImpact:
      'The project aims to shorten time to diagnosis, improve referral quality, and produce an implementation toolkit for partner health systems.',
    budgetJustification:
      'Funds will support research staff, field validation, community engagement, data governance review, and dissemination materials.',
    timeline:
      'Months 1-2: partner setup and ethics. Months 3-7: pilot validation. Months 8-10: analysis. Months 11-12: toolkit and reporting.',
    teamCapability:
      'The team combines AI research, public health implementation, clinical partnership, and community engagement experience.',
    status: 'Draft',
  },
];

// TODO: Connect proposal drafts to an OpenAI-powered Proposal Agent after backend auth is available.
