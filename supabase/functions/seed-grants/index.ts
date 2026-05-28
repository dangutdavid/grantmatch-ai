import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.105.4';

import { seedGrants } from '../../../data/seedGrants.ts';
import { handleOptions, jsonResponse, requireAuth } from '../_shared/http.ts';

interface GrantSeedRow {
  grant_external_id: string;
  title: string;
  funder: string;
  description: string;
  eligibility: string;
  deadline: string;
  funding_amount: string;
  region_eligibility: string;
  required_documents: string[];
  topics: string[];
  sectors: string[];
  source_url?: string;
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const authError = requireAuth(request);
  if (authError) return authError;

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(
      {
        error: 'missing_seed_configuration',
        message: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured as Edge Function secrets.',
      },
      500
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  const rows: GrantSeedRow[] = seedGrants.map((grant) => ({
    grant_external_id: grant.id,
    title: grant.title,
    funder: grant.funder,
    description: grant.description,
    eligibility: grant.eligibility,
    deadline: grant.deadline,
    funding_amount: grant.fundingAmount,
    region_eligibility: grant.regionEligibility,
    required_documents: grant.requiredDocuments,
    topics: grant.topics,
    sectors: grant.sectors,
    source_url: grant.sourceUrl,
  }));

  const { data, error } = await supabase
    .from('grants')
    .upsert(rows, { onConflict: 'grant_external_id' })
    .select('grant_external_id');

  if (error) {
    return jsonResponse(
      {
        error: 'seed_grants_failed',
        message: error.message,
      },
      500
    );
  }

  return jsonResponse({
    mode: 'backend',
    status: 'completed',
    importedCount: data?.length ?? rows.length,
    grantExternalIds: (data ?? []).map((item) => item.grant_external_id),
    generatedAt: new Date().toISOString(),
  });
});
