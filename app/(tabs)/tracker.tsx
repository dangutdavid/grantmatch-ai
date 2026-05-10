import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { PageHeader } from '@/components/PageHeader';
import { RoleBadge } from '@/components/RoleBadge';
import { ScreenContainer } from '@/components/ScreenContainer';
import { StatusBadge } from '@/components/StatusBadge';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { applicationStatuses, getDeadlineRisk } from '@/utils/applications';
import {
  ApplicationCollaborator,
  ApplicationStatus,
  ReviewComment,
  TrackedApplication,
  WorkspaceMember,
} from '@/types';

export default function TrackerScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const {
    trackedApplications,
    isLoaded,
    grants,
    savedGrantIds,
    workspaceMembers,
    applicationCollaborators,
    reviewComments,
    proposalDrafts,
    getGrantById,
    createTrackedApplication,
    updateApplicationStatus,
    updateApplicationNotes,
    toggleApplicationChecklistItem,
    linkDraftToApplication,
    assignCollaboratorToApplication,
    removeCollaboratorFromApplication,
    addReviewComment,
    getTrackerCounts,
  } = useGrantMatch();
  const counts = getTrackerCounts();
  const trackableSavedGrants = savedGrantIds
    .map((grantId) => grants.find((grant) => grant.id === grantId))
    .filter((grant): grant is NonNullable<typeof grant> => Boolean(grant))
    .filter(
      (grant) => !trackedApplications.some((application) => application.grantId === grant.id)
    );

  if (!isLoaded) {
    return (
      <ScreenContainer>
        <PageHeader eyebrow="Application pipeline" title="Loading Tracker" subtitle="Preparing local application state." />
        <AppCard>
          <Text style={styles.emptyText}>Loading tracked applications...</Text>
        </AppCard>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="Application pipeline"
        title="Application Tracker"
        subtitle="Track saved grant applications from shortlist through submission and outcome."
      />

      <DemoModeBanner />

      <View style={styles.countGrid}>
        {applicationStatuses.map((status) => (
          <AppCard key={status} style={[styles.countCard, isDesktop && styles.desktopCountCard]}>
            <Text style={styles.countValue}>{counts[status]}</Text>
            <Text style={styles.countLabel}>{status}</Text>
          </AppCard>
        ))}
      </View>

      {trackedApplications.length === 0 ? (
        <View style={styles.emptyStack}>
          <AppCard style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No tracked applications yet</Text>
            <Text style={styles.emptyText}>
              Start tracking from a saved grant to see statuses, checklists, deadline risk, notes, and linked drafts here.
            </Text>
            <AppButton title="Open Saved Grants" onPress={() => router.push('/saved')} />
          </AppCard>

          {trackableSavedGrants.length > 0 ? (
            <AppCard style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Ready to track</Text>
              <Text style={styles.emptyText}>
                You already have saved grants. Start one application now without leaving this page.
              </Text>
              {trackableSavedGrants.map((grant) => (
                <View key={grant.id} style={styles.trackSuggestion}>
                  <View style={styles.trackSuggestionText}>
                    <Text style={styles.suggestionTitle}>{grant.title}</Text>
                    <Text style={styles.suggestionMeta}>
                      {grant.funder} • Deadline {grant.deadline}
                    </Text>
                  </View>
                  <AppButton
                    title="Track"
                    variant="secondary"
                    onPress={() => createTrackedApplication(grant.id)}
                    style={styles.suggestionButton}
                  />
                </View>
              ))}
            </AppCard>
          ) : null}
        </View>
      ) : (
        <View style={styles.pipeline}>
          {applicationStatuses.map((status) => {
            const applications = trackedApplications.filter((application) => application.status === status);

            return (
              <View key={status} style={styles.statusGroup}>
                <Text style={styles.groupTitle}>
                  {status} ({applications.length})
                </Text>

                {applications.length === 0 ? (
                  <Text style={styles.groupEmpty}>No applications in this stage.</Text>
                ) : (
                  <View style={[styles.applicationGrid, isDesktop && styles.desktopApplicationGrid]}>
                    {applications.map((application) => (
                      <ApplicationCard
                        key={application.id}
                        application={application}
                        workspaceMembers={workspaceMembers}
                        collaborators={applicationCollaborators.filter(
                          (collaborator) => collaborator.applicationId === application.id
                        )}
                        comments={reviewComments.filter((comment) => comment.applicationId === application.id)}
                        availableDrafts={proposalDrafts.filter(
                          (draft) => draft.grantId === application.grantId
                        )}
                        onOpenGrant={() => router.push(`/grants/${application.grantId}`)}
                        onOpenDraft={() => {
                          const grant = getGrantById(application.grantId);
                          router.push(
                            grant
                              ? {
                                  pathname: '/proposal',
                                  params: { grantId: grant.id },
                                }
                              : '/proposal'
                          );
                        }}
                        onStatusChange={(nextStatus) => updateApplicationStatus(application.id, nextStatus)}
                        onNotesChange={(notes) => updateApplicationNotes(application.id, notes)}
                        onToggleChecklistItem={(itemId) =>
                          toggleApplicationChecklistItem(application.id, itemId)
                        }
                        onLinkDraft={(draftId) => linkDraftToApplication(application.id, draftId)}
                        onAssignCollaborator={(memberId) =>
                          assignCollaboratorToApplication(application.id, memberId)
                        }
                        onRemoveCollaborator={(memberId) =>
                          removeCollaboratorFromApplication(application.id, memberId)
                        }
                        onAddComment={(memberId, comment) =>
                          addReviewComment(application.id, memberId, comment)
                        }
                        style={isDesktop ? styles.desktopApplicationCard : undefined}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScreenContainer>
  );
}

interface ApplicationCardProps {
  application: TrackedApplication;
  workspaceMembers: WorkspaceMember[];
  collaborators: ApplicationCollaborator[];
  comments: ReviewComment[];
  availableDrafts: { id: string; proposalTitle: string }[];
  onOpenGrant: () => void;
  onOpenDraft: () => void;
  onStatusChange: (status: ApplicationStatus) => void;
  onNotesChange: (notes: string) => void;
  onToggleChecklistItem: (itemId: string) => void;
  onLinkDraft: (draftId: string) => void;
  onAssignCollaborator: (memberId: string) => void;
  onRemoveCollaborator: (memberId: string) => void;
  onAddComment: (memberId: string, comment: string) => void;
  style?: object;
}

function ApplicationCard({
  application,
  workspaceMembers,
  collaborators,
  comments,
  availableDrafts,
  onOpenGrant,
  onOpenDraft,
  onStatusChange,
  onNotesChange,
  onToggleChecklistItem,
  onLinkDraft,
  onAssignCollaborator,
  onRemoveCollaborator,
  onAddComment,
  style,
}: ApplicationCardProps) {
  const [commentText, setCommentText] = useState('');
  const linkedDraft = availableDrafts.find((draft) => draft.id === application.linkedProposalDraftId);
  const completedItems = application.checklistItems.filter((item) => item.completed).length;
  const checklistProgress =
    application.checklistItems.length === 0
      ? 0
      : Math.round((completedItems / application.checklistItems.length) * 100);
  const deadlineRisk = getDeadlineRisk(application.deadline, checklistProgress);
  const assignedMemberIds = new Set(collaborators.map((collaborator) => collaborator.memberId));
  const assignedMembers = workspaceMembers.filter((member) => assignedMemberIds.has(member.id));
  const unassignedMembers = workspaceMembers.filter((member) => !assignedMemberIds.has(member.id));
  const defaultCommenter = workspaceMembers[0];

  function addComment() {
    if (!defaultCommenter || !commentText.trim()) {
      return;
    }

    onAddComment(defaultCommenter.id, commentText);
    setCommentText('');
  }

  return (
    <AppCard style={[styles.applicationCard, style]}>
      <View style={styles.cardHeader}>
        <Text style={styles.applicationTitle}>{application.grantTitle}</Text>
        <StatusBadge status={application.status} />
      </View>
      <Text style={styles.meta}>{application.funder}</Text>
      <Text style={styles.meta}>Deadline: {application.deadline}</Text>
      <Text style={styles.meta}>
        Linked draft: {linkedDraft ? linkedDraft.proposalTitle : 'No linked draft yet'}
      </Text>
      <Text style={styles.nextAction}>{application.nextActionRecommendation}</Text>
      <View
        style={[
          styles.deadlineRisk,
          deadlineRisk.tone === 'success' && styles.successRisk,
          deadlineRisk.tone === 'danger' && styles.dangerRisk,
        ]}>
        <Text
          style={[
            styles.deadlineRiskLabel,
            deadlineRisk.tone === 'success' && styles.successRiskText,
            deadlineRisk.tone === 'danger' && styles.dangerRiskText,
          ]}>
          {deadlineRisk.label}
        </Text>
        <Text
          style={[
            styles.deadlineRiskText,
            deadlineRisk.tone === 'success' && styles.successRiskText,
            deadlineRisk.tone === 'danger' && styles.dangerRiskText,
          ]}>
          {deadlineRisk.message}
        </Text>
      </View>
      <View style={styles.progressBox}>
        <Text style={styles.progressLabel}>Submission checklist</Text>
        <Text style={styles.progressValue}>
          {checklistProgress}% complete ({completedItems}/{application.checklistItems.length})
        </Text>
      </View>

      <View style={styles.checklist}>
        {application.checklistItems.map((item) => (
          <AppButton
            key={item.id}
            title={`${item.completed ? 'Done' : 'Todo'}: ${item.label}`}
            variant={item.completed ? 'secondary' : 'ghost'}
            onPress={() => onToggleChecklistItem(item.id)}
          />
        ))}
      </View>

      <TextInput
        style={styles.notesInput}
        multiline
        onChangeText={onNotesChange}
        placeholder="Add application notes..."
        placeholderTextColor="#9CA3AF"
        value={application.notes}
      />

      <View style={styles.collaborationSection}>
        <Text style={styles.fieldLabel}>Collaborators</Text>
        {assignedMembers.length === 0 ? (
          <Text style={styles.groupEmpty}>No collaborators assigned yet.</Text>
        ) : (
          <View style={styles.memberList}>
            {assignedMembers.map((member) => (
              <View key={member.id} style={styles.collaboratorRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{member.avatarInitials}</Text>
                </View>
                <View style={styles.collaboratorInfo}>
                  <Text style={styles.collaboratorName}>{member.name}</Text>
                  <RoleBadge role={member.role} />
                </View>
                <AppButton
                  title="Remove"
                  variant="ghost"
                  onPress={() => onRemoveCollaborator(member.id)}
                  style={styles.smallButton}
                />
              </View>
            ))}
          </View>
        )}

        {unassignedMembers.length > 0 ? (
          <View style={styles.assignList}>
            <Text style={styles.fieldHint}>Assign member</Text>
            {unassignedMembers.map((member) => (
              <AppButton
                key={member.id}
                title={`Assign ${member.name}`}
                variant="secondary"
                onPress={() => onAssignCollaborator(member.id)}
              />
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.commentSection}>
        <Text style={styles.fieldLabel}>Review Comments</Text>
        {comments.length === 0 ? (
          <Text style={styles.groupEmpty}>No comments yet. Reviewers can leave notes before submission.</Text>
        ) : (
          <View style={styles.commentList}>
            {comments.map((comment) => {
              const member = workspaceMembers.find((item) => item.id === comment.memberId);

              return (
                <View key={comment.id} style={styles.commentItem}>
                  <Text style={styles.commentMeta}>
                    {member?.name ?? 'Team member'} • {member?.role ?? 'Reviewer'} •{' '}
                    {new Date(comment.createdAt).toLocaleString()}
                  </Text>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                </View>
              );
            })}
          </View>
        )}
        <TextInput
          style={styles.commentInput}
          multiline
          onChangeText={setCommentText}
          placeholder="Add a review comment..."
          placeholderTextColor="#9CA3AF"
          value={commentText}
        />
        <AppButton title="Add Comment" variant="secondary" onPress={addComment} />
      </View>

      {availableDrafts.length > 0 ? (
        <View style={styles.linkDraftList}>
          <Text style={styles.fieldLabel}>Link draft</Text>
          {availableDrafts.map((draft) => (
            <AppButton
              key={draft.id}
              title={draft.id === application.linkedProposalDraftId ? 'Linked Draft' : 'Link This Draft'}
              variant="secondary"
              onPress={() => onLinkDraft(draft.id)}
            />
          ))}
        </View>
      ) : null}

      <View style={styles.statusActions}>
        {applicationStatuses.map((status) => (
          <AppButton
            key={status}
            title={status}
            disabled={application.status === status}
            variant="secondary"
            onPress={() => onStatusChange(status)}
            style={styles.statusButton}
          />
        ))}
      </View>

      <View style={styles.cardActions}>
        <AppButton title="Open Grant" variant="secondary" onPress={onOpenGrant} style={styles.cardAction} />
        <AppButton title="Open Draft" onPress={onOpenDraft} style={styles.cardAction} />
      </View>
      <Text style={styles.updatedAt}>Last updated: {new Date(application.updatedAt).toLocaleString()}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  countGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  countCard: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  desktopCountCard: {
    flexBasis: '15%',
  },
  countValue: {
    color: brand.colors.ink,
    fontSize: 24,
    fontWeight: '900',
  },
  countLabel: {
    color: brand.colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  emptyCard: {
    gap: 14,
  },
  emptyStack: {
    gap: 14,
  },
  emptyTitle: {
    color: brand.colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: brand.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  trackSuggestion: {
    alignItems: 'center',
    borderTopColor: brand.colors.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
  },
  trackSuggestionText: {
    flex: 1,
  },
  suggestionTitle: {
    color: brand.colors.ink,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
  },
  suggestionMeta: {
    color: brand.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  suggestionButton: {
    minWidth: 112,
  },
  pipeline: {
    gap: 22,
  },
  statusGroup: {
    gap: 10,
  },
  groupTitle: {
    color: brand.colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  groupEmpty: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  applicationGrid: {
    gap: 14,
  },
  desktopApplicationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  desktopApplicationCard: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  applicationCard: {
    gap: 12,
  },
  cardHeader: {
    gap: 8,
  },
  applicationTitle: {
    color: brand.colors.ink,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  meta: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  nextAction: {
    backgroundColor: brand.colors.accentSoft,
    borderRadius: 14,
    color: brand.colors.accent,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: 12,
  },
  deadlineRisk: {
    backgroundColor: brand.colors.warningSoft,
    borderRadius: 14,
    gap: 3,
    padding: 12,
  },
  successRisk: {
    backgroundColor: brand.colors.successSoft,
  },
  dangerRisk: {
    backgroundColor: '#FEE2E2',
  },
  deadlineRiskLabel: {
    color: brand.colors.warning,
    fontSize: 13,
    fontWeight: '900',
  },
  deadlineRiskText: {
    color: brand.colors.warning,
    fontSize: 13,
    lineHeight: 19,
  },
  successRiskText: {
    color: brand.colors.success,
  },
  dangerRiskText: {
    color: '#B91C1C',
  },
  progressBox: {
    backgroundColor: brand.colors.background,
    borderRadius: 14,
    padding: 12,
  },
  progressLabel: {
    color: brand.colors.muted,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  progressValue: {
    color: brand.colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  checklist: {
    gap: 8,
  },
  notesInput: {
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    color: brand.colors.ink,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 86,
    padding: 12,
    textAlignVertical: 'top',
  },
  linkDraftList: {
    gap: 8,
  },
  fieldLabel: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  fieldHint: {
    color: brand.colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  collaborationSection: {
    gap: 10,
  },
  memberList: {
    gap: 10,
  },
  collaboratorRow: {
    alignItems: 'center',
    backgroundColor: brand.colors.background,
    borderRadius: 14,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: brand.colors.primary,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  collaboratorInfo: {
    flex: 1,
    gap: 4,
  },
  collaboratorName: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  smallButton: {
    minWidth: 92,
  },
  assignList: {
    gap: 8,
  },
  commentSection: {
    gap: 10,
  },
  commentList: {
    gap: 10,
  },
  commentItem: {
    backgroundColor: brand.colors.background,
    borderRadius: 14,
    padding: 12,
  },
  commentMeta: {
    color: brand.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  commentText: {
    color: brand.colors.ink,
    fontSize: 14,
    lineHeight: 20,
  },
  commentInput: {
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    color: brand.colors.ink,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 74,
    padding: 12,
    textAlignVertical: 'top',
  },
  statusActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cardAction: {
    flex: 1,
  },
  updatedAt: {
    color: brand.colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});
