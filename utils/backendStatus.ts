import { isBackendAiConfigured, isSupabaseConfigured } from '@/constants/env';
import { supabaseStatus } from '@/services/supabaseClient';
import { AuthMode, SessionUser } from '@/types';

export type SessionSource = 'Supabase' | 'Mock' | 'Signed out';

export interface BackendStatus {
  isSupabaseConfigured: boolean;
  isSupabaseClientAvailable: boolean;
  authMode: AuthMode;
  sessionSource: SessionSource;
  profileSource: 'supabase' | 'mock/local';
  workspaceSource: 'supabase' | 'mock/local';
  isSupabaseSession: boolean;
  isMockSession: boolean;
  isBackendAiConfigured: boolean;
  bannerMessage: string;
  statusLabel: string;
  detail: string;
}

export function getBackendStatus(authMode: AuthMode, sessionUser?: SessionUser): BackendStatus {
  const isSupabaseSession = authMode === 'supabase' && sessionUser?.authMode === 'supabase';
  const isMockSession = Boolean(sessionUser) && !isSupabaseSession;
  const sessionSource: SessionSource = isSupabaseSession ? 'Supabase' : isMockSession ? 'Mock' : 'Signed out';

  if (!isSupabaseConfigured || !supabaseStatus.canInitializeClient) {
    return {
      isSupabaseConfigured,
      isSupabaseClientAvailable: supabaseStatus.canInitializeClient,
      authMode,
      sessionSource,
      profileSource: 'mock/local',
      workspaceSource: 'mock/local',
      isSupabaseSession,
      isMockSession,
      isBackendAiConfigured,
      bannerMessage: 'Local demo mode: backend is not connected.',
      statusLabel: 'Local demo',
      detail: 'Supabase is not configured or cannot safely initialise in this runtime.',
    };
  }

  if (isMockSession) {
    return {
      isSupabaseConfigured,
      isSupabaseClientAvailable: supabaseStatus.canInitializeClient,
      authMode,
      sessionSource,
      profileSource: 'mock/local',
      workspaceSource: 'mock/local',
      isSupabaseSession,
      isMockSession,
      isBackendAiConfigured,
      bannerMessage: 'Local demo mode: data is stored on this device/browser.',
      statusLabel: 'Mock session',
      detail: 'Supabase is configured, but this session is using Demo Login or local fallback.',
    };
  }

  if (!sessionUser) {
    return {
      isSupabaseConfigured,
      isSupabaseClientAvailable: supabaseStatus.canInitializeClient,
      authMode,
      sessionSource,
      profileSource: 'mock/local',
      workspaceSource: 'mock/local',
      isSupabaseSession,
      isMockSession,
      isBackendAiConfigured,
      bannerMessage: 'Supabase is configured. Register or log in to use backend persistence.',
      statusLabel: 'Supabase ready',
      detail: 'Supabase is configured and ready for email login/register.',
    };
  }

  return {
    isSupabaseConfigured,
    isSupabaseClientAvailable: supabaseStatus.canInitializeClient,
    authMode,
    sessionSource,
    profileSource: isSupabaseSession ? 'supabase' : 'mock/local',
    workspaceSource: isSupabaseSession ? 'supabase' : 'mock/local',
    isSupabaseSession,
    isMockSession,
    isBackendAiConfigured,
    bannerMessage: 'Supabase backend connected. AI, notifications, and payments are still mock-only.',
    statusLabel: 'Supabase session',
    detail: 'This user session came from Supabase Auth.',
  };
}
