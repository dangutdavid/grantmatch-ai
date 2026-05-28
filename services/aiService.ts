import { env, isBackendAiConfigured } from '@/constants/env';
import {
  persistGrantMatchResults,
  recordAiRun,
  summarizeReadiness,
} from '@/services/aiPersistenceService';
import { generateProposalDraft } from '@/services/proposalService';
import { supabase } from '@/services/supabaseClient';
import {
  AIMatchInput,
  AIMatchResult,
  Grant,
  GrantMatchRequest,
  GrantMatchResponse,
  ProposalDraft,
  ProposalGenerationInput,
  ProposalGenerationRequest,
  ProposalGenerationResponse,
  ProposalGenerationResult,
  ProposalImprovementRequest,
  ProposalImprovementResponse,
  ProposalReadinessScore,
  ProposalReadinessRequest,
  ProposalReadinessResponse,
  ProposalSectionFeedback,
  RankingSignal,
  UserProfile,
} from '@/types';
import { createAppError } from '@/utils/errors';

export async function generateProposalWithAiPlaceholder(
  userProfile: UserProfile,
  grant?: Grant
): Promise<ProposalDraft> {
  // TODO: Replace with a secure backend endpoint that calls the AI provider server-side.
  return generateProposalDraft(userProfile, grant);
}

export async function improveProposalSection(sectionText: string): Promise<string> {
  // TODO: Replace with real AI refinement once backend auth and rate limits are in place.
  return `${sectionText} The improved version will add clearer outcomes, measurable milestones, and funder-aligned language.`;
}

export function getAiBackendMode() {
  return isBackendAiConfigured ? 'backend' : 'mock';
}

export async function requestGrantMatch(request: GrantMatchRequest): Promise<GrantMatchResponse> {
  if (isBackendAiConfigured) {
    const response = await aiBackendRequest<GrantMatchResponse, GrantMatchRequest>('match-grants', request);
    persistGrantMatchResults(response.results, request.workspaceId).catch((error) => {
      console.warn('Unable to persist backend match scores.', error);
    });

    return response;
  }

  const response: GrantMatchResponse = {
    mode: 'mock',
    status: 'completed',
    results: rankGrantsForUser({ profile: request.profile, grants: request.grants }),
    generatedAt: new Date().toISOString(),
  };
  persistGrantMatchResults(response.results, request.workspaceId).catch((error) => {
    console.warn('Unable to persist mock match scores.', error);
  });

  return response;
}

export async function requestMatchExplanation(request: GrantMatchRequest): Promise<GrantMatchResponse> {
  if (isBackendAiConfigured) {
    return aiBackendRequest<GrantMatchResponse, GrantMatchRequest>('explain-match', request);
  }

  return requestGrantMatch(request);
}

export async function requestProposalGeneration(
  request: ProposalGenerationRequest
): Promise<ProposalGenerationResponse> {
  if (isBackendAiConfigured) {
    const response = await aiBackendRequest<ProposalGenerationResponse, ProposalGenerationRequest>(
      'generate-proposal',
      request
    );
    recordAiRun({
      workspaceId: request.workspaceId,
      draft: response.result.draft,
      operation: 'generate-proposal',
      status: response.status,
      promptContext: prepareProposalPromptContext(request),
      resultSummary: summarizeReadiness(response.result.readiness),
    }).catch((error) => {
      console.warn('Unable to persist backend proposal generation run.', error);
    });

    return response;
  }

  const draft = await generateProposalDraft(request.profile, request.grant);
  const response: ProposalGenerationResponse = {
    mode: 'mock',
    status: 'completed',
    result: buildProposalGenerationResult(draft),
    generatedAt: new Date().toISOString(),
  };
  recordAiRun({
    workspaceId: request.workspaceId,
    draft,
    operation: 'generate-proposal',
    status: response.status,
    promptContext: prepareProposalPromptContext(request),
    resultSummary: summarizeReadiness(response.result.readiness),
  }).catch((error) => {
    console.warn('Unable to persist mock proposal generation run.', error);
  });

  return response;
}

export async function requestProposalImprovement(
  request: ProposalImprovementRequest
): Promise<ProposalImprovementResponse> {
  if (isBackendAiConfigured) {
    const response = await aiBackendRequest<ProposalImprovementResponse, ProposalImprovementRequest>(
      'improve-proposal',
      request
    );
    recordAiRun({
      workspaceId: request.workspaceId,
      draft: response.draft ?? request.draft,
      operation: 'improve-proposal',
      status: response.status,
      promptContext: { section: request.section },
      resultSummary: response.improvedText ? 'Proposal section improved.' : 'Proposal improvement completed.',
    }).catch((error) => {
      console.warn('Unable to persist backend proposal improvement run.', error);
    });

    return response;
  }

  const improvedText = request.text
    ? improveProposalSectionMock(String(request.section ?? 'section'), request.text)
    : undefined;

  const response: ProposalImprovementResponse = {
    mode: 'mock',
    status: 'completed',
    draft: request.draft,
    improvedText,
    generatedAt: new Date().toISOString(),
  };
  recordAiRun({
    workspaceId: request.workspaceId,
    draft: request.draft,
    operation: 'improve-proposal',
    status: response.status,
    promptContext: { section: request.section },
    resultSummary: improvedText ? 'Proposal section improved.' : 'Proposal improvement completed.',
  }).catch((error) => {
    console.warn('Unable to persist mock proposal improvement run.', error);
  });

  return response;
}

