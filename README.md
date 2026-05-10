# GrantMatch AI

GrantMatch AI is an Expo React Native SaaS foundation for grant discovery, grant comparison, proposal drafting, application tracking, and institution workspace collaboration.

The app uses one TypeScript codebase for Expo Web, iOS, and Android. It is deploy-prepared for a polished demo, with Supabase-ready auth and partial data sync for backend migration. Demo Login and mock/local mode still work without secrets, AI API, payment provider, notification service, or production-only credentials.

## Current Features

- Mock auth-ready login, register, demo login, logout, and protected app routes
- First-time onboarding persisted with `AsyncStorage`
- Dashboard with local counts and readiness insights
- Saved Grants shortlist and Grant Compare
- Editable Profile prefilled by onboarding answers
- Proposal Draft Management with local mock generation and editing
- Application Tracker with statuses, notes, linked drafts, submission checklists, and deadline risk guidance
- Team / Institution Workspace with mock members, collaborators, review comments, and activity log
- Settings with workspace preferences, notification preferences, app info, data export summary, app health panel, reset controls, and legal/readiness links
- Deploy Readiness screen with typed checklist data, status filters, app info, demo safety guidance, and backend migration plan
- Privacy Policy and Terms of Service placeholder screens
- Typed service layer and API client placeholder prepared for future backend replacement
- EAS build profile scaffolding for future mobile builds
- Sync Center, Grant Sources, Match Lab, Proposal Review Assistant, Institution Admin, Subscription, Data Management, and Audit Log production-readiness screens

## Main Docs

- [Architecture](docs/ARCHITECTURE.md)
- [Backend Migration](docs/BACKEND_MIGRATION.md)
- [AI Implementation Plan](docs/AI_IMPLEMENTATION_PLAN.md)
- [Deployment](docs/DEPLOYMENT.md)
- [QA Checklist](docs/QA_CHECKLIST.md)

## Current Backend Status

Supabase-backed for authenticated users: auth foundation, profiles, workspaces, workspace members, saved grants, proposal drafts, tracked applications, checklists, review comments, and activity log. Local/demo fallback remains available through AsyncStorage and Demo Login.

Still mock/planned: real grant ingestion, real AI APIs, payments, notifications, collaborator assignment persistence, production monitoring, and final legal/store release work.

## Secure AI Architecture

GrantMatch AI uses mock AI in the Expo frontend today. Real OpenAI integration must be backend-only:

`Expo frontend -> authenticated backend/Edge Function request -> OpenAI API -> result stored in Supabase -> frontend reads result`

OpenAI keys must never be stored in Expo code or `EXPO_PUBLIC_*` variables because web and mobile client bundles are inspectable. The frontend only supports public endpoint configuration:

```bash
EXPO_PUBLIC_AI_API_BASE_URL=
EXPO_PUBLIC_ENABLE_BACKEND_AI=false
```

Planned backend endpoints are documented in `supabase/functions/README.md` and include `generate-proposal`, `improve-proposal`, `score-proposal`, `match-grants`, `explain-match`, `generate-review-questions`, and `ingest-grants`.

Safe mock Supabase Edge Function scaffolds now exist for those endpoints. They require a Supabase bearer token and return deterministic mock responses until backend secrets, rate limits, persistence, and real AI provider calls are configured.

AI production hardening still required:
- Supabase JWT verification on every AI endpoint.
- Server-side OpenAI/provider secrets only.
- Per-user and per-workspace rate limits.
- Prompt safety checks and human review.
- AI run persistence and evaluation before real launch.

## Full Demo Test Path

1. Demo Login
2. Complete onboarding
3. Save grants
4. Compare grants
5. Generate proposal draft
6. Review proposal
7. Track application
8. Toggle checklist
9. Add collaborator/comment
10. Open Workspace
11. Open Institution Admin
12. Open Sync Center
13. Open Deploy Readiness
14. Reset demo data

## Local Development

Install dependencies:

