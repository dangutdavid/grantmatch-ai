import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHealthPanel } from '@/components/AppHealthPanel';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { appInfo } from '@/constants/appInfo';
import { brand } from '@/constants/brand';
import {
  DeploymentChecklistStatus,
  deploymentChecklist,
} from '@/data/deploymentChecklist';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { getBackendStatus } from '@/utils/backendStatus';

type ReadinessFilter = 'All' | DeploymentChecklistStatus;

const filters: ReadinessFilter[] = ['All', 'Complete', 'Mock', 'Pending'];
const migrationPlan = [
  ['Phase 1', 'Replace AsyncStorage with backend persistence'],
  ['Phase 2', 'Add real authentication'],
  ['Phase 3', 'Add workspace/team tables'],
  ['Phase 4', 'Add grant ingestion pipeline'],
  ['Phase 5', 'Add AI matching and proposal generation APIs'],
  ['Phase 6', 'Add payment/subscription enforcement'],
];
const demoDeploymentSteps = [
  'Validate app',
  'Run Expo Doctor',
  'Export web build',
  'Deploy static output',
  'Test demo login',
  'Test core workflows',
];
const remainingDataMigrations = [
  'notification preferences',
  'workspace preferences',
];
const backendMigrationStatus = [
  ['Auth', 'Migrated', 'Supabase', 'Harden auth flows and invite workflows.'],
  ['RLS helper functions', 'Backend-ready', 'Supabase SQL', 'Run updated schema.sql and complete production security review.'],
  ['Profiles', 'Migrated', 'Supabase', 'Profile RLS drafted for own-profile access only.'],
  ['Workspaces', 'Migrated', 'Supabase', 'Workspace RLS drafted for member access and owner/admin updates.'],
  ['Workspace members', 'Migrated', 'Supabase', 'Member RLS drafted for roster reads and owner/admin management.'],
  ['Saved grants', 'Migrated', 'Supabase', 'Connect real grant UUIDs after ingestion.'],
  ['Proposal drafts', 'Migrated', 'Supabase', 'Proposal RLS drafted for owner and workspace-member access.'],
  ['Tracked applications', 'Migrated', 'Supabase', 'Application RLS drafted for workspace read and role-scoped writes.'],
  ['Checklists', 'Migrated', 'Supabase', 'Checklist RLS follows owning user or parent application workspace.'],
  ['Review comments', 'Migrated', 'Supabase', 'Comment RLS drafted for workspace reads, member inserts, and scoped deletes.'],
  ['Activity log', 'Migrated', 'Supabase', 'Activity RLS drafted for workspace reads and inserts; client deletes are blocked.'],
  ['Notification preferences', 'Local-only', 'AsyncStorage', 'Persist preferences to Supabase.'],
  ['Subscription data', 'Backend-ready', 'Mock', 'Connect payments and entitlements.'],
  ['Production security review', 'Pending', 'Manual review', 'Review policies with two-user/two-workspace test cases before launch.'],
];
const readinessSections = [
  ['Backend status', 'Core product records now have Supabase sync paths with local fallback.'],
  ['AI status', 'Frontend mock AI is active; backend-only endpoint architecture is documented.'],
  ['Grant ingestion status', 'Mock grant sources and ingestion run architecture are in place.'],
  ['Subscription/payment status', 'Plan comparison and usage warnings are mock-only; payments are not connected.'],
  ['Deployment status', 'Expo validation and EAS/static web guidance are documented.'],
  ['Legal status', 'Privacy and Terms placeholders require legal review.'],
  ['QA status', 'Manual QA checklist exists in docs/QA_CHECKLIST.md.'],
  ['Documentation status', 'Architecture, backend migration, AI, deployment, and QA docs are available.'],
];

