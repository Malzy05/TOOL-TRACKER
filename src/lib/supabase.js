import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iqrvuexljtuanuuwtpka.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_F78KeY3lft39VzKs0-KRbw_Ze6aivDR';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    experimental: {
      passkey: true
    }
  }
});

export const getSupabaseServerClient = (authHeader) => {
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    });
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
};
