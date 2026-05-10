import { StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/brand';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginBottom: 14,
  },
  title: {
    color: brand.colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: brand.colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
});
