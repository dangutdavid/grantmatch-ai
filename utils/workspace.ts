import { WorkspaceRole } from '@/types';

export function getRoleHint(role: WorkspaceRole) {
  switch (role) {
    case 'Owner':
    case 'Admin':
      return 'Owners and Admins manage workspace settings and team coordination.';
    case 'Researcher':
      return 'Researchers shape the project narrative and technical approach.';
    case 'Reviewer':
      return 'Reviewers can comment before submission and improve proposal quality.';
    case 'Finance':
      return 'Finance members can help review budget sections and cost justification.';
    case 'Viewer':
      return 'Viewers can monitor progress without changing workflow decisions.';
  }
}

export function createInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
