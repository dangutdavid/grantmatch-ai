import { Grant, ProposalDraft, UserProfile } from '@/types';

export function createGeneralProposalDraft(user: UserProfile): ProposalDraft {
  return {
    id: 'proposal-general',
    grantId: 'general',
    proposalTitle: `${user.organisation} Grant Proposal Concept`,
    abstract:
      'This general mock draft outlines a fundable project concept that can later be tailored to a specific grant opportunity.',
    problemStatement:
      'The proposal addresses a clearly defined need in the applicant sector and frames why funding support is timely and important.',
    methodology:
      'The work will combine stakeholder engagement, structured research activities, delivery milestones, and practical evaluation.',
    expectedImpact:
      'Expected impact includes measurable benefits for target communities, stronger evidence for decision-making, and scalable learning.',
    budgetJustification:
      'The budget will align staff time, delivery costs, partner coordination, evaluation, and dissemination with funder expectations.',
    timeline:
      'The timeline will move from discovery and planning to delivery, evaluation, reporting, and future scale-up.',
    teamCapability:
      `${user.organisation} brings relevant expertise in ${user.sector}, with collaboration interests across ${user.collaborationInterests}.`,
    status: 'Draft',
    updatedAt: new Date().toISOString(),
  };
}

export function createGrantProposalDraft(grant: Grant, user: UserProfile): ProposalDraft {
  return {
    id: `proposal-${grant.id}`,
    grantId: grant.id,
    proposalTitle: `${grant.title}: ${user.organisation} Implementation Proposal`,
    abstract: `This mock draft responds to ${grant.funder}'s ${grant.title} by proposing a project aligned with ${grant.topics.join(', ')} and the applicant profile for ${user.organisation}.`,
    problemStatement: `The proposal addresses the opportunity described by ${grant.funder}: ${grant.description}`,
    methodology: `The project will combine ${user.sector.toLowerCase()} expertise, partner engagement, implementation milestones, and evidence collection tailored to ${grant.regionEligibility}.`,
    expectedImpact: `Expected impact includes measurable progress against ${grant.funder}'s priorities, stronger applicant readiness, and useful outcomes for future funding rounds.`,
    budgetJustification: `The requested budget will support delivery, staffing, partner coordination, monitoring, and the required documents: ${grant.requiredDocuments.join(', ')}.`,
    timeline: `The workplan is structured around the ${grant.deadline} deadline, with preparation, submission, implementation, and reporting phases.`,
    teamCapability: `${user.organisation} can contribute ${user.researchInterests.join(', ')} expertise and collaborate with ${user.collaborationInterests}.`,
    status: 'Draft',
    updatedAt: new Date().toISOString(),
  };
}