export async function requestProposalReadinessScore(
  request: ProposalReadinessRequest
): Promise<ProposalReadinessResponse> {
  if (isBackendAiConfigured) {
    const response = await aiBackendRequest<ProposalReadinessResponse, ProposalReadinessRequest>(
      'score-proposal',
      request
    );
    recordAiRun({
      workspaceId: request.workspaceId,
      draft: request.draft,
      operation: 'score-proposal',
      status: response.status,
      resultSummary: summarizeReadiness(response.readiness),
    }).catch((error) => {
      console.warn('Unable to persist backend proposal readiness run.', error);
    });

    return response;
  }

  const response = buildProposalReadinessResponse(request.draft);
  recordAiRun({
    workspaceId: request.workspaceId,
    draft: request.draft,
    operation: 'score-proposal',
    status: response.status,
    resultSummary: summarizeReadiness(response.readiness),
  }).catch((error) => {
    console.warn('Unable to persist mock proposal readiness run.', error);
  });

  return response;
}

export async function requestReviewerQuestions(
  request: ProposalReadinessRequest
): Promise<ProposalReadinessResponse> {
  if (isBackendAiConfigured) {
    return aiBackendRequest<ProposalReadinessResponse, ProposalReadinessRequest>(
      'generate-review-questions',
      request
    );
  }

  return buildProposalReadinessResponse(request.draft);
}

export async function requestBudgetJustification(
  request: ProposalReadinessRequest
): Promise<ProposalReadinessResponse> {
  if (isBackendAiConfigured) {
    return aiBackendRequest<ProposalReadinessResponse, ProposalReadinessRequest>(
      'generate-review-questions',
      request
    );
  }

  return buildProposalReadinessResponse(request.draft);
}

export async function requestImpactStatement(
  request: ProposalReadinessRequest
): Promise<ProposalReadinessResponse> {
  if (isBackendAiConfigured) {
    return aiBackendRequest<ProposalReadinessResponse, ProposalReadinessRequest>(
      'generate-review-questions',
      request
    );
  }

  return buildProposalReadinessResponse(request.draft);
}

export function generateGrantEmbeddingPlaceholder(grant: Grant): number[] {
  return deterministicVector(`${grant.title} ${grant.description} ${grant.topics.join(' ')}`);
}

export function generateProfileEmbeddingPlaceholder(profile: UserProfile): number[] {
  return deterministicVector(`${profile.userType} ${profile.sector} ${profile.researchInterests.join(' ')}`);
}

export function calculateSemanticSimilarityMock(first: number[], second: number[]) {
  const dot = first.reduce((total, value, index) => total + value * (second[index] ?? 0), 0);
  return Math.round(Math.min(100, Math.max(0, dot * 100)));
}

export function generateMatchScoreBreakdown(profile: UserProfile, grant: Grant): RankingSignal[] {
  const interests = profile.researchInterests.map((item) => item.toLowerCase());
  const topics = grant.topics.map((item) => item.toLowerCase());
  const sharedTopics = topics.filter((topic) =>
    interests.some((interest) => interest.includes(topic) || topic.includes(interest))
  );
  const topicFit = Math.min(95, 55 + sharedTopics.length * 15);
  const eligibilityFit = grant.eligibility.toLowerCase().includes(profile.userType.toLowerCase()) ? 88 : 72;
  const fundingFit = profile.fundingNeeds && grant.fundingAmount ? 78 : 64;
  const strategicFit = grant.sectors.some((sector) => sector.toLowerCase() === profile.sector.toLowerCase()) ? 86 : 70;

  return [
    { label: 'Topic fit', score: topicFit, explanation: sharedTopics.length > 0 ? `Shared topics: ${sharedTopics.join(', ')}.` : 'General thematic overlap from profile context.' },
    { label: 'Eligibility fit', score: eligibilityFit, explanation: 'Mock eligibility check from user type and grant text.' },
    { label: 'Deadline readiness', score: 76, explanation: 'Mock readiness based on current application planning stage.' },
    { label: 'Funding fit', score: fundingFit, explanation: 'Mock funding fit based on profile needs and grant amount.' },
    { label: 'Strategic fit', score: strategicFit, explanation: 'Mock strategic fit from sector and collaboration context.' },
  ];
}

export function explainMatch(signals: RankingSignal[]) {
  const strongest = [...signals].sort((first, second) => second.score - first.score)[0];

  return {
    summary: strongest
      ? `Strongest signal: ${strongest.label} (${strongest.score}%).`
      : 'No ranking signals available.',
    signals,
  };
}

