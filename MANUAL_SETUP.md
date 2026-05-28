# Manual Setup

This file lists the manual steps needed outside the codebase.

## Local Development

Install dependencies:

```bash
npm install
```

Start web:

```bash
npx expo start --web --port 8081
```

Open:

```text
http://localhost:8081
```

Validate:

```bash
npm run validate
```

## Environment

Create `.env` from `.env.example` if needed:

```bash
cp .env.example .env
```

Required public Supabase values for real email login:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Optional backend AI values:

```bash
EXPO_PUBLIC_AI_API_BASE_URL=
EXPO_PUBLIC_ENABLE_BACKEND_AI=false
```

Do not add service role keys, OpenAI keys, Stripe secret keys, or other private values to Expo public env vars.

## Supabase Setup

1. Create/open the Supabase project.
2. Copy Project URL to `EXPO_PUBLIC_SUPABASE_URL`.
3. Copy anon/publishable key to `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
4. Restart Expo after editing `.env`.
5. Run `supabase/schema.sql` in Supabase SQL Editor.
6. Confirm Email/Password provider is enabled in Authentication.
7. If email confirmation is enabled, confirm test users before login.
8. Use Register in the app to create a Supabase test account.
9. Use Reset Password from Login if credentials are rejected.

## Supabase Edge Functions

Safe mock scaffolds exist under `supabase/functions/`.

Current function set includes:

- `generate-proposal`
- `improve-proposal`
- `score-proposal`
- `match-grants`
- `explain-match`
- `generate-review-questions`
- `ingest-grants`
- `seed-grants`

Before production:

- Verify JWT on every function.
- Add server-side provider secrets.
- Add rate limits.
- Persist AI runs and evaluation metadata.
- Add audit logging.

## Demo Login

Demo Login is local fallback. It does not require Supabase and should remain available for safe testing until intentionally disabled for production.

## Known Localhost Note

If `localhost:8081` refuses connection, start Expo:

```bash
npx expo start --web --port 8081
```

If Expo Router returns 404 for newly created routes, restart the Expo server.
