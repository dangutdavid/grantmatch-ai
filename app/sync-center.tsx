import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { InfoBanner } from '@/components/InfoBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { getAiBackendMode } from '@/services/aiService';
import {
  getSupabaseDiagnostics,
  logSupabaseDiagnostics,
  SupabaseConnectivityResult,
  SupabaseDiagnostics,
  SupabaseHealthResult,
  testSupabaseConnectivity,
} from '@/services/supabaseDiagnostics';
import { getBackendStatus } from '@/utils/backendStatus';
import { buildSyncEntityStatuses, formatLastSyncedAt, getSyncStatusMessage } from '@/utils/sync';

export default function SyncCenterScreen() {
  const router = useRouter();
  const { authMode, sessionUser, isAuthenticated } = useGrantMatch();
  const [refreshedAt, setRefreshedAt] = useState(new Date().toISOString());
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [diagnostics, setDiagnostics] = useState<SupabaseDiagnostics>(() => getSupabaseDiagnostics());
  const [connectivityResult, setConnectivityResult] = useState<SupabaseConnectivityResult | undefined>();
  const backendStatus = getBackendStatus(authMode, sessionUser);
  const statuses = buildSyncEntityStatuses(authMode).map((item) => ({
    ...item,
    lastSyncedAt: item.lastSyncedAt ? refreshedAt : item.lastSyncedAt,
  }));

  async function handleRefreshSyncStatus() {
    setRefreshedAt(new Date().toISOString());
    setDiagnostics(logSupabaseDiagnostics());
  }

  async function handleTestSupabaseConnection() {
    setIsTestingSupabase(true);
    setDiagnostics(logSupabaseDiagnostics());

    try {
      const result = await testSupabaseConnectivity();
      console.info('GrantMatch AI Supabase connectivity result', result);
      setConnectivityResult(result);
    } finally {
      setIsTestingSupabase(false);
    }
  }

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="System"
        title="Sync Center"
        subtitle="Review local fallback, Supabase readiness, and entity-level sync status."
      />

      <InfoBanner text="Sync Center is a demo operations surface. It reports the active storage mode and preserves local fallback behavior." />

      {!backendStatus.isSupabaseConfigured ? (
        <InfoBanner tone="warning" text="Supabase is not configured. GrantMatch AI is safely using local fallback storage." />
      ) : null}

      <AppCard style={styles.card}>
        <Text style={styles.title}>Session</Text>
        <Text style={styles.text}>Backend status: {backendStatus.statusLabel}</Text>
        <Text style={styles.text}>Auth mode: {backendStatus.authMode === 'supabase' ? 'Supabase' : 'Mock/local'}</Text>
        <Text style={styles.text}>Session source: {backendStatus.sessionSource}</Text>
        <Text style={styles.text}>Profile source: {backendStatus.profileSource}</Text>
        <Text style={styles.text}>Workspace source: {backendStatus.workspaceSource}</Text>
        <Text style={styles.text}>Supabase configured: {backendStatus.isSupabaseConfigured ? 'Yes' : 'No'}</Text>
        <Text style={styles.text}>Supabase client available: {backendStatus.isSupabaseClientAvailable ? 'Yes' : 'No'}</Text>
        <Text style={styles.text}>Session: {isAuthenticated ? sessionUser?.email ?? 'Active' : 'Signed out'}</Text>
        <Text style={styles.text}>AI mode: {getAiBackendMode() === 'backend' ? 'Backend' : 'Mock'}</Text>
        <Text style={styles.text}>Backend AI configured: {backendStatus.isBackendAiConfigured ? 'Yes' : 'No'}</Text>
        <Text style={styles.text}>Proposal generation: {backendStatus.isBackendAiConfigured ? 'Backend endpoint' : 'Mock fallback'}</Text>
        <Text style={styles.text}>Grant matching: {backendStatus.isBackendAiConfigured ? 'Backend endpoint' : 'Mock fallback'}</Text>
        <Text style={styles.text}>Review assistant: {backendStatus.isBackendAiConfigured ? 'Backend endpoint' : 'Mock fallback'}</Text>
        <Text style={styles.text}>Last refreshed: {formatLastSyncedAt(refreshedAt)}</Text>
      </AppCard>

      <AppCard style={styles.card}>
        <Text style={styles.title}>Supabase diagnostics</Text>
        <DiagnosticRow label="URL" value={diagnostics.supabaseUrl} />
        <DiagnosticRow label="Project ref from URL" value={diagnostics.projectRefFromUrl} />
        <DiagnosticRow label="Project ref from key" value={diagnostics.anonKeyProjectRef} />
        <DiagnosticRow label="URL/key project match" value={diagnostics.projectRefMatchesKey} />
        <DiagnosticRow label="Anon/publishable key exists" value={diagnostics.anonKeyExists ? 'Yes' : 'No'} />
        <DiagnosticRow label="Anon/publishable key length" value={String(diagnostics.anonKeyLength)} />
        <DiagnosticRow label="Client is null" value={diagnostics.isSupabaseClientNull ? 'Yes' : 'No'} />
        <DiagnosticRow label="Platform" value={diagnostics.platform} />
        <DiagnosticRow label="Window exists" value={diagnostics.windowExists ? 'Yes' : 'No'} />
        <AppButton
          disabled={isTestingSupabase}
          title={isTestingSupabase ? 'Testing Supabase...' : 'Test Supabase Connection'}
          variant="secondary"
          onPress={handleTestSupabaseConnection}
        />
        {connectivityResult ? (
          <View style={styles.healthResult}>
            <Text style={styles.connectivityMessage}>{connectivityResult.message}</Text>
            <Text style={styles.nextAction}>Next action: {connectivityResult.nextAction}</Text>
            <EndpointDiagnostics title="Browser network probe" result={connectivityResult.browserProbe} />
            <EndpointDiagnostics title="REST endpoint" result={connectivityResult.rest} />
            <EndpointDiagnostics title="Auth endpoint" result={connectivityResult.auth} />
          </View>
        ) : null}
      </AppCard>

      <View style={styles.grid}>
        {statuses.map((item) => (
          <AppCard key={item.entity} style={styles.item}>
            <Text style={styles.itemTitle}>{item.label}</Text>
            <Text style={styles.badge}>{item.mode}</Text>
            <Text style={styles.text}>{getSyncStatusMessage(item.status, item.mode)}</Text>
            <Text style={styles.meta}>Last synced: {formatLastSyncedAt(item.lastSyncedAt)}</Text>
            {item.warning ? <Text style={styles.warning}>{item.warning}</Text> : null}
          </AppCard>
        ))}
      </View>

      <View style={styles.actions}>
        <AppButton title="Refresh Sync Status" onPress={handleRefreshSyncStatus} />
        <AppButton title="Deploy Readiness" variant="secondary" onPress={() => router.push('/deploy-readiness')} />
        <AppButton title="Settings" variant="secondary" onPress={() => router.push('/settings')} />
      </View>
    </ScreenContainer>
  );
}

function DiagnosticRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.diagnosticRow}>
      <Text style={styles.diagnosticLabel}>{label}</Text>
      <Text style={styles.diagnosticValue}>{value}</Text>
    </View>
  );
}

function EndpointDiagnostics({
  title,
  result,
}: {
  title: string;
  result: SupabaseHealthResult;
}) {
  return (
    <View style={styles.endpointBlock}>
      <Text style={styles.endpointTitle}>{title}</Text>
      <DiagnosticRow label={`${result.endpoint} URL`} value={result.url} />
      <DiagnosticRow label={`${result.endpoint} reachable`} value={result.reachable ? 'Yes' : 'No'} />
      <DiagnosticRow label={`${result.endpoint} fetch ok`} value={result.ok ? 'Yes' : 'No'} />
      <DiagnosticRow
        label={`${result.endpoint} status`}
        value={result.status ? `${result.status} ${result.statusText ?? ''}` : 'No response'}
      />
      <DiagnosticRow label={`${result.endpoint} error name`} value={result.errorName ?? 'None'} />
      <DiagnosticRow label={`${result.endpoint} error message`} value={result.errorMessage ?? 'None'} />
      <DiagnosticRow label={`${result.endpoint} response`} value={result.bodyPreview ?? 'None'} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 8, marginBottom: 16 },
  title: { color: brand.colors.ink, fontSize: 20, fontWeight: '900' },
  text: { color: brand.colors.muted, fontSize: 14, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  item: { flexBasis: 240, flexGrow: 1, gap: 8 },
  itemTitle: { color: brand.colors.ink, fontSize: 16, fontWeight: '900' },
  badge: { alignSelf: 'flex-start', backgroundColor: brand.colors.successSoft, borderRadius: 999, color: brand.colors.success, fontSize: 12, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 6 },
  meta: { color: brand.colors.muted, fontSize: 12 },
  warning: { color: brand.colors.warning, fontSize: 12, fontWeight: '800' },
  actions: { gap: 10, marginTop: 18 },
  diagnosticRow: { gap: 3 },
  diagnosticLabel: { color: brand.colors.primary, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  diagnosticValue: { color: brand.colors.muted, fontSize: 13, lineHeight: 18 },
  healthResult: { borderColor: brand.colors.subtle, borderRadius: 12, borderWidth: 1, gap: 8, padding: 10 },
  connectivityMessage: { backgroundColor: brand.colors.accentSoft, borderRadius: 10, color: brand.colors.ink, fontSize: 13, fontWeight: '800', lineHeight: 19, padding: 10 },
  nextAction: { color: brand.colors.muted, fontSize: 13, fontWeight: '700', lineHeight: 19 },
  endpointBlock: { borderTopColor: brand.colors.subtle, borderTopWidth: 1, gap: 7, paddingTop: 10 },
  endpointTitle: { color: brand.colors.ink, fontSize: 14, fontWeight: '900' },
});
