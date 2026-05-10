-- GrantMatch AI Supabase schema draft
-- Safe foundation only: RLS is enabled, and production policies are left as TODOs.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  user_type text not null check (user_type in ('Researcher', 'NGO', 'Startup', 'Institution')),
  organisation text,
  country text,
  sector text,
  funding_needs text,
  collaboration_interests text,
  research_interests text[] not null default '{}',
  profile_completeness integer not null default 0 check (profile_completeness between 0 and 100),
  subscription_tier text not null default 'Free' check (subscription_tier in ('Free', 'Pro', 'Institutional')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  organisation_type text not null,
  subscription_tier text not null default 'Free',
  default_currency text not null default 'USD',
  preferred_funding_regions text not null default 'Global',
  review_workflow_enabled boolean not null default true,
  finance_review_required boolean not null default true,
  internal_review_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  member_external_id text,
  email text not null,
  name text not null,
  role text not null check (role in ('Owner', 'Admin', 'Researcher', 'Reviewer', 'Finance', 'Viewer')),
  organisation text,
  avatar_initials text,
  status text not null default 'active',
  joined_date text not null default current_date::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grants (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  funder text not null,
  description text not null,
  eligibility text,
  deadline text,
  funding_amount text,
  region_eligibility text,
  required_documents text[] not null default '{}',
  topics text[] not null default '{}',
  sectors text[] not null default '{}',
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  grant_id uuid references public.grants(id) on delete cascade,
  grant_external_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, grant_external_id)
);

create table if not exists public.proposal_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  grant_id uuid references public.grants(id) on delete set null,
  draft_external_id text not null,
  grant_external_id text,
  title text not null,
  sections jsonb not null default '{}'::jsonb,
  status text not null default 'Draft' check (status in ('Draft', 'Improved', 'Ready for Review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, draft_external_id)
);

create table if not exists public.tracked_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  grant_id uuid references public.grants(id) on delete set null,
  application_external_id text not null,
  grant_external_id text not null,
  linked_proposal_draft_id uuid references public.proposal_drafts(id) on delete set null,
  linked_proposal_draft_external_id text,
  grant_title text not null,
  funder text,
  deadline date,
  status text not null default 'Not Started' check (
    status in ('Not Started', 'Drafting', 'Ready for Review', 'Submitted', 'Awarded', 'Rejected')
  ),
  notes text not null default '',
  next_action jsonb,
  next_action_recommendation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, application_external_id)
);

create table if not exists public.application_checklists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tracked_application_id uuid references public.tracked_applications(id) on delete cascade,
  application_external_id text,
  checklist_external_id text,
  title text not null,
  label text,
  completed boolean not null default false,
  required boolean not null default true,
  category text not null default 'Proposal' check (
    category in ('Eligibility', 'Proposal', 'Budget', 'Documents', 'Review', 'Submission')
  ),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, application_external_id, checklist_external_id)
);

create table if not exists public.review_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  application_external_id text,
  comment_external_id text,
  member_external_id text,
  tracked_application_id uuid references public.tracked_applications(id) on delete cascade,
  workspace_member_id uuid references public.workspace_members(id) on delete set null,
  commenter_name text not null default 'Team member',
  commenter_role text not null default 'Reviewer',
  comment text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, comment_external_id)
);

create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  activity_external_id text,
  tracked_application_id uuid references public.tracked_applications(id) on delete set null,
  actor_member_id uuid references public.workspace_members(id) on delete set null,
  type text not null,
  title text not null,
  description text not null,
  actor_name text,
  related_entity_type text,
  related_entity_external_id text,
  metadata jsonb,
  action text,
  message text not null,
  created_at timestamptz not null default now(),
  unique (user_id, activity_external_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  plan text not null default 'Free',
  status text not null default 'inactive',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grant_sources (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  source_external_id text not null unique,
  name text not null,
  source_type text not null,
  region text not null,
  status text not null default 'Idle',
  last_sync timestamptz,
  imported_count integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grant_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  source_external_id text not null,
  status text not null,
  imported_count integer not null default 0,
  notes text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grant_match_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  grant_external_id text not null,
  confidence_score integer not null default 0,
  signals jsonb not null default '[]'::jsonb,
  explanation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, grant_external_id)
);

