import { handleOptions, jsonResponse, mockRunId, readJson, requireAuth } from '../_shared/http.ts';
import { mockMatchResults } from '../_shared/aiMock.ts';

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const authError = requireAuth(request);
  if (authError) return authError;

  const body = await readJson<{ grants?: unknown[]; grant?: unknown }>(request);
  const grants = body.grants ?? (body.grant ? [body.grant] : []);
  const [result] = mockMatchResults(grants);

  return jsonResponse({
    mode: 'backend',
    status: 'completed',
    explanation: result?.explanation ?? {
      summary: 'No grant was provided for explanation.',
      signals: [],
    },
    confidenceScore: result?.confidenceScore ?? 0,
    runId: mockRunId('explain'),
    generatedAt: new Date().toISOString(),
    warning: 'Mock Edge Function response. Replace with backend AI explanation logic later.',
  });
});
