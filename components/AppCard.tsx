import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { brand } from '@/constants/brand';

interface AppCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AppCard({ children, style }: AppCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: brand.colors.surface,
    borderColor: brand.colors.subtle,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
});
