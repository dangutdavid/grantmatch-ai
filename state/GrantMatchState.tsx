import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { mockGrants, mockRecommendations } from '@/data/mockGrants';
import { mockUser } from '@/data/mockUser';
import { mockWorkspace, mockWorkspaceMembers } from '@/data/mockWorkspace';
import {
  fetchSavedGrantIds,
  saveGrantForUser,
  unsaveGrantForUser,
} from '@/services/grantService';
import {
  getCurrentSession,
  loginDemo,
  loginWithEmail as authenticateWithEmail,
  logout as logoutAuth,
  registerMockUser,
  registerUser,
} from '@/services/authService';
import { getProfile, mapSessionToProfileInput, upsertProfile } from '@/services/userService';
import { fetchProposalDrafts, upsertProposalDraft } from '@/services/proposalService';
import {
  addActivityLogItem as syncActivityLogItem,
  addReviewComment as syncReviewComment,
  createChecklistItems,
  fetchActivityLog,
  fetchReviewComments,
  fetchTrackedApplications as fetchTrackedApplicationsFromSupabase,
  upsertChecklistItem,
  upsertTrackedApplication,
} from '@/services/applicationService';
import {
  addWorkspaceMember as syncWorkspaceMember,
  getOrCreateWorkspace,
  getWorkspaceMembers,
  updateWorkspaceFromOnboarding,
} from '@/services/workspaceService';
import {
  countApplicationsByStatus,
  createApplicationChecklist,
  getApplicationNextAction,
} from '@/utils/applications';
import { calculateProfileCompleteness } from '@/utils/profile';
import { createGeneralProposalDraft, createGrantProposalDraft } from '@/utils/proposalDrafts';
import {
  ActivityLogItem,
  ApplicationCollaborator,
  ApplicationStatus,
  AuthMode,
  LoginCredentials,
  OnboardingAnswers,
  Grant,
  NotificationPreferences,
  ProposalDraft,
  RegisterInput,
  Recommendation,
  ReviewComment,
  SessionUser,
  TrackedApplication,
  UserProfile,
  Workspace,
  WorkspaceMember,
  WorkspacePreferences,
  WorkspaceRole,
} from '@/types';
import { createInitials } from '@/utils/workspace';

const STORAGE_KEY = 'grantmatch-ai-state-v1';

interface PersistedGrantMatchState {
  currentUser: UserProfile;
  savedGrantIds: string[];
  selectedGrantId?: string;
  proposalDrafts: ProposalDraft[];
  trackedApplications: TrackedApplication[];
  currentWorkspace: Workspace;
  workspaceMembers: WorkspaceMember[];
  applicationCollaborators: ApplicationCollaborator[];
  reviewComments: ReviewComment[];
  activityLog: ActivityLogItem[];
  notificationPreferences: NotificationPreferences;
  workspacePreferences: WorkspacePreferences;
  hasCompletedOnboarding: boolean;
  onboardingAnswers?: OnboardingAnswers;
  authMode: AuthMode;
  sessionUser?: SessionUser;
  isAuthenticated: boolean;
}

interface GrantMatchContextValue extends PersistedGrantMatchState {
  isLoaded: boolean;
  grants: Grant[];
  recommendations: Recommendation[];
  getGrantById: (grantId: string) => Grant | undefined;
  getRecommendationByGrantId: (grantId: string) => Recommendation | undefined;
  selectGrant: (grantId: string) => void;
  toggleSavedGrant: (grantId: string) => Promise<void>;
  updateProfile: (profile: UserProfile) => void;
  createDraftFromGrant: (grantId: string) => ProposalDraft | undefined;
  createGeneralDraft: () => ProposalDraft;
  saveDraft: (draft: ProposalDraft) => void;
  createTrackedApplication: (grantId: string, linkedProposalDraftId?: string) => TrackedApplication | undefined;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => void;
  updateApplicationNotes: (applicationId: string, notes: string) => void;
  toggleApplicationChecklistItem: (applicationId: string, itemId: string) => void;
  linkDraftToApplication: (applicationId: string, proposalDraftId: string) => void;
  getApplicationByGrantId: (grantId: string) => TrackedApplication | undefined;
  getTrackerCounts: () => Record<ApplicationStatus, number>;
  addMockWorkspaceMember: () => void;
  assignCollaboratorToApplication: (applicationId: string, memberId: string) => void;
  removeCollaboratorFromApplication: (applicationId: string, memberId: string) => void;
  addReviewComment: (applicationId: string, memberId: string, comment: string) => void;
  toggleNotificationPreference: (key: keyof NotificationPreferences) => void;
  updateWorkspacePreference: <K extends keyof WorkspacePreferences>(
    field: K,
    value: WorkspacePreferences[K]
  ) => void;
  recordDataExport: () => void;
  completeOnboarding: (answers: OnboardingAnswers) => Promise<void>;
  resetOnboarding: () => void;
  loginMock: (credentials?: LoginCredentials) => Promise<void>;
  registerMock: (input: RegisterInput) => Promise<void>;
  loginWithEmail: (credentials: LoginCredentials) => Promise<void>;
  registerWithEmail: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  logoutMock: () => Promise<void>;
  resetDemoData: () => void;
}