export function rankGrantsForUser(input: AIMatchInput): AIMatchResult[] {
  const profileVector = generateProfileEmbeddingPlaceholder(input.profile);

  return input.grants
    .map((grant) => {
      const signals = generateMatchScoreBreakdown(input.profile, grant);
      const semanticScore = calculateSemanticSimilarityMock(
        profileVector,
        generateGrantEmbeddingPlaceholder(grant)
      );
      const averageSignal = Math.round(
        signals.reduce((total, signal) => total + signal.score, semanticScore) / (signals.length + 1)
      );

      return {
        grant,
        confidenceScore: averageSignal,
        topicFit: signals[0].score,
        eligibilityFit: signals[1].score,
        deadlineReadiness: signals[2].score,
        fundingFit: signals[3].score,
        strategicFit: signals[4].score,
        explanation: explainMatch(signals),
      };
    })
    .sort((first, second) => second.confidenceScore - first.confidenceScore);
}

export function prepareProposalPromptContext(input: ProposalGenerationInput) {
  return {
    profile: `${input.profile.fullName}, ${input.profile.userType}, ${input.profile.organisation}`,
    grant: input.grant ? `${input.grant.title} from ${input.grant.funder}` : 'General proposal',
    draftTitle: input.draft?.proposalTitle ?? 'New draft',
  };
}

export function generateProposalSectionMock(section: string, input: ProposalGenerationInput) {
  const context = prepareProposalPromptContext(input);
  return `${section}: mock generated content for ${context.grant}, tailored to ${context.profile}.`;
}

export function improveProposalSectionMock(section: string, text: string) {
  return `${text} Improvement note for ${section}: add measurable outcomes, funder alignment, and clearer evidence.`;
}

export function scoreProposalReadinessMock(draft?: ProposalDraft): ProposalReadinessScore {
  const sections: [keyof ProposalDraft, string][] = [
    ['abstract', 'Abstract'],
    ['problemStatement', 'Problem statement'],
    ['methodology', 'Methodology'],
    ['expectedImpact', 'Expected impact'],
    ['budgetJustification', 'Budget justification'],
    ['timeline', 'Timeline'],
    ['teamCapability', 'Team capability'],
  ];
  const feedback: ProposalSectionFeedback[] = sections.map(([key, label]) => {
    const value = String(draft?.[key] ?? '');
    const score = value.length > 160 ? 85 : value.length > 60 ? 68 : 42;
    return { section: label, score, feedback: score >= 80 ? 'Looks ready for review.' : 'Needs more specificity before review.' };
  });
  const missingSections = feedback.filter((item) => item.score < 50).map((item) => item.section);
  const weakSections = feedback.filter((item) => item.score >= 50 && item.score < 75).map((item) => item.section);

  return {
    overall: Math.round(feedback.reduce((total, item) => total + item.score, 0) / feedback.length),
    missingSections,
    weakSections,
    feedback,
  };
}

export function generateReviewerQuestionsMock(draft?: ProposalDraft) {
  return [
    `What evidence supports the central problem in ${draft?.proposalTitle ?? 'this proposal'}?`,
    'How will outcomes be measured and reported?',
    'Which delivery risks need mitigation before submission?',
  ];
}

export function generateBudgetJustificationMock(draft?: ProposalDraft) {
  return draft?.budgetJustification
    ? 'Budget rationale is present; add assumptions, unit costs, and funder-specific categories.'
    : 'Budget justification is missing and should be drafted before review.';
}

export function generateImpactStatementMock(draft?: ProposalDraft) {
  return draft?.expectedImpact
    ? 'Impact statement should connect outputs to measurable beneficiary outcomes.'
    : 'Impact statement is missing and should explain who benefits and how success is measured.';
}

function buildProposalGenerationResult(draft: ProposalDraft): ProposalGenerationResult {
  return {
    draft,
    readiness: scoreProposalReadinessMock(draft),
    reviewerQuestions: generateReviewerQuestionsMock(draft),
  };
}

function buildProposalReadinessResponse(draft?: ProposalDraft): ProposalReadinessResponse {
  return {
    mode: 'mock',
    status: 'completed',
    readiness: scoreProposalReadinessMock(draft),
    reviewerQuestions: generateReviewerQuestionsMock(draft),
    budgetJustificationFeedback: generateBudgetJustificationMock(draft),
    impactStatementFeedback: generateImpactStatementMock(draft),
    generatedAt: new Date().toISOString(),
  };
}

async function aiBackendRequest<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  if (!isBackendAiConfigured) {
    throw createAppError('ai_backend_not_configured', 'Backend AI endpoint is not configured.');
  }

  const url = `${env.aiApiBaseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const token = await getSupabaseAccessToken();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw createAppError('ai_backend_request_failed', `AI backend request failed with status ${response.status}.`);
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }

    throw createAppError(
      'ai_backend_network_error',
      'Unable to reach the backend AI endpoint. Mock AI remains available.',
      error
    );
  }
}

async function getSupabaseAccessToken() {
  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return undefined;
  }

  return data.session?.access_token;
}

function deterministicVector(text: string) {
  const seed = text.split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  return Array.from({ length: 8 }, (_, index) => ((seed * (index + 3)) % 97) / 97);
}