create table if not exists public.proposal_generation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  draft_external_id text,
  status text not null default 'Completed',
  prompt_context jsonb,
  result_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  deadline_reminders boolean not null default true,
  proposal_review_reminders boolean not null default true,
  saved_grant_updates boolean not null default true,
  weekly_digest boolean not null default false,
  team_activity_updates boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_preferences (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  default_currency text not null default 'USD',
  preferred_funding_regions text not null default 'Global',
  review_workflow_enabled boolean not null default true,
  finance_review_required boolean not null default true,
  internal_review_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  event_type text not null,
  actor_name text,
  entity_type text,
  entity_external_id text,
  description text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  feedback_type text not null,
  related_entity_type text,
  related_entity_external_id text,
  rating integer check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspace_members
  add column if not exists member_external_id text;

alter table public.workspace_members
  alter column joined_date drop default;

alter table public.workspace_members
  alter column joined_date type text using joined_date::text;

alter table public.workspace_members
  alter column joined_date set default current_date::text;

alter table public.tracked_applications
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists application_external_id text,
  add column if not exists grant_external_id text,
  add column if not exists linked_proposal_draft_external_id text,
  add column if not exists next_action jsonb;

alter table public.tracked_applications
  alter column workspace_id drop not null,
  alter column grant_id drop not null,
  alter column deadline type text using deadline::text;

alter table public.application_checklists
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists application_external_id text,
  add column if not exists checklist_external_id text,
  add column if not exists title text,
  add column if not exists required boolean not null default true,
  add column if not exists category text not null default 'Proposal';

alter table public.application_checklists
  alter column tracked_application_id drop not null;

alter table public.application_checklists
  alter column title set default 'Checklist item';

update public.application_checklists
set title = coalesce(title, label, 'Checklist item')
where title is null;

alter table public.application_checklists
  alter column title set not null;

do $$
begin
  alter table public.application_checklists
    add constraint application_checklists_category_check
    check (category in ('Eligibility', 'Proposal', 'Budget', 'Documents', 'Review', 'Submission'));
exception
  when duplicate_object then null;
end;
$$;

alter table public.review_comments
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists application_external_id text,
  add column if not exists comment_external_id text,
  add column if not exists member_external_id text,
  add column if not exists commenter_name text not null default 'Team member',
  add column if not exists commenter_role text not null default 'Reviewer';

alter table public.review_comments
  alter column tracked_application_id drop not null;

alter table public.activity_log
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists activity_external_id text,
  add column if not exists type text,
  add column if not exists title text,
  add column if not exists description text,
  add column if not exists actor_name text,
  add column if not exists related_entity_type text,
  add column if not exists related_entity_external_id text,
  add column if not exists metadata jsonb;

update public.activity_log
set
  type = coalesce(type, action, 'settings_updated'),
  title = coalesce(title, message, 'Workspace activity'),
  description = coalesce(description, message, 'Workspace activity')
where type is null or title is null or description is null;

alter table public.activity_log
  alter column type set not null,
  alter column title set not null,
  alter column description set not null;

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists workspaces_owner_user_id_idx on public.workspaces(owner_user_id);
create index if not exists workspace_members_workspace_id_idx on public.workspace_members(workspace_id);
create index if not exists workspace_members_user_id_idx on public.workspace_members(user_id);
create index if not exists workspace_members_email_idx on public.workspace_members(email);
create index if not exists workspace_members_role_idx on public.workspace_members(role);
create index if not exists grants_deadline_idx on public.grants(deadline);
create index if not exists grants_topics_idx on public.grants using gin(topics);
create index if not exists grants_sectors_idx on public.grants using gin(sectors);
create index if not exists saved_grants_user_id_idx on public.saved_grants(user_id);
create index if not exists saved_grants_workspace_id_idx on public.saved_grants(workspace_id);
create index if not exists saved_grants_external_id_idx on public.saved_grants(grant_external_id);
create index if not exists proposal_drafts_user_id_idx on public.proposal_drafts(user_id);
create index if not exists proposal_drafts_workspace_id_idx on public.proposal_drafts(workspace_id);
create index if not exists proposal_drafts_grant_external_id_idx on public.proposal_drafts(grant_external_id);
create index if not exists proposal_drafts_status_idx on public.proposal_drafts(status);
create index if not exists proposal_drafts_updated_at_idx on public.proposal_drafts(updated_at desc);
create unique index if not exists tracked_applications_user_external_unique_idx on public.tracked_applications(user_id, application_external_id);
create index if not exists tracked_applications_user_id_idx on public.tracked_applications(user_id);
create index if not exists tracked_applications_workspace_id_idx on public.tracked_applications(workspace_id);
create index if not exists tracked_applications_external_id_idx on public.tracked_applications(application_external_id);
create index if not exists tracked_applications_grant_external_id_idx on public.tracked_applications(grant_external_id);
create index if not exists tracked_applications_status_idx on public.tracked_applications(status);
create index if not exists tracked_applications_deadline_idx on public.tracked_applications(deadline);
create index if not exists tracked_applications_updated_at_idx on public.tracked_applications(updated_at desc);
create unique index if not exists application_checklists_user_application_item_unique_idx on public.application_checklists(user_id, application_external_id, checklist_external_id);
create index if not exists application_checklists_user_id_idx on public.application_checklists(user_id);
create index if not exists application_checklists_application_idx on public.application_checklists(tracked_application_id);
create index if not exists application_checklists_external_application_idx on public.application_checklists(application_external_id);
create index if not exists application_checklists_external_item_idx on public.application_checklists(checklist_external_id);
create index if not exists application_checklists_category_idx on public.application_checklists(category);
create index if not exists application_checklists_completed_idx on public.application_checklists(completed);
create unique index if not exists review_comments_user_external_unique_idx on public.review_comments(user_id, comment_external_id);
create index if not exists review_comments_user_id_idx on public.review_comments(user_id);
create index if not exists review_comments_workspace_id_idx on public.review_comments(workspace_id);
create index if not exists review_comments_external_application_idx on public.review_comments(application_external_id);
create index if not exists review_comments_application_idx on public.review_comments(tracked_application_id);
create index if not exists review_comments_created_at_idx on public.review_comments(created_at desc);
create unique index if not exists activity_log_user_external_unique_idx on public.activity_log(user_id, activity_external_id);
create index if not exists activity_log_user_id_idx on public.activity_log(user_id);
create index if not exists activity_log_workspace_id_idx on public.activity_log(workspace_id);
create index if not exists activity_log_type_idx on public.activity_log(type);
create index if not exists activity_log_related_entity_type_idx on public.activity_log(related_entity_type);
create index if not exists activity_log_related_entity_external_id_idx on public.activity_log(related_entity_external_id);
create index if not exists activity_log_created_at_idx on public.activity_log(created_at desc);
create index if not exists subscriptions_workspace_id_idx on public.subscriptions(workspace_id);
create index if not exists grant_sources_workspace_id_idx on public.grant_sources(workspace_id);
create index if not exists grant_sources_external_id_idx on public.grant_sources(source_external_id);
create index if not exists grant_ingestion_runs_workspace_id_idx on public.grant_ingestion_runs(workspace_id);
create index if not exists grant_ingestion_runs_source_external_id_idx on public.grant_ingestion_runs(source_external_id);
create index if not exists grant_match_scores_user_id_idx on public.grant_match_scores(user_id);
create index if not exists grant_match_scores_grant_external_id_idx on public.grant_match_scores(grant_external_id);
create index if not exists proposal_generation_runs_user_id_idx on public.proposal_generation_runs(user_id);
create index if not exists proposal_generation_runs_workspace_id_idx on public.proposal_generation_runs(workspace_id);
create index if not exists notification_preferences_user_id_idx on public.notification_preferences(user_id);
create index if not exists workspace_preferences_workspace_id_idx on public.workspace_preferences(workspace_id);
create index if not exists workspace_preferences_user_id_idx on public.workspace_preferences(user_id);
create index if not exists audit_events_user_id_idx on public.audit_events(user_id);
create index if not exists audit_events_workspace_id_idx on public.audit_events(workspace_id);
create index if not exists audit_events_event_type_idx on public.audit_events(event_type);
create index if not exists audit_events_entity_external_id_idx on public.audit_events(entity_external_id);
create index if not exists audit_events_created_at_idx on public.audit_events(created_at desc);
create index if not exists user_feedback_user_id_idx on public.user_feedback(user_id);
create index if not exists user_feedback_workspace_id_idx on public.user_feedback(workspace_id);
create index if not exists user_feedback_related_entity_idx on public.user_feedback(related_entity_type, related_entity_external_id);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_workspaces_updated_at on public.workspaces;
create trigger set_workspaces_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

drop trigger if exists set_workspace_members_updated_at on public.workspace_members;
create trigger set_workspace_members_updated_at
before update on public.workspace_members
for each row execute function public.set_updated_at();

drop trigger if exists set_grants_updated_at on public.grants;
create trigger set_grants_updated_at
before update on public.grants
for each row execute function public.set_updated_at();

drop trigger if exists set_proposal_drafts_updated_at on public.proposal_drafts;
create trigger set_proposal_drafts_updated_at
before update on public.proposal_drafts
for each row execute function public.set_updated_at();

drop trigger if exists set_tracked_applications_updated_at on public.tracked_applications;
create trigger set_tracked_applications_updated_at
before update on public.tracked_applications
for each row execute function public.set_updated_at();

drop trigger if exists set_application_checklists_updated_at on public.application_checklists;
create trigger set_application_checklists_updated_at
before update on public.application_checklists
for each row execute function public.set_updated_at();

drop trigger if exists set_review_comments_updated_at on public.review_comments;
create trigger set_review_comments_updated_at
before update on public.review_comments
for each row execute function public.set_updated_at();

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists set_grant_sources_updated_at on public.grant_sources;
create trigger set_grant_sources_updated_at
before update on public.grant_sources
for each row execute function public.set_updated_at();

drop trigger if exists set_grant_ingestion_runs_updated_at on public.grant_ingestion_runs;
create trigger set_grant_ingestion_runs_updated_at
before update on public.grant_ingestion_runs
for each row execute function public.set_updated_at();

drop trigger if exists set_grant_match_scores_updated_at on public.grant_match_scores;
create trigger set_grant_match_scores_updated_at
before update on public.grant_match_scores
for each row execute function public.set_updated_at();

drop trigger if exists set_proposal_generation_runs_updated_at on public.proposal_generation_runs;
create trigger set_proposal_generation_runs_updated_at
before update on public.proposal_generation_runs
for each row execute function public.set_updated_at();

drop trigger if exists set_notification_preferences_updated_at on public.notification_preferences;
create trigger set_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute function public.set_updated_at();

drop trigger if exists set_workspace_preferences_updated_at on public.workspace_preferences;
create trigger set_workspace_preferences_updated_at
before update on public.workspace_preferences
for each row execute function public.set_updated_at();

drop trigger if exists set_user_feedback_updated_at on public.user_feedback;
create trigger set_user_feedback_updated_at
before update on public.user_feedback
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.grants enable row level security;
alter table public.saved_grants enable row level security;
alter table public.proposal_drafts enable row level security;
alter table public.tracked_applications enable row level security;
alter table public.application_checklists enable row level security;
alter table public.review_comments enable row level security;
alter table public.activity_log enable row level security;
alter table public.subscriptions enable row level security;
alter table public.grant_sources enable row level security;
alter table public.grant_ingestion_runs enable row level security;
alter table public.grant_match_scores enable row level security;
alter table public.proposal_generation_runs enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.workspace_preferences enable row level security;
alter table public.audit_events enable row level security;
alter table public.user_feedback enable row level security;

-- RLS security model:
-- - Profiles are personal records: users can only read/update their own profile.
-- - Workspace records are shared only through verified workspace_members rows.
-- - Owner/Admin roles can manage workspace settings and membership.
-- - Reviewer/Finance/Viewer roles are read-oriented here; Viewer is intentionally read-only.
-- - These policies are safe for the Expo anon client because they always resolve through auth.uid().
-- - Production review should revisit invite flows, ownership transfer, and server-only writes.

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_workspace_id is not null
    and exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = target_workspace_id
        and wm.user_id = (select auth.uid())
        and coalesce(wm.status, 'active') = 'active'
    );
