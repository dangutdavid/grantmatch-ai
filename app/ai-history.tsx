import { ReactNode, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { InfoBanner } from '@/components/InfoBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import {
  AiMatchScoreHistoryItem,
  AiRunHistoryItem,
  buildLocalAiRunHistory,
  fetchAiMatchScoreHistory,
  fetchAiRunHistory,
} from '@/services/aiHistoryService';
import { getAiBackendMode } from '@/services/aiService';

export default function AiHistoryScreen() {
  const { activityLog, authMode, currentWorkspace } = useGrantMatch();
  const [isLoading, setIsLoading] = useState(false);
  const [matchScores, setMatchScores] = useState<AiMatchScoreHistoryItem[]>([]);
  const [aiRuns, setAiRuns] = useState<AiRunHistoryItem[]>(() => buildLocalAiRunHistory(activityLog));
  const [lastLoadedAt, setLastLoadedAt] = useState(new Date().toISOString());

  const averageMatchScore = useMemo(() => {
    if (matchScores.length === 0) {
      return undefined;
    }

    return Math.round(
      matchScores.reduce((total, item) => total + item.confidenceScore, 0) / matchScores.length
    );
  }, [matchScores]);

  async function loadAiHistory() {
    setIsLoading(true);

    try {
      const [remoteScores, remoteRuns] = await Promise.all([
        fetchAiMatchScoreHistory(currentWorkspace.id),
        fetchAiRunHistory(currentWorkspace.id),
      ]);

      setMatchScores(remoteScores ?? []);
      setAiRuns(remoteRuns ?? buildLocalAiRunHistory(activityLog));
      setLastLoadedAt(new Date().toISOString());
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAiHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspace.id]);

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="AI operations"
        title="AI History"
        subtitle="Review persisted match scores and proposal/review run history for the active workspace."
      />

      <InfoBanner
        tone={authMode === 'supabase' ? 'info' : 'warning'}
        text={
          authMode === 'supabase'
            ? 'Supabase sessions load AI history from persisted rows when the schema has been applied.'
            : 'Demo mode shows local AI activity fallback. Persisted AI history requires Supabase email login.'
        }
      />

      <View style={styles.summaryGrid}>
        <SummaryCard label="AI mode" value={getAiBackendMode() === 'backend' ? 'Backend' : 'Mock'} />
        <SummaryCard label="Stored runs" value={String(aiRuns.length)} />
        <SummaryCard label="Stored scores" value={String(matchScores.length)} />
        <SummaryCard label="Average match" value={averageMatchScore ? `${averageMatchScore}%` : 'None'} />
      </View>

      <AppCard style={styles.card}>
        <Text style={styles.title}>History controls</Text>
        <Text style={styles.meta}>Workspace: {currentWorkspace.name}</Text>
        <Text style={styles.meta}>Last loaded: {new Date(lastLoadedAt).toLocaleString()}</Text>
        <AppButton
          disabled={isLoading}
          title={isLoading ? 'Refreshing AI History...' : 'Refresh AI History'}
          variant="secondary"
          onPress={loadAiHistory}
        />
      </AppCard>

      <Section title="Proposal and review runs">
        {aiRuns.length === 0 ? (
          <EmptyState title="No AI runs yet" message="Run proposal generation, improvement, or review to populate this history." />
        ) : (
          <View style={styles.list}>
            {aiRuns.map((run) => (
              <AppCard key={run.id} style={styles.item}>
                <Text style={styles.itemTitle}>{formatOperation(run.operation)}</Text>
                <Text style={styles.badge}>{run.status}</Text>
                <Text style={styles.meta}>{run.resultSummary}</Text>
                {run.draftExternalId ? <Text style={styles.meta}>Draft: {run.draftExternalId}</Text> : null}
                <Text style={styles.timestamp}>{new Date(run.createdAt).toLocaleString()}</Text>
              </AppCard>
            ))}
          </View>
        )}
      </Section>

      <Section title="Grant match scores">
        {matchScores.length === 0 ? (
          <EmptyState title="No persisted match scores" message="Run Match Lab while signed in with Supabase to store match scores." />
        ) : (
          <View style={styles.list}>
            {matchScores.map((score) => (
              <AppCard key={score.id} style={styles.item}>
                <Text style={styles.itemTitle}>{score.grantExternalId}</Text>
                <Text style={styles.score}>{score.confidenceScore}% confidence</Text>
                <Text style={styles.meta}>{score.explanation}</Text>
                <Text style={styles.timestamp}>{new Date(score.createdAt).toLocaleString()}</Text>
              </AppCard>
            ))}
          </View>
        )}
      </Section>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <AppCard style={styles.summaryCard}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </AppCard>
  );
}

function formatOperation(operation: string) {
  return operation
    .replace(/^ai_/, '')
    .replace(/-/g, ' ')
    .replace(/_/g, ' ');
}

const styles = StyleSheet.create({
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  summaryCard: { flexBasis: 150, flexGrow: 1, gap: 4 },
  summaryValue: { color: brand.colors.ink, fontSize: 22, fontWeight: '900' },
  summaryLabel: { color: brand.colors.muted, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  card: { gap: 8, marginBottom: 16 },
  title: { color: brand.colors.ink, fontSize: 18, fontWeight: '900' },
  meta: { color: brand.colors.muted, fontSize: 13, lineHeight: 19 },
  section: { gap: 10, marginTop: 10 },
  sectionTitle: { color: brand.colors.ink, fontSize: 20, fontWeight: '900' },
  list: { gap: 12 },
  item: { gap: 7 },
  itemTitle: { color: brand.colors.ink, fontSize: 16, fontWeight: '900', textTransform: 'capitalize' },
  badge: { alignSelf: 'flex-start', backgroundColor: brand.colors.successSoft, borderRadius: 999, color: brand.colors.success, fontSize: 12, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 6, textTransform: 'uppercase' },
  score: { color: brand.colors.success, fontSize: 15, fontWeight: '900' },
  timestamp: { color: brand.colors.muted, fontSize: 12, fontWeight: '700' },
});
