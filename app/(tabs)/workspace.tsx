import { useRouter } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { ActivityItem } from '@/components/ActivityItem';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { PageHeader } from '@/components/PageHeader';
import { RoleBadge } from '@/components/RoleBadge';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { getRoleHint } from '@/utils/workspace';

export default function WorkspaceScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const {
    currentWorkspace,
    workspaceMembers,
    trackedApplications,
    applicationCollaborators,
    activityLog,
    isLoaded,
    addMockWorkspaceMember,
  } = useGrantMatch();
  const activeApplications = trackedApplications.filter(
    (application) => !['Awarded', 'Rejected'].includes(application.status)
  );
  const activeCollaboratorIds = new Set(applicationCollaborators.map((collaborator) => collaborator.memberId));

  if (!isLoaded) {
    return (
      <ScreenContainer>
        <PageHeader eyebrow="Institution workspace" title="Loading Workspace" subtitle="Preparing local team state." />
        <AppCard>
          <Text style={styles.helperText}>Loading workspace members...</Text>
        </AppCard>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="Institution workspace"
        title={currentWorkspace.name}
        subtitle="Mock team workspace for collaboration, review, finance input, and institutional grant workflows."
      />

      <DemoModeBanner />

      <View style={styles.statsGrid}>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{currentWorkspace.organisationType}</Text>
          <Text style={styles.statLabel}>Organisation type</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{currentWorkspace.subscriptionTier}</Text>
          <Text style={styles.statLabel}>Mock plan</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{workspaceMembers.length}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{activeApplications.length}</Text>
          <Text style={styles.statLabel}>Active applications</Text>
        </AppCard>
        <AppCard style={[styles.statCard, isDesktop && styles.desktopStatCard]}>
          <Text style={styles.statValue}>{activeCollaboratorIds.size}</Text>
          <Text style={styles.statLabel}>Active collaborators</Text>
        </AppCard>
      </View>

      <AppCard style={styles.addMemberCard}>
        <Text style={styles.cardTitle}>Team members</Text>
        <Text style={styles.helperText}>
          Add mock members locally to test assignment, review comments, and role-based helper text.
        </Text>
        <AppButton title="Add Mock Member" onPress={addMockWorkspaceMember} />
        <AppButton title="Institution Admin" variant="secondary" onPress={() => router.push('/institution-admin')} />
        <AppButton title="Audit Log" variant="secondary" onPress={() => router.push('/audit-log')} />
      </AppCard>

      <View style={[styles.memberGrid, isDesktop && styles.desktopGrid]}>
        {workspaceMembers.map((member) => (
          <AppCard key={member.id} style={isDesktop ? styles.desktopCard : undefined}>
            <View style={styles.memberHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{member.avatarInitials}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
              </View>
            </View>
            <RoleBadge role={member.role} />
            <Text style={styles.helperText}>{getRoleHint(member.role)}</Text>
            <Text style={styles.memberMeta}>Joined {member.joinedDate}</Text>
          </AppCard>
        ))}
      </View>

      <AppCard style={styles.activityCard}>
        <Text style={styles.cardTitle}>Workspace Activity</Text>
        {activityLog.length === 0 ? (
          <Text style={styles.helperText}>
            No activity yet. Assign collaborators, save drafts, or update applications to populate this feed.
          </Text>
        ) : (
          <View style={styles.activityList}>
            {activityLog.slice(0, 8).map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </View>
        )}
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  desktopStatCard: {
    flexBasis: '18%',
  },
  statValue: {
    color: brand.colors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  statLabel: {
    color: brand.colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  addMemberCard: {
    gap: 10,
    marginBottom: 16,
  },
  cardTitle: {
    color: brand.colors.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  helperText: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  memberGrid: {
    gap: 14,
    marginBottom: 18,
  },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  desktopCard: {
    flexBasis: '31%',
    flexGrow: 1,
  },
  memberHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: brand.colors.primary,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: brand.colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  memberEmail: {
    color: brand.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  memberMeta: {
    color: brand.colors.muted,
    fontSize: 12,
    marginTop: 12,
  },
  activityCard: {
    gap: 12,
  },
  activityList: {
    gap: 12,
  },
});
