import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { ScoreBadge } from '@/components/ScoreBadge';
import { brand } from '@/constants/brand';
import { Grant, Recommendation } from '@/types';

interface GrantCardProps {
  grant: Grant;
  recommendation: Recommendation;
  onViewDetails: () => void;
  onSave?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function GrantCard({ grant, recommendation, onViewDetails, onSave, style }: GrantCardProps) {
  return (
    <AppCard style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{grant.title}</Text>
        <ScoreBadge score={recommendation.matchScore.overallConfidence} />
      </View>

      <Text style={styles.funder}>{grant.funder}</Text>

      <View style={styles.metaGrid}>
        <Text style={styles.meta}>Funding: {grant.fundingAmount}</Text>
        <Text style={styles.meta}>Deadline: {grant.deadline}</Text>
        <Text style={styles.meta}>Eligibility: {grant.regionEligibility}</Text>
      </View>

      <Text style={styles.explanation}>{recommendation.matchExplanation}</Text>

      <View style={styles.scoreGrid}>
        <ScoreItem label="Topic fit" value={recommendation.matchScore.relevanceScore} />
        <ScoreItem label="Eligibility" value={recommendation.matchScore.eligibilityScore} />
        <ScoreItem label="Deadline" value={recommendation.matchScore.urgencyScore} />
        <ScoreItem label="Funding" value={recommendation.matchScore.fundingFitScore} />
      </View>

      <View style={styles.actions}>
        <AppButton title="View Details" onPress={onViewDetails} style={styles.actionButton} />
        <AppButton
          title={recommendation.saved ? 'Saved' : 'Save'}
          onPress={onSave}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>
    </AppCard>
  );
}

function ScoreItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.scoreItem}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreValue}>{value}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  header: {
    gap: 10,
  },
  title: {
    color: brand.colors.ink,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  funder: {
    color: brand.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  metaGrid: {
    gap: 6,
  },
  meta: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  explanation: {
    color: brand.colors.ink,
    fontSize: 14,
    lineHeight: 21,
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreItem: {
    backgroundColor: brand.colors.background,
    borderRadius: 12,
    flexBasis: '47%',
    flexGrow: 1,
    padding: 10,
  },
  scoreLabel: {
    color: brand.colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  scoreValue: {
    color: brand.colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
});
