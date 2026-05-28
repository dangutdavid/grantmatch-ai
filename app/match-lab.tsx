import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { InfoBanner } from '@/components/InfoBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { isBackendAiConfigured } from '@/constants/env';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { getAiBackendMode, rankGrantsForUser, requestGrantMatch } from '@/services/aiService';

export default function MatchLabScreen() {
  const { currentUser, currentWorkspace, grants } = useGrantMatch();
  const [ranked, setRanked] = useState(() => rankGrantsForUser({ profile: currentUser, grants }).slice(0, 5));
  const aiMode = getAiBackendMode();

  async function runMockMatch() {
    const response = await requestGrantMatch({
      profile: currentUser,
      grants,
      workspaceId: currentWorkspace.id,
    });
    setRanked(response.results.slice(0, 5));
  }

  return (
    <ScreenContainer>
      <PageHeader eyebrow="AI testing" title="Match Lab" subtitle="Inspect deterministic mock ranking signals for future AI matching." />
      <InfoBanner tone="warning" text="This is mock AI logic. No embeddings, OpenAI calls, or external APIs are used." />
      <AppCard style={styles.profile}>
        <Text style={styles.title}>AI mode: {aiMode === 'backend' ? 'Backend endpoint' : 'Mock AI'}</Text>
        <Text style={styles.meta}>Backend AI configured: {isBackendAiConfigured ? 'Yes' : 'No'}</Text>
        <Text style={styles.meta}>Future mode: authenticated backend endpoint or Supabase Edge Function, then OpenAI server-side.</Text>
      </AppCard>
      <AppCard style={styles.profile}>
        <Text style={styles.title}>{currentUser.fullName}</Text>
        <Text style={styles.meta}>{currentUser.userType} • {currentUser.organisation}</Text>
        <Text style={styles.meta}>Interests: {currentUser.researchInterests.join(', ') || 'Not set'}</Text>
      </AppCard>
      <View style={styles.actions}>
        <AppButton title="Run Mock Match" onPress={runMockMatch} />
        <AppButton
          title={isBackendAiConfigured ? 'Run Backend Match' : 'Backend Match unavailable until endpoint configured'}
          variant="secondary"
          onPress={runMockMatch}
        />
      </View>
      <View style={styles.list}>
        {ranked.map((result) => (
          <AppCard key={result.grant.id} style={styles.card}>
            <Text style={styles.title}>{result.grant.title}</Text>
            <Text style={styles.score}>{result.confidenceScore}% confidence</Text>
            <Text style={styles.meta}>Topic {result.topicFit}% • Eligibility {result.eligibilityFit}% • Deadline {result.deadlineReadiness}% • Funding {result.fundingFit}% • Strategic {result.strategicFit}%</Text>
            <Text style={styles.explanation}>{result.explanation.summary}</Text>
            {result.explanation.signals.map((signal) => (
              <Text key={signal.label} style={styles.meta}>{signal.label}: {signal.score}% - {signal.explanation}</Text>
            ))}
          </AppCard>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profile: { gap: 6, marginBottom: 14 },
  actions: { gap: 10 },
  list: { gap: 12, marginTop: 14 },
  card: { gap: 8 },
  title: { color: brand.colors.ink, fontSize: 18, fontWeight: '900' },
  score: { color: brand.colors.success, fontSize: 16, fontWeight: '900' },
  meta: { color: brand.colors.muted, fontSize: 13, lineHeight: 19 },
  explanation: { color: brand.colors.ink, fontSize: 14, fontWeight: '800', lineHeight: 20 },
});
