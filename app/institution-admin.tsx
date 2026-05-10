import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { InfoBanner } from '@/components/InfoBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { countApplicationsByStatus } from '@/utils/applications';

export default function InstitutionAdminScreen() {
  const router = useRouter();
  const { currentWorkspace, workspaceMembers, trackedApplications, proposalDrafts, savedGrantIds, activityLog } = useGrantMatch();
  const appsByStatus = countApplicationsByStatus(trackedApplications);
  const membersByRole = workspaceMembers.reduce<Record<string, number>>((counts, member) => {
    counts[member.role] = (counts[member.role] ?? 0) + 1;
    return counts;
  }, {});

  return (
    <ScreenContainer>
      <PageHeader eyebrow="Admin" title="Institution Admin" subtitle="Operational controls for institutional grant workflows." />
      <InfoBanner text="Admin actions are mock/local until production role management and billing entitlements are connected." />
      <View style={styles.grid}>
        <Metric title="Workspace" value={currentWorkspace.name} />
        <Metric title="Mock plan" value={currentWorkspace.subscriptionTier} />
        <Metric title="Saved grants" value={String(savedGrantIds.length)} />
        <Metric title="Activity events" value={String(activityLog.length)} />
      </View>
      <AppCard style={styles.card}>
        <Text style={styles.title}>Members by role</Text>
        {Object.entries(membersByRole).map(([role, count]) => <Text key={role} style={styles.meta}>{role}: {count}</Text>)}
      </AppCard>
      <AppCard style={styles.card}>
        <Text style={styles.title}>Applications by status</Text>
        {Object.entries(appsByStatus).map(([status, count]) => <Text key={status} style={styles.meta}>{status}: {count}</Text>)}
        <Text style={styles.meta}>Drafts ready for review: {proposalDrafts.filter((draft) => draft.status === 'Ready for Review').length}</Text>
      </AppCard>
      <AppCard style={styles.card}>
        <Text style={styles.title}>Admin actions</Text>
        <View style={styles.actions}>
          <AppButton title="Manage Roles" variant="secondary" onPress={() => router.push('/workspace')} />
          <AppButton title="View Audit Events" variant="secondary" onPress={() => router.push('/audit-log')} />
          <AppButton title="Export Workspace Summary" variant="secondary" onPress={() => router.push('/data-management')} />
          <AppButton title="Configure Review Workflow" variant="secondary" onPress={() => router.push('/settings')} />
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <AppCard style={styles.metric}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.meta}>{title}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 },
  metric: { flexBasis: 180, flexGrow: 1 },
  value: { color: brand.colors.ink, fontSize: 22, fontWeight: '900' },
  card: { gap: 8, marginBottom: 14 },
  title: { color: brand.colors.ink, fontSize: 18, fontWeight: '900' },
  meta: { color: brand.colors.muted, fontSize: 14, lineHeight: 20 },
  actions: { gap: 10 },
});
