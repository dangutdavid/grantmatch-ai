import { supabase } from '@/services/supabaseClient';
import { NotificationPreferences, WorkspacePreferences } from '@/types';
import { createAppError } from '@/utils/errors';

interface NotificationPreferencesRow {
  deadline_reminders: boolean;
  proposal_review_reminders: boolean;
  saved_grant_updates: boolean;
  weekly_digest: boolean;
  team_activity_updates: boolean;
}

interface WorkspacePreferencesRow {
  default_currency: string;
  preferred_funding_regions: string;
  review_workflow_enabled: boolean;
  finance_review_required: boolean;
  internal_review_required: boolean;
}

interface WorkspacePreferenceWorkspaceRow {
  name: string;
  organisation_type: string;
}

export async function fetchNotificationPreferences(
  userId?: string
): Promise<NotificationPreferences | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .select(
      'deadline_reminders,proposal_review_reminders,saved_grant_updates,weekly_digest,team_activity_updates'
    )
    .eq('user_id', userId)
    .maybeSingle<NotificationPreferencesRow>();

  if (error || !data) {
    return undefined;
  }

  return mapNotificationPreferencesRow(data);
}

export async function upsertNotificationPreferences(
  userId: string | undefined,
  preferences: NotificationPreferences
): Promise<NotificationPreferences | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert(
      {
        user_id: userId,
        deadline_reminders: preferences.deadlineReminders,
        proposal_review_reminders: preferences.proposalReviewReminders,
        saved_grant_updates: preferences.savedGrantUpdates,
        weekly_digest: preferences.weeklyDigest,
        team_activity_updates: preferences.teamActivityUpdates,
      },
      { onConflict: 'user_id' }
    )
    .select(
      'deadline_reminders,proposal_review_reminders,saved_grant_updates,weekly_digest,team_activity_updates'
    )
    .single<NotificationPreferencesRow>();

  if (error || !data) {
    throw createAppError(
      'notification_preferences_sync_failed',
      error?.message ?? 'Unable to sync notification preferences.'
    );
  }

  return mapNotificationPreferencesRow(data);
}

export async function fetchWorkspacePreferences(
  workspaceId?: string,
  userId?: string
): Promise<WorkspacePreferences | undefined> {
  if (!supabase || !workspaceId || !userId) {
    return undefined;
  }

  const { data: workspaceRow } = await supabase
    .from('workspaces')
    .select('name,organisation_type')
    .eq('id', workspaceId)
    .maybeSingle<WorkspacePreferenceWorkspaceRow>();

  const { data: preferencesRow, error } = await supabase
    .from('workspace_preferences')
    .select(
      'default_currency,preferred_funding_regions,review_workflow_enabled,finance_review_required,internal_review_required'
    )
    .eq('workspace_id', workspaceId)
    .maybeSingle<WorkspacePreferencesRow>();

  if (error || (!workspaceRow && !preferencesRow)) {
    return undefined;
  }

  return mapWorkspacePreferencesRows(workspaceRow, preferencesRow);
}

export async function upsertWorkspacePreferences(
  workspaceId: string | undefined,
  userId: string | undefined,
  preferences: WorkspacePreferences
): Promise<WorkspacePreferences | undefined> {
  if (!supabase || !workspaceId || !userId) {
    return undefined;
  }

  const workspaceUpdate = supabase
    .from('workspaces')
    .update({
      name: preferences.workspaceName,
      organisation_type: preferences.organisationType,
    })
    .eq('id', workspaceId)
    .select('name,organisation_type')
    .single<WorkspacePreferenceWorkspaceRow>();

  const preferencesUpsert = supabase
    .from('workspace_preferences')
    .upsert(
      {
        workspace_id: workspaceId,
        user_id: userId,
        default_currency: preferences.defaultCurrency,
        preferred_funding_regions: preferences.preferredFundingRegions,
        review_workflow_enabled: preferences.reviewWorkflowEnabled,
        finance_review_required: preferences.financeReviewRequired,
        internal_review_required: preferences.internalReviewRequired,
      },
      { onConflict: 'workspace_id' }
    )
    .select(
      'default_currency,preferred_funding_regions,review_workflow_enabled,finance_review_required,internal_review_required'
    )
    .single<WorkspacePreferencesRow>();

  const [workspaceResult, preferencesResult] = await Promise.all([
    workspaceUpdate,
    preferencesUpsert,
  ]);

  if (workspaceResult.error || preferencesResult.error || !preferencesResult.data) {
    throw createAppError(
      'workspace_preferences_sync_failed',
      workspaceResult.error?.message ??
        preferencesResult.error?.message ??
        'Unable to sync workspace preferences.'
    );
  }

  return mapWorkspacePreferencesRows(workspaceResult.data, preferencesResult.data);
}

function mapNotificationPreferencesRow(row: NotificationPreferencesRow): NotificationPreferences {
  return {
    deadlineReminders: row.deadline_reminders,
    proposalReviewReminders: row.proposal_review_reminders,
    savedGrantUpdates: row.saved_grant_updates,
    weeklyDigest: row.weekly_digest,
    teamActivityUpdates: row.team_activity_updates,
  };
}

function mapWorkspacePreferencesRows(
  workspaceRow?: WorkspacePreferenceWorkspaceRow | null,
  preferencesRow?: WorkspacePreferencesRow | null
): WorkspacePreferences {
  return {
    workspaceName: workspaceRow?.name ?? '',
    organisationType: workspaceRow?.organisation_type ?? '',
    defaultCurrency: preferencesRow?.default_currency ?? 'USD',
    preferredFundingRegions: preferencesRow?.preferred_funding_regions ?? 'Global',
    reviewWorkflowEnabled: preferencesRow?.review_workflow_enabled ?? true,
    financeReviewRequired: preferencesRow?.finance_review_required ?? true,
    internalReviewRequired: preferencesRow?.internal_review_required ?? true,
  };
}
