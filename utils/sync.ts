import { isSupabaseConfigured } from '@/constants/env';
import { AuthMode, SyncEntityStatus, SyncMode, SyncStatus } from '@/types';

export function getSyncMode(authMode: AuthMode, hasNetwork = true): SyncMode {
  if (!hasNetwork) {
    return 'Offline';
  }

  if (authMode === 'supabase' && isSupabaseConfigured) {
    return 'Supabase';
  }

  if (isSupabaseConfigured) {
    return 'Hybrid';
  }

  return 'Local';
}

export function shouldUseSupabase(authMode: AuthMode) {
  return authMode === 'supabase' && isSupabaseConfigured;
}

export function getEntitySyncLabel(entity: SyncEntityStatus['entity']) {
  const labels: Record<SyncEntityStatus['entity'], string> = {
    savedGrants: 'Saved grants',
    proposalDrafts: 'Proposal drafts',
    trackedApplications: 'Tracked applications',
    applicationChecklists: 'Application checklists',
    reviewComments: 'Review comments',
    activityLog: 'Activity log',
    workspaceMembers: 'Workspace members',
    profile: 'Profile',
    settings: 'Settings',
    workspacePreferences: 'Workspace preferences',
    notificationPreferences: 'Notification preferences',
  };

  return labels[entity];
}

export function getSyncStatusMessage(status: SyncStatus, mode: SyncMode) {
  if (status === 'error') {
    return 'Last sync failed; local state is preserved.';
  }

  if (mode === 'Local') {
    return 'Stored locally on this device/browser.';
  }

  if (mode === 'Offline') {
    return 'Offline; changes will remain local for now.';
  }

  if (status === 'synced') {
    return 'Synced with Supabase for authenticated users.';
  }

  if (status === 'pending') {
    return 'Ready to sync when Supabase auth is active.';
  }

  return 'No sync action in progress.';
}

export function createSyncWarning(authMode: AuthMode) {
  if (!isSupabaseConfigured) {
    return 'Supabase is not configured. The app is using local fallback storage.';
  }

  if (authMode !== 'supabase') {
    return 'Demo Login is active. Data stays local until email login uses Supabase.';
  }

  return undefined;
}

export function formatLastSyncedAt(value?: string) {
  if (!value) {
    return 'Not synced yet';
  }

  return new Date(value).toLocaleString();
}

export function buildSyncEntityStatuses(authMode: AuthMode): SyncEntityStatus[] {
  const mode = getSyncMode(authMode);
  const syncedEntities: SyncEntityStatus['entity'][] = [
    'savedGrants',
    'proposalDrafts',
    'trackedApplications',
    'applicationChecklists',
    'reviewComments',
    'activityLog',
    'workspaceMembers',
    'profile',
  ];
  const localEntities: SyncEntityStatus['entity'][] = [
    'settings',
    'workspacePreferences',
    'notificationPreferences',
  ];
  const now = shouldUseSupabase(authMode) ? new Date().toISOString() : undefined;

  return [...syncedEntities, ...localEntities].map((entity) => {
    const isLocal = localEntities.includes(entity);
    const entityMode = isLocal ? 'Local' : mode;
    const status: SyncStatus = entityMode === 'Supabase' ? 'synced' : isLocal ? 'idle' : 'pending';

    return {
      entity,
      label: getEntitySyncLabel(entity),
      mode: entityMode,
      status,
      lastSyncedAt: entityMode === 'Supabase' ? now : undefined,
      warning: isLocal ? 'Preference sync is intentionally local for now.' : createSyncWarning(authMode),
    };
  });
}
