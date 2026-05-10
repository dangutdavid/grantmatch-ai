import {
  ActivityLogItem,
  ProposalDraft,
  ReviewComment,
  TrackedApplication,
  Workspace,
  WorkspaceMember,
} from '@/types';

export function buildLocalDataExportSummary(input: {
  savedGrantIds: string[];
  proposalDrafts: ProposalDraft[];
  trackedApplications: TrackedApplication[];
  workspaceMembers: WorkspaceMember[];
  reviewComments: ReviewComment[];
  activityLog: ActivityLogItem[];
}) {
  return {
    generatedAt: new Date().toISOString(),
    savedGrants: input.savedGrantIds.length,
    proposalDrafts: input.proposalDrafts.length,
    trackedApplications: input.trackedApplications.length,
    workspaceMembers: input.workspaceMembers.length,
    reviewComments: input.reviewComments.length,
    activityLogItems: input.activityLog.length,
    mode: 'mock-export',
  };
}

export function exportWorkspaceSummaryMock(workspace: Workspace, members: WorkspaceMember[]) {
  return {
    generatedAt: new Date().toISOString(),
    workspace,
    memberCount: members.length,
    membersByRole: members.reduce<Record<string, number>>((counts, member) => {
      counts[member.role] = (counts[member.role] ?? 0) + 1;
      return counts;
    }, {}),
  };
}

export function exportApplicationsSummaryMock(applications: TrackedApplication[]) {
  return {
    generatedAt: new Date().toISOString(),
    total: applications.length,
    byStatus: applications.reduce<Record<string, number>>((counts, application) => {
      counts[application.status] = (counts[application.status] ?? 0) + 1;
      return counts;
    }, {}),
  };
}

export function exportProposalDraftsSummaryMock(drafts: ProposalDraft[]) {
  return {
    generatedAt: new Date().toISOString(),
    total: drafts.length,
    readyForReview: drafts.filter((draft) => draft.status === 'Ready for Review').length,
  };
}

export function importLocalDataMock() {
  return {
    success: true,
    message: 'Import is a mock placeholder. No local data was changed.',
  };
}
