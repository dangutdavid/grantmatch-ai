import { supabase } from '@/services/supabaseClient';
import { createGeneralProposalDraft, createGrantProposalDraft } from '@/utils/proposalDrafts';
import { Grant, ProposalDraft, UserProfile } from '@/types';
import { createAppError } from '@/utils/errors';

interface ProposalSections {
  abstract: string;
  problemStatement: string;
  methodology: string;
  expectedImpact: string;
  budgetJustification: string;
  timeline: string;
  teamCapability: string;
}

interface ProposalDraftRow {
  id: string;
  draft_external_id: string;
  grant_external_id: string | null;
  title: string;
  status: ProposalDraft['status'];
  sections: Partial<ProposalSections> | null;
  updated_at: string;
}

export async function generateProposalDraft(
  userProfile: UserProfile,
  grant?: Grant
): Promise<ProposalDraft> {
  return grant ? createGrantProposalDraft(grant, userProfile) : createGeneralProposalDraft(userProfile);
}

export async function saveProposalDraft(
  draft: ProposalDraft,
  existingDrafts: ProposalDraft[]
): Promise<ProposalDraft[]> {
  const savedDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };

  return [savedDraft, ...existingDrafts.filter((item) => item.id !== savedDraft.id)];
}

export async function fetchProposalDrafts(userId?: string): Promise<ProposalDraft[] | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('proposal_drafts')
    .select('id,draft_external_id,grant_external_id,title,status,sections,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .returns<ProposalDraftRow[]>();

  if (error || !data) {
    return undefined;
  }

  return data.map(mapRowToProposalDraft);
}

export async function createProposalDraft(
  userId: string | undefined,
  draft: ProposalDraft,
  workspaceId?: string
): Promise<ProposalDraft | undefined> {
  return upsertProposalDraft(userId, draft, workspaceId);
}

export async function updateProposalDraft(
  userId: string | undefined,
  draftId: string,
  updates: Partial<ProposalDraft>,
  workspaceId?: string
): Promise<ProposalDraft | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const existingDraft: ProposalDraft = {
    id: draftId,
    grantId: updates.grantId ?? 'general',
    proposalTitle: updates.proposalTitle ?? 'Untitled proposal',
    abstract: updates.abstract ?? '',
    problemStatement: updates.problemStatement ?? '',
    methodology: updates.methodology ?? '',
    expectedImpact: updates.expectedImpact ?? '',
    budgetJustification: updates.budgetJustification ?? '',
    timeline: updates.timeline ?? '',
    teamCapability: updates.teamCapability ?? '',
    status: updates.status ?? 'Draft',
    updatedAt: updates.updatedAt ?? new Date().toISOString(),
  };

  return upsertProposalDraft(userId, existingDraft, workspaceId);
}

export async function deleteProposalDraft(
  userId: string | undefined,
  draftId: string
): Promise<boolean> {
  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase
    .from('proposal_drafts')
    .delete()
    .eq('user_id', userId)
    .eq('draft_external_id', draftId);

  return !error;
}

export async function upsertProposalDraft(
  userId: string | undefined,
  draft: ProposalDraft,
  workspaceId?: string
): Promise<ProposalDraft | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const savedDraft: ProposalDraft = {
    ...draft,
    updatedAt: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('proposal_drafts')
    .upsert(
      {
        user_id: userId,
        workspace_id: workspaceId,
        draft_external_id: savedDraft.id,
        grant_external_id: savedDraft.grantId === 'general' ? null : savedDraft.grantId,
        title: savedDraft.proposalTitle,
        status: savedDraft.status,
        sections: mapDraftToSections(savedDraft),
      },
      { onConflict: 'user_id,draft_external_id' }
    )
    .select('id,draft_external_id,grant_external_id,title,status,sections,updated_at')
    .single<ProposalDraftRow>();

  if (error || !data) {
    throw createAppError(
      'proposal_sync_failed',
      error?.message ?? 'Unable to sync proposal draft.'
    );
  }

  return mapRowToProposalDraft(data);
}

function mapDraftToSections(draft: ProposalDraft): ProposalSections {
  return {
    abstract: draft.abstract,
    problemStatement: draft.problemStatement,
    methodology: draft.methodology,
    expectedImpact: draft.expectedImpact,
    budgetJustification: draft.budgetJustification,
    timeline: draft.timeline,
    teamCapability: draft.teamCapability,
  };
}

function mapRowToProposalDraft(row: ProposalDraftRow): ProposalDraft {
  const sections = row.sections ?? {};

  return {
    id: row.draft_external_id,
    grantId: row.grant_external_id ?? 'general',
    proposalTitle: row.title,
    abstract: sections.abstract ?? '',
    problemStatement: sections.problemStatement ?? '',
    methodology: sections.methodology ?? '',
    expectedImpact: sections.expectedImpact ?? '',
    budgetJustification: sections.budgetJustification ?? '',
    timeline: sections.timeline ?? '',
    teamCapability: sections.teamCapability ?? '',
    status: row.status,
    updatedAt: row.updated_at,
  };
}