$$;

create or replace function public.is_workspace_role(target_workspace_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_workspace_id is not null
    and exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = target_workspace_id
        and wm.user_id = (select auth.uid())
        and wm.role = any(allowed_roles)
        and coalesce(wm.status, 'active') = 'active'
    );
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_workspace_id is not null
    and (
      exists (
        select 1
        from public.workspaces w
        where w.id = target_workspace_id
          and w.owner_user_id = (select auth.uid())
      )
      or public.is_workspace_role(target_workspace_id, array['Owner'])
    );
$$;

create or replace function public.is_workspace_admin(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select target_workspace_id is not null
    and (
      exists (
        select 1
        from public.workspaces w
        where w.id = target_workspace_id
          and w.owner_user_id = (select auth.uid())
      )
      or public.is_workspace_role(target_workspace_id, array['Owner', 'Admin'])
    );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.is_workspace_role(uuid, text[]) from public;
revoke all on function public.is_workspace_owner(uuid) from public;
revoke all on function public.is_workspace_admin(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.is_workspace_role(uuid, text[]) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.is_workspace_admin(uuid) to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "workspaces_select_owner_or_member" on public.workspaces;
drop policy if exists "workspaces_select_owner" on public.workspaces;
create policy "workspaces_select_owner_or_member"
on public.workspaces
for select
to authenticated
using (
  (select auth.uid()) = owner_user_id
  or public.is_workspace_member(id)
);

drop policy if exists "workspaces_insert_owner" on public.workspaces;
create policy "workspaces_insert_owner"
on public.workspaces
for insert
to authenticated
with check ((select auth.uid()) = owner_user_id);

drop policy if exists "workspaces_update_owner_or_admin" on public.workspaces;
drop policy if exists "workspaces_update_owner" on public.workspaces;
create policy "workspaces_update_owner_or_admin"
on public.workspaces
for update
to authenticated
using (
  (select auth.uid()) = owner_user_id
  or public.is_workspace_admin(id)
)
with check (
  (select auth.uid()) = owner_user_id
  or public.is_workspace_admin(id)
);

drop policy if exists "workspace_members_select_same_workspace" on public.workspace_members;
create policy "workspace_members_select_same_workspace"
on public.workspace_members
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_workspace_member(workspace_id)
  or public.is_workspace_admin(workspace_id)
);

drop policy if exists "workspace_members_insert_owner_or_admin" on public.workspace_members;
drop policy if exists "workspace_members_insert_owner_or_self" on public.workspace_members;
create policy "workspace_members_insert_owner_or_admin"
on public.workspace_members
for insert
to authenticated
with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace_members_update_owner_or_admin" on public.workspace_members;
drop policy if exists "workspace_members_update_owner" on public.workspace_members;
create policy "workspace_members_update_owner_or_admin"
on public.workspace_members
for update
to authenticated
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

drop policy if exists "workspace_members_delete_owner_or_admin" on public.workspace_members;
drop policy if exists "workspace_members_delete_owner" on public.workspace_members;
create policy "workspace_members_delete_owner_or_admin"
on public.workspace_members
for delete
to authenticated
using (public.is_workspace_admin(workspace_id));

drop policy if exists "saved_grants_select_own" on public.saved_grants;
create policy "saved_grants_select_own"
on public.saved_grants
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "saved_grants_insert_own" on public.saved_grants;
create policy "saved_grants_insert_own"
on public.saved_grants
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "saved_grants_delete_own" on public.saved_grants;
create policy "saved_grants_delete_own"
on public.saved_grants
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "proposal_drafts_select_own" on public.proposal_drafts;
create policy "proposal_drafts_select_own"
on public.proposal_drafts
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or public.is_workspace_member(workspace_id)
);

