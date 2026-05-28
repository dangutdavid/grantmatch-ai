# Claude Code Build Prompt

Use this prompt to continue development in another coding agent.

```text
You are continuing development on GrantMatch AI, an Expo Router React Native SaaS foundation in:

/Users/marendavid/my-mobile-app/my-mobile-app

Primary goal:
Keep building the app toward production readiness while preserving demo/local fallback.

Current stack:
- Expo SDK 54
- Expo Router
- React Native / React Native Web
- TypeScript
- Supabase client and SQL schema
- AsyncStorage fallback

Before changing code:
1. Run `git status --short`.
2. Read `CHECKPOINT.md`, `MEMORY.md`, `MANUAL_SETUP.md`, and `README.md`.
3. Do not revert unrelated existing changes.
4. Keep real secrets out of code and docs.

Validation:
Run `npm run validate` after changes.

Local web:
Use `npx expo start --web --port 8081`.
If new routes 404, restart Expo.

Important architecture rules:
- Expo frontend may only use public env vars.
- OpenAI/provider secrets must stay backend-only.
- Supabase service role keys must never be used in Expo.
- Demo Login should continue working without Supabase.
- Supabase Email Auth should continue working when `.env` is configured.
- Production-only features must be labelled honestly if still mocked.

Recently built:
- Password reset action on Login.
- AI History screen and AI persistence services.
- Notification Center and in-app notification queue scaffolding.
- Subscription state read service and Subscription screen.
- Supabase schema additions for AI history, notification events, and subscription reads.

Good next work:
- Add notification event worker/Edge Function scaffold.
- Add payment webhook Edge Function scaffold.
- Add RLS test documentation or SQL test fixtures.
- Add user-facing Supabase setup health checks to Settings.
- Improve Grant Sources ingestion from seed data to scheduled ingestion runs.
- Add audit_events persistence from activity events.
```
