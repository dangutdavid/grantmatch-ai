import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { PageHeader } from '@/components/PageHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { brand } from '@/constants/brand';
import { isSupabaseConfigured } from '@/constants/env';
import { useGrantMatch } from '@/hooks/use-grant-match';
import {
  getSupabaseDiagnostics,
  logSupabaseDiagnostics,
  SupabaseConnectivityResult,
  SupabaseDiagnostics,
  SupabaseHealthResult,
  testSupabaseConnectivity,
} from '@/services/supabaseDiagnostics';
import { UserType } from '@/types';
import { getFriendlyErrorMessage } from '@/utils/errors';

const userTypes: UserType[] = ['Researcher', 'NGO', 'Startup', 'Institution'];

export default function RegisterScreen() {
  const router = useRouter();
  const { registerWithEmail } = useGrantMatch();
  const [fullName, setFullName] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<UserType>('Researcher');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [message, setMessage] = useState('');
  const [diagnostics, setDiagnostics] = useState<SupabaseDiagnostics>(() => getSupabaseDiagnostics());
  const [connectivityResult, setConnectivityResult] = useState<SupabaseConnectivityResult | undefined>();

  useEffect(() => {
    setDiagnostics(logSupabaseDiagnostics());
  }, []);

  async function handleRegister() {
    setMessage('');
    setIsSubmitting(true);

    try {
      await registerWithEmail({
        fullName,
        organisation,
        userType: selectedUserType,
        email,
        password,
      });
      router.replace('/dashboard');
    } catch (error) {
      const friendlyMessage = getFriendlyErrorMessage(error);
      setMessage(friendlyMessage);

      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'supabase_unreachable'
      ) {
        const result = await testSupabaseConnectivity();
        setConnectivityResult(result);
        setMessage(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTestSupabaseConnection() {
    setIsTestingSupabase(true);
    const latestDiagnostics = logSupabaseDiagnostics();
    setDiagnostics(latestDiagnostics);

    try {
      const result = await testSupabaseConnectivity();
      console.info('GrantMatch AI Supabase connectivity result', result);
      setConnectivityResult(result);
    } finally {
      setIsTestingSupabase(false);
    }
  }

  return (
    <ScreenContainer maxWidth="narrow">
      <View style={styles.headerOffset}>
        <PageHeader
          eyebrow="New account"
          title="Create account"
          subtitle={
            isSupabaseConfigured
              ? 'Create a Supabase-backed account for this app foundation.'
              : 'Create a local mock account until Supabase is configured.'
          }
        />
      </View>

      <AppCard style={styles.form}>
        {message ? <Text style={styles.error}>{message}</Text> : null}

        <Text style={styles.label}>Full name</Text>
        <TextInput
          autoCapitalize="words"
          onChangeText={setFullName}
          placeholder="Full name"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={fullName}
        />

        <Text style={styles.label}>Organisation / Institution</Text>
        <TextInput
          onChangeText={setOrganisation}
          placeholder="Organisation / Institution"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={organisation}
        />

        <Text style={styles.label}>User type</Text>
        <View style={styles.optionGrid}>
          {userTypes.map((userType) => {
            const selected = selectedUserType === userType;

            return (
              <Pressable
                key={userType}
                style={[styles.option, selected && styles.selectedOption]}
                onPress={() => setSelectedUserType(userType)}>
                <Text style={[styles.optionText, selected && styles.selectedOptionText]}>
                  {userType}
                </Text>
              </Pressable>
            );
          })}
        </View>

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
          title={isSubmitting ? 'Creating Account...' : 'Create Account'}
          onPress={handleRegister}
        />
        <Text style={styles.helper}>
          {isSupabaseConfigured
            ? 'Supabase Auth handles the account when reachable. If the browser cannot reach Supabase, local mock fallback stays available.'
            : 'Supabase is not configured, so this creates a local mock session only.'}
        </Text>
      </AppCard>

      <AppCard style={styles.diagnosticsCard}>
        <Text style={styles.diagnosticsTitle}>Supabase diagnostics</Text>
        <DiagnosticRow label="URL" value={diagnostics.supabaseUrl} />
        <DiagnosticRow label="Project ref from URL" value={diagnostics.projectRefFromUrl} />
        <DiagnosticRow label="Project ref from key" value={diagnostics.anonKeyProjectRef} />
        <DiagnosticRow label="URL/key project match" value={diagnostics.projectRefMatchesKey} />
        <DiagnosticRow label="Anon/publishable key exists" value={diagnostics.anonKeyExists ? 'Yes' : 'No'} />
        <DiagnosticRow label="Anon/publishable key length" value={String(diagnostics.anonKeyLength)} />
        <DiagnosticRow label="Configured" value={diagnostics.isSupabaseConfigured ? 'Yes' : 'No'} />
        <DiagnosticRow label="Client is null" value={diagnostics.isSupabaseClientNull ? 'Yes' : 'No'} />
        <DiagnosticRow label="Client available" value={diagnostics.canInitializeClient ? 'Yes' : 'No'} />
        <DiagnosticRow label="Platform" value={diagnostics.platform} />
        <DiagnosticRow label="Window exists" value={diagnostics.windowExists ? 'Yes' : 'No'} />
        <AppButton
          disabled={isTestingSupabase}
          title={isTestingSupabase ? 'Testing Supabase...' : 'Test Supabase Connection'}
          variant="secondary"
          onPress={handleTestSupabaseConnection}
        />
        {connectivityResult ? (
          <View style={styles.healthResult}>
            <Text style={styles.connectivityMessage}>{connectivityResult.message}</Text>
            <Text style={styles.nextAction}>Next action: {connectivityResult.nextAction}</Text>
            <EndpointDiagnostics title="Browser network probe" result={connectivityResult.browserProbe} />
            <EndpointDiagnostics title="REST endpoint" result={connectivityResult.rest} />
            <EndpointDiagnostics title="Auth endpoint" result={connectivityResult.auth} />
          </View>
        ) : null}
      </AppCard>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href="/login" style={styles.link}>
          Login
        </Link>
      </View>
    </ScreenContainer>
  );
}

function DiagnosticRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.diagnosticRow}>
      <Text style={styles.diagnosticLabel}>{label}</Text>
      <Text style={styles.diagnosticValue}>{value}</Text>
    </View>
  );
}

