import { mockGrants, mockRecommendations } from '@/data/mockGrants';
import { supabase } from '@/services/supabaseClient';
import { Grant, Recommendation } from '@/types';

export async function fetchGrants(): Promise<Grant[]> {
  return mockGrants;
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  return mockRecommendations;
}

export async function fetchGrantById(grantId: string): Promise<Grant | undefined> {
  return mockGrants.find((grant) => grant.id === grantId);
}

export async function saveGrant(grantId: string, savedGrantIds: string[]): Promise<string[]> {
  return savedGrantIds.includes(grantId) ? savedGrantIds : [...savedGrantIds, grantId];
}

export async function unsaveGrant(grantId: string, savedGrantIds: string[]): Promise<string[]> {
  return savedGrantIds.filter((savedGrantId) => savedGrantId !== grantId);
}

export async function fetchSavedGrantIds(
  userId?: string,
  workspaceId?: string
): Promise<string[] | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  let query = supabase
    .from('saved_grants')
    .select('grant_external_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (workspaceId) {
    query = query.eq('workspace_id', workspaceId);
  }

  const { data, error } = await query.returns<{ grant_external_id: string }[]>();

  if (error || !data) {
    return undefined;
  }

  return data.map((item) => item.grant_external_id).filter(Boolean);
}

export async function saveGrantForUser(
  grantId: string,
  userId?: string,
  workspaceId?: string
): Promise<boolean> {
  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase.from('saved_grants').upsert(
    {
      user_id: userId,
      workspace_id: workspaceId,
      grant_external_id: grantId,
    },
    { onConflict: 'user_id,grant_external_id' }
  );

  return !error;
}

export async function unsaveGrantForUser(grantId: string, userId?: string): Promise<boolean> {
  if (!supabase || !userId) {
    return false;
  }

  const { error } = await supabase
    .from('saved_grants')
    .delete()
    .eq('user_id', userId)
    .eq('grant_external_id', grantId);

  return !error;
}
