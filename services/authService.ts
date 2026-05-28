import { mockUser } from '@/data/mockUser';
import { logSupabaseAuthError } from '@/services/supabaseDiagnostics';
import { supabase, supabaseStatus } from '@/services/supabaseClient';
import { LoginCredentials, RegisterInput, SessionUser, UserType } from '@/types';
import { createAppError } from '@/utils/errors';

function validateEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

function createMockSessionUser(input?: Partial<SessionUser>): SessionUser {
  return {
    id: input?.id ?? mockUser.id,
    fullName: input?.fullName ?? mockUser.fullName,
    email: input?.email ?? 'demo@grantmatch.ai',
    organisation: input?.organisation ?? mockUser.organisation,
    userType: input?.userType ?? mockUser.userType,
    authMode: 'mock',
  };
}

function getCredentials(
  emailOrCredentials: string | LoginCredentials,
  password?: string
): LoginCredentials {
  if (typeof emailOrCredentials === 'string') {
    return {
      email: emailOrCredentials,
      password: password ?? '',
    };
  }

  return emailOrCredentials;
}

function validateCredentials(credentials: LoginCredentials) {
  if (!validateEmail(credentials.email)) {
    throw createAppError('invalid_email', 'Enter a valid email address.');
  }

  if (credentials.password.trim().length < 6) {
    throw createAppError('invalid_password', 'Password must be at least 6 characters.');
  }
}

function isSupabaseNetworkError(error: unknown) {
  if (!error) {
    return false;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : String(error);

  return /failed to fetch|network request failed|load failed|fetch/i.test(message);
}

function createSupabaseUnavailableError(cause?: unknown) {
  return createAppError(
    'supabase_unreachable',
    'Supabase could not be reached from this browser. Check the project URL/anon key, restart Expo after editing .env, or use Demo Login for local mode.',
    cause
  );
}

function getSupabaseAuthFailureMessage(
  action: 'login' | 'register',
  fallbackMessage?: string
) {
  const message = fallbackMessage ?? '';

  if (/signup|signups|registration/i.test(message) && /disabled|not allowed/i.test(message)) {
    return 'Supabase Email Auth may be disabled or signups may be blocked. Check Authentication > Providers > Email in Supabase.';
  }

  if (/email/i.test(message) && /confirm|confirmation|not confirmed/i.test(message)) {
    return 'Check your email confirmation status in Supabase Auth before logging in.';
  }

  if (/invalid login|invalid credentials|invalid email or password/i.test(message)) {
    return 'Email or password is incorrect. Try again or register a fresh test account.';
  }

  return fallbackMessage ?? `Unable to ${action === 'login' ? 'sign in' : 'create a Supabase account'}.`;
}

function mapSupabaseUserToSessionUser(
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  },
  fallback?: Partial<SessionUser>
): SessionUser {
  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    email: user.email ?? fallback?.email ?? 'unknown@example.com',
    fullName:
      typeof metadata.full_name === 'string'
        ? metadata.full_name
        : fallback?.fullName ?? mockUser.fullName,
    organisation:
      typeof metadata.organisation === 'string'
        ? metadata.organisation
        : fallback?.organisation ?? mockUser.organisation,
    userType:
      typeof metadata.user_type === 'string'
        ? (metadata.user_type as UserType)
        : fallback?.userType ?? mockUser.userType,
    authMode: 'supabase',
  };
}

export async function loginWithEmail(
  emailOrCredentials: string | LoginCredentials,
  password?: string
): Promise<SessionUser> {
  const credentials = getCredentials(emailOrCredentials, password);
  validateCredentials(credentials);

  if (!supabase && !supabaseStatus.isConfigured) {
    return createMockSessionUser({ email: credentials.email.trim().toLowerCase() });
  }

  if (!supabase) {
    throw createSupabaseUnavailableError();
  }

  let result;

  try {
    result = await supabase.auth.signInWithPassword({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    });
  } catch (error) {
    logSupabaseAuthError('login', error);

    if (isSupabaseNetworkError(error)) {
      throw createSupabaseUnavailableError(error);
    }

    throw error;
  }

  const { data, error } = result;

  if (error || !data.user) {
    if (error) {
      logSupabaseAuthError('login response', error);
    }

    if (isSupabaseNetworkError(error)) {
      throw createSupabaseUnavailableError(error);
    }

    throw createAppError(
      'supabase_login_failed',
      getSupabaseAuthFailureMessage('login', error?.message)
    );
  }

  return mapSupabaseUserToSessionUser(data.user);
}

