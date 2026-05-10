import { Workspace, WorkspaceMember } from '@/types';

export const mockWorkspace: Workspace = {
  id: 'workspace-001',
  name: 'Global Health Innovation Lab',
  organisationType: 'Research institution',
  subscriptionTier: 'Institutional',
};

export const mockWorkspaceMembers: WorkspaceMember[] = [
  {
    id: 'member-001',
    name: 'Dr. Maya Chen',
    email: 'maya.chen@example.org',
    role: 'Owner',
    organisation: 'Global Health Innovation Lab',
    avatarInitials: 'MC',
    joinedDate: '2026-01-12',
  },
  {
    id: 'member-002',
    name: 'Samira Patel',
    email: 'samira.patel@example.org',
    role: 'Reviewer',
    organisation: 'Global Health Innovation Lab',
    avatarInitials: 'SP',
    joinedDate: '2026-02-04',
  },
  {
    id: 'member-003',
    name: 'Jon Bell',
    email: 'jon.bell@example.org',
    role: 'Finance',
    organisation: 'Global Health Innovation Lab',
    avatarInitials: 'JB',
    joinedDate: '2026-02-19',
  },
];
