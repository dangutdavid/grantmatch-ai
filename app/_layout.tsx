import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GrantMatchProvider } from '@/state/GrantMatchState';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <GrantMatchProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: 'Login' }} />
          <Stack.Screen name="register" options={{ title: 'Register' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="compare" options={{ title: 'Compare Grants' }} />
          <Stack.Screen name="deploy-readiness" options={{ title: 'Deploy Readiness' }} />
          <Stack.Screen name="sync-center" options={{ title: 'Sync Center' }} />
          <Stack.Screen name="grant-sources" options={{ title: 'Grant Sources' }} />
          <Stack.Screen name="match-lab" options={{ title: 'Match Lab' }} />
          <Stack.Screen name="proposal-review" options={{ title: 'Proposal Review' }} />
          <Stack.Screen name="institution-admin" options={{ title: 'Institution Admin' }} />
          <Stack.Screen name="subscription" options={{ title: 'Subscription' }} />
          <Stack.Screen name="data-management" options={{ title: 'Data Management' }} />
          <Stack.Screen name="audit-log" options={{ title: 'Audit Log' }} />
          <Stack.Screen name="privacy-policy" options={{ title: 'Privacy Policy' }} />
          <Stack.Screen name="terms-of-service" options={{ title: 'Terms of Service' }} />
          <Stack.Screen name="grants/[id]" options={{ title: 'Grant Details' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </GrantMatchProvider>
    </ThemeProvider>
  );
}
