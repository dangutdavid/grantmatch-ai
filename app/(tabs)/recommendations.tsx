import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { GrantCard } from '@/components/GrantCard';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';

type MatchFilter = 'all' | 'saved' | 'high';

export default function RecommendationsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const { grants, isLoaded, recommendations, savedGrantIds, toggleSavedGrant } = useGrantMatch();
  const [activeFilter, setActiveFilter] = useState<MatchFilter>('all');
  const savedRecommendations = recommendations.filter((recommendation) =>
    savedGrantIds.includes(recommendation.grantId)
  );
  const highRecommendations = recommendations.filter(
    (recommendation) => recommendation.matchScore.overallConfidence >= 80
  );
  const visibleRecommendations =
    activeFilter === 'saved'
      ? savedRecommendations
      : activeFilter === 'high'
        ? highRecommendations
        : recommendations;

  const filters: { label: string; value: MatchFilter; count: number }[] = [
    { label: 'All', value: 'all', count: recommendations.length },
    { label: 'Saved', value: 'saved', count: savedRecommendations.length },
    { label: 'High match', value: 'high', count: highRecommendations.length },
  ];

  if (!isLoaded) {
    return (
      <ScreenContainer>
        <PageHeader eyebrow="Matches" title="Grant recommendations" subtitle="Loading local recommendation state." />
        <AppCard>
          <Text style={styles.emptyText}>Loading matches...</Text>
        </AppCard>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="Matches"
        title="Grant recommendations"
        subtitle="Mock opportunities ranked by topic fit, eligibility, urgency, and funding fit."
      />

      <DemoModeBanner />

      <Text style={styles.note}>
        Demo data: these recommendations are local mock records. Future versions will use grant
        ingestion, eligibility filters, embeddings, and feedback learning.
      </Text>
      <View style={styles.labActions}>
        <AppButton title="Open Match Lab" variant="secondary" onPress={() => router.push('/match-lab')} />
        <AppButton title="Grant Sources" variant="secondary" onPress={() => router.push('/grant-sources')} />
      </View>

      <View style={styles.savedSection}>
        <Text style={styles.savedTitle}>Saved Grants</Text>
        {savedRecommendations.length > 0 ? (
          <Text style={styles.savedText}>
            You have saved {savedRecommendations.length} grant
            {savedRecommendations.length === 1 ? '' : 's'} for follow-up.
          </Text>
        ) : (
          <Text style={styles.emptyText}>
            No saved grants yet. Tap Save on any recommendation to build your shortlist.
          </Text>
        )}
        <AppButton
          title="Open Saved Grants"
          variant="secondary"
          onPress={() => router.push('/saved')}
          style={styles.savedButton}
        />
      </View>

      <View style={styles.filterRow}>
        {filters.map((filter) => {
          const selected = activeFilter === filter.value;

          return (
            <Pressable
              key={filter.value}
              style={[styles.filterChip, selected && styles.activeFilterChip]}
              onPress={() => setActiveFilter(filter.value)}>
              <Text style={[styles.filterText, selected && styles.activeFilterText]}>
                {filter.label} ({filter.count})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {visibleRecommendations.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No grants in this view</Text>
          <Text style={styles.emptyText}>
            Try another filter or save a grant from the full recommendations list.
          </Text>
        </View>
      ) : null}

      <View style={[styles.list, isDesktop && styles.desktopList]}>
        {visibleRecommendations.map((recommendation) => {
          const grant = grants.find((item) => item.id === recommendation.grantId);

          if (!grant) {
            return null;
          }

          return (
            <GrantCard
              key={recommendation.id}
              grant={grant}
              recommendation={{
                ...recommendation,
                saved: savedGrantIds.includes(grant.id),
              }}
              onViewDetails={() => router.push(`/grants/${grant.id}`)}
              onSave={() => toggleSavedGrant(grant.id)}
              style={isDesktop ? styles.desktopCard : undefined}
            />
          );
        })}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  note: {
    backgroundColor: brand.colors.accentSoft,
    borderRadius: 14,
    color: brand.colors.accent,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 18,
    padding: 14,
  },
  savedSection: {
    backgroundColor: '#FFFFFF',
    borderColor: brand.colors.subtle,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
  },
  labActions: {
    gap: 10,
    marginBottom: 18,
  },
  savedButton: {
    marginTop: 12,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
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
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderColor: brand.colors.subtle,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 18,
    padding: 18,
  },
  emptyTitle: {
    color: brand.colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  savedTitle: {
    color: brand.colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  savedText: {
    color: brand.colors.success,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  emptyText: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: 14,
  },
  desktopList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  desktopCard: {
    flexBasis: '48%',
    flexGrow: 1,
  },
});
