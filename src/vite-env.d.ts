/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// 擴展 Window 介面以支援資料清理工具
declare global {
  interface Window {
    runDataCleanup?: () => void;
    store?: any;
    forcePersist?: (state: any) => void;
    testResults?: any[];
  }
}

export {};