const initialState: PersistedGrantMatchState = {
  currentUser: {
    ...mockUser,
    profileCompleteness: calculateProfileCompleteness(mockUser),
  },
  savedGrantIds: mockUser.savedGrantIds,
  selectedGrantId: undefined,
  proposalDrafts: [],
  trackedApplications: [],
  currentWorkspace: mockWorkspace,
  workspaceMembers: mockWorkspaceMembers,
  applicationCollaborators: [],
  reviewComments: [],
  activityLog: [],
  notificationPreferences: {
    deadlineReminders: true,
    proposalReviewReminders: true,
    savedGrantUpdates: true,
    weeklyDigest: false,
    teamActivityUpdates: true,
  },
  workspacePreferences: {
    workspaceName: mockWorkspace.name,
    organisationType: mockWorkspace.organisationType,
    defaultCurrency: 'USD',
    preferredFundingRegions: 'Global',
    reviewWorkflowEnabled: true,
    financeReviewRequired: true,
    internalReviewRequired: true,
  },
  hasCompletedOnboarding: false,
  onboardingAnswers: undefined,
  authMode: 'mock',
  sessionUser: undefined,
  isAuthenticated: false,
};

const GrantMatchContext = createContext<GrantMatchContextValue | undefined>(undefined);

function createActivityLogItem(
  action: ActivityLogItem['action'],
  message: string,
  applicationId?: string,
  actorMemberId?: string
): ActivityLogItem {
  return {
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    message,
    applicationId,
    actorMemberId,
    createdAt: new Date().toISOString(),
  };
}

