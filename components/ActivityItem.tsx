import { StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/brand';
import { ActivityLogItem } from '@/types';

export function ActivityItem({ item }: { item: ActivityLogItem }) {
  return (
    <View style={styles.item}>
      <View style={styles.dot} />
      <View style={styles.content}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    backgroundColor: brand.colors.primary,
    borderRadius: 5,
    height: 10,
    marginTop: 5,
    width: 10,
  },
  content: {
    flex: 1,
  },
  message: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  date: {
    color: brand.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
});
