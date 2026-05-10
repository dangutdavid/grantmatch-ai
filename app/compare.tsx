import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { PageHeader } from '@/components/PageHeader';
import { ScoreBadge } from '@/components/ScoreBadge';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';

export default function CompareGrantsScreen() {
  const router = useRouter();
  const { grantIds } = useLocalSearchParams<{ grantIds?: string }>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const { grants, recommendations, savedGrantIds } = useGrantMatch();
  const selectedGrantIds = grantIds ? grantIds.split(',').filter(Boolean).slice(0, 3) : savedGrantIds.slice(0, 3);
  const selectedSavedGrantIds = selectedGrantIds.filter((grantId) => savedGrantIds.includes(grantId));
  const savedComparisons = selectedSavedGrantIds
    .map((grantId) => {
      const grant = grants.find((item) => item.id === grantId);
      const recommendation = recommendations.find((item) => item.grantId === grantId);

      if (!grant || !recommendation) {
        return null;
      }

      return { grant, recommendation };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const strongestGrantId = savedComparisons.reduce<string | undefined>((currentBestId, comparison) => {
    if (!currentBestId) {
      return comparison.grant.id;
    }

    const currentBest = savedComparisons.find((item) => item.grant.id === currentBestId);

    if (!currentBest) {
      return comparison.grant.id;
    }

    const currentBestScore =
      currentBest.recommendation.matchScore.overallConfidence +
      currentBest.recommendation.matchScore.urgencyScore;
    const comparisonScore =
      comparison.recommendation.matchScore.overallConfidence +
      comparison.recommendation.matchScore.urgencyScore;

    return comparisonScore > currentBestScore ? comparison.grant.id : currentBestId;
  }, undefined);

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="Decision support"
        title="Compare saved grants"
        subtitle="Review saved opportunities side by side before choosing where to spend proposal time."
      />

      {savedComparisons.length < 2 ? (
        <AppCard style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Select at least two saved grants to compare</Text>
          <Text style={styles.emptyText}>
            Comparison works best with a shortlist of 2 to 3 saved grants. Go to Saved Grants, select
            the opportunities you want, then compare them here.
          </Text>
          <AppButton title="Open Saved Grants" onPress={() => router.push('/saved')} />
        </AppCard>
      ) : (
        <View style={[styles.grid, isDesktop && styles.desktopGrid]}>
          {savedComparisons.map(({ grant, recommendation }) => (
            <AppCard key={grant.id} style={isDesktop ? styles.desktopCard : undefined}>
              {grant.id === strongestGrantId ? (
                <Text style={styles.bestBadge}>Strongest comparison signal</Text>
              ) : null}
              <Text style={styles.grantTitle}>{grant.title}</Text>
              <Text style={styles.funder}>{grant.funder}</Text>
              <ScoreBadge score={recommendation.matchScore.overallConfidence} />

              <View style={styles.factList}>
                <CompareFact label="Funding" value={grant.fundingAmount} />
                <CompareFact label="Deadline" value={grant.deadline} />
                <CompareFact label="Region / geography" value={grant.regionEligibility} />
                <CompareFact label="Eligibility" value={grant.eligibility} />
                <CompareFact label="Required documents" value={grant.requiredDocuments.join(', ')} />
                <CompareFact label="Overall confidence" value={`${recommendation.matchScore.overallConfidence}%`} />
                <CompareFact label="Topic fit" value={`${recommendation.matchScore.relevanceScore}%`} />
                <CompareFact label="Eligibility fit" value={`${recommendation.matchScore.eligibilityScore}%`} />
                <CompareFact label="Deadline readiness" value={`${recommendation.matchScore.urgencyScore}%`} />
                <CompareFact label="Funding fit" value={`${recommendation.matchScore.fundingFitScore}%`} />
                <CompareFact
                  label="Proposal readiness recommendation"
                  value={getProposalReadiness(recommendation.matchScore.overallConfidence, recommendation.matchScore.urgencyScore)}
                />
              </View>

              <Text style={styles.matchLabel}>Why it matches</Text>
              <Text style={styles.explanation}>{recommendation.matchExplanation}</Text>
              <AppButton
                title="View Details"
                variant="secondary"
                onPress={() => router.push(`/grants/${grant.id}`)}
              />
            </AppCard>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

function getProposalReadiness(overallConfidence: number, urgencyScore: number) {
  if (overallConfidence >= 85 && urgencyScore >= 75) {
    return 'Best immediate opportunity';
  }

  if (overallConfidence >= 80) {
    return 'Best strategic fit';
  }

  return 'Needs more profile information';
}

function CompareFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.factRow}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    gap: 14,
  },
  emptyTitle: {
    color: brand.colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: brand.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  grid: {
    gap: 16,
  },
  desktopGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  desktopCard: {
    flexBasis: '31%',
    flexGrow: 1,
  },
  bestBadge: {
    alignSelf: 'flex-start',
    backgroundColor: brand.colors.successSoft,
    borderRadius: 999,
    color: brand.colors.success,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  grantTitle: {
    color: brand.colors.ink,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    marginBottom: 6,
  },
  funder: {
    color: brand.colors.primary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  factList: {
    gap: 8,
    marginTop: 14,
  },
  factRow: {
    borderTopColor: brand.colors.subtle,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  factLabel: {
    color: brand.colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  factValue: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  explanation: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 14,
  },
  matchLabel: {
    color: brand.colors.ink,
    fontSize: 13,
    fontWeight: '900',
    marginTop: 14,
    textTransform: 'uppercase',
  },
});
