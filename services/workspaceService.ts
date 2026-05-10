import { mockWorkspace, mockWorkspaceMembers } from '@/data/mockWorkspace';
import { supabase } from '@/services/supabaseClient';
import { OnboardingAnswers, SessionUser, Workspace, WorkspaceMember, WorkspaceRole } from '@/types';
import { createInitials } from '@/utils/workspace';

interface WorkspaceRow {
  id: string;
  name: string;
  organisation_type: string;
  subscription_tier: string;
  default_currency: string | null;
  preferred_funding_regions: string | null;
  review_workflow_enabled: boolean | null;
  finance_review_required: boolean | null;
  internal_review_required: boolean | null;
}

interface WorkspaceMemberRow {
  id: string;
  workspace_id: string;
  user_id: string | null;
  member_external_id: string | null;
  email: string;
  name: string;
  role: string;
  organisation: string | null;
  avatar_initials: string | null;
  joined_date: string;
}

export async function fetchCurrentWorkspace(): Promise<Workspace> {
  return mockWorkspace;
}

export async function fetchWorkspace(userId?: string): Promise<Workspace | undefined> {
  if (!supabase || !userId) {
    return undefined;
  }

  return getOwnedWorkspace(userId);
}

export async function fetchWorkspaceMembers(
  workspaceId?: string,
  userId?: string
): Promise<WorkspaceMember[] | undefined> {
  if (!supabase || !workspaceId || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('joined_date', { ascending: true })
    .returns<WorkspaceMemberRow[]>();

  if (error || !data) {
    return undefined;
  }

  return data.map(mapWorkspaceMemberRow);
}

async function addLocalWorkspaceMember(
  member: WorkspaceMember,
  existingMembers: WorkspaceMember[]
): Promise<WorkspaceMember[]> {
  return [...existingMembers, member];
}

export async function getOrCreateWorkspace(sessionUser: SessionUser): Promise<Workspace> {
  if (!supabase) {
    return {
      ...mockWorkspace,
      name: sessionUser.organisation || mockWorkspace.name,
      organisationType: sessionUser.userType,
    };
  }

  const existing = await getOwnedWorkspace(sessionUser.id);

  if (existing) {
    await ensureOwnerMember(existing, sessionUser);
    return existing;
  }

  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      owner_user_id: sessionUser.id,
      name: sessionUser.organisation || `${sessionUser.fullName}'s Workspace`,
      organisation_type: sessionUser.userType,
      subscription_tier: 'Free',
      default_currency: 'USD',
      preferred_funding_regions: 'Global',
      review_workflow_enabled: true,
      finance_review_required: true,
      internal_review_required: true,
    })
    .select('*')
    .single<WorkspaceRow>();

  if (error || !data) {
    return {
      ...mockWorkspace,
      name: sessionUser.organisation || mockWorkspace.name,
      organisationType: sessionUser.userType,
    };
  }

  const workspace = mapWorkspaceRow(data);
  await ensureOwnerMember(workspace, sessionUser);
  return workspace;
}

export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  if (!supabase) {
    return mockWorkspaceMembers;
  }

  const members = await fetchWorkspaceMembers(workspaceId, 'authenticated-user');
  return members ?? [];
}

export async function updateWorkspaceFromOnboarding(
  workspace: Workspace,
  answers: OnboardingAnswers
): Promise<Workspace> {
  const nextWorkspace: Workspace = {
    ...workspace,
    name: answers.organisationName.trim() || workspace.name,
    organisationType: answers.userType,
  };

  if (!supabase) {
    return nextWorkspace;
  }

  const { data, error } = await supabase
    .from('workspaces')
    .update({
      name: nextWorkspace.name,
      organisation_type: nextWorkspace.organisationType,
      preferred_funding_regions: answers.countryRegion.trim() || 'Global',
    })
    .eq('id', workspace.id)
    .select('*')
    .single<WorkspaceRow>();

  if (error || !data) {
    return nextWorkspace;
  }

  return mapWorkspaceRow(data);
}