function EndpointDiagnostics({
  title,
  result,
}: {
  title: string;
  result: SupabaseHealthResult;
}) {
  return (
    <View style={styles.endpointBlock}>
      <Text style={styles.endpointTitle}>{title}</Text>
      <DiagnosticRow label={`${result.endpoint} URL`} value={result.url} />
      <DiagnosticRow label={`${result.endpoint} reachable`} value={result.reachable ? 'Yes' : 'No'} />
      <DiagnosticRow label={`${result.endpoint} fetch ok`} value={result.ok ? 'Yes' : 'No'} />
      <DiagnosticRow
        label={`${result.endpoint} status`}
        value={result.status ? `${result.status} ${result.statusText ?? ''}` : 'No response'}
      />
      <DiagnosticRow label={`${result.endpoint} error name`} value={result.errorName ?? 'None'} />
      <DiagnosticRow label={`${result.endpoint} error message`} value={result.errorMessage ?? 'None'} />
      <DiagnosticRow label={`${result.endpoint} response`} value={result.bodyPreview ?? 'None'} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerOffset: {
    marginTop: 30,
  },
  form: {
    gap: 14,
  },
  label: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '800',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderColor: brand.colors.subtle,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectedOption: {
    backgroundColor: brand.colors.accentSoft,
    borderColor: brand.colors.accent,
  },
  optionText: {
    color: brand.colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  selectedOptionText: {
    color: brand.colors.accent,
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
  diagnosticsCard: {
    gap: 10,
    marginTop: 14,
  },
  diagnosticsTitle: {
    color: brand.colors.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  diagnosticRow: {
    gap: 4,
  },
  diagnosticLabel: {
    color: brand.colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  diagnosticValue: {
    color: brand.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  healthResult: {
    borderColor: brand.colors.subtle,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    padding: 10,
  },
  connectivityMessage: {
    backgroundColor: brand.colors.accentSoft,
    borderRadius: 10,
    color: brand.colors.ink,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 19,
    padding: 10,
  },
  nextAction: {
    color: brand.colors.muted,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  endpointBlock: {
    borderTopColor: brand.colors.subtle,
    borderTopWidth: 1,
    gap: 7,
    paddingTop: 10,
  },
  endpointTitle: {
    color: brand.colors.ink,
    fontSize: 14,
    fontWeight: '900',
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