```bash
npm install
```

Start Expo:

```bash
npm start
```

Validate during development:

```bash
npm run lint
npx tsc --noEmit
npm run validate
```

## Web Preview

Run the Expo web dev server:

```bash
npm run web
```

Open the local URL shown by Expo. Use Demo Login to enter the protected app routes.

## Web Production Build

Export a static web build:

```bash
npx expo export
```

Run health checks before hosting:

```bash
npx expo-doctor
npm run validate
```

The `web.output` setting is configured for static export. Connect a hosting provider only after environment values and legal placeholders are reviewed.

## Local Static Preview

After export, preview the static build locally:

```bash
npx serve dist
```

Then open the localhost URL shown by `serve`. This checks the same `dist` folder you would upload to a static host. If `serve` is not installed, `npx` may ask to download it.

## Demo Web Deployment Targets

Netlify:

- Build command: `npx expo export`
- Publish directory: `dist`
- Environment variables: optional for the mock demo; use placeholders only until real services exist
- Limitation: local persistence is browser-specific and resets when browser storage is cleared

Vercel:

- Framework preset: Other
- Build command: `npx expo export`
- Output directory: `dist`
- Environment variables: optional for the mock demo; do not add real secret keys
- Limitation: protected routes use mock session state, not server-side auth

Render static site:

- Build command: `npm install && npx expo export`
- Publish directory: `dist`
- Environment variables: optional placeholder public values only
- Limitation: no backend, scheduled jobs, AI calls, or payment webhooks are connected

GitHub Pages:

- Build command: `npx expo export`
- Output folder: `dist`
- Practical note: easiest with a custom domain or root deployment; project pages may need base-path handling before final use
- Limitation: static hosting cannot provide real auth, backend persistence, or secret-backed APIs

## Android Build Preparation

Use Expo/EAS after installing and logging into EAS CLI:

```bash
npx expo-doctor
npm run validate
```

Then use the EAS profiles in `eas.json` when credentials are ready:

```bash
eas build --platform android --profile preview
eas build --platform android --profile production
```

No Google Play credentials are required for the current code changes.

## iOS Build Preparation

Use the same validation path before iOS builds:

```bash
npx expo-doctor
npm run validate
```

When Apple credentials are ready:

```bash
eas build --platform ios --profile preview
eas build --platform ios --profile production
```

No Apple credentials are required for the current demo-ready setup.

## Environment Variables

Copy `.env.example` when real services are selected:

```bash
cp .env.example .env
```

Current placeholders:

- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_OPENAI_API_KEY_PLACEHOLDER`
- `EXPO_PUBLIC_STRIPE_PUBLIC_KEY_PLACEHOLDER`

Do not commit real secrets. OpenAI calls should ultimately happen through a secure backend, not directly from the mobile/web client.

## Supabase Backend Foundation

Phase 1 adds Supabase-ready structure without requiring a live project.

To create a Supabase project:

1. Go to the Supabase dashboard and create a new project.
2. Open Project Settings -> API.
3. Copy the Project URL into `EXPO_PUBLIC_SUPABASE_URL`.
4. Copy the anon public key into `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
5. Keep service role keys out of Expo and out of this repository.

Create a local `.env` file:

```bash
cp .env.example .env
```

Then fill only public Expo variables:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Install dependencies:

```bash
npm install
```

If those Supabase values are missing or still placeholders, the app keeps using mock/local auth and local persisted demo state.

## Supabase SQL Schema Draft

The schema draft lives at:

```text
supabase/schema.sql
```

It includes tables for:

- `profiles`
- `workspaces`
- `workspace_members`
- `grants`
- `saved_grants`
- `proposal_drafts`
- `tracked_applications`
- `application_checklists`
- `review_comments`
- `activity_log`
- `subscriptions`

To run it, open the Supabase SQL editor, review the file, then execute it in the project. RLS is enabled. The current active policies are narrowly scoped to the authenticated user's own profile, owned workspace/member records, saved grants, proposal drafts, tracked applications, checklist items, review comments, and activity log records. Workspace-linked records currently use `user_id` ownership; future production RLS should expand this to verified workspace membership.

