import { mockReadiness, mockReviewerQuestions } from '../_shared/aiMock.ts';
import { handleOptions, jsonResponse, mockRunId, readJson, requireAuth } from '../_shared/http.ts';

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const authError = requireAuth(request);
  if (authError) return authError;

  const body = await readJson<{ draft?: Record<string, unknown> }>(request);
  const title = String(body.draft?.proposalTitle ?? 'this proposal');

  return jsonResponse({
    mode: 'backend',
    status: 'completed',
    readiness: mockReadiness(body.draft),
    reviewerQuestions: mockReviewerQuestions(title),
    budgetJustificationFeedback: 'Mock backend budget feedback for reviewer preparation.',
    impactStatementFeedback: 'Mock backend impact feedback for reviewer preparation.',
    runId: mockRunId('review'),
    generatedAt: new Date().toISOString(),
  });
});
