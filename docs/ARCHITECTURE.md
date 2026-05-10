# GrantMatch AI Architecture

GrantMatch AI is an Expo React Native SaaS foundation for web, iOS, and Android.

## Structure
- `app/`: Expo Router screens and tab routes.
- `components/`: reusable UI pieces.
- `state/`: shared app context and persistence.
- `services/`: backend-ready service boundaries.
- `data/`: mock datasets and product configuration.
- `utils/`: deterministic helpers for sync, AI mocks, subscriptions, and audit.
- `supabase/schema.sql`: backend schema and RLS draft.

## State
The app uses React Context with AsyncStorage fallback. Supabase is used only when configured and authenticated.

## Supabase
Public Expo env vars configure the Supabase client. No service role keys belong in the app. RLS uses authenticated user ownership today, with TODOs for future workspace membership policies.

## AI Plan
Current AI logic is deterministic mock logic. Real matching and proposal generation should run through secure backend endpoints.

## Grant Ingestion
Grant sources and ingestion runs are mocked in the client. Production ingestion should run server-side with source adapters, validation, deduplication, and monitoring.

## Deployment
Expo Web can be statically exported. Mobile release should use EAS after legal, secrets, monitoring, store metadata, and backend rules are complete.

## Remaining Production Work
Real grant ingestion, secure AI APIs, payments, notification delivery, production monitoring, legal content, and app store release.