Current Supabase-backed tables:

- `profiles`
- `workspaces`
- `workspace_members`
- `saved_grants`
- `proposal_drafts`
- `tracked_applications`
- `application_checklists`
- `review_comments`
- `activity_log`

Remaining migration work: real grant ingestion, AI matching/generation APIs, notifications, payments, production monitoring, and deeper workspace preference persistence. Keep `AsyncStorage` for temporary local preferences and mock/demo fallback.

## EAS Build Setup

`eas.json` includes:

- `development`: development client, internal distribution
- `preview`: internal distribution
- `production`: production build with auto increment

Before production builds, review app icons, splash assets, bundle identifiers, store metadata, privacy forms, and credentials.

## Future Backend Connection

The `services/` folder isolates future backend boundaries:

- `apiClient.ts`: base URL config, typed request helper, safe errors, future auth token TODOs
- `supabaseClient.ts`: nullable Supabase client that does not crash when env vars are missing
- `authService.ts`: mock login, demo login, Supabase login/register/logout, current session helpers
- `userService.ts`: Supabase-backed `getProfile()` and `upsertProfile()` with mock fallback
- `grantService.ts`: grants, recommendations, save/unsave helpers
- `proposalService.ts`: proposal draft generation and save helpers
- `applicationService.ts`: tracked application, checklist, review comment, and activity log sync helpers
- `workspaceService.ts`: Supabase-backed `getOrCreateWorkspace()`, `getWorkspaceMembers()`, member insert/update/remove helpers, and local fallback helpers
- `aiService.ts`: AI proposal placeholder wrapper

Screens and state can keep using local behavior now, then service internals can be swapped for Supabase table calls as each model migrates.

## Mock Auth Flow

Shared state in `state/GrantMatchState.tsx` includes:

- `authMode: "mock"`
- `sessionUser`
- `isAuthenticated`
- `loginMock()`
- `registerMock()`
- `loginWithEmail()`
- `registerWithEmail()`
- `logout()`
- `logoutMock()`

