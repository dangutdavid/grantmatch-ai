import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { InfoBanner } from '@/components/InfoBanner';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { isBackendAiConfigured } from '@/constants/env';
import { useGrantMatch } from '@/hooks/use-grant-match';
import {
  generateBudgetJustificationMock,
  generateImpactStatementMock,
  generateReviewerQuestionsMock,
  getAiBackendMode,
  requestProposalReadinessScore,
  scoreProposalReadinessMock,
} from '@/services/aiService';

export default function ProposalReviewScreen() {
  const router = useRouter();
  const { currentWorkspace, proposalDrafts, saveDraft } = useGrantMatch();
  const [selectedDraftId, setSelectedDraftId] = useState(proposalDrafts[0]?.id);
  const [reviewedAt, setReviewedAt] = useState(new Date().toISOString());
  const selectedDraft = proposalDrafts.find((draft) => draft.id === selectedDraftId);
  const readiness = useMemo(() => scoreProposalReadinessMock(selectedDraft), [selectedDraft]);
  const aiMode = getAiBackendMode();

  function markReady() {
    if (!selectedDraft) return;
    saveDraft({ ...selectedDraft, status: 'Ready for Review', updatedAt: new Date().toISOString() });
  }

  async function runMockReview() {
    await requestProposalReadinessScore({
      draft: selectedDraft,
      workspaceId: currentWorkspace.id,
    });
    setReviewedAt(new Date().toISOString());
  }

  return (
    <ScreenContainer>
      <PageHeader eyebrow="AI review" title="Proposal Review Assistant" subtitle="Mock readiness scoring and reviewer preparation." />
      <InfoBanner tone="warning" text="This assistant uses deterministic mock scoring. Real AI generation will require secure backend endpoints." />
      <AppCard style={styles.card}>
        <Text style={styles.title}>AI mode: {aiMode === 'backend' ? 'Backend endpoint' : 'Mock AI'}</Text>
        <Text style={styles.meta}>Backend AI configured: {isBackendAiConfigured ? 'Yes' : 'No'}</Text>
        <Text style={styles.meta}>Future endpoint: authenticated backend review service, with OpenAI keys stored server-side only.</Text>
        <Text style={styles.meta}>Last mock review: {new Date(reviewedAt).toLocaleString()}</Text>
      </AppCard>
      {proposalDrafts.length === 0 ? (
        <EmptyState title="No proposal drafts yet" message="Create a draft in Proposal Builder to review it here." />
      ) : (
        <>
          <View style={styles.selector}>
            {proposalDrafts.map((draft) => (
              <Pressable key={draft.id} onPress={() => setSelectedDraftId(draft.id)} style={[styles.chip, draft.id === selectedDraftId && styles.activeChip]}>
                <Text style={[styles.chipText, draft.id === selectedDraftId && styles.activeChipText]}>{draft.proposalTitle}</Text>
              </Pressable>
            ))}
          </View>
          <AppCard style={styles.card}>
            <Text style={styles.title}>{selectedDraft?.proposalTitle}</Text>
            <Text style={styles.score}>{readiness.overall}% readiness</Text>
            <Text style={styles.meta}>Missing: {readiness.missingSections.join(', ') || 'None'}</Text>
            <Text style={styles.meta}>Weak: {readiness.weakSections.join(', ') || 'None'}</Text>
            <Text style={styles.titleSmall}>Reviewer questions</Text>
            {generateReviewerQuestionsMock(selectedDraft).map((question) => <Text key={question} style={styles.meta}>{question}</Text>)}
            <Text style={styles.titleSmall}>Budget feedback</Text>
            <Text style={styles.meta}>{generateBudgetJustificationMock(selectedDraft)}</Text>
            <Text style={styles.titleSmall}>Impact feedback</Text>
            <Text style={styles.meta}>{generateImpactStatementMock(selectedDraft)}</Text>
            <View style={styles.actions}>
              <AppButton title="Run Mock Review" variant="secondary" onPress={runMockReview} />
              <AppButton
                title={isBackendAiConfigured ? 'Run Backend Review' : 'Backend Review unavailable until endpoint configured'}
                variant="secondary"
                onPress={runMockReview}
              />
              <AppButton title="Improve Draft in Proposal Builder" onPress={() => router.push('/proposal')} />
              <AppButton title="Mark Ready for Review" variant="secondary" onPress={markReady} />
            </View>
          </AppCard>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  selector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { backgroundColor: '#FFFFFF', borderColor: brand.colors.subtle, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  activeChip: { backgroundColor: brand.colors.primary, borderColor: brand.colors.primary },
  chipText: { color: brand.colors.ink, fontSize: 13, fontWeight: '800' },
  activeChipText: { color: '#FFFFFF' },
  card: { gap: 10 },
  title: { color: brand.colors.ink, fontSize: 19, fontWeight: '900' },
  titleSmall: { color: brand.colors.ink, fontSize: 15, fontWeight: '900', marginTop: 8 },
  score: { color: brand.colors.success, fontSize: 24, fontWeight: '900' },
  meta: { color: brand.colors.muted, fontSize: 14, lineHeight: 20 },
  actions: { gap: 10, marginTop: 8 },
});