drop policy if exists "proposal_drafts_insert_own" on public.proposal_drafts;
create policy "proposal_drafts_insert_own"
on public.proposal_drafts
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    workspace_id is null
    or public.is_workspace_role(workspace_id, array['Owner', 'Admin', 'Researcher'])
  )
);

drop policy if exists "proposal_drafts_update_own" on public.proposal_drafts;
create policy "proposal_drafts_update_own"
on public.proposal_drafts
for update
to authenticated
using (
  (select auth.uid()) = user_id
  or public.is_workspace_role(workspace_id, array['Owner', 'Admin', 'Researcher'])
)
with check (
  (select auth.uid()) = user_id
  or public.is_workspace_role(workspace_id, array['Owner', 'Admin', 'Researcher'])
);

drop policy if exists "proposal_drafts_delete_own" on public.proposal_drafts;
create policy "proposal_drafts_delete_own"
on public.proposal_drafts
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  or public.is_workspace_admin(workspace_id)
);

drop policy if exists "tracked_applications_select_own" on public.tracked_applications;
create policy "tracked_applications_select_own"
on public.tracked_applications
for select
to authenticated
using ((select auth.uid()) = user_id);
drop policy if exists "tracked_applications_select_workspace" on public.tracked_applications;
create policy "tracked_applications_select_workspace"
on public.tracked_applications
for select
to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists "tracked_applications_insert_own" on public.tracked_applications;
create policy "tracked_applications_insert_own"
on public.tracked_applications
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    workspace_id is null
    or public.is_workspace_role(workspace_id, array['Owner', 'Admin', 'Researcher'])
  )
);

