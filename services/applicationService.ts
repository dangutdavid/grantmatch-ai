import { supabase } from '@/services/supabaseClient';
import { createApplicationChecklist, getApplicationNextAction } from '@/utils/applications';
import {
  ActivityLogItem,
  ApplicationChecklistItem,
  ApplicationStatus,
  Grant,
  ReviewComment,
  TrackedApplication,
  WorkspaceMember,
} from '@/types';
import { createAppError } from '@/utils/errors';

type ChecklistCategory = 'Eligibility' | 'Proposal' | 'Budget' | 'Documents' | 'Review' | 'Submission';

interface TrackedApplicationRow {
  id: string;
  application_external_id: string;
  grant_external_id: string;
  grant_title: string;
  funder: string | null;
  deadline: string | null;
  status: ApplicationStatus;
  linked_proposal_draft_id: string | null;
  linked_proposal_draft_external_id: string | null;
  notes: string | null;
  next_action: { recommendation?: string } | null;
  updated_at: string;
}

interface ApplicationChecklistRow {
  id: string;
  tracked_application_id: string | null;
  application_external_id: string | null;
  checklist_external_id: string | null;
  title: string;
  completed: boolean;
  required: boolean;
  category: ChecklistCategory | null;
  updated_at: string;
}

interface ReviewCommentRow {
  id: string;
  application_external_id: string | null;
  comment_external_id: string | null;
  member_external_id: string | null;
  commenter_name: string | null;
  commenter_role: string | null;
  comment: string;
  created_at: string;
}

interface ActivityLogRow {
  id: string;
  activity_external_id: string | null;
  type: ActivityLogItem['action'];
  title: string;
  description: string;
  actor_name: string | null;
  related_entity_type: string | null;
  related_entity_external_id: string | null;
  metadata: {
    applicationId?: string;
    actorMemberId?: string;
  } | null;
  message: string;
  created_at: string;
}

export interface ApplicationChecklistSyncRecord {
  applicationExternalId: string;
  item: ApplicationChecklistItem;
}

export async function createTrackedApplicationRecord(
  grant: Grant,
  linkedProposalDraftId?: string
): Promise<TrackedApplication> {
  const status: ApplicationStatus = linkedProposalDraftId ? 'Drafting' : 'Not Started';

  return {
    id: `application-${grant.id}-${Date.now()}`,
    grantId: grant.id,
    grantTitle: grant.title,
    funder: grant.funder,
    deadline: grant.deadline,
    status,
    linkedProposalDraftId,
    notes: '',
    checklistItems: createApplicationChecklist(grant),
    updatedAt: new Date().toISOString(),
    nextActionRecommendation: getApplicationNextAction(status),
  };
}

export async function updateApplicationStatusRecord(
  application: TrackedApplication,
  status: ApplicationStatus
): Promise<TrackedApplication> {
  return {
    ...application,
    status,
    updatedAt: new Date().toISOString(),
    nextActionRecommendation: getApplicationNextAction(status),
  };
}

export async function fetchTrackedApplications(
  userId?: string
): Promise<TrackedApplication[] | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data: applicationRows, error: applicationsError } = await supabase
    .from('tracked_applications')
    .select(
      'id,application_external_id,grant_external_id,grant_title,funder,deadline,status,linked_proposal_draft_id,linked_proposal_draft_external_id,notes,next_action,updated_at'
    )
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .returns<TrackedApplicationRow[]>();

  if (applicationsError || !applicationRows) {
    return undefined;
  }

  const { data: checklistRows } = await supabase
    .from('application_checklists')
    .select(
      'id,tracked_application_id,application_external_id,checklist_external_id,title,completed,required,category,updated_at'
    )
    .eq('user_id', userId)
    .returns<ApplicationChecklistRow[]>();

  const checklistItemsByApplication = new Map<string, ApplicationChecklistItem[]>();
  (checklistRows ?? []).forEach((row) => {
    const applicationExternalId = row.application_external_id;

    if (!applicationExternalId) {
      return;
    }

    const items = checklistItemsByApplication.get(applicationExternalId) ?? [];
    items.push(mapRowToChecklistItem(row));
    checklistItemsByApplication.set(applicationExternalId, items);
  });

  return applicationRows.map((row) =>
    mapRowToTrackedApplication(row, checklistItemsByApplication.get(row.application_external_id) ?? [])
  );
}

export async function createTrackedApplication(
  userId: string | undefined,
  application: TrackedApplication,
  workspaceId?: string
): Promise<TrackedApplication | undefined> {
  return upsertTrackedApplication(userId, application, workspaceId);
}

