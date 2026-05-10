import { StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/brand';

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: '#FFFFFF',
    borderColor: brand.colors.subtle,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  title: {
    color: brand.colors.ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  message: {
    color: brand.colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
