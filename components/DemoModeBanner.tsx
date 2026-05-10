import { StyleSheet, Text } from 'react-native';

import { brand } from '@/constants/brand';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { getBackendStatus } from '@/utils/backendStatus';

export function DemoModeBanner() {
  const { authMode, sessionUser } = useGrantMatch();
  const backendStatus = getBackendStatus(authMode, sessionUser);

  return (
    <Text
      style={[
        styles.banner,
        backendStatus.isSupabaseClientAvailable && !backendStatus.isMockSession && styles.readyBanner,
        backendStatus.isSupabaseSession && styles.connectedBanner,
      ]}>
      {backendStatus.bannerMessage}
    </Text>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: brand.colors.warningSoft,
    borderColor: '#FCD34D',
    borderRadius: 14,
    borderWidth: 1,
    color: brand.colors.warning,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 18,
    padding: 14,
  },
  connectedBanner: {
    backgroundColor: brand.colors.successSoft,
    borderColor: brand.colors.success,
    color: brand.colors.success,
  },
  readyBanner: {
    backgroundColor: brand.colors.accentSoft,
    borderColor: brand.colors.accent,
    color: brand.colors.accent,
  },
});