export async function updateTrackedApplication(
  userId: string | undefined,
  applicationId: string,
  updates: Partial<TrackedApplication>,
  workspaceId?: string
): Promise<TrackedApplication | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const updatePayload: Partial<TrackedApplicationRow> & {
    workspace_id?: string;
    grant_external_id?: string;
    grant_title?: string;
    linked_proposal_draft_external_id?: string | null;
    next_action?: { recommendation: string };
  } = {
    workspace_id: workspaceId,
  };

  if (updates.grantId !== undefined) {
    updatePayload.grant_external_id = updates.grantId;
  }

  if (updates.grantTitle !== undefined) {
    updatePayload.grant_title = updates.grantTitle;
  }

  if (updates.funder !== undefined) {
    updatePayload.funder = updates.funder;
  }

  if (updates.deadline !== undefined) {
    updatePayload.deadline = updates.deadline;
  }

  if (updates.status !== undefined) {
    updatePayload.status = updates.status;
    updatePayload.next_action = {
      recommendation: getApplicationNextAction(updates.status),
    };
  }

  if (updates.linkedProposalDraftId !== undefined) {
    updatePayload.linked_proposal_draft_external_id = updates.linkedProposalDraftId ?? null;
  }

  if (updates.notes !== undefined) {
    updatePayload.notes = updates.notes;
  }

  const { data, error } = await supabase
    .from('tracked_applications')
    .update(updatePayload)
    .eq('user_id', userId)
    .eq('application_external_id', applicationId)
    .select(
      'id,application_external_id,grant_external_id,grant_title,funder,deadline,status,linked_proposal_draft_id,linked_proposal_draft_external_id,notes,next_action,updated_at'
    )
    .single<TrackedApplicationRow>();

  if (error || !data) {
    throw createAppError(
      'application_sync_failed',
      error?.message ?? 'Unable to sync tracked application.'
    );
  }

  return mapRowToTrackedApplication(data, updates.checklistItems ?? []);
}

export async function deleteTrackedApplication(
  userId: string | undefined,
  applicationId: string
): Promise<boolean> {
  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase
    .from('tracked_applications')
    .delete()
    .eq('user_id', userId)
    .eq('application_external_id', applicationId);

  return !error;
}

export async function upsertTrackedApplication(
  userId: string | undefined,
  application: TrackedApplication,
  workspaceId?: string
): Promise<TrackedApplication | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const savedApplication: TrackedApplication = {
    ...application,
    updatedAt: new Date().toISOString(),
    nextActionRecommendation: getApplicationNextAction(application.status),
  };

  const { data, error } = await supabase
    .from('tracked_applications')
    .upsert(
      {
        user_id: userId,
        workspace_id: workspaceId,
        application_external_id: savedApplication.id,
        grant_external_id: savedApplication.grantId,
        grant_title: savedApplication.grantTitle,
        funder: savedApplication.funder,
        deadline: savedApplication.deadline,
        status: savedApplication.status,
        linked_proposal_draft_external_id: savedApplication.linkedProposalDraftId ?? null,
        notes: savedApplication.notes,
        next_action: {
          recommendation: savedApplication.nextActionRecommendation,
        },
      },
      { onConflict: 'user_id,application_external_id' }
    )
    .select(
      'id,application_external_id,grant_external_id,grant_title,funder,deadline,status,linked_proposal_draft_id,linked_proposal_draft_external_id,notes,next_action,updated_at'
    )
    .single<TrackedApplicationRow>();

  if (error || !data) {
    throw createAppError(
      'application_sync_failed',
      error?.message ?? 'Unable to sync tracked application.'
    );
  }

  return mapRowToTrackedApplication(data, savedApplication.checklistItems);
}

export async function fetchApplicationChecklists(
  userId?: string
): Promise<ApplicationChecklistSyncRecord[] | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('application_checklists')
    .select(
      'id,tracked_application_id,application_external_id,checklist_external_id,title,completed,required,category,updated_at'
    )
    .eq('user_id', userId)
    .returns<ApplicationChecklistRow[]>();

  if (error || !data) {
    return undefined;
  }

  return data
    .filter((row) => Boolean(row.application_external_id))
    .map((row) => ({
      applicationExternalId: row.application_external_id ?? '',
      item: mapRowToChecklistItem(row),
    }));
}

export async function fetchChecklistForApplication(
  userId: string | undefined,
  applicationExternalId: string
): Promise<ApplicationChecklistItem[] | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('application_checklists')
    .select(
      'id,tracked_application_id,application_external_id,checklist_external_id,title,completed,required,category,updated_at'
    )
    .eq('user_id', userId)
    .eq('application_external_id', applicationExternalId)
    .returns<ApplicationChecklistRow[]>();

  if (error || !data) {
    return undefined;
  }

  return data.map(mapRowToChecklistItem);
}

