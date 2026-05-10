import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedStorage } from '@supabase/supabase-js';

export function getSupabaseStorage(): SupportedStorage {
  return AsyncStorage;
}

export function canInitializeSupabaseClient() {
  return true;
}