export async function loginDemo(): Promise<SessionUser> {
  return createMockSessionUser();
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  if (!validateEmail(email)) {
    throw createAppError('invalid_email', 'Enter a valid email address.');
  }

  if (!supabase && !supabaseStatus.isConfigured) {
    throw createAppError(
      'supabase_not_configured',
      'Password reset requires Supabase Auth. Use Demo Login for local mode.'
    );
  }

  if (!supabase) {
    throw createSupabaseUnavailableError();
  }

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/login`
      : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo,
  });

  if (error) {
    logSupabaseAuthError('password reset', error);

    if (isSupabaseNetworkError(error)) {
      throw createSupabaseUnavailableError(error);
    }

    throw createAppError(
      'supabase_password_reset_failed',
      getSupabaseAuthFailureMessage('login', error.message)
    );
  }
}

export async function registerMockUser(input: RegisterInput): Promise<SessionUser> {
  if (!input.fullName.trim()) {
    throw createAppError('missing_name', 'Enter your full name.');
  }

  if (!input.organisation.trim()) {
    throw createAppError('missing_organisation', 'Enter your organisation or institution.');
  }

  validateCredentials(input);

  return createMockSessionUser({
    id: `mock-user-${Date.now()}`,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    organisation: input.organisation.trim(),
    userType: input.userType,
  });
}

export async function registerUser(input: RegisterInput): Promise<SessionUser> {
  if (!input.fullName.trim()) {
    throw createAppError('missing_name', 'Enter your full name.');
  }

  if (!input.organisation.trim()) {
    throw createAppError('missing_organisation', 'Enter your organisation or institution.');
  }

  validateCredentials(input);

  if (!supabase && !supabaseStatus.isConfigured) {
    return registerMockUser(input);
  }

  if (!supabase) {
    throw createSupabaseUnavailableError();
  }

  let result;

  try {
    result = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: {
          full_name: input.fullName.trim(),
          organisation: input.organisation.trim(),
          user_type: input.userType,
        },
      },
    });
  } catch (error) {
    logSupabaseAuthError('register', error);

    if (isSupabaseNetworkError(error)) {
      throw createSupabaseUnavailableError(error);
    }

    throw error;
  }

  const { data, error } = result;

  if (error || !data.user) {
    if (error) {
      logSupabaseAuthError('register response', error);
    }

    if (isSupabaseNetworkError(error)) {
      throw createSupabaseUnavailableError(error);
    }

    throw createAppError(
      'supabase_registration_failed',
      getSupabaseAuthFailureMessage('register', error?.message)
    );
  }

  return mapSupabaseUserToSessionUser(data.user, {
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    organisation: input.organisation.trim(),
    userType: input.userType,
  });
}

export async function logout(): Promise<void> {
  if (supabase) {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw createAppError('supabase_logout_failed', error.message);
    }
  }
}

export async function getCurrentSession(): Promise<SessionUser | undefined> {
  if (!supabase) {
    return undefined;
  }

  let result;

  try {
    result = await supabase.auth.getSession();
  } catch (error) {
    if (isSupabaseNetworkError(error)) {
      console.warn('Supabase session restore unreachable; continuing without Supabase session.', error);
      return undefined;
    }

    throw createSupabaseUnavailableError(error);
  }

  const { data, error } = result;

  if (error || !data.session?.user) {
    return undefined;
  }

  return mapSupabaseUserToSessionUser(data.session.user);
}

export async function getCurrentUser(sessionUser?: SessionUser): Promise<SessionUser | undefined> {
  if (!supabaseStatus.isConfigured) {
    return sessionUser;
  }

  return getCurrentSession();
}

export { supabaseStatus };