export async function createChecklistItems(
  userId: string | undefined,
  applicationExternalId: string,
  items: ApplicationChecklistItem[]
): Promise<ApplicationChecklistItem[] | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('application_checklists')
    .upsert(
      items.map((item) => ({
        user_id: userId,
        application_external_id: applicationExternalId,
        checklist_external_id: item.id,
        title: item.label,
        completed: item.completed,
        required: true,
        category: getChecklistCategory(item),
      })),
      { onConflict: 'user_id,application_external_id,checklist_external_id' }
    )
    .select(
      'id,tracked_application_id,application_external_id,checklist_external_id,title,completed,required,category,updated_at'
    )
    .returns<ApplicationChecklistRow[]>();

  if (error || !data) {
    throw createAppError(
      'checklist_sync_failed',
      error?.message ?? 'Unable to sync application checklist.'
    );
  }

  return data.map(mapRowToChecklistItem);
}

export async function updateChecklistItem(
  userId: string | undefined,
  checklistItemId: string,
  updates: Partial<ApplicationChecklistItem>
): Promise<ApplicationChecklistItem | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('application_checklists')
    .update({
      title: updates.label,
      completed: updates.completed,
    })
    .eq('user_id', userId)
    .eq('checklist_external_id', checklistItemId)
    .select(
      'id,tracked_application_id,application_external_id,checklist_external_id,title,completed,required,category,updated_at'
    )
    .single<ApplicationChecklistRow>();

  if (error || !data) {
    throw createAppError(
      'checklist_sync_failed',
      error?.message ?? 'Unable to sync checklist item.'
    );
  }

  return mapRowToChecklistItem(data);
}

export async function upsertChecklistItem(
  userId: string | undefined,
  applicationExternalId: string,
  item: ApplicationChecklistItem
): Promise<ApplicationChecklistItem | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('application_checklists')
    .upsert(
      {
        user_id: userId,
        application_external_id: applicationExternalId,
        checklist_external_id: item.id,
        title: item.label,
        completed: item.completed,
        required: true,
        category: getChecklistCategory(item),
      },
      { onConflict: 'user_id,application_external_id,checklist_external_id' }
    )
    .select(
      'id,tracked_application_id,application_external_id,checklist_external_id,title,completed,required,category,updated_at'
    )
    .single<ApplicationChecklistRow>();

  if (error || !data) {
    throw createAppError(
      'checklist_sync_failed',
      error?.message ?? 'Unable to sync checklist item.'
    );
  }

  return mapRowToChecklistItem(data);
}

export async function deleteChecklistItem(
  userId: string | undefined,
  checklistExternalId: string
): Promise<boolean> {
  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase
    .from('application_checklists')
    .delete()
    .eq('user_id', userId)
    .eq('checklist_external_id', checklistExternalId);

  return !error;
}

export async function fetchReviewComments(
  userId?: string
): Promise<ReviewComment[] | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('review_comments')
    .select('id,application_external_id,comment_external_id,member_external_id,commenter_name,commenter_role,comment,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<ReviewCommentRow[]>();

  if (error || !data) {
    return undefined;
  }

  return data.map(mapRowToReviewComment);
}

export async function fetchReviewCommentsForApplication(
  userId: string | undefined,
  applicationExternalId: string
): Promise<ReviewComment[] | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('review_comments')
    .select('id,application_external_id,comment_external_id,member_external_id,commenter_name,commenter_role,comment,created_at')
    .eq('user_id', userId)
    .eq('application_external_id', applicationExternalId)
    .order('created_at', { ascending: false })
    .returns<ReviewCommentRow[]>();

  if (error || !data) {
    return undefined;
  }

  return data.map(mapRowToReviewComment);
}

export async function addReviewComment(
  userId: string | undefined,
  comment: ReviewComment,
  workspaceId?: string,
  member?: WorkspaceMember
): Promise<ReviewComment | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('review_comments')
    .upsert(
      {
        user_id: userId,
        workspace_id: workspaceId,
        application_external_id: comment.applicationId,
        comment_external_id: comment.id,
        member_external_id: comment.memberId,
        commenter_name: member?.name ?? 'Team member',
        commenter_role: member?.role ?? 'Reviewer',
        comment: comment.comment,
        created_at: comment.createdAt,
      },
      { onConflict: 'user_id,comment_external_id' }
    )
    .select('id,application_external_id,comment_external_id,member_external_id,commenter_name,commenter_role,comment,created_at')
    .single<ReviewCommentRow>();

  if (error || !data) {
    throw createAppError(
      'review_comment_sync_failed',
      error?.message ?? 'Unable to sync review comment.'
    );
  }

  return mapRowToReviewComment(data);
}

