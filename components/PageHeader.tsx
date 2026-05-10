import { StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/brand';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

export function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <View style={styles.container}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 22,
  },
  eyebrow: {
    color: brand.colors.primary,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    color: brand.colors.ink,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 38,
  },
  subtitle: {
    color: brand.colors.muted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
});
