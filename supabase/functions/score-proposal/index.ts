import { mockReadiness, mockReviewerQuestions } from '../_shared/aiMock.ts';
import { handleOptions, jsonResponse, mockRunId, readJson, requireAuth } from '../_shared/http.ts';

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const authError = requireAuth(request);
  if (authError) return authError;

  const body = await readJson<{ draft?: Record<string, unknown> }>(request);

  return jsonResponse({
    mode: 'backend',
    status: 'completed',
    readiness: mockReadiness(body.draft),
    reviewerQuestions: mockReviewerQuestions(String(body.draft?.proposalTitle ?? 'this proposal')),
    budgetJustificationFeedback: 'Mock backend budget feedback. Add assumptions, units, and funder categories.',
    impactStatementFeedback: 'Mock backend impact feedback. Link outputs to measurable beneficiary outcomes.',
    runId: mockRunId('score'),
    generatedAt: new Date().toISOString(),
  });
});
