import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { isSupabaseConfigured } from '@/constants/env';
import { useGrantMatch } from '@/hooks/use-grant-match';
import { getFriendlyErrorMessage } from '@/utils/errors';

export default function LoginScreen() {
  const router = useRouter();
  const { loginMock, loginWithEmail } = useGrantMatch();
  const [email, setEmail] = useState('demo@grantmatch.ai');
  const [password, setPassword] = useState('password');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleLogin(demo = false) {
    setMessage('');
    setIsSubmitting(true);

    try {
      if (demo) {
        await loginMock();
      } else {
        await loginWithEmail({ email, password });
      }
      router.replace('/dashboard');
    } catch (error) {
      setMessage(getFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer maxWidth="narrow">
      <View style={styles.headerOffset}>
        <PageHeader
          eyebrow="Account access"
          title="Welcome back"
          subtitle={`Log in to continue with ${brand.appName}. ${
            isSupabaseConfigured
              ? 'Email login uses Supabase Auth.'
              : 'Email login falls back to mock/local mode until Supabase is configured.'
          }`}
        />
      </View>

      <AppCard style={styles.form}>
        {message ? <Text style={styles.error}>{message}</Text> : null}

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={email}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        <AppButton
          disabled={isSubmitting}
          title={isSubmitting ? 'Signing In...' : 'Login'}
          onPress={() => handleLogin(false)}
        />
        <AppButton
          disabled={isSubmitting}
          title="Demo Login"
          variant="secondary"
          onPress={() => handleLogin(true)}
        />
        <Text style={styles.helper}>
          {isSupabaseConfigured
            ? 'Email login uses Supabase when reachable. Demo Login always creates a local mock session for safe testing.'
            : 'Supabase is not configured, so email login and Demo Login use local mock mode.'}
        </Text>
      </AppCard>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Need an account?</Text>
        <Link href="/register" style={styles.link}>
          Register
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerOffset: {
    marginTop: 70,
  },
  form: {
    gap: 14,
  },
  label: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: brand.colors.subtle,
    borderRadius: 14,
    borderWidth: 1,
    color: brand.colors.ink,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  error: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
    padding: 12,
  },
  helper: {
    color: brand.colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: brand.colors.muted,
    fontSize: 15,
  },
  link: {
    color: brand.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
