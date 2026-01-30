// Storage-related type definitions for smart community management system

export interface StorageKey {
  // Theme and UI preferences
  THEME_CONFIG: 'smart-community-theme-config';
  COLOR_PALETTE: 'smart-community-color-palette';
  UI_PREFERENCES: 'smart-community-ui-preferences';
  
  // User data
  USER_PROFILE: 'smart-community-user-profile';
  USER_PREFERENCES: 'smart-community-user-preferences';
  
  // Local cache (frequently accessed data)
  RECENT_ACTIVITIES: 'smart-community-recent-activities';
  QUICK_ACCESS_DATA: 'smart-community-quick-access';
  
  // App state
  LAST_ACTIVE_TAB: 'smart-community-last-tab';
  SIDEBAR_STATE: 'smart-community-sidebar-state';
  FILTER_PREFERENCES: 'smart-community-filter-preferences';
}

export interface StorageItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  version: string;
  expiresAt?: number;
}

export interface StorageOptions {
  expiresIn?: number; // milliseconds
  version?: string;
  compress?: boolean;
}

export interface StorageError extends Error {
  code: 'QUOTA_EXCEEDED' | 'STORAGE_DISABLED' | 'INVALID_DATA' | 'VERSION_MISMATCH';
  originalError?: Error;
}

export interface PersistenceConfig {
  key: string;
  whitelist?: string[]; // Redux slice paths to persist
  blacklist?: string[]; // Redux slice paths to exclude
  serialize?: (state: any) => string;
  deserialize?: (serialized: string) => any;
  migrate?: (persistedState: any, currentVersion: string) => any;
}

export interface StorageStats {
  totalSize: number;
  usedSize: number;
  itemCount: number;
  oldestItem?: number;
  newestItem?: number;
}

// Data expiration periods (in milliseconds)
export const EXPIRY_PERIODS = {
  IMMEDIATE: 0,
  HOURLY: 60 * 60 * 1000,
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
  MONTHLY: 30 * 24 * 60 * 60 * 1000,
  NEVER: -1,
} as const;

// Storage version for migration support
export const STORAGE_VERSION = '1.0.0';

// Event types for storage changes
export type StorageEventType = 'setItem' | 'removeItem' | 'clear' | 'error';

export interface StorageChangeEvent {
  type: StorageEventType;
  key?: string;
  oldValue?: string;
  newValue?: string;
  error?: StorageError;
}

export type StorageEventListener = (event: StorageChangeEvent) => void;