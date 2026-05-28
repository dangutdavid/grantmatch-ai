import { supabase } from '@/services/supabaseClient';
import {
  ActivityLogItem,
  NotificationEvent,
  NotificationEventStatus,
  NotificationPreferences,
  ProposalDraft,
  TrackedApplication,
} from '@/types';
import { calculateChecklistProgress, getDaysUntilDeadline } from '@/utils/applications';

interface NotificationEventRow {
  notification_external_id: string;
  notification_type: NotificationEvent['type'];
  title: string;
  message: string;
  channel: string;
  status: string;
  related_entity_external_id: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
}

interface BuildNotificationQueueInput {
  applications: TrackedApplication[];
  proposalDrafts: ProposalDraft[];
  activityLog: ActivityLogItem[];
  preferences: NotificationPreferences;
}

export async function fetchNotificationQueue(
  userId?: string,
  workspaceId?: string
): Promise<NotificationEvent[] | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  let query = supabase
    .from('notification_events')
    .select(
      'notification_external_id,notification_type,title,message,channel,status,related_entity_external_id,scheduled_for,sent_at,created_at'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (workspaceId) {
    query = query.or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`);
  }

  const { data, error } = await query.returns<NotificationEventRow[]>();

  if (error || !data) {
    return undefined;
  }

  return data.map(mapNotificationEventRow);
}

export async function upsertNotificationQueue(
  userId: string | undefined,
  workspaceId: string | undefined,
  notifications: NotificationEvent[]
): Promise<boolean> {
  if (!supabase || !userId || notifications.length === 0) {
    return false;
  }

  const { error } = await supabase.from('notification_events').upsert(
    notifications.map((notification) => ({
      user_id: userId,
      workspace_id: workspaceId,
      notification_external_id: notification.id,
      notification_type: notification.type,
      title: notification.title,
      message: notification.message,
      channel: notification.channel,
      status: notification.status,
      related_entity_external_id: notification.relatedEntityId,
      scheduled_for: notification.scheduledFor,
      sent_at: notification.sentAt,
    })),
    { onConflict: 'user_id,notification_external_id' }
  );

  return !error;
}

export async function markNotificationRead(
  userId: string | undefined,
  notificationId: string
): Promise<boolean> {
  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase
    .from('notification_events')
    .update({ status: 'read' })
    .eq('user_id', userId)
    .eq('notification_external_id', notificationId);

  return !error;
}

export function buildNotificationQueue(input: BuildNotificationQueueInput): NotificationEvent[] {
  const notifications: NotificationEvent[] = [];

  if (input.preferences.deadlineReminders) {
    notifications.push(...buildDeadlineNotifications(input.applications));
  }

  if (input.preferences.proposalReviewReminders) {
    notifications.push(...buildProposalReviewNotifications(input.proposalDrafts));
  }

  if (input.preferences.teamActivityUpdates) {
    notifications.push(...buildTeamActivityNotifications(input.activityLog));
  }

  if (input.preferences.weeklyDigest) {
    notifications.push(buildWeeklyDigestNotification(input));
  }

  return notifications
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
    .slice(0, 30);
}

function buildDeadlineNotifications(applications: TrackedApplication[]) {
  return applications
    .filter((application) => !['Submitted', 'Awarded', 'Rejected'].includes(application.status))
    .map((application) => {
      const daysUntilDeadline = getDaysUntilDeadline(application.deadline);
      const progress = calculateChecklistProgress(application.checklistItems);

      if (daysUntilDeadline > 45 && progress >= 50) {
        return undefined;
      }

      return createNotification({
        id: `deadline-${application.id}`,
        type: 'deadline_reminder',
        title: daysUntilDeadline < 0 ? 'Application deadline passed' : 'Application deadline needs attention',
        message:
          daysUntilDeadline < 0
            ? `${application.grantTitle} deadline has passed. Move it to an outcome stage when ready.`
            : `${application.grantTitle} is due in ${daysUntilDeadline} days with ${progress}% checklist progress.`,
        relatedEntityId: application.id,
        scheduledFor: application.deadline,
      });
    })
    .filter((notification): notification is NotificationEvent => Boolean(notification));
}

function buildProposalReviewNotifications(drafts: ProposalDraft[]) {
  return drafts
    .filter((draft) => draft.status === 'Ready for Review' || draft.status === 'Improved')
    .map((draft) =>
      createNotification({
        id: `proposal-review-${draft.id}`,
        type: 'proposal_review',
        title: 'Proposal ready for review',
        message: `${draft.proposalTitle} is marked ${draft.status}. Assign review and finance checks before submission.`,
        relatedEntityId: draft.id,
        scheduledFor: draft.updatedAt,
      })
    );
}

function buildTeamActivityNotifications(activityLog: ActivityLogItem[]) {
  return activityLog
    .filter((item) =>
      ['collaborator_assigned', 'comment_added', 'member_added', 'application_submitted'].includes(
        item.action
      )
    )
    .slice(0, 8)
    .map((item) =>
      createNotification({
        id: `team-${item.id}`,
        type: 'team_activity',
        title: 'Workspace activity update',
        message: item.message,
        relatedEntityId: item.applicationId,
        scheduledFor: item.createdAt,
      })
    );
}

function buildWeeklyDigestNotification(input: BuildNotificationQueueInput) {
  return createNotification({
    id: 'weekly-digest-current',
    type: 'weekly_digest',
    title: 'Weekly grant workspace digest',
    message: `${input.applications.length} applications, ${input.proposalDrafts.length} proposal drafts, and ${input.activityLog.length} activity items are ready for digest delivery.`,
  });
}

function createNotification(input: {
  id: string;
  type: NotificationEvent['type'];
  title: string;
  message: string;
  relatedEntityId?: string;
  scheduledFor?: string;
}): NotificationEvent {
  const createdAt = new Date().toISOString();

  return {
    id: input.id,
    type: input.type,
    title: input.title,
    message: input.message,
    channel: 'in_app',
    status: 'queued',
    relatedEntityId: input.relatedEntityId,
    scheduledFor: input.scheduledFor,
    createdAt,
  };
}

function mapNotificationEventRow(row: NotificationEventRow): NotificationEvent {
  return {
    id: row.notification_external_id,
    type: row.notification_type,
    title: row.title,
    message: row.message,
    channel: row.channel === 'email' || row.channel === 'push' ? row.channel : 'in_app',
    status: normalizeStatus(row.status),
    relatedEntityId: row.related_entity_external_id ?? undefined,
    scheduledFor: row.scheduled_for ?? undefined,
    sentAt: row.sent_at ?? undefined,
    createdAt: row.created_at,
  };
}

function normalizeStatus(status: string): NotificationEventStatus {
  if (status === 'sent' || status === 'read' || status === 'failed') {
    return status;
  }

  return 'queued';
}
