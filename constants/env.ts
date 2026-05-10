function readPublicEnv(name: string) {
  return (process.env[name] ?? '').trim();
}

function normalizeBaseUrl(value: string) {
  return value
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export const env = {
  apiUrl: normalizeBaseUrl(readPublicEnv('EXPO_PUBLIC_API_URL')),
  supabaseUrl: normalizeBaseUrl(readPublicEnv('EXPO_PUBLIC_SUPABASE_URL')),
  supabaseAnonKey: readPublicEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  aiApiBaseUrl: normalizeBaseUrl(readPublicEnv('EXPO_PUBLIC_AI_API_BASE_URL')),
  enableBackendAi: readPublicEnv('EXPO_PUBLIC_ENABLE_BACKEND_AI') || 'false',
  openAiApiKeyPlaceholder: readPublicEnv('EXPO_PUBLIC_OPENAI_API_KEY_PLACEHOLDER'),
  stripePublicKeyPlaceholder: readPublicEnv('EXPO_PUBLIC_STRIPE_PUBLIC_KEY_PLACEHOLDER'),
};

export const isApiConfigured = Boolean(
  env.apiUrl &&
    env.apiUrl !== 'https://api.example.com' &&
    isValidUrl(env.apiUrl)
);
export const isSupabaseConfigured = Boolean(
  env.supabaseUrl &&
    env.supabaseAnonKey &&
    isValidUrl(env.supabaseUrl) &&
    !env.supabaseUrl.includes('your-project') &&
    !env.supabaseAnonKey.includes('replace-with')
);
export const isBackendAiConfigured = Boolean(
  env.enableBackendAi === 'true' &&
    env.aiApiBaseUrl &&
    isValidUrl(env.aiApiBaseUrl) &&
    !env.aiApiBaseUrl.includes('example.com')
);
