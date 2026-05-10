import { handleOptions, jsonResponse, mockRunId, readJson, requireAuth } from '../_shared/http.ts';

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const authError = requireAuth(request);
  if (authError) return authError;

  const body = await readJson<{ sourceExternalId?: string }>(request);

  return jsonResponse({
    mode: 'backend',
    status: 'completed',
    runId: mockRunId('ingest'),
    sourceExternalId: body.sourceExternalId ?? 'mock-source',
    importedCount: 0,
    notes: 'Mock ingestion run created. Real grant source credentials and scraping/API logic must stay backend-only.',
    generatedAt: new Date().toISOString(),
  });
});
