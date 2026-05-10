import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { GrantCard } from '@/components/GrantCard';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';

export default function SavedGrantsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const {
    grants,
    recommendations,
    savedGrantIds,
    toggleSavedGrant,
    selectGrant,
    createDraftFromGrant,
    createTrackedApplication,
  } = useGrantMatch();
  const [selectedGrantIds, setSelectedGrantIds] = useState<string[]>(savedGrantIds.slice(0, 2));

  const savedRecommendations = recommendations.filter((recommendation) =>
    savedGrantIds.includes(recommendation.grantId)
  );

  function generateProposalDraft(grantId: string) {
    selectGrant(grantId);
    createDraftFromGrant(grantId);
    router.push({
      pathname: '/proposal',
      params: { grantId },
    });
  }

  function trackApplication(grantId: string) {
    createTrackedApplication(grantId);
    router.push('/tracker');
  }

  function toggleSelectedGrant(grantId: string) {
    setSelectedGrantIds((currentIds) => {
      if (currentIds.includes(grantId)) {
        return currentIds.filter((currentId) => currentId !== grantId);
      }

      if (currentIds.length >= 3) {
        return currentIds;
      }

      return [...currentIds, grantId];
    });
  }

  function compareSelectedGrants() {
    if (selectedGrantIds.length < 2) {
      return;
    }

    router.push({
      pathname: '/compare',
      params: { grantIds: selectedGrantIds.join(',') },
    });
  }

  return (
    <ScreenContainer>
      <PageHeader
        eyebrow="My Grants"
        title="Saved grants"
        subtitle="Your shortlist of grants to review, compare, and turn into proposal drafts."
      />

      {savedRecommendations.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No saved grants yet</Text>
          <Text style={styles.emptyText}>
            Save grants from Matches to build a shortlist. Saved items persist locally in this prototype.
          </Text>
          <AppButton title="Browse Matches" onPress={() => router.push('/recommendations')} />
        </AppCard>
      ) : (
        <>
          <AppCard style={styles.compareCard}>
            <Text style={styles.compareTitle}>Compare your shortlist</Text>
            <Text style={styles.compareText}>
              Select 2 to 3 saved grants to compare funding, eligibility, readiness, and match signals.
            </Text>
            <Text style={styles.selectionHelp}>
              {selectedGrantIds.length < 2
                ? 'Select at least 2 grants to compare.'
                : `${selectedGrantIds.length} grant${selectedGrantIds.length === 1 ? '' : 's'} selected.`}
            </Text>
            <AppButton
              title="Compare Selected"
              disabled={selectedGrantIds.length < 2}
              onPress={compareSelectedGrants}
            />
          </AppCard>

          <View style={[styles.list, isDesktop && styles.desktopList]}>
            {savedRecommendations.map((recommendation) => {
              const grant = grants.find((item) => item.id === recommendation.grantId);

              if (!grant) {
                return null;
              }

              return (
                <View key={recommendation.id} style={isDesktop ? styles.desktopCard : undefined}>
                  <AppButton
                    title={selectedGrantIds.includes(grant.id) ? 'Selected for Compare' : 'Select for Compare'}
                    variant="secondary"
                    onPress={() => toggleSelectedGrant(grant.id)}
                    style={styles.selectButton}
                  />
                  <GrantCard
                    grant={grant}
                    recommendation={{
                      ...recommendation,
                      saved: true,
                    }}
                    onViewDetails={() => router.push(`/grants/${grant.id}`)}
                    onSave={() => toggleSavedGrant(grant.id)}
                  />
                  <AppButton
                    title="Generate Proposal Draft"
                    variant="secondary"
                    onPress={() => generateProposalDraft(grant.id)}
                    style={styles.generateButton}
                  />
                  <AppButton
                    title="Track Application"
                    variant="secondary"
                    onPress={() => trackApplication(grant.id)}
                    style={styles.generateButton}
                  />
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScreenContainer>
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
  list: {
    gap: 16,
  },
  compareCard: {
    gap: 10,
    marginBottom: 16,
  },
  compareTitle: {
    color: brand.colors.ink,
    fontSize: 18,
    fontWeight: '900',
  },
  compareText: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  selectionHelp: {
    color: brand.colors.primary,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  selectButton: {
    marginBottom: 10,
  },
  desktopList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  desktopCard: {
    flexBasis: '48%',
    flexGrow: 1,
  },
  generateButton: {
    marginTop: 10,
  },
});
