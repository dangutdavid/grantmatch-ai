import { SupportedStorage } from '@supabase/supabase-js';

export function getSupabaseStorage(): SupportedStorage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const storage = window.localStorage;

    if (!storage) {
      return undefined;
    }

    return {
      getItem: (key) => storage.getItem(key),
      setItem: (key, value) => storage.setItem(key, value),
      removeItem: (key) => storage.removeItem(key),
    };
  } catch {
    return undefined;
  }
}

export function canInitializeSupabaseClient() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    void window.localStorage;
    return true;
  } catch {
    return false;
  }
}

/*
 * Expo Router can evaluate modules during static/server rendering. This default
 * web implementation never imports AsyncStorage, so SSR can safely fall back to
 * mock/local mode when browser storage is unavailable.
 */
