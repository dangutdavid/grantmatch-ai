import { mockDraft, mockReadiness, mockReviewerQuestions } from '../_shared/aiMock.ts';
import { handleOptions, jsonResponse, mockRunId, readJson, requireAuth } from '../_shared/http.ts';

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const authError = requireAuth(request);
  if (authError) return authError;

  const body = await readJson<Record<string, unknown>>(request);
  const draft = mockDraft(body);

  return jsonResponse({
    mode: 'backend',
    status: 'completed',
    result: {
      draft,
      readiness: mockReadiness(draft),
      reviewerQuestions: mockReviewerQuestions(draft.proposalTitle),
    },
    runId: mockRunId('proposal'),
    generatedAt: new Date().toISOString(),
    warning: 'Mock Edge Function response. Store OpenAI keys only in backend secrets when enabling real generation.',
  });
});
