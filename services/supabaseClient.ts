import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';

import { env, isSupabaseConfigured } from '@/constants/env';
import { canInitializeSupabaseClient, getSupabaseStorage } from '@/services/supabaseStorage';

const canUseSupabaseRuntime = isSupabaseConfigured && canInitializeSupabaseClient();
const storage = canUseSupabaseRuntime ? getSupabaseStorage() : undefined;

export const supabase = canUseSupabaseRuntime
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: Boolean(storage),
        detectSessionInUrl: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 0,
        },
      },
    })
  : null;

export const supabaseStatus = {
  isConfigured: isSupabaseConfigured,
  canInitializeClient: canUseSupabaseRuntime,
  mode: canUseSupabaseRuntime ? 'supabase' : 'mock',
};

// TODO: For production, confirm deep-link/session handling for OAuth and magic links.
// TODO: Add secure server-side APIs for privileged data access and AI/payment operations.