drop policy if exists "tracked_applications_update_own" on public.tracked_applications;
create policy "tracked_applications_update_own"
on public.tracked_applications
for update
to authenticated
using (
  (select auth.uid()) = user_id
  or public.is_workspace_role(workspace_id, array['Owner', 'Admin', 'Researcher'])
)
with check (
  (select auth.uid()) = user_id
  or public.is_workspace_role(workspace_id, array['Owner', 'Admin', 'Researcher'])
);

drop policy if exists "tracked_applications_delete_own" on public.tracked_applications;
create policy "tracked_applications_delete_own"
on public.tracked_applications
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  or public.is_workspace_admin(workspace_id)
);

drop policy if exists "application_checklists_select_own" on public.application_checklists;
create policy "application_checklists_select_own"
on public.application_checklists
for select
to authenticated
using ((select auth.uid()) = user_id);
drop policy if exists "application_checklists_select_workspace" on public.application_checklists;
create policy "application_checklists_select_workspace"
on public.application_checklists
for select
to authenticated
using (
  exists (
    select 1
    from public.tracked_applications ta
    where ta.id = application_checklists.tracked_application_id
      and public.is_workspace_member(ta.workspace_id)
  )
);

drop policy if exists "application_checklists_insert_own" on public.application_checklists;
create policy "application_checklists_insert_own"
on public.application_checklists
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    tracked_application_id is null
    or exists (
      select 1
      from public.tracked_applications ta
      where ta.id = application_checklists.tracked_application_id
        and (
          ta.user_id = (select auth.uid())
          or public.is_workspace_role(ta.workspace_id, array['Owner', 'Admin', 'Researcher'])
        )
    )
  )
);

