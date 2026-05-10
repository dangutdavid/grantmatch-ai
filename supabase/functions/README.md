# Supabase Edge Function Plan

These functions are planned backend-only AI endpoints. Do not store OpenAI keys in the Expo app. Function secrets should live in Supabase Edge Function secrets or another trusted backend secret manager.

This folder now includes safe mock Edge Function scaffolds. They require an `Authorization: Bearer <supabase-access-token>` header, return deterministic mock responses, and do not call OpenAI or any external grant source yet.

## Common Security Requirements

- Require a valid Supabase user session.
- Verify workspace membership before reading workspace-linked data.
- Rate limit by user and workspace.
- Store AI run metadata in Supabase.
- Return friendly errors to the frontend.
- Never expose provider secrets or raw service credentials.

## generate-proposal

- Purpose: Generate a proposal draft from user profile, grant, and workspace context.
- Request: `{ profileId, grantExternalId, workspaceId?, draftExternalId? }`
- Response: `{ draft, readiness, reviewerQuestions, runId }`
- Auth: authenticated user; workspace member if `workspaceId` is provided.
- Tables touched: `profiles`, `grants`, `proposal_drafts`, `proposal_generation_runs`, `activity_log`.
- Security notes: redact unnecessary personal data before calling the model.
- Scaffold: `generate-proposal/index.ts`

## improve-proposal

- Purpose: Improve a draft or section with funder-aligned language.
- Request: `{ draftExternalId, section?, text?, workspaceId? }`
- Response: `{ improvedText, draft?, runId }`
- Auth: draft owner or workspace member with update permission.
- Tables touched: `proposal_drafts`, `proposal_generation_runs`, `activity_log`.
- Security notes: keep original and improved text auditable.
- Scaffold: `improve-proposal/index.ts`

## score-proposal

- Purpose: Score proposal readiness and identify missing/weak sections.
- Request: `{ draftExternalId, workspaceId? }`
- Response: `{ readiness, sectionFeedback, runId }`
- Auth: draft owner or workspace member.
- Tables touched: `proposal_drafts`, `proposal_generation_runs`.
- Security notes: do not mark a draft submission-ready without human review.
- Scaffold: `score-proposal/index.ts`

## match-grants

- Purpose: Rank grants for a user/workspace.
- Request: `{ profileId, workspaceId?, grantExternalIds? }`
- Response: `{ results, runId }`
- Auth: authenticated user; workspace member when workspace-scoped.
- Tables touched: `profiles`, `grants`, `grant_match_scores`.
- Security notes: grants should be ingested server-side from approved sources.
- Scaffold: `match-grants/index.ts`

## explain-match

- Purpose: Explain why a grant is ranked highly or poorly.
- Request: `{ profileId, grantExternalId, workspaceId? }`
- Response: `{ explanation, signals, confidenceScore }`
- Auth: authenticated user.
- Tables touched: `profiles`, `grants`, `grant_match_scores`.
- Security notes: explanations should be traceable to non-sensitive signals.
- Scaffold: `explain-match/index.ts`

## generate-review-questions

- Purpose: Generate reviewer questions for proposal review.
- Request: `{ draftExternalId, workspaceId? }`
- Response: `{ questions, budgetFeedback, impactFeedback, runId }`
- Auth: draft owner or workspace member.
- Tables touched: `proposal_drafts`, `proposal_generation_runs`, `review_comments`.
- Security notes: questions are advisory and should be reviewed by a human.
- Scaffold: `generate-review-questions/index.ts`

## ingest-grants

- Purpose: Ingest and normalise grant records from approved backend sources.
- Request: `{ sourceExternalId, workspaceId? }`
- Response: `{ runId, importedCount, status }`
- Auth: workspace owner/admin for workspace-specific sources.
- Tables touched: `grant_sources`, `grant_ingestion_runs`, `grants`.
- Security notes: no scraping from the Expo client; source credentials stay server-side.
- Scaffold: `ingest-grants/index.ts`

## Local Function Smoke Test

After installing/configuring the Supabase CLI outside the Expo app:

```bash
supabase functions serve match-grants
```

Then call the local function with a valid Supabase access token:

```bash
curl -i \
  --request POST \
  --header "Authorization: Bearer <access-token>" \
  --header "Content-Type: application/json" \
  --data '{"grants":[{"id":"g1","title":"Mock Grant"}]}' \
  http://127.0.0.1:54321/functions/v1/match-grants
```

## Deployment Notes

Deploy only after the Supabase project is configured:

```bash
supabase functions deploy match-grants
supabase functions deploy explain-match
supabase functions deploy generate-proposal
supabase functions deploy improve-proposal
supabase functions deploy score-proposal
supabase functions deploy generate-review-questions
supabase functions deploy ingest-grants
```

Real OpenAI integration should be added only inside these functions after setting backend secrets with the Supabase CLI. Never add provider secrets to `.env` values consumed by Expo.