export async function addWorkspaceMemberMockOrLocalFallback(
  member: WorkspaceMember,
  existingMembers: WorkspaceMember[],
  workspaceId?: string
): Promise<WorkspaceMember[]> {
  if (!supabase || !workspaceId) {
    return addLocalWorkspaceMember(member, existingMembers);
  }

  const { data, error } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspaceId,
      member_external_id: member.id,
      email: member.email,
      name: member.name,
      role: member.role,
      organisation: member.organisation,
      avatar_initials: member.avatarInitials,
      joined_date: member.joinedDate,
    })
    .select('*')
    .single<WorkspaceMemberRow>();

  if (error || !data) {
    return addLocalWorkspaceMember(member, existingMembers);
  }

  return [...existingMembers, mapWorkspaceMemberRow(data)];
}

export async function addWorkspaceMember(
  workspaceId: string | undefined,
  userId: string | undefined,
  member: WorkspaceMember
): Promise<WorkspaceMember | undefined> {
  if (!supabase || !workspaceId || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('workspace_members')
    .insert({
      workspace_id: workspaceId,
      member_external_id: member.id,
      email: member.email,
      name: member.name,
      role: member.role,
      organisation: member.organisation,
      avatar_initials: member.avatarInitials,
      joined_date: member.joinedDate,
    })
    .select('*')
    .single<WorkspaceMemberRow>();

  if (error || !data) {
    return undefined;
  }

  return mapWorkspaceMemberRow(data);
}

export async function updateWorkspaceMember(
  workspaceId: string | undefined,
  userId: string | undefined,
  memberId: string,
  updates: Partial<WorkspaceMember>
): Promise<WorkspaceMember | undefined> {
  if (!supabase || !workspaceId || !userId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('workspace_members')
    .update({
      email: updates.email,
      name: updates.name,
      role: updates.role,
      organisation: updates.organisation,
      avatar_initials: updates.avatarInitials,
      joined_date: updates.joinedDate,
    })
    .eq('workspace_id', workspaceId)
    .eq('member_external_id', memberId)
    .select('*')
    .single<WorkspaceMemberRow>();

  if (error || !data) {
    return undefined;
  }

  return mapWorkspaceMemberRow(data);
}

export async function removeWorkspaceMember(
  workspaceId: string | undefined,
  userId: string | undefined,
  memberId: string
): Promise<boolean> {
  if (!supabase || !workspaceId || !userId) {
    return false;
  }

  const { error } = await supabase
    .from('workspace_members')
    .delete()
    .eq('workspace_id', workspaceId)
    .eq('member_external_id', memberId);

  return !error;
}

async function getOwnedWorkspace(userId: string): Promise<Workspace | undefined> {
  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_user_id', userId)
    .maybeSingle<WorkspaceRow>();

  if (error || !data) {
    return undefined;
  }

  return mapWorkspaceRow(data);
}

async function ensureOwnerMember(workspace: Workspace, sessionUser: SessionUser) {
  if (!supabase) {
    return;
  }

  const { data: existingMember } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('workspace_id', workspace.id)
    .eq('user_id', sessionUser.id)
    .maybeSingle<{ id: string }>();

  if (existingMember) {
    return;
  }

  await supabase.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: sessionUser.id,
    member_external_id: `member-owner-${sessionUser.id}`,
    email: sessionUser.email,
    name: sessionUser.fullName,
    role: 'Owner',
    organisation: workspace.name,
    avatar_initials: createInitials(sessionUser.fullName),
    joined_date: new Date().toISOString().slice(0, 10),
  });
}

function mapWorkspaceRow(row: WorkspaceRow): Workspace {
  return {
    id: row.id,
    name: row.name,
    organisationType: row.organisation_type,
    subscriptionTier:
      row.subscription_tier === 'Pro' || row.subscription_tier === 'Institutional'
        ? row.subscription_tier
        : 'Free',
  };
}

function mapWorkspaceMemberRow(row: WorkspaceMemberRow): WorkspaceMember {
  return {
    id: row.member_external_id ?? row.id,
    name: row.name,
    email: row.email,
    role: isWorkspaceRole(row.role) ? row.role : 'Viewer',
    organisation: row.organisation ?? '',
    avatarInitials: row.avatar_initials ?? createInitials(row.name),
    joinedDate: row.joined_date,
  };
}

function isWorkspaceRole(value: string): value is WorkspaceRole {
  return ['Owner', 'Admin', 'Researcher', 'Reviewer', 'Finance', 'Viewer'].includes(value);
}
