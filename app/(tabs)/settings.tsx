import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppHealthPanel } from '@/components/AppHealthPanel';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { appInfo } from '@/constants/appInfo';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { NotificationPreferences, WorkspacePreferences } from '@/types';
import { getBackendStatus } from '@/utils/backendStatus';

const notificationOptions: {
  key: keyof NotificationPreferences;
  title: string;
  description: string;
}[] = [
  {
    key: 'deadlineReminders',
    title: 'Deadline reminders',
    description: 'Mock preference for application deadline nudges.',
  },
  {
    key: 'proposalReviewReminders',
    title: 'Proposal review reminders',
    description: 'Local preference for reviewer and finance follow-ups.',
  },
  {
    key: 'savedGrantUpdates',
    title: 'Saved grant updates',
    description: 'Future alerts for saved opportunity changes.',
  },
  {
    key: 'weeklyDigest',
    title: 'Weekly digest',
    description: 'Future summary of matches, drafts, applications, and team activity.',
  },
  {
    key: 'teamActivityUpdates',
    title: 'Team activity updates',
    description: 'Future notifications when collaborators comment or change status.',
  },
];

const currencyOptions = ['USD', 'GBP', 'EUR'];
const organisationTypes = ['Researcher', 'NGO', 'Startup', 'Institution'];

function PreferenceToggle({
  title,
  description,
  enabled,
  onPress,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceText}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled }}
        onPress={onPress}
        style={[styles.switchTrack, enabled && styles.switchTrackEnabled]}>
        <View style={[styles.switchThumb, enabled && styles.switchThumbEnabled]} />
      </Pressable>
    </View>
  );
}

