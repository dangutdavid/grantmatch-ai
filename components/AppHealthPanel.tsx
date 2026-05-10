import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { brand } from '@/constants/brand';

const healthItems = [
  ['Local storage', 'Active', 'success'],
  ['Mock recommendation engine', 'Active', 'success'],
  ['Proposal draft manager', 'Active', 'success'],
  ['Application tracker', 'Active', 'success'],
  ['Workspace collaboration', 'Active', 'success'],
  ['Backend', 'Disconnected', 'muted'],
  ['Authentication', 'Mock only', 'warning'],
  ['AI API', 'Disconnected', 'muted'],
  ['Payments', 'Disconnected', 'muted'],
] as const;

export function AppHealthPanel() {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>App health</Text>
      <Text style={styles.description}>
        Local prototype services are active. External production services remain intentionally disconnected.
      </Text>
      <View style={styles.grid}>
        {healthItems.map(([label, status, tone]) => (
          <View key={label} style={styles.item}>
            <Text style={styles.label}>{label}</Text>
            <Text
              style={[
                styles.status,
                tone === 'success' && styles.success,
                tone === 'warning' && styles.warning,
              ]}>
              {status}
            </Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  title: {
    color: brand.colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  description: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    backgroundColor: brand.colors.background,
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: 170,
    flexGrow: 1,
    padding: 12,
  },
  label: {
    color: brand.colors.muted,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  status: {
    color: brand.colors.muted,
    fontSize: 15,
    fontWeight: '900',
  },
  success: {
    color: brand.colors.success,
  },
  warning: {
    color: brand.colors.warning,
  },
});