drop policy if exists "application_checklists_update_own" on public.application_checklists;
create policy "application_checklists_update_own"
on public.application_checklists
for update
to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1
    from public.tracked_applications ta
    where ta.id = application_checklists.tracked_application_id
      and public.is_workspace_role(ta.workspace_id, array['Owner', 'Admin', 'Researcher'])
  )
)
with check (
  (select auth.uid()) = user_id
  or exists (
    select 1
    from public.tracked_applications ta
    where ta.id = application_checklists.tracked_application_id
      and public.is_workspace_role(ta.workspace_id, array['Owner', 'Admin', 'Researcher'])
  )
);

drop policy if exists "application_checklists_delete_own" on public.application_checklists;
create policy "application_checklists_delete_own"
on public.application_checklists
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1
    from public.tracked_applications ta
    where ta.id = application_checklists.tracked_application_id
      and public.is_workspace_admin(ta.workspace_id)
  )
);

drop policy if exists "review_comments_select_own" on public.review_comments;
create policy "review_comments_select_own"
on public.review_comments
for select
to authenticated
using ((select auth.uid()) = user_id);
drop policy if exists "review_comments_select_workspace" on public.review_comments;
create policy "review_comments_select_workspace"
on public.review_comments
for select
to authenticated
using (
  public.is_workspace_member(workspace_id)
  or exists (
    select 1
    from public.tracked_applications ta
    where ta.id = review_comments.tracked_application_id
      and public.is_workspace_member(ta.workspace_id)
  )
);

