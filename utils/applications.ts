import { ApplicationChecklistItem, ApplicationStatus, Grant, TrackedApplication } from '@/types';

export const applicationStatuses: ApplicationStatus[] = [
  'Not Started',
  'Drafting',
  'Ready for Review',
  'Submitted',
  'Awarded',
  'Rejected',
];

export function getApplicationNextAction(status: ApplicationStatus) {
  switch (status) {
    case 'Not Started':
      return 'Review eligibility and generate a proposal draft.';
    case 'Drafting':
      return 'Complete proposal sections and prepare required documents.';
    case 'Ready for Review':
      return 'Share the draft with collaborators before submission.';
    case 'Submitted':
      return 'Monitor funder updates and record the outcome.';
    case 'Awarded':
      return 'Plan kickoff, reporting milestones, and compliance tasks.';
    case 'Rejected':
      return 'Capture feedback and identify stronger-fit opportunities.';
  }
}

export function countApplicationsByStatus(applications: TrackedApplication[]) {
  return applicationStatuses.reduce<Record<ApplicationStatus, number>>(
    (counts, status) => ({
      ...counts,
      [status]: applications.filter((application) => application.status === status).length,
    }),
    {
      'Not Started': 0,
      Drafting: 0,
      'Ready for Review': 0,
      Submitted: 0,
      Awarded: 0,
      Rejected: 0,
    }
  );
}

export function createApplicationChecklist(grant: Grant): ApplicationChecklistItem[] {
  const requiredDocumentItems = grant.requiredDocuments.map((documentName, index) => ({
    id: `required-document-${index}`,
    label: `Prepare ${documentName}`,
    completed: false,
  }));

  return [
    {
      id: 'review-eligibility',
      label: 'Review eligibility rules',
      completed: false,
    },
    {
      id: 'confirm-deadline',
      label: `Confirm deadline: ${grant.deadline}`,
      completed: false,
    },
    ...requiredDocumentItems,
    {
      id: 'final-review',
      label: 'Complete final proposal review',
      completed: false,
    },
  ];
}

export function calculateChecklistProgress(checklistItems: ApplicationChecklistItem[]) {
  if (checklistItems.length === 0) {
    return 0;
  }

  const completedItems = checklistItems.filter((item) => item.completed).length;

  return Math.round((completedItems / checklistItems.length) * 100);
}

export function getDaysUntilDeadline(deadline: string) {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.ceil((deadlineDate.getTime() - today.getTime()) / millisecondsPerDay);
}

export function getDeadlineRisk(deadline: string, checklistProgress: number) {
  const daysUntilDeadline = getDaysUntilDeadline(deadline);

  if (daysUntilDeadline < 0) {
    return {
      label: 'Deadline passed',
      tone: 'danger' as const,
      message: 'Move this application to an outcome stage or archive it later.',
    };
  }

  if (daysUntilDeadline <= 14 && checklistProgress < 75) {
    return {
      label: 'High deadline risk',
      tone: 'danger' as const,
      message: 'Prioritise checklist items and proposal review this week.',
    };
  }

  if (daysUntilDeadline <= 45 || checklistProgress < 50) {
    return {
      label: 'Needs attention',
      tone: 'warning' as const,
      message: 'Keep moving checklist items forward to avoid a late rush.',
    };
  }

  return {
    label: 'On track',
    tone: 'success' as const,
    message: 'Timeline and checklist readiness look manageable.',
  };
}