Login validates email/password and uses Supabase Auth when `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are configured. If Supabase is not configured, email login/register fall back to mock/local mode. Demo Login always creates a local mock session for safe testing.

## Supabase Profile Sync

When a user registers with Supabase Auth, the app upserts a `profiles` row with:

- Supabase auth user id
- email
- full name
- organisation
- user type
- country/region when available
- research/funding interests when available
- subscription tier and profile completeness

When a Supabase user logs in or refreshes with an existing session, the app fetches `profiles`. If no row exists, it creates a basic profile from Supabase auth metadata and then mirrors that record into local app state.

Onboarding completion also updates the Supabase profile with organisation, user type, country/region, funding interests, and funding needs when Supabase is configured.

## Supabase Workspace Sync

When a Supabase user registers or logs in, the app calls `getOrCreateWorkspace()`:

- Finds the user's owned workspace if one exists
- Creates a default workspace if none exists
- Ensures the user is present in `workspace_members` as `Owner`
- Loads workspace members into app state

Onboarding updates the workspace name, organisation type, and preferred funding region where appropriate. If Supabase is not configured, all workspace behavior remains local/mock.

## Supabase Saved Grants Sync

When a Supabase user saves or unsaves a grant, the app syncs the grant's local catalog ID to `saved_grants.grant_external_id`. This works before the real grant ingestion pipeline exists because the current mock grant IDs are text values such as `grant-002`.

On login/session restore, saved grant IDs are loaded from Supabase when available. If Supabase is not configured or a sync call fails, the app continues using local `AsyncStorage` state.

## Supabase Proposal Draft Sync

Proposal drafts now sync to `proposal_drafts` for Supabase users. The table stores:

- `draft_external_id` for the app's current local draft ID
- `grant_external_id` for grant-linked drafts
- `title`
- `status`
- `sections` JSONB for abstract, problem statement, methodology, impact, budget, timeline, and team capability
- timestamps for sorting recent drafts

RLS allows authenticated users to select, insert, update, and delete only their own proposal drafts. If Supabase is not configured, or Demo Login is used, Proposal Builder continues to use local `AsyncStorage` state.

To test real proposal persistence:

1. Sign up or log in with Supabase email/password.
2. Create a general proposal draft or generate a grant-specific draft.
3. Edit sections and tap `Save Draft`.
4. Change status to Draft, Improved, or Ready for Review.
5. Refresh the app and log back in.
6. Confirm the draft list and Dashboard recent drafts reload from Supabase.

## Supabase Tracker And Checklist Sync

Tracked applications now sync to `tracked_applications` for Supabase users. The table stores:

- `application_external_id` for the app's current local tracker ID
- `grant_external_id`, `grant_title`, `funder`, and `deadline` for mock grant compatibility
- `status` using Not Started, Drafting, Ready for Review, Submitted, Awarded, or Rejected
- `linked_proposal_draft_external_id` so proposal draft linking keeps working before full UUID relationships exist
- `notes`
- `next_action` JSONB for deadline/action guidance
- timestamps for dashboard sorting and recent updates

Application checklist items sync to `application_checklists`. The table stores:

- `application_external_id` to attach items to the app's local tracked application ID
- `checklist_external_id` for stable local checklist item IDs
- `title`
- `completed`
- `required`
- `category` using Eligibility, Proposal, Budget, Documents, Review, or Submission

RLS allows authenticated users to select, insert, update, and delete only their own tracked applications and checklist items. If Supabase is not configured, or Demo Login is used, the Tracker keeps using `AsyncStorage` state.

To test real tracker persistence:

1. Run the updated `supabase/schema.sql` in Supabase SQL Editor.
2. Sign up or log in with Supabase email/password.
3. Track a grant from Dashboard, Saved Grants, Grant Details, or Tracker.
4. Change status, edit notes, link a proposal draft, and toggle checklist items.
5. Refresh the app and log back in.
6. Confirm Dashboard tracker counts, deadline risk, checklist readiness, and Tracker groups reload from Supabase.

## Supabase Review Comments Sync

Review comments now sync to `review_comments` for Supabase users. The table stores the local comment ID, tracked application external ID, commenter member external ID, commenter name/role, comment text, workspace ID, and timestamps.

RLS allows authenticated users to select, insert, update, and delete only their own review comment rows. If Supabase is not configured, comments remain in `AsyncStorage`.

To test comment persistence:

1. Log in with Supabase email/password.
2. Track an application.
3. Add a review comment from the Tracker card.
4. Refresh the app and log back in.
5. Confirm the comment still appears on that application.

## Supabase Activity Log Sync

Activity now syncs to `activity_log` for Supabase users. Important actions are written with a local `activity_external_id`, action `type`, message title/description, optional actor name, related entity metadata, and timestamp.

Synced actions include application tracking, status changes, checklist completion, proposal saves, collaborator assignment, review comments, workspace member additions, settings updates, and data export events. Dashboard and Workspace activity feeds continue to read from shared app state, which is hydrated from Supabase on login/session restore.

To test activity persistence:

1. Log in with Supabase email/password.
2. Save a draft, track an application, change status, add a comment, or add a workspace member.
3. Refresh the app and log back in.
4. Confirm Dashboard Recent Activity and Workspace Activity still show the events.

## Supabase Workspace Members Sync

Workspace members now use `workspace_members.member_external_id` so the existing mock member IDs can remain stable in UI assignments. Supabase users load members from `workspace_members`, and Add Mock Member inserts a row when Supabase auth is active.

Collaborator assignments are still stored locally for now, but the member records they reference can persist in Supabase. Activity records capture collaborator assignment events until a dedicated collaboration assignment table is added.

To test member persistence:

1. Log in with Supabase email/password.
2. Open Workspace.
3. Tap `Add Mock Member`.
4. Refresh the app and log back in.
5. Confirm the member appears and can be assigned in Tracker.

## Supabase Migration Test Checklist

1. Create or open the Supabase project.
2. Run the updated `supabase/schema.sql` in SQL Editor.
3. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`.
4. Restart Expo.
5. Register a new user.
6. Complete onboarding.
7. Save a grant.
8. Create a proposal draft.
9. Track an application.
10. Toggle checklist items.
11. Add a review comment.
12. Add a workspace member.
13. Refresh the browser or restart the app.
14. Log in again.
15. Confirm saved grants, drafts, tracker items, checklists, comments, activity, and members persist.