export async function deleteReviewComment(
  userId: string | undefined,
  commentIdOrExternalId: string
): Promise<boolean> {
  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase
    .from('review_comments')
    .delete()
    .eq('user_id', userId)
    .or(`id.eq.${commentIdOrExternalId},comment_external_id.eq.${commentIdOrExternalId}`);

  return !error;
}

export async function fetchActivityLog(userId?: string): Promise<ActivityLogItem[] | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('activity_log')
    .select('id,activity_external_id,type,title,description,actor_name,related_entity_type,related_entity_external_id,metadata,message,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<ActivityLogRow[]>();

  if (error || !data) {
    return undefined;
  }

  return data.map(mapRowToActivityLogItem);
}

export async function addActivityLogItem(
  userId: string | undefined,
  item: ActivityLogItem,
  workspaceId?: string,
  actorName?: string
): Promise<ActivityLogItem | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('activity_log')
    .upsert(
      {
        user_id: userId,
        workspace_id: workspaceId,
        activity_external_id: item.id,
        type: item.action,
        title: item.message,
        description: item.message,
        actor_name: actorName,
        related_entity_type: item.applicationId ? 'tracked_application' : undefined,
        related_entity_external_id: item.applicationId,
        metadata: {
          applicationId: item.applicationId,
          actorMemberId: item.actorMemberId,
        },
        action: item.action,
        message: item.message,
        created_at: item.createdAt,
      },
      { onConflict: 'user_id,activity_external_id' }
    )
    .select('id,activity_external_id,type,title,description,actor_name,related_entity_type,related_entity_external_id,metadata,message,created_at')
    .single<ActivityLogRow>();

  if (error || !data) {
    throw createAppError(
      'activity_sync_failed',
      error?.message ?? 'Unable to sync activity log item.'
    );
  }

  return mapRowToActivityLogItem(data);
}

export async function fetchRecentActivity(
  userId: string | undefined,
  limit = 10
): Promise<ActivityLogItem[] | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('activity_log')
    .select('id,activity_external_id,type,title,description,actor_name,related_entity_type,related_entity_external_id,metadata,message,created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
    .returns<ActivityLogRow[]>();

  if (error || !data) {
    return undefined;
  }

  return data.map(mapRowToActivityLogItem);
}

function mapRowToTrackedApplication(
  row: TrackedApplicationRow,
  checklistItems: ApplicationChecklistItem[]
): TrackedApplication {
  return {
    id: row.application_external_id,
    grantId: row.grant_external_id,
    grantTitle: row.grant_title,
    funder: row.funder ?? '',
    deadline: row.deadline ?? '',
    status: row.status,
    linkedProposalDraftId: row.linked_proposal_draft_external_id ?? undefined,
    notes: row.notes ?? '',
    checklistItems,
    updatedAt: row.updated_at,
    nextActionRecommendation: row.next_action?.recommendation ?? getApplicationNextAction(row.status),
  };
}

function mapRowToChecklistItem(row: ApplicationChecklistRow): ApplicationChecklistItem {
  return {
    id: row.checklist_external_id ?? row.id,
    label: row.title,
    completed: row.completed,
  };
}

function mapRowToReviewComment(row: ReviewCommentRow): ReviewComment {
  return {
    id: row.comment_external_id ?? row.id,
    applicationId: row.application_external_id ?? '',
    memberId: row.member_external_id ?? row.commenter_name ?? 'reviewer',
    comment: row.comment,
    createdAt: row.created_at,
  };
}

function mapRowToActivityLogItem(row: ActivityLogRow): ActivityLogItem {
  return {
    id: row.activity_external_id ?? row.id,
    applicationId: row.metadata?.applicationId ?? row.related_entity_external_id ?? undefined,
    actorMemberId: row.metadata?.actorMemberId,
    action: row.type,
    message: row.message ?? row.description ?? row.title,
    createdAt: row.created_at,
  };
}

function getChecklistCategory(item: ApplicationChecklistItem): ChecklistCategory {
  const label = item.label.toLowerCase();

  if (label.includes('eligibility')) {
    return 'Eligibility';
  }

  if (label.includes('budget')) {
    return 'Budget';
  }

  if (label.includes('document') || label.includes('prepare')) {
    return 'Documents';
  }

  if (label.includes('review')) {
    return 'Review';
  }

  if (label.includes('deadline') || label.includes('submission')) {
    return 'Submission';
  }

  return 'Proposal';
}