export default function DeployReadinessScreen() {
  const router = useRouter();
  const { authMode, sessionUser } = useGrantMatch();
  const backendStatus = getBackendStatus(authMode, sessionUser);
  const [activeFilter, setActiveFilter] = useState<ReadinessFilter>('All');
  const counts: Record<DeploymentChecklistStatus, number> = {
    Complete: 0,
    Mock: 0,
    Pending: 0,
  };

  deploymentChecklist.forEach((item) => {
    counts[item.status] += 1;
  });

  const visibleItems =
    activeFilter === 'All'
      ? deploymentChecklist
      : deploymentChecklist.filter((item) => item.status === activeFilter);

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="Launch checklist"
        title="Deploy Readiness"
        subtitle="A practical view of what is demo-ready, what is intentionally mocked, and what remains before production launch."
      />

      <DemoModeBanner />

      <View style={styles.messageGrid}>
        <ReadinessMessage title="Demo-ready" tone="success" />
        <ReadinessMessage title="Backend required before production" tone="warning" />
        <ReadinessMessage title="Legal review required before public launch" tone="warning" />
      </View>

      <AppCard style={styles.appInfoCard}>
        <Text style={styles.migrationTitle}>Build info</Text>
        <Text style={styles.explanation}>
          {appInfo.appName} v{appInfo.version} is running in {appInfo.environment} mode with{' '}
          {appInfo.platformSupport.join(', ')} support. Build status: {appInfo.buildStatus}.
        </Text>
      </AppCard>

      <AppCard style={styles.migrationCard}>
        <Text style={styles.migrationTitle}>Backend Migration Status</Text>
        <View style={styles.stepGrid}>
          {backendMigrationStatus.map(([name, status, storage, nextAction]) => (
            <View key={name} style={styles.backendItem}>
              <Text style={styles.phase}>{name}</Text>
              <Text style={styles.phaseAction}>{status} • {storage}</Text>
              <Text style={styles.explanation}>{nextAction}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard style={styles.migrationCard}>
        <Text style={styles.migrationTitle}>Production Readiness Sections</Text>
        <View style={styles.migrationList}>
          {readinessSections.map(([title, detail]) => (
            <View key={title} style={styles.migrationItem}>
              <Text style={styles.phase}>{title}</Text>
              <Text style={styles.phaseAction}>{detail}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard style={styles.migrationCard}>
        <Text style={styles.migrationTitle}>Production Tools</Text>
        <View style={styles.toolGrid}>
          <AppButton title="Sync Center" variant="secondary" onPress={() => router.push('/sync-center')} />
          <AppButton title="Grant Sources" variant="secondary" onPress={() => router.push('/grant-sources')} />
          <AppButton title="Match Lab" variant="secondary" onPress={() => router.push('/match-lab')} />
          <AppButton title="Proposal Review" variant="secondary" onPress={() => router.push('/proposal-review')} />
          <AppButton title="Institution Admin" variant="secondary" onPress={() => router.push('/institution-admin')} />
          <AppButton title="Subscription" variant="secondary" onPress={() => router.push('/subscription')} />
          <AppButton title="Data Management" variant="secondary" onPress={() => router.push('/data-management')} />
          <AppButton title="Audit Log" variant="secondary" onPress={() => router.push('/audit-log')} />
        </View>
      </AppCard>

      <AppCard style={styles.appInfoCard}>
        <Text style={styles.migrationTitle}>Supabase foundation</Text>
        <Text style={styles.explanation}>
          Supabase client: added. Supabase configured:{' '}
          {backendStatus.isSupabaseConfigured ? 'yes' : 'no'}. Supabase client available:{' '}
          {backendStatus.isSupabaseClientAvailable ? 'yes' : 'no'}. Auth mode:{' '}
          {backendStatus.authMode}. Session source: {backendStatus.sessionSource}. Profile table
          integration and workspace table integration are active for Supabase sessions. Saved
          grants, proposal drafts, tracked applications, application checklists, review comments,
          activity log, and workspace members have Supabase sync paths. Database schema draft:
          available at supabase/schema.sql.
        </Text>
        <Text style={styles.nextAction}>
          Remaining migrations pending: {remainingDataMigrations.join(', ')}.
        </Text>
      </AppCard>

      <AppCard style={styles.appInfoCard}>
        <Text style={styles.migrationTitle}>AI backend security</Text>
        <Text style={styles.explanation}>
          Frontend mock AI: active. Backend AI endpoint connected:{' '}
          {backendStatus.isBackendAiConfigured ? 'yes' : 'no'}. OpenAI keys must stay backend-only and must
          never be placed in Expo frontend code or public environment variables. Edge Function
          scaffold documentation: available at supabase/functions/README.md. AI evaluation and
          safety review are pending before production launch.
        </Text>
      </AppCard>

      <View style={styles.summaryGrid}>
        {(['Complete', 'Mock', 'Pending'] as const).map((status) => (
          <AppCard key={status} style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{counts[status]}</Text>
            <Text style={styles.summaryLabel}>{status}</Text>
          </AppCard>
        ))}
      </View>

      <View style={styles.filterRow}>
        {filters.map((filter) => {
          const selected = activeFilter === filter;

          return (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterChip, selected && styles.activeFilterChip]}>
              <Text style={[styles.filterText, selected && styles.activeFilterText]}>{filter}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.safetyText}>
        No real data should be entered yet. Local data is stored only on this device or browser.
        Backend connection is required for team production use.
      </Text>

      <View style={styles.list}>
        {visibleItems.map((item) => (
          <AppCard key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.itemTitleGroup}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.itemTitle}>{item.title}</Text>
              </View>
              <Text
                style={[
                  styles.statusBadge,
                  item.status === 'Complete' && styles.completeBadge,
                  item.status === 'Mock' && styles.mockBadge,
                ]}>
                {item.status}
              </Text>
            </View>
            <Text style={styles.explanation}>{item.explanation}</Text>
            <Text style={styles.nextAction}>Next: {item.nextAction}</Text>
          </AppCard>
        ))}
      </View>

      <AppCard style={styles.migrationCard}>
        <Text style={styles.migrationTitle}>Demo Deployment Steps</Text>
        <Text style={styles.explanation}>
          Use this sequence when publishing a mock web demo. It does not require backend services,
          secrets, app store credentials, or payment setup.
        </Text>
        <View style={styles.stepGrid}>
          {demoDeploymentSteps.map((step, index) => (
            <View key={step} style={styles.stepItem}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.phaseAction}>{step}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard style={styles.migrationCard}>
        <Text style={styles.migrationTitle}>Backend Migration Plan</Text>
        <Text style={styles.explanation}>
          The app keeps working offline today, while these phases describe how to move each mock
          layer into production services.
        </Text>
        <View style={styles.migrationList}>
          {migrationPlan.map(([phase, action]) => (
            <View key={phase} style={styles.migrationItem}>
              <Text style={styles.phase}>{phase}</Text>
              <Text style={styles.phaseAction}>{action}</Text>
            </View>
          ))}
        </View>
      </AppCard>

      <AppHealthPanel />
    </ScreenContainer>
  );
}

function ReadinessMessage({ title, tone }: { title: string; tone: 'success' | 'warning' }) {
  return (
    <Text style={[styles.readinessMessage, tone === 'success' && styles.successMessage]}>
      {title}
    </Text>
  );
}

const styles = StyleSheet.create({
  messageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  readinessMessage: {
    backgroundColor: brand.colors.warningSoft,
    borderRadius: 14,
    color: brand.colors.warning,
    flexBasis: 220,
    flexGrow: 1,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
    padding: 14,
  },
  successMessage: {
    backgroundColor: brand.colors.successSoft,
    color: brand.colors.success,
  },
  appInfoCard: {
    gap: 10,
    marginBottom: 18,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  summaryCard: {
    flexBasis: 160,
    flexGrow: 1,
  },
  summaryValue: {
    color: brand.colors.ink,
    fontSize: 28,
    fontWeight: '900',
  },
  summaryLabel: {
    color: brand.colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderColor: brand.colors.subtle,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  activeFilterChip: {
    backgroundColor: brand.colors.primary,
    borderColor: brand.colors.primary,
  },
  filterText: {
    color: brand.colors.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  safetyText: {
    backgroundColor: '#FFFFFF',
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    color: brand.colors.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 18,
    padding: 14,
  },
  list: {
    gap: 12,
    marginBottom: 18,
  },
  itemCard: {
    gap: 10,
  },
  itemHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  itemTitleGroup: {
    flex: 1,
    minWidth: 220,
  },
  category: {
    color: brand.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  itemTitle: {
    color: brand.colors.ink,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  statusBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    color: brand.colors.muted,
    fontSize: 12,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  completeBadge: {
    backgroundColor: brand.colors.successSoft,
    color: brand.colors.success,
  },
  mockBadge: {
    backgroundColor: brand.colors.warningSoft,
    color: brand.colors.warning,
  },
  explanation: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  nextAction: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  migrationCard: {
    gap: 12,
    marginBottom: 18,
  },
  migrationTitle: {
    color: brand.colors.ink,
    fontSize: 21,
    fontWeight: '900',
  },
  migrationList: {
    gap: 10,
  },
  migrationItem: {
    backgroundColor: brand.colors.background,
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  stepGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stepItem: {
    alignItems: 'center',
    backgroundColor: brand.colors.background,
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: 170,
    flexDirection: 'row',
    flexGrow: 1,
    gap: 10,
    padding: 12,
  },
  backendItem: {
    backgroundColor: brand.colors.background,
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: 230,
    flexGrow: 1,
    gap: 6,
    padding: 12,
  },
  toolGrid: {
    gap: 10,
  },
  stepNumber: {
    backgroundColor: brand.colors.primary,
    borderRadius: 999,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  phase: {
    color: brand.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  phaseAction: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
});
