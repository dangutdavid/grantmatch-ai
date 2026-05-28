import { supabase } from '@/services/supabaseClient';
import { ActivityLogItem, AIRequestStatus } from '@/types';

export interface AiMatchScoreHistoryItem {
  id: string;
  grantExternalId: string;
  confidenceScore: number;
  explanation: string;
  createdAt: string;
}

export interface AiRunHistoryItem {
  id: string;
  draftExternalId?: string;
  operation: string;
  status: AIRequestStatus | 'unknown';
  resultSummary: string;
  createdAt: string;
}

interface AiMatchScoreRow {
  id: string;
  grant_external_id: string;
  confidence_score: number;
  explanation: string | null;
  created_at: string;
}

interface AiRunRow {
  id: string;
  draft_external_id: string | null;
  status: string;
  prompt_context: { operation?: string } | null;
  result_summary: string | null;
  created_at: string;
}

export async function fetchAiMatchScoreHistory(
  workspaceId?: string
): Promise<AiMatchScoreHistoryItem[] | undefined> {
  if (!supabase) {
    return undefined;
  }

  let query = supabase
    .from('grant_match_scores')
    .select('id,grant_external_id,confidence_score,explanation,created_at')
    .order('updated_at', { ascending: false })
    .limit(20);

  if (workspaceId) {
    query = query.or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`);
  }

  const { data, error } = await query.returns<AiMatchScoreRow[]>();

  if (error || !data) {
    return undefined;
  }

  return data.map((row) => ({
    id: row.id,
    grantExternalId: row.grant_external_id,
    confidenceScore: row.confidence_score,
    explanation: row.explanation ?? 'No explanation stored.',
    createdAt: row.created_at,
  }));
}

export async function fetchAiRunHistory(
  workspaceId?: string
): Promise<AiRunHistoryItem[] | undefined> {
  if (!supabase) {
    return undefined;
  }

  let query = supabase
    .from('proposal_generation_runs')
    .select('id,draft_external_id,status,prompt_context,result_summary,created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  if (workspaceId) {
    query = query.or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`);
  }

  const { data, error } = await query.returns<AiRunRow[]>();

  if (error || !data) {
    return undefined;
  }

  return data.map((row) => ({
    id: row.id,
    draftExternalId: row.draft_external_id ?? undefined,
    operation: row.prompt_context?.operation ?? 'ai-run',
    status: mapRunStatus(row.status),
    resultSummary: row.result_summary ?? 'No result summary stored.',
    createdAt: row.created_at,
  }));
}

export function buildLocalAiRunHistory(activityLog: ActivityLogItem[]): AiRunHistoryItem[] {
  return activityLog
    .filter((item) => item.action.startsWith('ai_'))
    .slice(0, 20)
    .map((item) => ({
      id: item.id,
      draftExternalId: item.applicationId,
      operation: item.action,
      status: item.action === 'ai_backend_unavailable' ? 'unavailable' : 'completed',
      resultSummary: item.message,
      createdAt: item.createdAt,
    }));
}

function mapRunStatus(status: string): AiRunHistoryItem['status'] {
  switch (status) {
    case 'Completed':
      return 'completed';
    case 'Failed':
      return 'failed';
    case 'Running':
      return 'running';
    case 'Unavailable':
      return 'unavailable';
    case 'Idle':
      return 'idle';
    default:
      return 'unknown';
  }
}
