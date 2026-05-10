import { ActivityLogItem } from '@/types';
import { mapActivityToAuditEvent } from '@/utils/audit';

export async function fetchAuditEvents(activityLog: ActivityLogItem[], actor?: string) {
  return activityLog.map((item) => mapActivityToAuditEvent(item, actor));
}

export async function recordAuditEventMock(description: string) {
  return {
    id: `audit-${Date.now()}`,
    type: 'settings' as const,
    actor: 'GrantMatch AI',
    description,
    createdAt: new Date().toISOString(),
  };
}

export async function recordAiAuditEventMock(
  type:
    | 'ai_match_requested'
    | 'ai_proposal_generated'
    | 'ai_proposal_improved'
    | 'ai_review_generated'
    | 'ai_backend_unavailable',
  description: string
) {
  return {
    id: `audit-ai-${Date.now()}`,
    type: 'ai' as const,
    actor: 'GrantMatch AI',
    entity: type,
    description,
    createdAt: new Date().toISOString(),
  };
}
