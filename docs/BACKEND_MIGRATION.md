# Backend Migration

## Completed
- Supabase Auth foundation.
- Profiles and workspaces.
- Workspace members basics.
- Saved grants.
- Proposal drafts.
- Tracked applications.
- Application checklists.
- Review comments.
- Activity log.

## Remaining
- Collaborator assignments as a dedicated table.
- Real grant ingestion.
- Match score persistence integration.
- Proposal generation run persistence integration.
- Notification/workspace preferences full sync.
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
- `proposal_drafts`: owners can access their own drafts; workspace members can read workspace-linked drafts; owners/admins/researchers can update workspace-linked drafts.
- `tracked_applications`: owners can access their own records; workspace members can read workspace-linked records; owners/admins/researchers can create/update workspace-linked records.
- `application_checklists`: access follows the owning user or parent tracked application workspace.
- `review_comments`: workspace members can read and add comments; users can delete their own comments; owners/admins can delete comments in their workspace.
- `activity_log`: workspace members can read workspace activity and insert scoped activity; update/delete is intentionally not exposed.
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

## Fallback
If Supabase is missing or unavailable, the app continues with AsyncStorage and mock data.
