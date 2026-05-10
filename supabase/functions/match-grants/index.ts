import { handleOptions, jsonResponse, mockRunId, readJson, requireAuth } from '../_shared/http.ts';
import { mockMatchResults } from '../_shared/aiMock.ts';

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const authError = requireAuth(request);
  if (authError) return authError;

  const body = await readJson<{ grants?: unknown[] }>(request);

  return jsonResponse({
    mode: 'backend',
    status: 'completed',
    results: mockMatchResults(body.grants ?? []),
    runId: mockRunId('match'),
    generatedAt: new Date().toISOString(),
    warning: 'Mock Edge Function response. Add server-side OpenAI call after secrets and rate limits are configured.',
  });
});