## Protected Route Behaviour

Public routes:

- `/`
- `/login`
- `/register`
- `/onboarding`
- `/privacy-policy`
- `/terms-of-service`

App tab routes require a mock session:

- `/dashboard`
- `/recommendations`
- `/saved`
- `/profile`
- `/proposal`
- `/tracker`
- `/workspace`
- `/settings`

If a user is not authenticated, the tab layout redirects to `/login`. If authenticated but onboarding is incomplete, it redirects to `/onboarding`.

## Pre-Deployment Validation Checklist

- Run `npm install`
- Run `npm start` and smoke test navigation
- Run `npm run web` and test the browser demo
- Run `npm run lint`
- Run `npx tsc --noEmit`
- Run `npm run validate`
- Run `npx expo-doctor`
- Run `npx expo export` for web build verification
- Confirm `.env.example` has placeholders only
- Confirm no real secrets are committed
- Confirm Privacy Policy and Terms placeholders are not used as final legal documents
- Confirm demo banner is visible on key app screens
- Confirm Reset Demo Data behaves as expected

## Demo Web Deployment Checklist

- Run `npm install`
- Run `npm run validate`
- Run `npx expo-doctor`
- Run `npx expo export`
- Test `dist` locally with `npx serve dist`
- Deploy the `dist` folder
- Verify public routes: `/`, `/login`, `/register`, `/privacy-policy`, `/terms-of-service`
- Verify protected route redirects by opening `/dashboard` while logged out
- Verify Login and Demo Login
- Verify onboarding if local storage is fresh or onboarding was reset
- Verify local persistence by saving a grant, refreshing, and confirming it remains
- Verify Reset Demo Data clears local prototype data
- Verify Deploy Readiness filters and demo deployment steps

## Final Demo QA Checklist

- Landing: app name, value proposition, Get Started, and View Demo render
- Login: validation message, Login, Demo Login, and Register link work
- Register: required fields, user type selection, validation, and mock account creation work
- Onboarding: all setup steps complete and route to Dashboard
- Dashboard: counts, quick actions, saved preview, drafts, and activity render
- Matches: filters, save actions, and grant details navigation work
- Saved Grants: empty state, shortlist, compare selection, draft generation, and tracking work
- Compare: fewer-than-two empty state and 2-to-3 grant comparison work
- Proposal Builder: general drafts, grant drafts, edits, status changes, and save work
- Tracker: empty state, status changes, notes, checklist, collaborators, comments, and linked drafts work
- Workspace: member list, add mock member, role badges, and activity feed work
- Settings: app info, safety guidance, preferences, export summary, reset controls, legal links, and logout work
- Deploy Readiness: summary counts, filters, demo steps, migration plan, and app health render
- Privacy Policy: placeholder warning is clear
- Terms of Service: placeholder warning is clear

## Backend Migration Plan

Phase 1: Replace `AsyncStorage` with backend persistence.

Phase 2: Add real authentication.

Phase 3: Add workspace/team tables.

Phase 4: Add grant ingestion pipeline.

Phase 5: Add AI matching and proposal generation APIs.

Phase 6: Add payment/subscription enforcement.

## Proposed Backend Schema

