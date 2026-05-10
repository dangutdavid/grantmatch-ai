# AI Implementation Plan

## Secure Backend-Only Architecture

GrantMatch AI must call AI providers only from a trusted backend. The secure request path is:

`Expo frontend -> authenticated request -> backend endpoint / Supabase Edge Function -> OpenAI API -> result stored in Supabase -> frontend reads result`

OpenAI keys must never be stored in the Expo frontend because public mobile/web bundles can be inspected. `EXPO_PUBLIC_*` variables are public by design and are only suitable for non-secret configuration such as endpoint URLs and feature flags.

Planned runtime behavior:
- The Expo app keeps deterministic mock AI as the default fallback.
- When `EXPO_PUBLIC_ENABLE_BACKEND_AI=true` and `EXPO_PUBLIC_AI_API_BASE_URL` is configured, frontend AI service methods can call backend endpoints.
- Backend endpoints verify the Supabase user session before doing AI work.
- Backend endpoints call OpenAI with server-side secrets only.
- Results and run metadata are stored in Supabase tables such as `grant_match_scores` and `proposal_generation_runs`.
- The frontend reads saved results through normal Supabase RLS-backed queries.
- Current Edge Function scaffolds return deterministic mock responses and require a bearer token. They are ready to deploy for integration testing before real model calls are added.

## Matching
- Generate grant and profile embeddings server-side.
- Store match scores in `grant_match_scores`.
- Combine semantic fit with eligibility, deadline readiness, funding fit, and strategic fit.

## Proposal Generation
- Prepare structured prompt context from profile, grant, workspace, and draft.
- Generate sections server-side.
- Score readiness and produce reviewer questions.
- Store run metadata in `proposal_generation_runs`.

## Safety
- Never put private model keys in Expo.
- Use backend rate limits and audit logs.
- Keep human review before submission.
- Add prompt-injection checks for grant text, uploaded documents, and team comments.
- Avoid sending unnecessary personal or institution data to model providers.

## Evaluation
- Track acceptance, edits, reviewer feedback, submission outcomes, and user ratings.
- Compare mock ranking, backend semantic ranking, and user actions before replacing deterministic logic.
- Track hallucination reports, rejected suggestions, and reviewer override reasons.

## Future Models
Choose model/provider server-side based on quality, cost, latency, and data governance needs.

## Planned Backend Endpoints

- `generate-proposal`: creates a draft from profile, grant, and workspace context.
- `improve-proposal`: improves one draft section or a full draft.
- `score-proposal`: returns readiness score, missing sections, and weak sections.
- `match-grants`: ranks grants for the current user/workspace.
- `explain-match`: explains ranking signals for one grant or a ranked set.
- `generate-review-questions`: creates reviewer questions for a draft.
- `ingest-grants`: normalises grants from approved backend sources.

## Production Hardening Checklist

- Store OpenAI/API keys only in backend secrets.
- Verify Supabase JWTs in every AI endpoint.
- Add per-user and per-workspace rate limits.
- Log `AIUsageEvent` metadata without storing sensitive prompt text unnecessarily.
- Persist AI output and review status in Supabase.
- Add human approval before submission-ready proposal language is used.
- Add model evaluation datasets before enabling real user-facing AI.
