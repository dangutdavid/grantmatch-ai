import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { PageHeader } from '@/components/PageHeader';
import { ScoreBadge } from '@/components/ScoreBadge';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionHeader } from '@/components/SectionHeader';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';

const scoreLabels = {
  relevanceScore: 'Topic fit',
  eligibilityScore: 'Eligibility fit',
  urgencyScore: 'Deadline readiness',
  fundingFitScore: 'Funding fit',
};

export default function GrantDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    grants,
    recommendations,
    savedGrantIds,
    toggleSavedGrant,
    selectGrant,
    createDraftFromGrant,
    createTrackedApplication,
  } = useGrantMatch();
  const grant = grants.find((item) => item.id === id) ?? grants[0];
  const recommendation =
    recommendations.find((item) => item.grantId === grant.id) ?? recommendations[0];
  const isSaved = savedGrantIds.includes(grant.id);

  return (
    <ScreenContainer maxWidth="medium">
      <PageHeader
        eyebrow="Grant details"
        title={grant.title}
        subtitle="Review the opportunity, score breakdown, and proposal requirements before drafting."
      />

      <View style={styles.headerMeta}>
        <Text style={styles.funder}>{grant.funder}</Text>
        <ScoreBadge score={recommendation.matchScore.overallConfidence} />
      </View>

      <AppCard style={styles.summaryCard}>
        <View style={styles.factGrid}>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>Funding amount</Text>
            <Text style={styles.factValue}>{grant.fundingAmount}</Text>
          </View>
          <View style={styles.factItem}>
            <Text style={styles.factLabel}>Deadline</Text>
            <Text style={styles.factValue}>{grant.deadline}</Text>
          </View>
        </View>
        <Text style={styles.description}>{grant.description}</Text>
      </AppCard>

      <SectionHeader title="Grant details" />
      <AppCard style={styles.detailCard}>
        <Text style={styles.label}>Eligibility</Text>
        <Text style={styles.body}>{grant.eligibility}</Text>

        <Text style={styles.label}>Country / region eligibility</Text>
        <Text style={styles.body}>{grant.regionEligibility}</Text>

        <Text style={styles.label}>Required documents</Text>
        <Text style={styles.body}>{grant.requiredDocuments.join(', ')}</Text>
      </AppCard>

      <SectionHeader title="Why this matches" />
      <AppCard style={styles.detailCard}>
        <Text style={styles.body}>{recommendation.matchExplanation}</Text>

        {Object.entries(scoreLabels).map(([scoreKey, label]) => (
          <View key={scoreKey} style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>{label}</Text>
            <Text style={styles.scoreValue}>
              {recommendation.matchScore[scoreKey as keyof typeof scoreLabels]}%
            </Text>
          </View>
        ))}
      </AppCard>

      <View style={styles.actions}>
        <AppButton
          title="Generate Proposal Draft"
          onPress={() => {
            selectGrant(grant.id);
            createDraftFromGrant(grant.id);
            router.push({
              pathname: '/proposal',
              params: { grantId: grant.id },
            });
          }}
        />
        <AppButton
          title={isSaved ? 'Grant Saved' : 'Save Grant'}
          variant="secondary"
          onPress={() => toggleSavedGrant(grant.id)}
        />
        <AppButton
          title="Track Application"
          variant="secondary"
          onPress={() => {
            createTrackedApplication(grant.id);
            router.push('/tracker');
          }}
        />
        <AppButton title="Back to Matches" variant="ghost" onPress={() => router.push('/recommendations')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerMeta: {
    gap: 10,
    marginBottom: 18,
  },
  funder: {
    color: brand.colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  summaryCard: {
    marginBottom: 22,
    gap: 16,
  },
  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  factItem: {
    backgroundColor: brand.colors.background,
    borderRadius: 14,
    flexBasis: '47%',
    flexGrow: 1,
    padding: 14,
  },
  factLabel: {
    color: brand.colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  factValue: {
    color: brand.colors.ink,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  description: {
    color: brand.colors.ink,
    fontSize: 16,
    lineHeight: 24,
  },
  detailCard: {
    gap: 8,
    marginBottom: 22,
  },
  label: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  body: {
    color: brand.colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  scoreRow: {
    alignItems: 'center',
    borderTopColor: brand.colors.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  scoreLabel: {
    color: brand.colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  scoreValue: {
    color: brand.colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  actions: {
    gap: 10,
  },
});
