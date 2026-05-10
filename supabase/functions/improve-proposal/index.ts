import { handleOptions, jsonResponse, mockRunId, readJson, requireAuth } from '../_shared/http.ts';

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const authError = requireAuth(request);
  if (authError) return authError;

  const body = await readJson<{ draft?: unknown; section?: string; text?: string }>(request);
  const improvedText = `${body.text ?? 'Draft section'} Backend mock improvement: add measurable outcomes, funder alignment, and clearer evidence.`;

  return jsonResponse({
    mode: 'backend',
    status: 'completed',
    draft: body.draft,
    improvedText,
    runId: mockRunId('improve'),
    generatedAt: new Date().toISOString(),
    warning: 'Mock Edge Function response. Real model improvement stays backend-only.',
  });
});
