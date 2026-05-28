import { mockGrants, mockRecommendations } from '@/data/mockGrants';
import { supabase } from '@/services/supabaseClient';
import { Grant, Recommendation } from '@/types';

const GRANT_SELECT =
  'id,grant_external_id,title,funder,description,eligibility,deadline,funding_amount,region_eligibility,required_documents,topics,sectors,source_url';

interface GrantRow {
  id: string;
  grant_external_id: string | null;
  title: string;
  funder: string;
  description: string;
  eligibility: string | null;
  deadline: string | null;
  funding_amount: string | null;
  region_eligibility: string | null;
  required_documents: string[] | null;
  topics: string[] | null;
  sectors: string[] | null;
  source_url: string | null;
}

function mapGrantRow(row: GrantRow): Grant {
  return {
    id: row.grant_external_id ?? row.id,
    title: row.title,
    funder: row.funder,
    description: row.description,
    eligibility: row.eligibility ?? '',
    deadline: row.deadline ?? '',
    fundingAmount: row.funding_amount ?? '',
    regionEligibility: row.region_eligibility ?? '',
    requiredDocuments: row.required_documents ?? [],
    topics: row.topics ?? [],
    sectors: row.sectors ?? [],
    sourceUrl: row.source_url ?? undefined,
  };
}

export async function fetchGrants(): Promise<Grant[]> {
  if (!supabase) {
    return mockGrants;
  }

  const { data, error } = await supabase
    .from('grants')
    .select(GRANT_SELECT)
    .order('deadline', { ascending: true })
    .returns<GrantRow[]>();

  if (error || !data || data.length === 0) {
    return mockGrants;
  }

  return data.map(mapGrantRow);
}

export async function fetchRecommendations(): Promise<Recommendation[]> {
  return mockRecommendations;
}

export async function fetchGrantById(grantId: string): Promise<Grant | undefined> {
  if (supabase) {
    const { data, error } = await supabase
      .from('grants')
      .select(GRANT_SELECT)
      .eq('grant_external_id', grantId)
      .maybeSingle<GrantRow>();

    if (!error && data) {
      return mapGrantRow(data);
    }

    if (isUuid(grantId)) {
      const { data: idData, error: idError } = await supabase
        .from('grants')
        .select(GRANT_SELECT)
        .eq('id', grantId)
        .maybeSingle<GrantRow>();

      if (!idError && idData) {
        return mapGrantRow(idData);
      }
    }
  }

  return mockGrants.find((grant) => grant.id === grantId);
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
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
