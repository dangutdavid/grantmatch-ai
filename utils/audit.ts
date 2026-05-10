import { ActivityLogItem, AuditEvent, AuditEventType } from '@/types';

export function mapActivityToAuditEvent(item: ActivityLogItem, actor = 'GrantMatch AI'): AuditEvent {
  return {
    id: `audit-${item.id}`,
    type: getAuditType(item.action),
    actor,
    entity: item.applicationId,
    description: item.message,
    createdAt: item.createdAt,
  };
}

export function getAuditType(action: ActivityLogItem['action']): AuditEventType {
  if (action.includes('ai_')) return 'ai';
  if (action.includes('proposal')) return 'proposals';
  if (action.includes('application') || action.includes('status') || action.includes('checklist')) return 'applications';
  if (action.includes('member') || action.includes('collaborator') || action.includes('comment')) return 'workspace';
  if (action.includes('settings') || action.includes('data')) return 'settings';
  return 'grants';
}
