import { useRouter } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ActivityItem } from '@/components/ActivityItem';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { GrantCard } from '@/components/GrantCard';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { getDeadlineRisk } from '@/utils/applications';
import { getBackendStatus } from '@/utils/backendStatus';
import { buildUsageSummary } from '@/utils/subscriptions';
import { buildSyncEntityStatuses } from '@/utils/sync';

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isTablet = width >= 640;
  const {
    currentUser,
    currentWorkspace,
    workspaceMembers,
    applicationCollaborators,
    activityLog,
    grants,
    recommendations,
    savedGrantIds,
    proposalDrafts,
    trackedApplications,
    isLoaded,
    toggleSavedGrant,
    createTrackedApplication,
    getTrackerCounts,
    authMode,
    sessionUser,
  } = useGrantMatch();
  const topRecommendations = recommendations.slice(0, 3);
  const recentDrafts = proposalDrafts.slice(0, 3);
  const trackerCounts = getTrackerCounts();
  const nextDeadlineApplication = [...trackedApplications].sort(
    (firstApplication, secondApplication) =>
      new Date(firstApplication.deadline).getTime() - new Date(secondApplication.deadline).getTime()
  )[0];
  const averageChecklistProgress =
    trackedApplications.length === 0
      ? 0
      : Math.round(
          trackedApplications.reduce((total, application) => {
            if (application.checklistItems.length === 0) {
              return total;
            }

            const completedItems = application.checklistItems.filter((item) => item.completed).length;

            return total + completedItems / application.checklistItems.length;
          }, 0) /
            trackedApplications.length *
            100
        );
  const highRiskApplications = trackedApplications.filter((application) => {
    const completedItems = application.checklistItems.filter((item) => item.completed).length;
    const checklistProgress =
      application.checklistItems.length === 0
        ? 0
        : Math.round((completedItems / application.checklistItems.length) * 100);

    return getDeadlineRisk(application.deadline, checklistProgress).tone === 'danger';
  });
  const activeCollaboratorIds = new Set(applicationCollaborators.map((collaborator) => collaborator.memberId));
  const applicationsNeedingReview = trackedApplications.filter(
    (application) => application.status === 'Ready for Review'
  );
  const usageSummary = buildUsageSummary({
    tier: currentWorkspace.subscriptionTier,
    savedGrantCount: savedGrantIds.length,
    proposalDraftCount: proposalDrafts.length,
    workspaceMemberCount: workspaceMembers.length,
  });
  const syncSummary = buildSyncEntityStatuses(authMode);
  const backendStatus = getBackendStatus(authMode, sessionUser);

  if (!isLoaded) {
    return (
      <ScreenContainer>
        <PageHeader eyebrow="Dashboard" title="Loading Dashboard" subtitle="Preparing local workspace state." />
        <AppCard>
          <Text style={styles.emptyText}>Loading your mock SaaS workspace...</Text>
        </AppCard>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome, ${currentUser.fullName.split(' ')[1] ?? currentUser.fullName}`}
        subtitle="Your grant workspace is ready with explainable matches and proposal drafts."
      />

      <DemoModeBanner />

      <View style={styles.statsGrid}>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{currentUser.profileCompleteness}%</Text>
          <Text style={styles.statLabel}>Profile complete</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{recommendations.length}</Text>
          <Text style={styles.statLabel}>Matched grants</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{savedGrantIds.length}</Text>
          <Text style={styles.statLabel}>Saved grants</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{proposalDrafts.length}</Text>
          <Text style={styles.statLabel}>Draft proposals</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{trackedApplications.length}</Text>
          <Text style={styles.statLabel}>Tracked applications</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{trackerCounts.Submitted}</Text>
          <Text style={styles.statLabel}>Submitted</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{trackerCounts.Drafting}</Text>
          <Text style={styles.statLabel}>Drafting</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{averageChecklistProgress}%</Text>
          <Text style={styles.statLabel}>Checklist readiness</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{highRiskApplications.length}</Text>
          <Text style={styles.statLabel}>High-risk deadlines</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{activeCollaboratorIds.size}</Text>
          <Text style={styles.statLabel}>Active collaborators</Text>
        </AppCard>
      </View>

      <SectionHeader title="Workspace summary" subtitle="Mock institution workspace for team grant operations." />
      <AppCard style={styles.nextActionCard}>
        <Text style={styles.nextActionTitle}>{currentWorkspace.name}</Text>
        <Text style={styles.nextActionText}>
          {currentWorkspace.organisationType} • {currentWorkspace.subscriptionTier} plan • {workspaceMembers.length} members
        </Text>
        <Text style={styles.nextActionText}>
          {applicationsNeedingReview.length} application
          {applicationsNeedingReview.length === 1 ? '' : 's'} ready for review.
        </Text>
        <Text style={styles.deadlineReminder}>
          {applicationsNeedingReview.length > 0
            ? 'Recommended team action: assign a Reviewer and Finance member before submission.'
            : 'Recommended team action: assign collaborators to active applications early.'}
        </Text>
        <AppButton title="Open Workspace" variant="secondary" onPress={() => router.push('/workspace')} />
      </AppCard>

      <SectionHeader title="Quick actions" subtitle="Move from profile to match to proposal." />
      <View style={[styles.actions, isTablet && styles.tabletActions]}>
        <AppButton
          title="Complete Profile"
          variant="secondary"
          onPress={() => router.push('/profile')}
          style={isTablet ? styles.actionButton : undefined}
        />
        <AppButton
          title="View Matches"
          variant="secondary"
          onPress={() => router.push('/recommendations')}
          style={isTablet ? styles.actionButton : undefined}
        />
        <AppButton
          title="Start Proposal"
          onPress={() => router.push('/proposal')}
          style={isTablet ? styles.actionButton : undefined}
        />
        <AppButton
          title="View Saved Grants"
          variant="secondary"
          onPress={() => router.push('/saved')}
          style={isTablet ? styles.actionButton : undefined}
        />
        <AppButton
          title="Compare Grants"
          variant="secondary"
          onPress={() => router.push('/compare')}
          style={isTablet ? styles.actionButton : undefined}
        />
        <AppButton
          title="Application Tracker"
          variant="secondary"
          onPress={() => router.push('/tracker')}
          style={isTablet ? styles.actionButton : undefined}
        />
      </View>

      <SectionHeader title="Production readiness" subtitle="Sync, usage, ingestion, and AI quality signals." />
      <AppCard style={styles.nextActionCard}>
        <Text style={styles.nextActionTitle}>SaaS operating snapshot</Text>
        <Text style={styles.nextActionText}>
          Backend: {backendStatus.statusLabel}. Session source: {backendStatus.sessionSource}.
          Supabase configured: {backendStatus.isSupabaseConfigured ? 'yes' : 'no'}.
        </Text>
        <Text style={styles.nextActionText}>
          Sync: {syncSummary.filter((item) => item.mode === 'Supabase').length}/{syncSummary.length} entities Supabase-backed in the active mode.
        </Text>
        <Text style={styles.nextActionText}>
          Usage: {usageSummary.limits.map((limit) => `${limit.entity} ${limit.used}/${limit.limit}`).join(' • ')}
        </Text>
        <Text style={styles.nextActionText}>
          AI match quality: mock ranking available in Match Lab. Grant ingestion: mock source registry available.
        </Text>
        {usageSummary.warnings.map((warning) => (
          <Text key={warning} style={styles.deadlineReminder}>{warning}</Text>
        ))}
        <View style={[styles.actions, isTablet && styles.tabletActions, styles.embeddedActions]}>
          <AppButton
            title="Sync Center"
            variant="secondary"
            onPress={() => router.push('/sync-center')}
            style={isTablet ? styles.actionButton : undefined}
          />
          <AppButton
            title="Grant Sources"
            variant="secondary"
            onPress={() => router.push('/grant-sources')}
            style={isTablet ? styles.actionButton : undefined}
          />
          <AppButton
            title="Institution Admin"
            variant="secondary"
            onPress={() => router.push('/institution-admin')}
            style={isTablet ? styles.actionButton : undefined}
          />
        </View>
      </AppCard>

      <SectionHeader
        title="Recommended next action"
        subtitle="A simple local suggestion based on your current workspace."
      />
      <AppCard style={styles.nextActionCard}>
        <Text style={styles.nextActionTitle}>
          {savedGrantIds.length === 0
            ? 'Save your first grant'
            : trackedApplications.length === 0
              ? 'Track a saved grant application'
            : proposalDrafts.length === 0
              ? 'Generate a proposal draft'
              : currentUser.profileCompleteness < 100
                ? 'Complete your profile'
                : 'Review your latest draft'}
        </Text>
        <Text style={styles.nextActionText}>
          {savedGrantIds.length === 0
            ? 'Shortlist one or two high-confidence matches so you can compare them later.'
            : trackedApplications.length === 0
              ? 'Create your first tracked application so deadlines and statuses are visible.'
            : proposalDrafts.length === 0
              ? 'Use a saved grant to create a mock proposal draft and test the workflow.'
              : currentUser.profileCompleteness < 100
                ? 'A more complete profile will improve future matching and proposal context.'
                : 'Your workspace is in good shape. Open a draft and mark it ready for review.'}
        </Text>
      </AppCard>

      <SectionHeader title="Next deadline application" subtitle="Live tracker insight from local state." />
      <AppCard style={styles.nextActionCard}>
        {nextDeadlineApplication ? (
          <>
            <Text style={styles.nextActionTitle}>{nextDeadlineApplication.grantTitle}</Text>
            <Text style={styles.nextActionText}>
              {nextDeadlineApplication.funder} • Deadline {nextDeadlineApplication.deadline}
            </Text>
            <Text style={styles.draftStatus}>Status: {nextDeadlineApplication.status}</Text>
            <Text style={styles.nextActionText}>{nextDeadlineApplication.nextActionRecommendation}</Text>
            <Text style={styles.deadlineReminder}>
              {getDeadlineRisk(
                nextDeadlineApplication.deadline,
                nextDeadlineApplication.checklistItems.length === 0
                  ? 0
                  : Math.round(
                      (nextDeadlineApplication.checklistItems.filter((item) => item.completed).length /
                        nextDeadlineApplication.checklistItems.length) *
                        100
                    )
              ).message}
            </Text>
            <AppButton title="Open Tracker" variant="secondary" onPress={() => router.push('/tracker')} />
          </>
        ) : (
          <>
            <Text style={styles.emptyTitle}>No tracked applications yet</Text>
            <Text style={styles.emptyText}>Track a saved grant to see deadline and status reminders here.</Text>
          </>
        )}
      </AppCard>

      <SectionHeader title="Recent Activity" subtitle="Latest local workspace events." />
      <AppCard style={styles.activityCard}>
        {activityLog.length === 0 ? (
          <Text style={styles.emptyText}>No activity yet. Team actions will appear here.</Text>
        ) : (
          <View style={styles.activityList}>
            {activityLog.slice(0, 5).map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </View>
        )}
      </AppCard>

      <SectionHeader title="Recently saved grants" subtitle="Your latest saved opportunities." />
      <View style={styles.savedPreviewList}>
        {savedGrantIds.length > 0 ? (
          savedGrantIds.slice(0, 2).map((grantId) => {
            const grant = grants.find((item) => item.id === grantId);

            if (!grant) {
              return null;
            }

            return (
              <AppCard key={grant.id} style={styles.savedPreviewCard}>
                <Text style={styles.savedGrantTitle}>{grant.title}</Text>
                <Text style={styles.savedGrantMeta}>{grant.funder}</Text>
                <AppButton
                  title="View Details"
                  variant="secondary"
                  onPress={() => router.push(`/grants/${grant.id}`)}
                />
                <AppButton
                  title={
                    trackedApplications.some((application) => application.grantId === grant.id)
                      ? 'Open Tracker'
                      : 'Track Application'
                  }
                  onPress={() => {
                    createTrackedApplication(grant.id);
                    router.push('/tracker');
                  }}
                />
              </AppCard>
            );
          })
        ) : (
          <AppCard>
            <Text style={styles.emptyTitle}>No saved grants yet</Text>
            <Text style={styles.emptyText}>Save grants from Matches to build your shortlist.</Text>
          </AppCard>
        )}
      </View>

      <SectionHeader
        title="Recent proposal drafts"
        subtitle="Drafts are stored locally in this prototype."
      />
      <View style={styles.draftList}>
        {recentDrafts.length > 0 ? (
          recentDrafts.map((draft) => {
            const grant = grants.find((item) => item.id === draft.grantId);

            return (
              <AppCard key={draft.id} style={styles.draftCard}>
                <Text style={styles.draftTitle}>{draft.proposalTitle}</Text>
                <Text style={styles.draftMeta}>
                  {grant ? `${grant.funder} • ${grant.deadline}` : 'General proposal draft'}
                </Text>
                <Text style={styles.draftStatus}>Status: {draft.status}</Text>
                <AppButton
                  title="Open Draft"
                  variant="secondary"
                  onPress={() =>
                    router.push(
                      grant
                        ? {
                            pathname: '/proposal',
                            params: { grantId: grant.id },
                          }
                        : '/proposal'
                    )
                  }
                />
              </AppCard>
            );
          })
        ) : (
          <AppCard>
            <Text style={styles.emptyTitle}>No proposal drafts yet</Text>
            <Text style={styles.emptyText}>
              Start from a grant detail page or use Start Proposal to create a general draft.
            </Text>
          </AppCard>
        )}
      </View>

      <SectionHeader
        title="Top recommended grants"
        subtitle="Ranked using the current mock matching engine."
      />
      <View style={styles.grantList}>
        {topRecommendations.map((recommendation) => {
          const grant = grants.find((item) => item.id === recommendation.grantId);

          if (!grant) {
            return null;
          }

          return (
            <GrantCard
              key={recommendation.id}
              grant={grant}
              recommendation={{
                ...recommendation,
                saved: savedGrantIds.includes(grant.id),
              }}
              onViewDetails={() => router.push(`/grants/${grant.id}`)}
              onSave={() => toggleSavedGrant(grant.id)}
            />
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  desktopStatCard: {
    flexBasis: '22%',
  },
  statValue: {
    color: brand.colors.ink,
    fontSize: 26,
    fontWeight: '900',
  },
  statLabel: {
    color: brand.colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  actions: {
    gap: 10,
    marginBottom: 24,
  },
  tabletActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexBasis: '31%',
    flexGrow: 1,
  },
  embeddedActions: {
    marginBottom: 0,
    marginTop: 4,
  },
  nextActionCard: {
    gap: 8,
    marginBottom: 24,
  },
  nextActionTitle: {
    color: brand.colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  nextActionText: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  savedPreviewList: {
    gap: 12,
    marginBottom: 24,
  },
  savedPreviewCard: {
    gap: 10,
  },
  savedGrantTitle: {
    color: brand.colors.ink,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
  },
  savedGrantMeta: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  draftList: {
    gap: 12,
    marginBottom: 24,
  },
  draftCard: {
    gap: 10,
  },
  draftTitle: {
    color: brand.colors.ink,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
  },
  draftMeta: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  draftStatus: {
    color: brand.colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  deadlineReminder: {
    backgroundColor: brand.colors.warningSoft,
    borderRadius: 14,
    color: brand.colors.warning,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: 12,
  },
  activityCard: {
    gap: 12,
    marginBottom: 24,
  },
  activityList: {
    gap: 12,
  },
  emptyTitle: {
    color: brand.colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  emptyText: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  grantList: {
    gap: 14,
  },
});
