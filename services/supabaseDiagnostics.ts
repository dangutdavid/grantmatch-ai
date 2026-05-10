import { Platform } from 'react-native';

import { env, isSupabaseConfigured } from '@/constants/env';
import { supabase, supabaseStatus } from '@/services/supabaseClient';

export interface SupabaseDiagnostics {
  supabaseUrl: string;
  projectRefFromUrl: string;
  anonKeyProjectRef: string;
  projectRefMatchesKey: string;
  anonKeyExists: boolean;
  anonKeyLength: number;
  isSupabaseConfigured: boolean;
  isSupabaseClientNull: boolean;
  canInitializeClient: boolean;
  platform: string;
  windowExists: boolean;
}

export type SupabaseDiagnosticEndpoint = 'Browser' | 'REST' | 'Auth';

export interface SupabaseHealthResult {
  endpoint: SupabaseDiagnosticEndpoint;
  url: string;
  ok: boolean;
  reachable: boolean;
  status?: number;
  statusText?: string;
  bodyPreview?: string;
  errorName?: string;
  errorMessage?: string;
}

export interface SupabaseConnectivityResult {
  browserProbe: SupabaseHealthResult;
  rest: SupabaseHealthResult;
  auth: SupabaseHealthResult;
  message: string;
  nextAction: string;
  testedAt: string;
}

export interface SafeErrorDetails {
  name: string;
  message: string;
  status?: string;
}

function getProjectRefFromUrl(value: string) {
  try {
    return new URL(value).hostname.split('.')[0] || 'Unknown';
  } catch {
    return 'Unknown';
  }
}

function getAnonKeyProjectRef(value: string) {
  const payload = value.split('.')[1];

  if (!payload || typeof globalThis.atob !== 'function') {
    return 'Unknown';
  }

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = JSON.parse(globalThis.atob(padded)) as { ref?: unknown };

    return typeof decoded.ref === 'string' ? decoded.ref : 'Unknown';
  } catch {
    return 'Unknown';
  }
}

function getProjectRefMatch(projectRefFromUrl: string, anonKeyProjectRef: string) {
  if (projectRefFromUrl === 'Unknown' || anonKeyProjectRef === 'Unknown') {
    return 'Unknown';
  }

  return projectRefFromUrl === anonKeyProjectRef ? 'Yes' : 'No';
}

export function getSupabaseDiagnostics(): SupabaseDiagnostics {
  const projectRefFromUrl = getProjectRefFromUrl(env.supabaseUrl);
  const anonKeyProjectRef = getAnonKeyProjectRef(env.supabaseAnonKey);

  return {
    supabaseUrl: env.supabaseUrl || 'Missing',
    projectRefFromUrl,
    anonKeyProjectRef,
    projectRefMatchesKey: getProjectRefMatch(projectRefFromUrl, anonKeyProjectRef),
    anonKeyExists: Boolean(env.supabaseAnonKey),
    anonKeyLength: env.supabaseAnonKey.length,
    isSupabaseConfigured,
    isSupabaseClientNull: !supabase,
    canInitializeClient: supabaseStatus.canInitializeClient,
    platform: Platform.OS,
    windowExists: typeof window !== 'undefined',
  };
}

export function logSupabaseDiagnostics() {
  const diagnostics = getSupabaseDiagnostics();
  console.info('GrantMatch AI Supabase diagnostics', diagnostics);
  return diagnostics;
}

export function getSafeErrorDetails(error: unknown): SafeErrorDetails {
  if (error instanceof Error) {
    const status =
      'status' in error && typeof error.status !== 'undefined'
        ? String(error.status)
        : undefined;

    return {
      name: error.name,
      message: error.message,
      status,
    };
  }

  if (error && typeof error === 'object') {
    const value = error as { name?: unknown; message?: unknown; status?: unknown };

    return {
      name: typeof value.name === 'string' ? value.name : 'UnknownError',
      message: typeof value.message === 'string' ? value.message : String(error),
      status: typeof value.status !== 'undefined' ? String(value.status) : undefined,
    };
  }

  return {
    name: 'UnknownError',
    message: String(error),
  };
}

export function logSupabaseAuthError(context: string, error: unknown) {
  const details = getSafeErrorDetails(error);
  console.warn(`GrantMatch AI Supabase ${context} error`, {
    ...getSupabaseDiagnostics(),
    errorName: details.name,
    errorMessage: details.message,
    errorStatus: details.status ?? 'None',
  });
  return details;
}

function buildMissingUrlResult(endpoint: SupabaseDiagnosticEndpoint): SupabaseHealthResult {
  return {
    endpoint,
    url: 'Missing Supabase URL',
    ok: false,
    reachable: false,
    errorMessage: 'EXPO_PUBLIC_SUPABASE_URL is missing.',
  };
}

async function testSupabaseEndpoint(
  endpoint: SupabaseDiagnosticEndpoint,
  url: string,
  headers: Record<string, string>,
  options?: Pick<RequestInit, 'mode'>
): Promise<SupabaseHealthResult> {
  if (!env.supabaseUrl) {
    return buildMissingUrlResult(endpoint);
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
      ...options,
    });
    const body = await response.text();

    return {
      endpoint,
      url,
      ok: response.ok,
      reachable: true,
      status: response.status,
      statusText: response.statusText,
      bodyPreview: body.slice(0, 240),
    };
  } catch (error) {
    const details = getSafeErrorDetails(error);

    return {
      endpoint,
      url,
      ok: false,
      reachable: false,
      errorName: details.name,
      errorMessage: details.message,
    };
  }
}

