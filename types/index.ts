export type UserType = 'Researcher' | 'NGO' | 'Startup' | 'Institution';

export type SubscriptionTier = 'Free' | 'Pro' | 'Institutional';

export type WorkspaceRole = 'Owner' | 'Admin' | 'Researcher' | 'Reviewer' | 'Finance' | 'Viewer';

export type AuthMode = 'mock' | 'supabase';

export type SyncMode = 'Local' | 'Supabase' | 'Hybrid' | 'Offline';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'pending';

export type AIBackendMode = 'mock' | 'backend';

export type AIRequestStatus = 'idle' | 'running' | 'completed' | 'failed' | 'unavailable';

export interface SyncEntityStatus {
  entity:
    | 'savedGrants'
    | 'proposalDrafts'
    | 'trackedApplications'
    | 'applicationChecklists'
    | 'reviewComments'
    | 'activityLog'
    | 'workspaceMembers'
    | 'profile'
    | 'settings'
    | 'workspacePreferences'
    | 'notificationPreferences';
  label: string;
  mode: SyncMode;
  status: SyncStatus;
  lastSyncedAt?: string;
  warning?: string;
}

export type ApplicationStatus =
  | 'Not Started'
  | 'Drafting'
  | 'Ready for Review'
  | 'Submitted'
  | 'Awarded'
  | 'Rejected';

export type ApplicationNextAction = string;

export interface NotificationPreferences {
  deadlineReminders: boolean;
  proposalReviewReminders: boolean;
  savedGrantUpdates: boolean;
  weeklyDigest: boolean;
  teamActivityUpdates: boolean;
}

export interface WorkspacePreferences {
  workspaceName: string;
  organisationType: string;
  defaultCurrency: string;
  preferredFundingRegions: string;
  reviewWorkflowEnabled: boolean;
  financeReviewRequired: boolean;
  internalReviewRequired: boolean;
}

export type PreferredFundingSize =
  | 'Under $50k'
  | '$50k - $250k'
  | '$250k - $1m'
  | '$1m+';

export type DeadlineReadiness =
  | 'Ready now'
  | 'Ready in 1 month'
  | 'Ready in 3 months'
  | 'Exploring only';

export interface OnboardingAnswers {
  userType: UserType;
  organisationName: string;
  countryRegion: string;
  fundingInterests: string;
  preferredFundingSize: PreferredFundingSize;
  deadlineReadiness: DeadlineReadiness;
}

export interface MatchScore {
  relevanceScore: number;
  eligibilityScore: number;
  urgencyScore: number;
  fundingFitScore: number;
  overallConfidence: number;
}

export interface UserProfile {
  id: string;
  fullName: string;
  organisation: string;
  userType: UserType;
  country: string;
  researchInterests: string[];
  sector: string;
  fundingNeeds: string;
  collaborationInterests: string;
  profileCompleteness: number;
  savedGrantIds: string[];
  subscriptionTier: SubscriptionTier;
}

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  organisation: string;
  userType: UserType;
  authMode: AuthMode;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginCredentials {
  fullName: string;
  organisation: string;
  userType: UserType;
}

export interface ProfileUpsertInput {
  userId: string;
  email: string;
  fullName: string;
  organisation: string;
  userType: UserType;
  country?: string;
  sector?: string;
  fundingNeeds?: string;
  collaborationInterests?: string;
  researchInterests?: string[];
  subscriptionTier?: SubscriptionTier;
}

export interface Grant {
  id: string;
  title: string;
  funder: string;
  description: string;
  eligibility: string;
  deadline: string;
  fundingAmount: string;
  regionEligibility: string;
  requiredDocuments: string[];
  topics: string[];
  sectors: string[];
}

export interface Recommendation {
  id: string;
  grantId: string;
  matchScore: MatchScore;
  matchExplanation: string;
  saved: boolean;
}

export interface ProposalDraft {
  id: string;
  grantId: string;
  proposalTitle: string;
  abstract: string;
  problemStatement: string;
  methodology: string;
  expectedImpact: string;
  budgetJustification: string;
  timeline: string;
  teamCapability: string;
  status: 'Draft' | 'Improved' | 'Ready for Review';
  updatedAt?: string;
}

export interface TrackedApplication {
  id: string;
  grantId: string;
  grantTitle: string;
  funder: string;
  deadline: string;
  status: ApplicationStatus;
  linkedProposalDraftId?: string;
  notes: string;
  checklistItems: ApplicationChecklistItem[];
  updatedAt: string;
  nextActionRecommendation: ApplicationNextAction;
}

export interface Workspace {
  id: string;
  name: string;
  organisationType: string;
  subscriptionTier: SubscriptionTier;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  organisation: string;
  avatarInitials: string;
  joinedDate: string;
}

export interface ApplicationCollaborator {
  id: string;
  applicationId: string;
  memberId: string;
  assignedAt: string;
}

