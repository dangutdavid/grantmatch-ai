# GrantMatch AI QA Checklist

## Auth
- Demo login works.
- Email login works when Supabase env vars are configured.
- Register creates a session.
- Logout returns to public entry.
- Protected app routes redirect or prompt when signed out.

## Onboarding
- Complete onboarding.
- Reset onboarding from Settings.
- Profile is prefilled from onboarding answers.

## Grants
- Run `supabase/schema.sql`, then `supabase/seed-grants.sql`.
- Verify the seed query returns `seeded_grant_count = 20`.
- Log in with Supabase email/password and confirm grants load from Supabase.
- View recommendations.
- Save a grant.
- Unsave a grant.
- Compare saved grants.

## Proposals
- Create a draft.
- Edit and save a draft.
- Improve a draft.
- Review a draft in Proposal Review Assistant.

## Tracker
- Track an application.
- Change status.
- Add notes.
- Toggle checklist items.
- Add a review comment.
- Assign a collaborator.

## Workspace
- Add a mock member.
- Assign collaborator to application.
- Confirm activity log updates.

## Backend
- App works without Supabase env vars.
- App uses Supabase when env vars are configured and user is authenticated.
- Persistence survives refresh/login for migrated entities.

## Supabase RLS Test Checklist
- User A cannot select or update User B's `profiles` row.
- User A cannot select an unrelated workspace.
- A workspace member can select workspace applications, proposal drafts, checklists, comments, and activity.
- A Viewer can read workspace-linked records but cannot update workspace settings.
- An Owner/Admin can update workspace settings.
- An Owner/Admin can add, update, and remove workspace members.
- A Researcher can create or update workspace-linked proposal drafts and tracked applications.
- User A cannot delete unrelated review comments.
- Workspace Owner/Admin can delete comments in their workspace.
- Activity log rows can be inserted for owned/member workspaces but cannot be updated or deleted from the client.
- Saved grants remain user-scoped.
- Proposal drafts remain user/workspace scoped.
- Tracked applications and checklists remain user/workspace scoped.
- Subscription writes are not available from the client.

## Deployment
- `npm run validate`
- `npx expo-doctor`
- `npx expo export`
