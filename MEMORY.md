# Project Memory

## Product

GrantMatch AI is a grant discovery and proposal workflow SaaS foundation. It targets researchers, NGOs, startups, and institutions.

Core jobs:

- Discover relevant grants.
- Save and compare opportunities.
- Generate and improve proposal drafts.
- Track applications through submission/outcome.
- Coordinate team review, finance review, comments, and collaborators.
- Prepare for Supabase-backed production workflows while keeping a polished local demo.

## User Preferences

- Keep building proactively.
- Preserve localhost availability when possible.
- Keep Demo Login working.
- Do not expose secrets.
- Prefer practical production-readiness features over decorative UI work.
- Make continuity easy for future development sessions.

## Architecture Memory

- App state lives primarily in `state/GrantMatchState.tsx`.
- Screens live in `app/`.
- Reusable UI lives in `components/`.
- Service boundaries live in `services/`.
- Mock data lives in `data/`.
- Production docs live in `docs/`.
- Supabase schema lives in `supabase/schema.sql`.
- Edge Function scaffolds live in `supabase/functions/`.

## Supabase Memory

Supabase-backed paths now cover:

- auth/session restore
- profiles
- workspaces
- workspace members
- saved grants
- proposal drafts
- tracked applications
- application checklists
- application collaborators
- review comments
- activity log
- notification preferences
- notification events / in-app queue
- workspace preferences
- grants read path
- match scores
- AI run history
- subscription state reads

Still not real production services:

- real grant ingestion jobs
- real AI provider calls
- payment checkout/webhooks
- email/push notification delivery
- production monitoring
- legal review

## Login Memory

If email login fails but Demo Login works:

- Supabase URL/key may be valid, but the account may not exist in that project.
- Use Register to create a test account.
- Use Reset Password for existing accounts.
- If email confirmation is enabled in Supabase, confirm the email before login.

## Localhost Memory

Use:

```bash
npx expo start --web --port 8081
```

Known issue: Expo port probing can fail in sandboxed command execution. Starting outside the sandbox fixed localhost previously.

If new route files are added, restart Expo so Expo Router sees them.

## Validation Memory

Use:

```bash
npm run validate
```

This has been kept green after recent changes.