function OptionButton<T extends string>({
  label,
  value,
  selectedValue,
  onSelect,
}: {
  label: string;
  value: T;
  selectedValue: T;
  onSelect: (value: T) => void;
}) {
  const selected = value === selectedValue;

  return (
    <Pressable
      onPress={() => onSelect(value)}
      style={[styles.optionButton, selected && styles.optionButtonSelected]}>
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const {
    currentUser,
    currentWorkspace,
    workspaceMembers,
    savedGrantIds,
    proposalDrafts,
    trackedApplications,
    reviewComments,
    activityLog,
    notificationPreferences,
    workspacePreferences,
    resetDemoData,
    resetOnboarding,
    logout,
    toggleNotificationPreference,
    updateWorkspacePreference,
    recordDataExport,
    authMode,
    sessionUser,
  } = useGrantMatch();
  const [exportGeneratedAt, setExportGeneratedAt] = useState<string | undefined>();
  const backendStatus = getBackendStatus(authMode, sessionUser);

  const exportSummary = useMemo(
    () => [
      ['Saved grants', savedGrantIds.length],
      ['Proposal drafts', proposalDrafts.length],
      ['Tracked applications', trackedApplications.length],
      ['Workspace members', workspaceMembers.length],
      ['Review comments', reviewComments.length],
      ['Activity log items', activityLog.length],
    ],
    [
      activityLog.length,
      proposalDrafts.length,
      reviewComments.length,
      savedGrantIds.length,
      trackedApplications.length,
      workspaceMembers.length,
    ]
  );

  function handleExportSummary() {
    setExportGeneratedAt(new Date().toLocaleString());
    recordDataExport();
  }

  function updatePreference<K extends keyof WorkspacePreferences>(
    field: K,
    value: WorkspacePreferences[K]
  ) {
    updateWorkspacePreference(field, value);
  }

  function handleResetOnboarding() {
    resetOnboarding();
    router.replace('/onboarding');
  }

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="Workspace controls"
        title="Settings"
        subtitle="Manage local SaaS preferences, mock account controls, readiness links, and prototype health."
      />

      <DemoModeBanner />

      <Text style={styles.sectionHeading}>Account</Text>
      <View style={styles.grid}>
        <AppCard style={styles.card}>
          <Text style={styles.cardEyebrow}>Account</Text>
          <Text style={styles.cardTitle}>{currentUser.fullName}</Text>
          <Text style={styles.itemDescription}>
            {currentUser.userType} profile for {currentUser.organisation}. Backend status:{' '}
            {backendStatus.statusLabel}. Session source: {backendStatus.sessionSource}.
          </Text>
          <View style={styles.actions}>
            <AppButton title="Open Profile" variant="secondary" onPress={() => router.push('/profile')} />
            <AppButton title="Logout" variant="danger" onPress={handleLogout} />
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.cardEyebrow}>Subscription</Text>
          <Text style={styles.cardTitle}>{currentWorkspace.subscriptionTier} mock plan</Text>
          <Text style={styles.itemDescription}>
            Billing, plan enforcement, invoices, seats, and upgrades are placeholders until payments are added.
          </Text>
        </AppCard>
      </View>

      <Text style={styles.sectionHeading}>App status</Text>
      <AppCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>App version and safety</Text>
        <Text style={styles.itemDescription}>
          {appInfo.appName} v{appInfo.version} is {appInfo.buildStatus} in {appInfo.environment}
          mode for {appInfo.platformSupport.join(', ')}.
        </Text>
        <Text style={styles.itemDescription}>
          Supabase configured: {backendStatus.isSupabaseConfigured ? 'Yes' : 'No'}.
          Supabase client available: {backendStatus.isSupabaseClientAvailable ? 'Yes' : 'No'}.
          Auth mode: {backendStatus.authMode === 'supabase' ? 'Supabase' : 'Mock/local'}.
          Profile source: {backendStatus.profileSource}. Workspace source:{' '}
          {backendStatus.workspaceSource}.
        </Text>
        <Text style={styles.safetyText}>
          No real data should be entered yet. Local data is stored only on this device or browser.
          Reset Demo Data clears local prototype data. Backend connection is required for team
          production use.
        </Text>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Sync status</Text>
        <Text style={styles.itemDescription}>
          {backendStatus.detail}
        </Text>
        <View style={styles.syncGrid}>
          {[
            'Saved grants',
            'Proposal drafts',
            'Tracker',
            'Checklists',
            'Comments',
            'Activity',
            'Workspace members',
            'Application collaborators',
            'Workspace preferences',
            'Notification preferences',
          ].map((label) => (
            <View key={label} style={styles.syncItem}>
              <Text style={styles.syncLabel}>{label}</Text>
              <Text style={styles.syncValue}>
                {backendStatus.isSupabaseSession ? 'Supabase' : 'Local'}
              </Text>
            </View>
          ))}
        </View>
      </AppCard>

      <Text style={styles.sectionHeading}>Workspace</Text>
      <AppCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Workspace controls</Text>
        <Text style={styles.itemDescription}>
          Open the active workspace, admin overview, or tune mock review workflow preferences.
        </Text>
        <View style={styles.actions}>
          <AppButton title="Open Workspace" variant="secondary" onPress={() => router.push('/workspace')} />
          <AppButton title="Institution Admin" variant="secondary" onPress={() => router.push('/institution-admin')} />
        </View>
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Workspace preferences</Text>
        <Text style={styles.itemDescription}>
          {backendStatus.isSupabaseSession
            ? 'Saved to Supabase for this workspace, with local fallback kept responsive.'
            : 'Stored locally for Demo Login until Supabase email auth is active.'}
        </Text>

        <SettingInput
          label="Workspace name"
          value={workspacePreferences.workspaceName}
          onChangeText={(value) => updatePreference('workspaceName', value)}
        />

        <View style={styles.preferenceBlock}>
          <Text style={styles.optionLabel}>Organisation type</Text>
          <View style={styles.optionWrap}>
            {organisationTypes.map((type) => (
              <OptionButton
                key={type}
                label={type}
                value={type}
                selectedValue={workspacePreferences.organisationType}
                onSelect={(value) => updatePreference('organisationType', value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.preferenceBlock}>
          <Text style={styles.optionLabel}>Default currency</Text>
          <View style={styles.optionWrap}>
            {currencyOptions.map((currency) => (
              <OptionButton
                key={currency}
                label={currency}
                value={currency}
                selectedValue={workspacePreferences.defaultCurrency}
                onSelect={(value) => updatePreference('defaultCurrency', value)}
              />
            ))}
          </View>
        </View>

        <SettingInput
          label="Preferred funding regions"
          value={workspacePreferences.preferredFundingRegions}
          onChangeText={(value) => updatePreference('preferredFundingRegions', value)}
          multiline
        />

        <PreferenceToggle
          title="Review workflow enabled"
          description="Show local review and collaboration controls for applications."
          enabled={workspacePreferences.reviewWorkflowEnabled}
          onPress={() =>
            updatePreference('reviewWorkflowEnabled', !workspacePreferences.reviewWorkflowEnabled)
          }
        />
        <PreferenceToggle
          title="Finance review required"
          description="Mock workflow rule for budget and compliance review."
          enabled={workspacePreferences.financeReviewRequired}
          onPress={() =>
            updatePreference('financeReviewRequired', !workspacePreferences.financeReviewRequired)
          }
        />
        <PreferenceToggle
          title="Internal review required"
          description="Mock workflow rule for internal approval before submission."
          enabled={workspacePreferences.internalReviewRequired}
          onPress={() =>
            updatePreference('internalReviewRequired', !workspacePreferences.internalReviewRequired)
          }
        />
      </AppCard>

      <Text style={styles.sectionHeading}>Product</Text>
      <AppCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Notification preferences</Text>
        <Text style={styles.itemDescription}>
          {backendStatus.isSupabaseSession
            ? 'Preference values persist in Supabase. Real email, push, and in-app delivery are not connected yet.'
            : 'These switches stay in local demo storage. No email, push, or in-app notification service is connected.'}
        </Text>
        <View style={styles.divider} />
        {notificationOptions.map((option) => (
          <PreferenceToggle
            key={option.key}
            title={option.title}
            description={option.description}
            enabled={notificationPreferences[option.key]}
            onPress={() => toggleNotificationPreference(option.key)}
          />
        ))}
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Data export summary</Text>
        <Text style={styles.itemDescription}>
          A mock summary of the local data footprint. Real export files should be generated securely by a backend.
        </Text>

        <View style={styles.summaryGrid}>
          {exportSummary.map(([label, value]) => (
            <View key={label} style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{value}</Text>
              <Text style={styles.summaryLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {exportGeneratedAt ? (
          <Text style={styles.successMessage}>
            Export Local Summary completed at {exportGeneratedAt}. This export is mock-only for now.
          </Text>
        ) : (
          <Text style={styles.helperText}>No file is downloaded in the local prototype.</Text>
        )}

        <AppButton title="Export Local Summary" variant="secondary" onPress={handleExportSummary} />
      </AppCard>

      <AppCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Product and admin center</Text>
        <Text style={styles.itemDescription}>
          Production-readiness tools for ingestion, AI matching, subscriptions, data controls, and admin workflows.
        </Text>
        <View style={styles.actions}>
          <AppButton title="Subscription" variant="secondary" onPress={() => router.push('/subscription')} />
          <AppButton title="Data Management" variant="secondary" onPress={() => router.push('/data-management')} />
          <AppButton title="Notification Center" variant="secondary" onPress={() => router.push('/notification-center' as never)} />
          <AppButton title="Grant Sources" variant="secondary" onPress={() => router.push('/grant-sources')} />
          <AppButton title="Match Lab" variant="secondary" onPress={() => router.push('/match-lab')} />
          <AppButton title="AI History" variant="secondary" onPress={() => router.push('/ai-history' as never)} />
          <AppButton title="Proposal Review Assistant" variant="secondary" onPress={() => router.push('/proposal-review')} />
          <AppButton title="Institution Admin" variant="secondary" onPress={() => router.push('/institution-admin')} />
        </View>
      </AppCard>

      <Text style={styles.sectionHeading}>System</Text>
      <AppCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>System controls</Text>
        <Text style={styles.itemDescription}>
          Monitor sync, audit events, app health, and launch readiness.
        </Text>
        <View style={styles.actions}>
          <AppButton title="Sync Center" variant="secondary" onPress={() => router.push('/sync-center')} />
          <AppButton title="Audit Log" variant="secondary" onPress={() => router.push('/audit-log')} />
          <AppButton title="Deploy Readiness" variant="secondary" onPress={() => router.push('/deploy-readiness')} />
        </View>
      </AppCard>

      <AppHealthPanel />

      <Text style={styles.sectionHeading}>Legal</Text>
      <AppCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Launch and legal</Text>
        <Text style={styles.itemDescription}>
          Review production placeholders and deploy-readiness before connecting real services.
        </Text>
        <View style={styles.actions}>
          <AppButton
            title="Deploy Readiness"
            variant="secondary"
            onPress={() => router.push('/deploy-readiness')}
          />
          <AppButton
            title="Privacy Policy"
            variant="secondary"
            onPress={() => router.push('/privacy-policy')}
          />
          <AppButton
            title="Terms of Service"
            variant="secondary"
            onPress={() => router.push('/terms-of-service')}
          />
        </View>
      </AppCard>

      <Text style={styles.sectionHeading}>Demo</Text>
      <AppCard style={styles.sectionCard}>
        <Text style={styles.cardTitle}>Demo controls</Text>
        <Text style={styles.itemDescription}>
          Reset local demo state or reopen onboarding to test a first-time setup.
        </Text>
        <View style={styles.actions}>
          <AppButton title="Reset Onboarding" variant="secondary" onPress={handleResetOnboarding} />
          <AppButton title="Reset Demo Data" variant="danger" onPress={resetDemoData} />
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

function SettingInput({
  label,
  value,
  onChangeText,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={styles.preferenceBlock}>
      <Text style={styles.optionLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        placeholderTextColor="#9CA3AF"
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 14,
  },
  card: {
    flexBasis: 280,
    flexGrow: 1,
    gap: 12,
  },
  sectionCard: {
    gap: 14,
    marginTop: 14,
  },
  sectionHeading: {
    color: brand.colors.primary,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 22,
    textTransform: 'uppercase',
  },
  cardEyebrow: {
    color: brand.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardTitle: {
    color: brand.colors.ink,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  itemTitle: {
    color: brand.colors.ink,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  itemDescription: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  divider: {
    backgroundColor: brand.colors.subtle,
    height: 1,
  },
  preferenceRow: {
    alignItems: 'center',
    borderBottomColor: brand.colors.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  preferenceText: {
    flex: 1,
  },
  switchTrack: {
    backgroundColor: '#D1D5DB',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 3,
    width: 56,
  },
  switchTrackEnabled: {
    backgroundColor: brand.colors.primary,
  },
  switchThumb: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    height: 26,
    width: 26,
  },
  switchThumbEnabled: {
    alignSelf: 'flex-end',
  },
  preferenceBlock: {
    gap: 10,
  },
  optionLabel: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: brand.colors.surface,
    borderColor: brand.colors.subtle,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionButtonSelected: {
    backgroundColor: brand.colors.primary,
    borderColor: brand.colors.primary,
  },
  optionText: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    color: brand.colors.ink,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 82,
    textAlignVertical: 'top',
  },
  helperText: {
    color: brand.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  safetyText: {
    backgroundColor: brand.colors.warningSoft,
    borderRadius: 14,
    color: brand.colors.warning,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryItem: {
    backgroundColor: brand.colors.background,
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: 145,
    flexGrow: 1,
    padding: 12,
  },
  summaryValue: {
    color: brand.colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  summaryLabel: {
    color: brand.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  syncGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  syncItem: {
    backgroundColor: brand.colors.background,
    borderColor: brand.colors.subtle,
    borderRadius: 12,
    borderWidth: 1,
    flexBasis: 150,
    flexGrow: 1,
    padding: 12,
  },
  syncLabel: {
    color: brand.colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  syncValue: {
    color: brand.colors.ink,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  successMessage: {
    backgroundColor: brand.colors.successSoft,
    borderRadius: 12,
    color: brand.colors.success,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: 12,
  },
  actions: {
    gap: 10,
  },
});