function getConnectivityMessage(
  diagnostics: SupabaseDiagnostics,
  browserProbe: SupabaseHealthResult,
  rest: SupabaseHealthResult,
  auth: SupabaseHealthResult
) {
  if (diagnostics.projectRefMatchesKey === 'No') {
    return 'Supabase URL and anon/publishable key are from different project refs.';
  }

  if (!browserProbe.reachable && !rest.reachable && !auth.reachable) {
    return 'Supabase cannot be reached from this browser/network. Try another browser or Incognito, disable browser extensions, and check DNS/VPN/firewall settings.';
  }

  if (browserProbe.reachable && !rest.reachable && !auth.reachable) {
    return 'Supabase is reachable with a basic browser probe, but API requests are blocked before a response is returned. Check browser extensions, network inspection, or CORS/preflight blocking.';
  }

  if (rest.reachable && !auth.reachable) {
    return 'Supabase database API is reachable, but Auth API is blocked or unavailable. Check Email Auth settings, browser extensions, or network.';
  }

  if (!rest.reachable && !auth.reachable) {
    return 'Supabase cannot be reached from this browser/network.';
  }

  if (!rest.reachable && auth.reachable) {
    return 'Supabase Auth is reachable, but the database API is blocked or unavailable. Check the anon key, browser extensions, or network.';
  }

  return 'Supabase REST and Auth endpoints are reachable from this browser.';
}

function getConnectivityNextAction(
  diagnostics: SupabaseDiagnostics,
  browserProbe: SupabaseHealthResult,
  rest: SupabaseHealthResult,
  auth: SupabaseHealthResult
) {
  if (diagnostics.projectRefMatchesKey === 'No') {
    return 'Copy the Project URL and anon/publishable key from the same Supabase project, update .env, then restart Expo with npx expo start -c.';
  }

  if (diagnostics.projectRefMatchesKey === 'Unknown') {
    return 'Confirm the Supabase URL and anon/publishable key are complete, then restart Expo after any .env edit.';
  }

  if (!diagnostics.isSupabaseConfigured) {
    return 'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env, then restart Expo.';
  }

  if (!diagnostics.canInitializeClient) {
    return 'Supabase is configured, but this runtime cannot safely initialise the client. Use a browser/mobile runtime rather than server rendering.';
  }

  if (!browserProbe.reachable && !rest.reachable && !auth.reachable) {
    return 'Try Incognito or another browser, disable extensions, verify DNS/VPN/firewall settings, then restart Expo with the corrected .env.';
  }

  if (browserProbe.reachable && !rest.reachable && !auth.reachable) {
    return 'The base Supabase host is reachable, but API fetches are blocked. Check browser extensions, network inspection tools, or CORS/preflight blocking.';
  }

  if (rest.reachable && !auth.reachable) {
    return 'Check Supabase Authentication settings, Email provider status, browser extensions, and network rules that might block /auth/v1.';
  }

  if (!rest.reachable && auth.reachable) {
    return 'Check the Data API setting, anon/publishable key, browser extensions, and network rules that might block /rest/v1.';
  }

  if (rest.reachable && auth.reachable) {
    return 'Connection looks healthy. Try registering with a fresh email address and check the exact Auth error if signup still fails.';
  }

  return 'Review the endpoint-specific error name and message shown below.';
}

export async function testSupabaseBrowserProbe(): Promise<SupabaseHealthResult> {
  const url = env.supabaseUrl;

  if (!env.supabaseUrl) {
    return buildMissingUrlResult('Browser');
  }

  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return {
      endpoint: 'Browser',
      url,
      ok: false,
      reachable: false,
      errorMessage: 'Browser probe only runs in Expo Web.',
    };
  }

  return testSupabaseEndpoint(
    'Browser',
    url,
    {
      Accept: 'text/plain',
    },
    {
      mode: 'no-cors',
    }
  );
}

export async function testSupabaseRestHealth(): Promise<SupabaseHealthResult> {
  const url = `${env.supabaseUrl}/rest/v1/`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (env.supabaseAnonKey) {
    headers.apikey = env.supabaseAnonKey;
    headers.Authorization = `Bearer ${env.supabaseAnonKey}`;
  }

  return testSupabaseEndpoint('REST', url, headers);
}

export async function testSupabaseAuthHealth(): Promise<SupabaseHealthResult> {
  const url = `${env.supabaseUrl}/auth/v1/health`;

  return testSupabaseEndpoint('Auth', url, {
    Accept: 'application/json',
  });
}

export async function testSupabaseConnectivity(): Promise<SupabaseConnectivityResult> {
  const diagnostics = getSupabaseDiagnostics();
  const [browserProbe, rest, auth] = await Promise.all([
    testSupabaseBrowserProbe(),
    testSupabaseRestHealth(),
    testSupabaseAuthHealth(),
  ]);

  return {
    browserProbe,
    rest,
    auth,
    message: getConnectivityMessage(diagnostics, browserProbe, rest, auth),
    nextAction: getConnectivityNextAction(diagnostics, browserProbe, rest, auth),
    testedAt: new Date().toISOString(),
  };
}
