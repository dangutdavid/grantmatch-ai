# Backend Migration

## Completed
- Supabase Auth foundation.
- Starter grant catalog Supabase read path and seed function.
- Profiles and workspaces.
- Workspace members basics.
- Saved grants.
- Proposal drafts.
- Tracked applications.
- Application checklists.
- Review comments.
- Activity log.
- Notification preferences.
- Notification queue scaffolding.
- Workspace preferences.
- Application collaborators.
- Workspace-aware reads for workspace-linked applications, proposals, comments, activity, members, and collaborators.
- Match score persistence for Supabase-authenticated users.
- Proposal generation, improvement, and review run persistence for Supabase-authenticated users.
- AI History operations screen for persisted match scores and AI runs.
- Subscription state read path for workspace subscription rows.

## Remaining
- Automated external grant source ingestion beyond the starter seed catalog.
- AI evaluation metrics and approval tooling.
- Real notification delivery.
- Subscriptions and entitlement enforcement.
- Production monitoring and audit hardening.

## Tables
See `supabase/schema.sql` for current table definitions and policies.

## RLS
Policies are scoped to authenticated user ownership or workspace ownership. Broad anon/public policies are intentionally avoided.

## Supabase RLS Security Model

The current security model is designed for the public Expo anon client and does not require service role keys in the frontend. Service role keys must never be used in the Expo app because they bypass Row Level Security and would expose production data to any extracted client bundle.

Role model:
- `Owner`: owns the workspace, can manage settings, members, and workspace-linked records.
- `Admin`: can manage workspace settings, members, and workspace-linked records.
- `Researcher`: can create and update workspace-linked applications and proposal drafts.
- `Reviewer`, `Finance`, `Viewer`: can read workspace-linked records; Viewer is intentionally read-only in the draft policies.

Table access summary:
- `profiles`: users can select, insert, and update only their own profile.
- `workspaces`: authenticated users can select workspaces they own or belong to; owners/admins can update settings.
- `workspace_members`: workspace members can read their workspace roster; owners/admins can add, update, or remove members.
- `saved_grants`: remains user-scoped.
- `grants`: authenticated users can read the catalog; writes should remain server-side through service-role Edge Functions.
- `proposal_drafts`: owners can access their own drafts; workspace members can read workspace-linked drafts; owners/admins/researchers can update workspace-linked drafts.
- `tracked_applications`: owners can access their own records; workspace members can read workspace-linked records; owners/admins/researchers can create/update workspace-linked records.
- `application_checklists`: access follows the owning user or parent tracked application workspace.
- `application_collaborators`: users can read their own collaborator assignments; workspace members can read workspace application collaborators; owners/admins/researchers can manage assignments.
- `review_comments`: workspace members can read and add comments; users can delete their own comments; owners/admins can delete comments in their workspace.
- `activity_log`: workspace members can read workspace activity and insert scoped activity; update/delete is intentionally not exposed.
- `notification_preferences`: users can select, insert, update, and delete only their own notification preference row.
- `notification_events`: users can manage their own in-app notification queue; workspace members can read workspace-scoped notification events.
- `workspace_preferences`: owners/admins can update workspace settings; user-scoped rows remain owner-only.
- `subscriptions`: workspace members can read subscription state; writes should happen only through trusted backend/payment webhook code.

Policy assumptions:
- Workspace sharing is based on `workspace_members.user_id = auth.uid()` and `status = active`.
- RLS helper functions are scoped to `auth.uid()` and do not expose service-role behavior to the client.
- Workspace ownership transfer, invitations, and payment writes should be implemented later through audited server-side functions.

Before production:
- Run a dedicated security review of every policy.
- Add automated policy tests using at least two users and two workspaces.
- Confirm Viewer cannot mutate workspace records.
- Confirm Admin cannot escalate ownership without an audited server-side flow.
- Confirm payment/subscription writes are blocked from the client.

## Running SQL
Open Supabase SQL Editor and run `supabase/schema.sql` after reviewing changes.

Then seed the starter grant catalog by running:

```text
supabase/seed-grants.sql
```

The seed file upserts the current 20 curated mock grants into `public.grants` using `grant_external_id`, so it is safe to rerun. It ends with this verification query:

```sql
select count(*) as seeded_grant_count
from public.grants
where grant_external_id like 'grant-%';
```

Expected count: `20`.

## Migration Test Path

1. Log in with Supabase email/password.
2. Confirm Explore/Matches loads grants from `public.grants` after running `supabase/seed-grants.sql`.
3. Open Settings and change notification preferences.
4. Change workspace name, currency, preferred regions, and review workflow preferences.
5. Track an application, add a workspace member, and assign that member as a collaborator.
6. Run Match Lab and open AI History.
7. Open Notification Center and confirm in-app notification events are generated.
8. Open Subscription and confirm subscription state reads from Supabase or clearly falls back to workspace plan state.
9. Log out and log back in.
10. Confirm grants, preferences, notification events, collaborator assignments, AI history, and subscription state reload from Supabase.
11. Repeat with Demo Login to confirm local fallback still works without backend writes.

Mock-only after this phase: real grants, grant ingestion, real AI calls, real email/push notification delivery, payments, production monitoring, and legal/store release workflows.

## Fallback
If Supabase is missing or unavailable, the app continues with AsyncStorage and mock data.