drop policy if exists "review_comments_insert_own" on public.review_comments;
create policy "review_comments_insert_own"
on public.review_comments
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    workspace_id is null
    or public.is_workspace_member(workspace_id)
  )
);

drop policy if exists "review_comments_update_own" on public.review_comments;
create policy "review_comments_update_own"
on public.review_comments
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "review_comments_delete_own" on public.review_comments;
create policy "review_comments_delete_own"
on public.review_comments
for delete
to authenticated
using (
  (select auth.uid()) = user_id
  or public.is_workspace_admin(workspace_id)
  or exists (
    select 1
    from public.tracked_applications ta
    where ta.id = review_comments.tracked_application_id
      and public.is_workspace_admin(ta.workspace_id)
  )
);

drop policy if exists "activity_log_select_own" on public.activity_log;
create policy "activity_log_select_own"
on public.activity_log
for select
to authenticated
using ((select auth.uid()) = user_id);
drop policy if exists "activity_log_select_workspace" on public.activity_log;
create policy "activity_log_select_workspace"
on public.activity_log
for select
to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists "activity_log_insert_own" on public.activity_log;
create policy "activity_log_insert_own"
on public.activity_log
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    workspace_id is null
    or public.is_workspace_member(workspace_id)
  )
);

drop policy if exists "activity_log_update_own" on public.activity_log;
drop policy if exists "activity_log_delete_own" on public.activity_log;

drop policy if exists "grant_sources_select_workspace_owner" on public.grant_sources;
create policy "grant_sources_select_workspace_owner"
on public.grant_sources
for select
to authenticated
using (
  workspace_id is null
  or exists (
    select 1 from public.workspaces w
    where w.id = grant_sources.workspace_id
      and w.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "grant_ingestion_runs_owner" on public.grant_ingestion_runs;
create policy "grant_ingestion_runs_owner"
on public.grant_ingestion_runs
for all
to authenticated
using (
  workspace_id is null
  or exists (
    select 1 from public.workspaces w
    where w.id = grant_ingestion_runs.workspace_id
      and w.owner_user_id = (select auth.uid())
  )
)
with check (
  workspace_id is null
  or exists (
    select 1 from public.workspaces w
    where w.id = grant_ingestion_runs.workspace_id
      and w.owner_user_id = (select auth.uid())
  )
);

drop policy if exists "grant_match_scores_own" on public.grant_match_scores;
create policy "grant_match_scores_own"
on public.grant_match_scores
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "proposal_generation_runs_own" on public.proposal_generation_runs;
create policy "proposal_generation_runs_own"
on public.proposal_generation_runs
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "notification_preferences_own" on public.notification_preferences;
create policy "notification_preferences_own"
on public.notification_preferences
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "workspace_preferences_owner" on public.workspace_preferences;
drop policy if exists "workspace_preferences_admin" on public.workspace_preferences;
create policy "workspace_preferences_admin"
on public.workspace_preferences
for all
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_workspace_admin(workspace_id)
)
with check (
  user_id = (select auth.uid())
  or public.is_workspace_admin(workspace_id)
);

drop policy if exists "subscriptions_select_workspace_member" on public.subscriptions;
create policy "subscriptions_select_workspace_member"
on public.subscriptions
for select
to authenticated
using (public.is_workspace_member(workspace_id));

drop policy if exists "audit_events_own" on public.audit_events;
create policy "audit_events_own"
on public.audit_events
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "user_feedback_own" on public.user_feedback;
create policy "user_feedback_own"
on public.user_feedback
for all
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Remaining production security review:
-- grants: decide whether authenticated users can read all published grants or only workspace-imported grants.
-- subscriptions: reads are workspace-scoped; writes should remain server-side through payment webhooks.
-- workspace ownership transfer and invites should be implemented through audited server functions.
