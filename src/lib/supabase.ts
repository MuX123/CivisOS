// Supabase 配置
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// 環境變數類型擴展
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Supabase 客戶端
let supabaseClient: SupabaseClient | null = null;

export function initSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = (import.meta.env as ImportMeta['env']).VITE_SUPABASE_URL;
  const anonKey = (import.meta.env as ImportMeta['env']).VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn('[Supabase] 未配置 URL 或 ANON_KEY');
    return null;
  }

  supabaseClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: window.localStorage,
    },
  });

  return supabaseClient;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseClient) {
    return initSupabase();
  }
  return supabaseClient;
}

// 導出 supabase 變量供舊程式碼使用（已棄用，請使用 getSupabaseClient）
export const supabase = getSupabaseClient();

// 監聽認證狀態變化
export function onAuthStateChange(
  callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED', session: Session | null) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const { data } = client.auth.onAuthStateChange((event, session) => {
    callback(event as any, session);
  });

  return () => {
    if (data?.subscription) {
      data.subscription.unsubscribe();
    }
  };
}

export type { User, Session };