export interface ReviewComment {
  id: string;
  applicationId: string;
  memberId: string;
  comment: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  applicationId?: string;
  actorMemberId?: string;
  action:
    | 'application_tracked'
    | 'status_changed'
    | 'checklist_completed'
    | 'proposal_saved'
    | 'ai_match_requested'
    | 'ai_proposal_generated'
    | 'ai_proposal_improved'
    | 'ai_review_generated'
    | 'ai_backend_unavailable'
    | 'collaborator_assigned'
    | 'comment_added'
    | 'application_submitted'
    | 'member_added'
    | 'settings_updated'
    | 'data_exported';
  message: string;
  createdAt: string;
}

export interface ApplicationChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export type GrantIngestionStatus = 'Idle' | 'Running' | 'Completed' | 'Failed';

export interface GrantSource {
  id: string;
  name: string;
  type: 'Government' | 'Foundation' | 'Multilateral' | 'Research Council';
  region: string;
  status: GrantIngestionStatus;
  lastSync?: string;
  importedCount: number;
  notes: string;
}

export interface GrantIngestionRun {
  id: string;
  sourceId: string;
  status: GrantIngestionStatus;
  startedAt: string;
  completedAt?: string;
  importedCount: number;
  notes: string;
}

export interface NormalisedGrant {
  externalId: string;
  sourceId: string;
  title: string;
  funder: string;
  description: string;
  deadline?: string;
  fundingAmount?: string;
  regionEligibility?: string;
  topics: string[];
  requiredDocuments: string[];
}

export interface RankingSignal {
  label: string;
  score: number;
  explanation: string;
}

export interface MatchExplanation {
  summary: string;
  signals: RankingSignal[];
}

export interface AIMatchInput {
  profile: UserProfile;
  grants: Grant[];
}

export interface AIMatchResult {
  grant: Grant;
  confidenceScore: number;
  topicFit: number;
  eligibilityFit: number;
  deadlineReadiness: number;
  fundingFit: number;
  strategicFit: number;
  explanation: MatchExplanation;
}

export interface ProposalGenerationInput {
  profile: UserProfile;
  grant?: Grant;
  draft?: ProposalDraft;
}

export interface ProposalSectionFeedback {
  section: string;
  score: number;
  feedback: string;
}

export interface ProposalReadinessScore {
  overall: number;
  missingSections: string[];
  weakSections: string[];
  feedback: ProposalSectionFeedback[];
}

export interface ProposalGenerationResult {
  draft: ProposalDraft;
  readiness: ProposalReadinessScore;
  reviewerQuestions: string[];
}

export interface GrantMatchRequest {
  profile: UserProfile;
  grants: Grant[];
  workspaceId?: string;
}

export interface GrantMatchResponse {
  mode: AIBackendMode;
  status: AIRequestStatus;
  results: AIMatchResult[];
  generatedAt: string;
}

export interface ProposalGenerationRequest {
  profile: UserProfile;
  grant?: Grant;
  draft?: ProposalDraft;
  workspaceId?: string;
}

export interface ProposalGenerationResponse {
  mode: AIBackendMode;
  status: AIRequestStatus;
  result: ProposalGenerationResult;
  generatedAt: string;
}

export interface ProposalImprovementRequest {
  draft: ProposalDraft;
  section?: keyof ProposalDraft;
  text?: string;
  workspaceId?: string;
}

export interface ProposalImprovementResponse {
  mode: AIBackendMode;
  status: AIRequestStatus;
  draft?: ProposalDraft;
  improvedText?: string;
  generatedAt: string;
}

export interface ProposalReadinessRequest {
  draft?: ProposalDraft;
  workspaceId?: string;
}

export interface ProposalReadinessResponse {
  mode: AIBackendMode;
  status: AIRequestStatus;
  readiness: ProposalReadinessScore;
  reviewerQuestions: string[];
  budgetJustificationFeedback: string;
  impactStatementFeedback: string;
  generatedAt: string;
}

export interface AIUsageEvent {
  id: string;
  type:
    | 'ai_match_requested'
    | 'ai_proposal_generated'
    | 'ai_proposal_improved'
    | 'ai_review_generated'
    | 'ai_backend_unavailable';
  mode: AIBackendMode;
  status: AIRequestStatus;
  createdAt: string;
  relatedEntityId?: string;
}

export interface SubscriptionFeature {
  id: string;
  label: string;
  included: boolean;
}

export interface UsageLimit {
  entity: string;
  used: number;
  limit: number | 'Unlimited';
}

export interface UsageSummary {
  tier: SubscriptionTier;
  limits: UsageLimit[];
  warnings: string[];
}

export type AuditEventType =
  | 'auth'
  | 'grants'
  | 'ai'
  | 'proposals'
  | 'applications'
  | 'workspace'
  | 'settings';

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  actor: string;
  entity?: string;
  description: string;
  createdAt: string;
}
