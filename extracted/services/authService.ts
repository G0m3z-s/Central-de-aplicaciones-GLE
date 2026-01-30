import { supabase, hasSupabase } from './supabaseClient';
import { DEFAULT_PASSWORD, GENERIC_USERS } from '../constants';

export async function verifyCredentials(username: string, password: string) {
  const userKey = username.trim().toLowerCase();
  const pass = password.trim();

  let overrides: Record<string, string> = {};
  try {
    overrides = JSON.parse(localStorage.getItem('gle_password_overrides') || '{}');
  } catch {
    overrides = {};
  }

  if (hasSupabase && supabase) {
    const { data, error } = await supabase
      .from('users')
      .select('username, role, password')
      .eq('username', userKey)
      .limit(1)
      .single();

    if (!error && data) {
      const expected = data.password || overrides[userKey] || DEFAULT_PASSWORD;
      if (pass === expected) {
        return { ok: true, role: data.role || GENERIC_USERS[userKey] || 'Usuario' };
      }
      return { ok: false, message: 'Contraseña incorrecta.' };
    }
    // Fallback a locales si el usuario no existe en BD
  }

  if (GENERIC_USERS[userKey]) {
    const expected = overrides[userKey] || DEFAULT_PASSWORD;
    if (pass === expected) {
      return { ok: true, role: GENERIC_USERS[userKey] };
    }
  }
  return { ok: false, message: 'Usuario o contraseña incorrectos.' };
}