`users`
- `id`, `email`, `full_name`, `user_type`, `country`, `sector`, `funding_needs`, `collaboration_interests`, `profile_completeness`, `created_at`, `updated_at`

`workspaces`
- `id`, `name`, `organisation_type`, `subscription_tier`, `default_currency`, `preferred_funding_regions`, `review_workflow_enabled`, `finance_review_required`, `internal_review_required`, `created_at`, `updated_at`

`workspace_members`
- `id`, `workspace_id`, `user_id`, `member_external_id`, `email`, `name`, `role`, `organisation`, `avatar_initials`, `joined_date`, `created_at`, `updated_at`

`grants`
- `id`, `title`, `funder`, `description`, `eligibility`, `deadline`, `funding_amount`, `region_eligibility`, `required_documents`, `topics`, `sectors`, `source_url`, `created_at`, `updated_at`

`saved_grants`
- `id`, `user_id`, `workspace_id`, `grant_id`, `created_at`

`proposal_drafts`
- `id`, `user_id`, `workspace_id`, `grant_id`, `proposal_title`, `abstract`, `problem_statement`, `methodology`, `expected_impact`, `budget_justification`, `timeline`, `team_capability`, `status`, `updated_at`

`tracked_applications`
- `id`, `user_id`, `workspace_id`, `application_external_id`, `grant_external_id`, `grant_title`, `funder`, `deadline`, `status`, `linked_proposal_draft_id`, `linked_proposal_draft_external_id`, `notes`, `next_action`, `created_at`, `updated_at`

`application_checklists`
- `id`, `user_id`, `tracked_application_id`, `application_external_id`, `checklist_external_id`, `title`, `completed`, `required`, `category`, `created_at`, `updated_at`

`review_comments`
- `id`, `user_id`, `workspace_id`, `application_external_id`, `comment_external_id`, `member_external_id`, `tracked_application_id`, `workspace_member_id`, `commenter_name`, `commenter_role`, `comment`, `created_at`, `updated_at`

`activity_log`
- `id`, `user_id`, `workspace_id`, `activity_external_id`, `type`, `title`, `description`, `actor_name`, `related_entity_type`, `related_entity_external_id`, `metadata`, `created_at`

`subscriptions`
- `id`, `workspace_id`, `plan`, `status`, `provider_customer_id`, `provider_subscription_id`, `current_period_end`, `created_at`, `updated_at`

## Deployment Preparation Steps

- Choose Supabase, Firebase, or a custom backend.
- Create real auth and session handling.
- Move persisted local records into backend tables.
- Add row-level security or equivalent authorization rules.
- Add secure server-side AI endpoints.
- Add payment/subscription enforcement.
- Replace legal placeholders with reviewed production documents.
- Configure EAS builds, web hosting, env vars, monitoring, icons, splash screens, and store metadata.

## Path From Demo To Production

1. Demo deployment
2. Real authentication
3. Backend database
4. Grant ingestion
5. AI matching
6. AI proposal generation
7. Payments/subscriptions
8. Legal review
9. App store release
10. Production monitoring

## Mock / Local-Only Limitations

- Supabase Auth is supported when configured; Demo Login remains mock/local.
- Local data is stored only on this device or browser.
- No real data should be entered yet.
- Grants and recommendations are local mock records.
- Saved grants sync to Supabase for Supabase users, with AsyncStorage fallback.
- Proposal drafts sync to Supabase for Supabase users, with AsyncStorage fallback.
- Tracked applications and checklist items sync to Supabase for Supabase users, with AsyncStorage fallback.
- Review comments, activity log, and workspace members sync to Supabase for Supabase users, with AsyncStorage fallback.
- Proposal generation is deterministic mock text.
- Data export summary does not download a real file.
- Notifications, AI, payments, collaborator assignment persistence, real grant ingestion, and full production monitoring are not connected.
- Reset Demo Data clears local prototype data.
- Backend connection is required for team production use.
- Privacy Policy and Terms of Service are placeholders requiring review.
