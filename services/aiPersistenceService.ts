import { supabase } from '@/services/supabaseClient';
import {
  AIMatchResult,
  AIRequestStatus,
  ProposalDraft,
  ProposalReadinessScore,
} from '@/types';

interface RecordAiRunInput {
  workspaceId?: string;
  draft?: ProposalDraft;
  operation: 'generate-proposal' | 'improve-proposal' | 'score-proposal' | 'review-questions';
  status: AIRequestStatus;
  promptContext?: Record<string, unknown>;
  resultSummary: string;
}

export async function persistGrantMatchResults(
  results: AIMatchResult[],
  workspaceId?: string
): Promise<boolean> {
  if (!supabase || results.length === 0) {
    return false;
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return false;
  }

  const { error } = await supabase.from('grant_match_scores').upsert(
    results.map((result) => ({
      user_id: userId,
      workspace_id: workspaceId,
      grant_external_id: result.grant.id,
      confidence_score: result.confidenceScore,
      signals: result.explanation.signals,
      explanation: result.explanation.summary,
    })),
    { onConflict: 'user_id,grant_external_id' }
  );

  return !error;
}

export async function recordAiRun(input: RecordAiRunInput): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  const userId = await getCurrentUserId();

  if (!userId) {
    return false;
  }

  const { error } = await supabase.from('proposal_generation_runs').insert({
    user_id: userId,
    workspace_id: input.workspaceId,
    draft_external_id: input.draft?.id,
    status: mapAiStatusToRunStatus(input.status),
    prompt_context: {
      operation: input.operation,
      draftTitle: input.draft?.proposalTitle,
      ...input.promptContext,
    },
    result_summary: input.resultSummary,
  });

  return !error;
}

export function summarizeReadiness(readiness: ProposalReadinessScore) {
  const missing = readiness.missingSections.length;
  const weak = readiness.weakSections.length;

  return `${readiness.overall}% readiness; ${missing} missing sections; ${weak} weak sections.`;
}

async function getCurrentUserId() {
  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return undefined;
  }

  return data.user.id;
}

function mapAiStatusToRunStatus(status: AIRequestStatus) {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'running':
      return 'Running';
    case 'unavailable':
      return 'Unavailable';
    default:
      return 'Idle';
  }
}