export function GrantMatchProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedGrantMatchState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadState() {
      try {
        const storedState = await AsyncStorage.getItem(STORAGE_KEY);

        if (storedState) {
          const parsedState = JSON.parse(storedState) as PersistedGrantMatchState;
          const supabaseSessionUser = await getCurrentSession();
          const supabaseProfile = supabaseSessionUser
            ? (await getProfile(supabaseSessionUser.id)) ??
              (await upsertProfile(mapSessionToProfileInput(supabaseSessionUser)))
            : undefined;
          const supabaseWorkspace = supabaseSessionUser
            ? await getOrCreateWorkspace(supabaseSessionUser)
            : undefined;
          const supabaseWorkspaceMembers = supabaseWorkspace
            ? await getWorkspaceMembers(supabaseWorkspace.id)
            : undefined;
          const supabaseSavedGrantIds = supabaseSessionUser
            ? await fetchSavedGrantIds(supabaseSessionUser.id, supabaseWorkspace?.id)
            : undefined;
          const supabaseProposalDrafts = supabaseSessionUser
            ? await fetchProposalDrafts(supabaseSessionUser.id)
            : undefined;
          const supabaseTrackedApplications = supabaseSessionUser
            ? await fetchTrackedApplicationsFromSupabase(supabaseSessionUser.id)
            : undefined;
          const supabaseReviewComments = supabaseSessionUser
            ? await fetchReviewComments(supabaseSessionUser.id)
            : undefined;
          const supabaseActivityLog = supabaseSessionUser
            ? await fetchActivityLog(supabaseSessionUser.id)
            : undefined;
          setState({
            ...initialState,
            ...parsedState,
            proposalDrafts: supabaseProposalDrafts ?? parsedState.proposalDrafts ?? [],
            trackedApplications:
              supabaseTrackedApplications ??
              (parsedState.trackedApplications ?? []).map((application) => {
                const grant = mockGrants.find((item) => item.id === application.grantId);

                return {
                  ...application,
                  checklistItems:
                    application.checklistItems ?? (grant ? createApplicationChecklist(grant) : []),
                };
              }),
            currentUser: supabaseProfile ?? {
              ...initialState.currentUser,
              ...parsedState.currentUser,
              profileCompleteness: calculateProfileCompleteness(parsedState.currentUser),
            },
            savedGrantIds: supabaseSavedGrantIds ?? parsedState.savedGrantIds ?? initialState.savedGrantIds,
            currentWorkspace:
              supabaseWorkspace ?? parsedState.currentWorkspace ?? initialState.currentWorkspace,
            workspaceMembers:
              supabaseWorkspaceMembers ?? parsedState.workspaceMembers ?? initialState.workspaceMembers,
            applicationCollaborators: parsedState.applicationCollaborators ?? [],
            reviewComments: supabaseReviewComments ?? parsedState.reviewComments ?? [],
            activityLog: supabaseActivityLog ?? parsedState.activityLog ?? [],
            notificationPreferences:
              {
                ...initialState.notificationPreferences,
                ...(parsedState.notificationPreferences ?? {}),
              },
            workspacePreferences: {
              ...initialState.workspacePreferences,
              ...(parsedState.workspacePreferences ?? {}),
            },
            hasCompletedOnboarding: parsedState.hasCompletedOnboarding ?? false,
            onboardingAnswers: parsedState.onboardingAnswers,
            authMode: supabaseSessionUser?.authMode ?? parsedState.authMode ?? 'mock',
            sessionUser: supabaseSessionUser ?? parsedState.sessionUser,
            isAuthenticated:
              Boolean(supabaseSessionUser) ||
              parsedState.isAuthenticated ||
              Boolean(parsedState.sessionUser),
          });
        } else {
          const supabaseSessionUser = await getCurrentSession();

          if (supabaseSessionUser) {
            const supabaseProfile =
              (await getProfile(supabaseSessionUser.id)) ??
              (await upsertProfile(mapSessionToProfileInput(supabaseSessionUser)));
            const supabaseWorkspace = await getOrCreateWorkspace(supabaseSessionUser);
            const supabaseWorkspaceMembers = await getWorkspaceMembers(supabaseWorkspace.id);
            const supabaseSavedGrantIds = await fetchSavedGrantIds(
              supabaseSessionUser.id,
              supabaseWorkspace.id
            );
            const supabaseProposalDrafts = await fetchProposalDrafts(supabaseSessionUser.id);
            const supabaseTrackedApplications = await fetchTrackedApplicationsFromSupabase(
              supabaseSessionUser.id
            );
            const supabaseReviewComments = await fetchReviewComments(supabaseSessionUser.id);
            const supabaseActivityLog = await fetchActivityLog(supabaseSessionUser.id);

            setState((currentState) => ({
              ...currentState,
              authMode: supabaseSessionUser.authMode,
              sessionUser: supabaseSessionUser,
              isAuthenticated: true,
              currentUser: supabaseProfile,
              savedGrantIds: supabaseSavedGrantIds ?? currentState.savedGrantIds,
              proposalDrafts: supabaseProposalDrafts ?? currentState.proposalDrafts,
              trackedApplications:
                supabaseTrackedApplications ?? currentState.trackedApplications,
              reviewComments: supabaseReviewComments ?? currentState.reviewComments,
              activityLog: supabaseActivityLog ?? currentState.activityLog,
              currentWorkspace: supabaseWorkspace,
              workspaceMembers: supabaseWorkspaceMembers,
            }));
          }
        }
      } catch (error) {
        console.warn('Unable to load GrantMatch AI local state.', error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadState();
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((error) => {
      console.warn('Unable to save GrantMatch AI local state.', error);
    });
  }, [isLoaded, state]);

  const syncTrackedApplication = (application: TrackedApplication) => {
    if (state.sessionUser?.authMode !== 'supabase') {
      return;
    }

    upsertTrackedApplication(state.sessionUser.id, application, state.currentWorkspace.id).catch((error) => {
      console.warn('Unable to sync tracked application.', error);
    });
  };

  const syncChecklistItems = (application: TrackedApplication) => {
    if (state.sessionUser?.authMode !== 'supabase') {
      return;
    }

    createChecklistItems(state.sessionUser.id, application.id, application.checklistItems).catch((error) => {
      console.warn('Unable to sync application checklist.', error);
    });
  };

  const syncActivityItem = (item: ActivityLogItem) => {
    if (state.sessionUser?.authMode !== 'supabase') {
      return;
    }

    const actor = item.actorMemberId
      ? state.workspaceMembers.find((member) => member.id === item.actorMemberId)
      : undefined;

    syncActivityLogItem(
      state.sessionUser.id,
      item,
      state.currentWorkspace.id,
      actor?.name ?? state.sessionUser.fullName
    ).catch((error) => {
      console.warn('Unable to sync activity log item.', error);
    });
  };

  const createSyncedActivityLogItem = (
    action: ActivityLogItem['action'],
    message: string,
    applicationId?: string,
    actorMemberId?: string
  ) => {
    const item = createActivityLogItem(action, message, applicationId, actorMemberId);
    syncActivityItem(item);
    return item;
  };

  const value = useMemo<GrantMatchContextValue>(
    () => ({
      ...state,
      isLoaded,
      grants: mockGrants,
      recommendations: mockRecommendations,
      getGrantById: (grantId) => mockGrants.find((grant) => grant.id === grantId),
      getRecommendationByGrantId: (grantId) =>
        mockRecommendations.find((recommendation) => recommendation.grantId === grantId),
      selectGrant: (grantId) => {
        setState((currentState) => ({
          ...currentState,
          selectedGrantId: grantId,
        }));
      },
      toggleSavedGrant: async (grantId) => {
        const isCurrentlySaved = state.savedGrantIds.includes(grantId);
        const didSync =
          state.sessionUser?.authMode === 'supabase'
            ? isCurrentlySaved
              ? await unsaveGrantForUser(grantId, state.sessionUser.id)
              : await saveGrantForUser(grantId, state.sessionUser.id, state.currentWorkspace.id)
            : false;

        setState((currentState) => {
          const savedGrantIds = currentState.savedGrantIds.includes(grantId)
            ? currentState.savedGrantIds.filter((savedGrantId) => savedGrantId !== grantId)
            : [...currentState.savedGrantIds, grantId];

          return {
            ...currentState,
            savedGrantIds,
            activityLog:
              didSync && currentState.sessionUser?.authMode === 'supabase'
                ? [
                    createSyncedActivityLogItem(
                      'settings_updated',
                      `${isCurrentlySaved ? 'Removed' : 'Saved'} grant synced to Supabase`
                    ),
                    ...currentState.activityLog,
                  ]
                : currentState.activityLog,
          };
        });
      },
      updateProfile: (profile) => {
        setState((currentState) => ({
          ...currentState,
          currentUser: {
            ...profile,
            profileCompleteness: calculateProfileCompleteness(profile),
          },
        }));
      },
      createDraftFromGrant: (grantId) => {
        const grant = mockGrants.find((item) => item.id === grantId);

        if (!grant) {
          return undefined;
        }

        const draft = createGrantProposalDraft(grant, state.currentUser);
        if (state.sessionUser?.authMode === 'supabase') {
          upsertProposalDraft(state.sessionUser.id, draft, state.currentWorkspace.id).catch((error) => {
            console.warn('Unable to sync grant proposal draft.', error);
          });
        }

        setState((currentState) => ({
          ...currentState,
          selectedGrantId: grantId,
          proposalDrafts: [
            draft,
            ...currentState.proposalDrafts.filter((proposalDraft) => proposalDraft.id !== draft.id),
          ],
        }));

        return draft;
      },
      createGeneralDraft: () => {
        const draft: ProposalDraft = {
          ...createGeneralProposalDraft(state.currentUser),
          id: `proposal-general-${Date.now()}`,
          updatedAt: new Date().toISOString(),
        };
        if (state.sessionUser?.authMode === 'supabase') {
          upsertProposalDraft(state.sessionUser.id, draft, state.currentWorkspace.id).catch((error) => {
            console.warn('Unable to sync general proposal draft.', error);
          });
        }

        setState((currentState) => ({
          ...currentState,
          proposalDrafts: [
            draft,
            ...currentState.proposalDrafts.filter((proposalDraft) => proposalDraft.id !== draft.id),
          ],
        }));

        return draft;
      },
      saveDraft: (draft) => {
        const savedDraft: ProposalDraft = {
          ...draft,
          updatedAt: new Date().toISOString(),
        };
        if (state.sessionUser?.authMode === 'supabase') {
          upsertProposalDraft(state.sessionUser.id, savedDraft, state.currentWorkspace.id).catch((error) => {
            console.warn('Unable to sync saved proposal draft.', error);
          });
        }

        setState((currentState) => ({
          ...currentState,
          proposalDrafts: [
            savedDraft,
            ...currentState.proposalDrafts.filter((proposalDraft) => proposalDraft.id !== savedDraft.id),
          ],
          activityLog: [
            createSyncedActivityLogItem(
              'proposal_saved',
              `Proposal draft saved: ${savedDraft.proposalTitle}`,
              savedDraft.grantId === 'general' ? undefined : savedDraft.grantId
            ),
            ...currentState.activityLog,
          ],
        }));
      },
      createTrackedApplication: (grantId, linkedProposalDraftId) => {
        const grant = mockGrants.find((item) => item.id === grantId);

        if (!grant) {
          return undefined;
        }

        const existingApplication = state.trackedApplications.find(
          (application) => application.grantId === grantId
        );

        if (existingApplication) {
          const updatedApplication: TrackedApplication = {
            ...existingApplication,
            linkedProposalDraftId: linkedProposalDraftId ?? existingApplication.linkedProposalDraftId,
            status:
              linkedProposalDraftId && existingApplication.status === 'Not Started'
                ? 'Drafting'
                : existingApplication.status,
            updatedAt: new Date().toISOString(),
            nextActionRecommendation: getApplicationNextAction(
              linkedProposalDraftId && existingApplication.status === 'Not Started'
                ? 'Drafting'
                : existingApplication.status
            ),
          };
          syncTrackedApplication(updatedApplication);
          if (
            state.sessionUser?.authMode === 'supabase' &&
            !state.savedGrantIds.includes(grantId)
          ) {
            saveGrantForUser(grantId, state.sessionUser.id, state.currentWorkspace.id).catch((error) => {
              console.warn('Unable to sync saved grant while tracking application.', error);
            });
          }

          setState((currentState) => ({
            ...currentState,
            trackedApplications: currentState.trackedApplications.map((application) =>
              application.id === updatedApplication.id ? updatedApplication : application
            ),
            activityLog: [
              createSyncedActivityLogItem(
                'application_tracked',
                `Application tracking updated for ${updatedApplication.grantTitle}`,
                updatedApplication.id
              ),
              ...currentState.activityLog,
            ],
          }));

          return updatedApplication;
        }

        const application: TrackedApplication = {
          id: `application-${grantId}-${Date.now()}`,
          grantId,
          grantTitle: grant.title,
          funder: grant.funder,
          deadline: grant.deadline,
          status: linkedProposalDraftId ? 'Drafting' : 'Not Started',
          linkedProposalDraftId,
          notes: '',
          checklistItems: createApplicationChecklist(grant),
          updatedAt: new Date().toISOString(),
          nextActionRecommendation: getApplicationNextAction(linkedProposalDraftId ? 'Drafting' : 'Not Started'),
        };
        syncTrackedApplication(application);
        syncChecklistItems(application);
        if (state.sessionUser?.authMode === 'supabase' && !state.savedGrantIds.includes(grantId)) {
          saveGrantForUser(grantId, state.sessionUser.id, state.currentWorkspace.id).catch((error) => {
            console.warn('Unable to sync saved grant while tracking application.', error);
          });
        }

        setState((currentState) => ({
          ...currentState,
          trackedApplications: [application, ...currentState.trackedApplications],
          savedGrantIds: currentState.savedGrantIds.includes(grantId)
            ? currentState.savedGrantIds
            : [...currentState.savedGrantIds, grantId],
          activityLog: [
            createSyncedActivityLogItem(
              'application_tracked',
              `Started tracking application for ${application.grantTitle}`,
              application.id
            ),
            ...currentState.activityLog,
          ],
        }));

        return application;
      },
      updateApplicationStatus: (applicationId, status) => {
        const existingApplication = state.trackedApplications.find(
          (application) => application.id === applicationId
        );
        const syncedApplication = existingApplication
          ? {
              ...existingApplication,
              status,
              updatedAt: new Date().toISOString(),
              nextActionRecommendation: getApplicationNextAction(status),
            }
          : undefined;

        if (syncedApplication) {
          syncTrackedApplication(syncedApplication);
        }

        setState((currentState) => ({
          ...currentState,
          trackedApplications: currentState.trackedApplications.map((application) =>
            application.id === applicationId
              ? {
                  ...application,
                  status,
                  updatedAt: new Date().toISOString(),
                  nextActionRecommendation: getApplicationNextAction(status),
                }
              : application
          ),
          activityLog: [
            createSyncedActivityLogItem(
              status === 'Submitted' ? 'application_submitted' : 'status_changed',
              `Application status changed to ${status}`,
              applicationId
            ),
            ...currentState.activityLog,
          ],
        }));
      },
      updateApplicationNotes: (applicationId, notes) => {
        const existingApplication = state.trackedApplications.find(
          (application) => application.id === applicationId
        );
        const syncedApplication = existingApplication
          ? {
              ...existingApplication,
              notes,
              updatedAt: new Date().toISOString(),
            }
          : undefined;

        if (syncedApplication) {
          syncTrackedApplication(syncedApplication);
        }

        setState((currentState) => ({
          ...currentState,
          trackedApplications: currentState.trackedApplications.map((application) =>
            application.id === applicationId
              ? {
                  ...application,
                  notes,
                  updatedAt: new Date().toISOString(),
                }
              : application
          ),
          activityLog: [
            createSyncedActivityLogItem('checklist_completed', 'Checklist item updated', applicationId),
            ...currentState.activityLog,
          ],
        }));
      },
      toggleApplicationChecklistItem: (applicationId, itemId) => {
        const existingApplication = state.trackedApplications.find(
          (application) => application.id === applicationId
        );
        const existingChecklistItem = existingApplication?.checklistItems.find(
          (item) => item.id === itemId
        );
        const updatedChecklistItem = existingChecklistItem
          ? {
              ...existingChecklistItem,
              completed: !existingChecklistItem.completed,
            }
          : undefined;

        if (state.sessionUser?.authMode === 'supabase' && updatedChecklistItem) {
          upsertChecklistItem(state.sessionUser.id, applicationId, updatedChecklistItem).catch((error) => {
            console.warn('Unable to sync checklist item.', error);
          });
        }

        setState((currentState) => ({
          ...currentState,
          trackedApplications: currentState.trackedApplications.map((application) =>
            application.id === applicationId
              ? {
                  ...application,
                  checklistItems: application.checklistItems.map((item) =>
                    item.id === itemId
                      ? {
                          ...item,
                          completed: !item.completed,
                        }
                      : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : application
          ),
          activityLog: updatedChecklistItem?.completed
            ? [
                createSyncedActivityLogItem(
                  'checklist_completed',
                  `Checklist item completed: ${updatedChecklistItem.label}`,
                  applicationId
                ),
                ...currentState.activityLog,
              ]
            : currentState.activityLog,
        }));
      },
      linkDraftToApplication: (applicationId, proposalDraftId) => {
        const existingApplication = state.trackedApplications.find(
          (application) => application.id === applicationId
        );
        const nextStatus =
          existingApplication?.status === 'Not Started' ? 'Drafting' : existingApplication?.status;
        const syncedApplication =
          existingApplication && nextStatus
            ? {
                ...existingApplication,
                linkedProposalDraftId: proposalDraftId,
                status: nextStatus,
                updatedAt: new Date().toISOString(),
                nextActionRecommendation: getApplicationNextAction(nextStatus),
              }
            : undefined;

        if (syncedApplication) {
          syncTrackedApplication(syncedApplication);
        }

        setState((currentState) => ({
          ...currentState,
          trackedApplications: currentState.trackedApplications.map((application) =>
            application.id === applicationId
              ? {
                  ...application,
                  linkedProposalDraftId: proposalDraftId,
                  status: application.status === 'Not Started' ? 'Drafting' : application.status,
                  updatedAt: new Date().toISOString(),
                  nextActionRecommendation: getApplicationNextAction(
                    application.status === 'Not Started' ? 'Drafting' : application.status
                  ),
                }
              : application
          ),
        }));
      },
      getApplicationByGrantId: (grantId) =>
        state.trackedApplications.find((application) => application.grantId === grantId),
      getTrackerCounts: () => countApplicationsByStatus(state.trackedApplications),
      addMockWorkspaceMember: () => {
        const memberNumber = state.workspaceMembers.length + 1;
        const roles: WorkspaceRole[] = ['Researcher', 'Reviewer', 'Finance', 'Viewer'];
        const role = roles[memberNumber % roles.length];
        const name = `Team Member ${memberNumber}`;
        const member: WorkspaceMember = {
          id: `member-${Date.now()}`,
          name,
          email: `member${memberNumber}@example.org`,
          role,
          organisation: state.currentWorkspace.name,
          avatarInitials: createInitials(name),
          joinedDate: new Date().toISOString().slice(0, 10),
        };
        if (state.sessionUser?.authMode === 'supabase') {
          syncWorkspaceMember(state.currentWorkspace.id, state.sessionUser.id, member).catch((error) => {
            console.warn('Unable to sync workspace member.', error);
          });
        }

        setState((currentState) => ({
          ...currentState,
          workspaceMembers: [...currentState.workspaceMembers, member],
          activityLog: [
            createSyncedActivityLogItem('member_added', `${member.name} added as ${member.role}`),
            ...currentState.activityLog,
          ],
        }));
      },
      assignCollaboratorToApplication: (applicationId, memberId) => {
        setState((currentState) => {
          const exists = currentState.applicationCollaborators.some(
            (collaborator) =>
              collaborator.applicationId === applicationId && collaborator.memberId === memberId
          );

          if (exists) {
            return currentState;
          }

          const member = currentState.workspaceMembers.find((item) => item.id === memberId);

          return {
            ...currentState,
            applicationCollaborators: [
              {
                id: `collaborator-${Date.now()}`,
                applicationId,
                memberId,
                assignedAt: new Date().toISOString(),
              },
              ...currentState.applicationCollaborators,
            ],
            activityLog: [
              createSyncedActivityLogItem(
                'collaborator_assigned',
                `${member?.name ?? 'A team member'} assigned to an application`,
                applicationId,
                memberId
              ),
              ...currentState.activityLog,
            ],
          };
        });
      },
      removeCollaboratorFromApplication: (applicationId, memberId) => {
        setState((currentState) => ({
          ...currentState,
          applicationCollaborators: currentState.applicationCollaborators.filter(
            (collaborator) =>
              !(collaborator.applicationId === applicationId && collaborator.memberId === memberId)
          ),
        }));
      },
      addReviewComment: (applicationId, memberId, comment) => {
        const trimmedComment = comment.trim();

        if (!trimmedComment) {
          return;
        }

        setState((currentState) => {
          const member = currentState.workspaceMembers.find((item) => item.id === memberId);
          const reviewComment: ReviewComment = {
            id: `comment-${Date.now()}`,
            applicationId,
            memberId,
            comment: trimmedComment,
            createdAt: new Date().toISOString(),
          };
          if (currentState.sessionUser?.authMode === 'supabase') {
            syncReviewComment(
              currentState.sessionUser.id,
              reviewComment,
              currentState.currentWorkspace.id,
              member
            ).catch((error) => {
              console.warn('Unable to sync review comment.', error);
            });
          }

          return {
            ...currentState,
            reviewComments: [reviewComment, ...currentState.reviewComments],
            activityLog: [
              createSyncedActivityLogItem(
                'comment_added',
                `${member?.name ?? 'A team member'} commented on an application`,
                applicationId,
                memberId
              ),
              ...currentState.activityLog,
            ],
          };
        });
      },
      toggleNotificationPreference: (key) => {
        setState((currentState) => {
          const nextValue = !currentState.notificationPreferences[key];

          return {
            ...currentState,
            notificationPreferences: {
              ...currentState.notificationPreferences,
              [key]: nextValue,
            },
            activityLog: [
              createSyncedActivityLogItem(
                'settings_updated',
                `Notification preference updated: ${key} ${nextValue ? 'enabled' : 'disabled'}`
              ),
              ...currentState.activityLog,
            ],
          };
        });
      },
      updateWorkspacePreference: (field, value) => {
        setState((currentState) => ({
          ...currentState,
          workspacePreferences: {
            ...currentState.workspacePreferences,
            [field]: value,
          },
          currentWorkspace:
            field === 'workspaceName' || field === 'organisationType'
              ? {
                  ...currentState.currentWorkspace,
                  name:
                    field === 'workspaceName'
                      ? String(value).trim() || currentState.currentWorkspace.name
                      : currentState.currentWorkspace.name,
                  organisationType:
                    field === 'organisationType'
                      ? String(value).trim() || currentState.currentWorkspace.organisationType
                      : currentState.currentWorkspace.organisationType,
                }
              : currentState.currentWorkspace,
          activityLog: [
            createSyncedActivityLogItem('settings_updated', `Workspace preference updated: ${field}`),
            ...currentState.activityLog,
          ],
        }));
      },
      recordDataExport: () => {
        setState((currentState) => ({
          ...currentState,
          activityLog: [
            createSyncedActivityLogItem('data_exported', 'Local data export summary generated'),
            ...currentState.activityLog,
          ],
        }));
      },
      completeOnboarding: async (answers) => {
        const cleanedInterests = answers.fundingInterests
          .split(',')
          .map((interest) => interest.trim())
          .filter(Boolean);
        const nextProfile: UserProfile = {
          ...state.currentUser,
          organisation: answers.organisationName.trim() || state.currentUser.organisation,
          userType: answers.userType,
          country: answers.countryRegion.trim() || state.currentUser.country,
          researchInterests:
            cleanedInterests.length > 0 ? cleanedInterests : state.currentUser.researchInterests,
          fundingNeeds: answers.preferredFundingSize,
        };
        const savedProfile =
          state.sessionUser?.authMode === 'supabase'
            ? await upsertProfile({
                userId: state.sessionUser.id,
                email: state.sessionUser.email,
                fullName: nextProfile.fullName,
                organisation: nextProfile.organisation,
                userType: nextProfile.userType,
                country: nextProfile.country,
                sector: nextProfile.sector,
                fundingNeeds: nextProfile.fundingNeeds,
                collaborationInterests: nextProfile.collaborationInterests,
                researchInterests: nextProfile.researchInterests,
                subscriptionTier: nextProfile.subscriptionTier,
              })
            : {
                ...nextProfile,
                profileCompleteness: calculateProfileCompleteness(nextProfile),
              };
        const savedWorkspace =
          state.sessionUser?.authMode === 'supabase'
            ? await updateWorkspaceFromOnboarding(state.currentWorkspace, answers)
            : {
                ...state.currentWorkspace,
                name: answers.organisationName.trim() || state.currentWorkspace.name,
                organisationType: answers.userType,
              };

        setState((currentState) => {
          return {
            ...currentState,
            hasCompletedOnboarding: true,
            onboardingAnswers: answers,
            currentUser: savedProfile,
            currentWorkspace: savedWorkspace,
            workspacePreferences: {
              ...currentState.workspacePreferences,
              workspaceName: answers.organisationName.trim() || currentState.workspacePreferences.workspaceName,
              organisationType: answers.userType,
              preferredFundingRegions:
                answers.countryRegion.trim() || currentState.workspacePreferences.preferredFundingRegions,
            },
            activityLog: [
              createSyncedActivityLogItem('settings_updated', 'Onboarding completed'),
              ...currentState.activityLog,
            ],
          };
        });
      },
      resetOnboarding: () => {
        setState((currentState) => ({
          ...currentState,
          hasCompletedOnboarding: false,
          onboardingAnswers: undefined,
          activityLog: [
            createSyncedActivityLogItem('settings_updated', 'Onboarding reset'),
            ...currentState.activityLog,
          ],
        }));
      },
      loginMock: async (credentials) => {
        const sessionUser = credentials
          ? await registerMockUser({
              fullName: state.currentUser.fullName,
              organisation: state.currentUser.organisation,
              userType: state.currentUser.userType,
              email: credentials.email,
              password: credentials.password,
            })
          : await loginDemo();

        setState((currentState) => ({
          ...currentState,
          sessionUser,
          isAuthenticated: true,
          authMode: sessionUser.authMode,
          currentUser: {
            ...currentState.currentUser,
            id: sessionUser.id,
            fullName: sessionUser.fullName,
            organisation: sessionUser.organisation,
            userType: sessionUser.userType,
            profileCompleteness: calculateProfileCompleteness({
              ...currentState.currentUser,
              fullName: sessionUser.fullName,
              organisation: sessionUser.organisation,
              userType: sessionUser.userType,
            }),
          },
          activityLog: [
            createSyncedActivityLogItem('settings_updated', 'Mock login completed'),
            ...currentState.activityLog,
          ],
        }));
      },
      registerMock: async (input) => {
        const sessionUser = await registerMockUser(input);

        setState((currentState) => {
          const nextProfile: UserProfile = {
            ...currentState.currentUser,
            id: sessionUser.id,
            fullName: sessionUser.fullName,
            organisation: sessionUser.organisation,
            userType: sessionUser.userType,
          };

          return {
            ...currentState,
            sessionUser,
            isAuthenticated: true,
            authMode: sessionUser.authMode,
            currentUser: {
              ...nextProfile,
              profileCompleteness: calculateProfileCompleteness(nextProfile),
            },
            currentWorkspace: {
              ...currentState.currentWorkspace,
              name: sessionUser.organisation,
              organisationType: sessionUser.userType,
            },
            workspacePreferences: {
              ...currentState.workspacePreferences,
              workspaceName: sessionUser.organisation,
              organisationType: sessionUser.userType,
            },
            activityLog: [
              createSyncedActivityLogItem('settings_updated', 'Mock registration completed'),
              ...currentState.activityLog,
            ],
          };
        });
      },
      loginWithEmail: async (credentials) => {
        const sessionUser = await authenticateWithEmail(credentials);
        const syncedProfile =
          (await getProfile(sessionUser.id)) ??
          (await upsertProfile(mapSessionToProfileInput(sessionUser)));
        const syncedWorkspace = await getOrCreateWorkspace(sessionUser);
        const syncedWorkspaceMembers = await getWorkspaceMembers(syncedWorkspace.id);
        const syncedSavedGrantIds = await fetchSavedGrantIds(sessionUser.id, syncedWorkspace.id);
        const syncedProposalDrafts = await fetchProposalDrafts(sessionUser.id);
        const syncedTrackedApplications = await fetchTrackedApplicationsFromSupabase(sessionUser.id);
        const syncedReviewComments = await fetchReviewComments(sessionUser.id);
        const syncedActivityLog = await fetchActivityLog(sessionUser.id);

        setState((currentState) => ({
          ...currentState,
          sessionUser,
          isAuthenticated: true,
          authMode: sessionUser.authMode,
          currentUser: syncedProfile,
          savedGrantIds: syncedSavedGrantIds ?? currentState.savedGrantIds,
          proposalDrafts: syncedProposalDrafts ?? currentState.proposalDrafts,
          trackedApplications:
            syncedTrackedApplications ?? currentState.trackedApplications,
          reviewComments: syncedReviewComments ?? currentState.reviewComments,
          currentWorkspace: syncedWorkspace,
          workspaceMembers: syncedWorkspaceMembers,
          workspacePreferences: {
            ...currentState.workspacePreferences,
            workspaceName: syncedWorkspace.name,
            organisationType: syncedWorkspace.organisationType,
          },
          activityLog: [
            createSyncedActivityLogItem(
              'settings_updated',
              `${sessionUser.authMode === 'supabase' ? 'Supabase' : 'Mock'} login completed`
            ),
            ...(syncedActivityLog ?? currentState.activityLog),
          ],
        }));
      },
      registerWithEmail: async (input) => {
        const sessionUser = await registerUser(input);
        const syncedProfile = await upsertProfile({
          userId: sessionUser.id,
          email: sessionUser.email,
          fullName: sessionUser.fullName,
          organisation: sessionUser.organisation,
          userType: sessionUser.userType,
          country: state.currentUser.country,
          sector: state.currentUser.sector,
          fundingNeeds: state.currentUser.fundingNeeds,
          collaborationInterests: state.currentUser.collaborationInterests,
          researchInterests: state.currentUser.researchInterests,
          subscriptionTier: state.currentUser.subscriptionTier,
        });
        const syncedWorkspace = await getOrCreateWorkspace(sessionUser);
        const syncedWorkspaceMembers = await getWorkspaceMembers(syncedWorkspace.id);
        const syncedSavedGrantIds = await fetchSavedGrantIds(sessionUser.id, syncedWorkspace.id);
        const syncedProposalDrafts = await fetchProposalDrafts(sessionUser.id);
        const syncedTrackedApplications = await fetchTrackedApplicationsFromSupabase(sessionUser.id);
        const syncedReviewComments = await fetchReviewComments(sessionUser.id);
        const syncedActivityLog = await fetchActivityLog(sessionUser.id);

        setState((currentState) => {
          return {
            ...currentState,
            sessionUser,
            isAuthenticated: true,
            authMode: sessionUser.authMode,
            currentUser: syncedProfile,
            savedGrantIds: syncedSavedGrantIds ?? currentState.savedGrantIds,
            proposalDrafts: syncedProposalDrafts ?? currentState.proposalDrafts,
            trackedApplications:
              syncedTrackedApplications ?? currentState.trackedApplications,
            reviewComments: syncedReviewComments ?? currentState.reviewComments,
            currentWorkspace: syncedWorkspace,
            workspaceMembers: syncedWorkspaceMembers,
            workspacePreferences: {
              ...currentState.workspacePreferences,
              workspaceName: syncedWorkspace.name,
              organisationType: syncedWorkspace.organisationType,
            },
            activityLog: [
              createSyncedActivityLogItem(
                'settings_updated',
                `${sessionUser.authMode === 'supabase' ? 'Supabase' : 'Mock'} registration completed`
              ),
              ...(syncedActivityLog ?? currentState.activityLog),
            ],
          };
        });
      },
      logout: async () => {
        const previousAuthMode = state.authMode;
        await logoutAuth();

        setState((currentState) => ({
          ...currentState,
          currentUser: initialState.currentUser,
          currentWorkspace: initialState.currentWorkspace,
          workspaceMembers: initialState.workspaceMembers,
          sessionUser: undefined,
          isAuthenticated: false,
          authMode: 'mock',
          activityLog: [
            createSyncedActivityLogItem(
              'settings_updated',
              `${previousAuthMode === 'supabase' ? 'Supabase' : 'Mock'} logout completed`
            ),
            ...currentState.activityLog,
          ],
        }));
      },
      logoutMock: async () => {
        await logoutAuth();

        setState((currentState) => ({
          ...currentState,
          currentUser: initialState.currentUser,
          currentWorkspace: initialState.currentWorkspace,
          workspaceMembers: initialState.workspaceMembers,
          sessionUser: undefined,
          isAuthenticated: false,
          authMode: 'mock',
          activityLog: [
            createSyncedActivityLogItem('settings_updated', 'Mock logout completed'),
            ...currentState.activityLog,
          ],
        }));
      },
      resetDemoData: () => {
        setState((currentState) => {
          if (currentState.authMode === 'supabase' && currentState.sessionUser) {
            return {
              ...initialState,
              currentUser: currentState.currentUser,
              currentWorkspace: currentState.currentWorkspace,
              workspaceMembers: currentState.workspaceMembers,
              savedGrantIds: currentState.savedGrantIds,
              proposalDrafts: currentState.proposalDrafts,
              trackedApplications: currentState.trackedApplications,
              reviewComments: currentState.reviewComments,
              activityLog: currentState.activityLog,
              notificationPreferences: currentState.notificationPreferences,
              workspacePreferences: currentState.workspacePreferences,
              hasCompletedOnboarding: currentState.hasCompletedOnboarding,
              onboardingAnswers: currentState.onboardingAnswers,
              authMode: 'supabase',
              sessionUser: currentState.sessionUser,
              isAuthenticated: true,
            };
          }

          return initialState;
        });
        AsyncStorage.removeItem(STORAGE_KEY).catch((error) => {
          console.warn('Unable to reset GrantMatch AI local state.', error);
        });
      },
    }),
    [isLoaded, state]
  );

  return <GrantMatchContext.Provider value={value}>{children}</GrantMatchContext.Provider>;
}

export function useGrantMatch() {
  const context = useContext(GrantMatchContext);

  if (!context) {
    throw new Error('useGrantMatch must be used inside GrantMatchProvider.');
  }

  return context;
}
