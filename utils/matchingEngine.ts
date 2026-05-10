import { Grant, MatchScore, UserProfile } from '@/types';

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function countOverlaps(source: string[], target: string[]) {
  const sourceTerms = source.map((item) => item.toLowerCase());
  const targetTerms = target.map((item) => item.toLowerCase());

  return sourceTerms.filter((term) =>
    targetTerms.some((targetTerm) => targetTerm.includes(term) || term.includes(targetTerm))
  ).length;
}

function daysUntilDeadline(deadline: string) {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.ceil((deadlineDate.getTime() - today.getTime()) / millisecondsPerDay);
}

export function calculateMatchScore(user: UserProfile, grant: Grant): MatchScore {
  const topicMatches = countOverlaps(user.researchInterests, grant.topics);
  const sectorMatches = countOverlaps([user.sector, user.userType], grant.sectors);
  const deadlineWindow = daysUntilDeadline(grant.deadline);

  const relevanceScore = clampScore(58 + topicMatches * 12 + sectorMatches * 5);
  const eligibilityScore = clampScore(
    grant.eligibility.toLowerCase().includes(user.userType.toLowerCase()) ? 88 : 70 + sectorMatches * 6
  );
  const urgencyScore = clampScore(deadlineWindow <= 45 ? 92 : deadlineWindow <= 100 ? 78 : 64);
  const fundingFitScore = clampScore(user.fundingNeeds.length > 20 ? 84 + sectorMatches * 4 : 70);

  return {
    relevanceScore,
    eligibilityScore,
    urgencyScore,
    fundingFitScore,
    overallConfidence: clampScore(
      relevanceScore * 0.4 + eligibilityScore * 0.25 + urgencyScore * 0.15 + fundingFitScore * 0.2
    ),
  };
}

export function getConfidenceLabel(score: number) {
  if (score >= 85) {
    return 'High match';
  }

  if (score >= 70) {
    return 'Good match';
  }

  return 'Explore fit';
}

// TODO: Replace deterministic scoring with profile extraction, embeddings, eligibility filters, and ranking agents.
