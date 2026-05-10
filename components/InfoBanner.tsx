import { StyleSheet, Text } from 'react-native';

import { brand } from '@/constants/brand';

export function InfoBanner({ text, tone = 'info' }: { text: string; tone?: 'info' | 'warning' | 'success' }) {
  return <Text style={[styles.banner, tone === 'warning' && styles.warning, tone === 'success' && styles.success]}>{text}</Text>;
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: brand.colors.accentSoft,
    borderRadius: 14,
    color: brand.colors.accent,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 16,
    padding: 14,
  },
  warning: {
    backgroundColor: brand.colors.warningSoft,
    color: brand.colors.warning,
  },
  success: {
    backgroundColor: brand.colors.successSoft,
    color: brand.colors.success,
  },
});
