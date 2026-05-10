interface GrantLike {
  id?: string;
  title?: string;
  funder?: string;
  topics?: string[];
  sectors?: string[];
}

interface DraftLike {
  id?: string;
  proposalTitle?: string;
  abstract?: string;
  problemStatement?: string;
  methodology?: string;
  expectedImpact?: string;
  budgetJustification?: string;
  timeline?: string;
  teamCapability?: string;
}

export function mockMatchResults(grants: GrantLike[] = []) {
  return grants.map((grant, index) => {
    const confidenceScore = Math.max(55, 92 - index * 7);

    return {
      grant,
      confidenceScore,
      topicFit: Math.max(50, confidenceScore - 4),
      eligibilityFit: Math.max(50, confidenceScore - 8),
      deadlineReadiness: 76,
      fundingFit: Math.max(50, confidenceScore - 10),
      strategicFit: Math.max(50, confidenceScore - 6),
      explanation: {
        summary: `Mock backend ranking for ${grant.title ?? 'grant'} is ${confidenceScore}%.`,
        signals: [
          {
            label: 'Topic fit',
            score: Math.max(50, confidenceScore - 4),
            explanation: 'Mock server-side topic overlap signal.',
          },
          {
            label: 'Eligibility fit',
            score: Math.max(50, confidenceScore - 8),
            explanation: 'Mock server-side eligibility signal.',
          },
        ],
      },
    };
  });
}

export function mockReadiness(draft?: DraftLike) {
  const sections = [
    ['abstract', 'Abstract'],
    ['problemStatement', 'Problem statement'],
    ['methodology', 'Methodology'],
    ['expectedImpact', 'Expected impact'],
    ['budgetJustification', 'Budget justification'],
    ['timeline', 'Timeline'],
    ['teamCapability', 'Team capability'],
  ] as const;

  const feedback = sections.map(([key, label]) => {
    const value = String(draft?.[key] ?? '');
    const score = value.length > 160 ? 86 : value.length > 60 ? 68 : 44;

    return {
      section: label,
      score,
      feedback: score >= 80 ? 'Ready for reviewer pass.' : 'Needs stronger detail before submission.',
    };
  });

  return {
    overall: Math.round(feedback.reduce((total, item) => total + item.score, 0) / feedback.length),
    missingSections: feedback.filter((item) => item.score < 50).map((item) => item.section),
    weakSections: feedback.filter((item) => item.score >= 50 && item.score < 75).map((item) => item.section),
    feedback,
  };
}

export function mockReviewerQuestions(title = 'this proposal') {
  return [
    `What evidence best supports the need described in ${title}?`,
    'How will the team measure outcomes and report learning?',
    'Which delivery risks should be mitigated before submission?',
  ];
}

export function mockDraft(payload: Record<string, unknown>) {
  const grant = payload.grant as GrantLike | undefined;
  const title = grant?.title ? `${grant.title} proposal` : 'General grant proposal';

  return {
    id: `edge-draft-${Date.now()}`,
    grantId: grant?.id ?? '',
    proposalTitle: title,
    abstract: `Mock backend abstract for ${title}.`,
    problemStatement: 'Mock backend problem statement with clear need and beneficiaries.',
    methodology: 'Mock backend methodology with staged delivery and evaluation.',
    expectedImpact: 'Mock backend impact statement with measurable outcomes.',
    budgetJustification: 'Mock backend budget justification with categories and assumptions.',
    timeline: 'Mock backend timeline with milestones.',
    teamCapability: 'Mock backend team capability summary.',
    status: 'Draft',
    updatedAt: new Date().toISOString(),
  };
}
