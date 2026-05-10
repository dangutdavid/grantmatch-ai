import { StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/brand';
import { ApplicationStatus } from '@/types';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const terminal = status === 'Awarded' || status === 'Submitted';
  const rejected = status === 'Rejected';

  return (
    <View style={[styles.badge, terminal && styles.successBadge, rejected && styles.rejectedBadge]}>
      <Text style={[styles.text, terminal && styles.successText, rejected && styles.rejectedText]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: brand.colors.warningSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  successBadge: {
    backgroundColor: brand.colors.successSoft,
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  text: {
    color: brand.colors.warning,
    fontSize: 12,
    fontWeight: '900',
  },
  successText: {
    color: brand.colors.success,
  },
  rejectedText: {
    color: '#B91C1C',
  },
});
