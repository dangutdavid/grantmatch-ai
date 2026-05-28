# GrantMatch AI Checkpoint

Last updated: 2026-05-19

## Current State

GrantMatch AI is an Expo Router React Native app for web, iOS, and Android. It is demo-ready with local fallback and increasingly Supabase-backed for authenticated users.

## Working Local URL

Expo web has been run on:

```bash
npx expo start --web --port 8081
```

Open:

```text
http://localhost:8081
```

If newly added routes return 404, restart Expo. Expo Router sometimes needs a restart to discover new files in `app/`.

## Validation

Use:

```bash
npm run validate
```

This runs Expo lint and TypeScript. It passed after the latest notification-center work.

## Major Features Built

- Demo Login and Supabase Email Auth paths.
- Password reset request from Login.
- Onboarding and protected routes.
- Dashboard, Explore/Matches, Saved, Compare, Proposal, Tracker, Workspace, Profile, Settings.
- Supabase-ready profiles, workspaces, workspace members, saved grants, proposal drafts, tracked applications, checklists, review comments, activity log.
- Notification preferences and in-app notification queue scaffolding.
- Workspace preferences.
- Application collaborator sync.
- Starter grants table read path and seed-grants Edge Function scaffold.
- AI mock/backend request layer with bearer token attachment.
- Match score persistence.
- AI run history persistence and AI History screen.
- Subscription state read path and Subscription screen.
- Sync Center, Deploy Readiness, Grant Sources, Institution Admin, Data Management, Audit Log, Notification Center.

## New Files Added Recently

- `app/ai-history.tsx`
- `app/notification-center.tsx`
- `services/aiHistoryService.ts`
- `services/aiPersistenceService.ts`
- `services/notificationService.ts`
- `services/preferenceService.ts`
- `services/subscriptionService.ts`
- `data/seedGrants.ts`
- `supabase/functions/seed-grants/index.ts`

## Important Boundaries

- OpenAI keys must not go in Expo env vars.
- Real AI should run only through authenticated backend or Supabase Edge Functions.
- Payment checkout/webhooks are not connected.
- Email/push notification delivery is not connected.
- Legal pages are placeholders.
- Demo Login remains local fallback.

## Current Remaining Production Work

- Apply and test `supabase/schema.sql` in the Supabase dashboard.
- Run two-user/two-workspace RLS QA.
- Add real grant ingestion jobs.
- Add real AI provider calls server-side.
- Add AI evaluation and approval workflow.
- Add payment provider checkout and webhook enforcement.
- Add email/push notification provider and scheduled delivery workers.
- Replace legal placeholders.
- Run web/mobile QA and store-readiness review.
