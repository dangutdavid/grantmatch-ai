import { StyleSheet, Text, View } from 'react-native';

import { brand } from '@/constants/brand';
import { WorkspaceRole } from '@/types';

export function RoleBadge({ role }: { role: WorkspaceRole }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: brand.colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    color: brand.colors.accent,
    fontSize: 12,
    fontWeight: '900',
  },
});
