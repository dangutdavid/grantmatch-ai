import { StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/brand';
import { getConfidenceLabel } from '@/utils/matchingEngine';

interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const isHigh = score >= 85;

  return (
    <View style={[styles.badge, isHigh ? styles.high : styles.good]}>
      <Text style={[styles.score, isHigh ? styles.highText : styles.goodText]}>{score}%</Text>
      <Text style={[styles.label, isHigh ? styles.highText : styles.goodText]}>
        {getConfidenceLabel(score)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  high: {
    backgroundColor: brand.colors.successSoft,
  },
  good: {
    backgroundColor: brand.colors.warningSoft,
  },
  score: {
    fontSize: 13,
    fontWeight: '800',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  highText: {
    color: brand.colors.success,
  },
  goodText: {
    color: brand.colors.warning,
  },
});
