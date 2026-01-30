import { Middleware, Store } from '@reduxjs/toolkit';
import LocalStorageManager from '../../services/LocalStorageManager';
import { PersistenceConfig } from '../types/storage';
import { RootState } from '../store';

interface PersistedState {
  version: string;
  timestamp: number;
  state: Partial<RootState>;
}

export interface PersistenceMiddlewareConfig {
  key: string;
  whitelist?: (keyof RootState)[];
  blacklist?: (keyof RootState)[];
  throttle?: number;
  migrate?: (persistedState: any, currentVersion: string) => Promise<Partial<RootState>>;
  serialize?: (state: Partial<RootState>) => string;
  deserialize?: (serialized: string) => Partial<RootState>;
}

const DEFAULT_CONFIG: Partial<PersistenceMiddlewareConfig> = {
  throttle: 1000,
};

export class PersistenceMiddleware {
  private config: PersistenceMiddlewareConfig;
  private storage: LocalStorageManager;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(config: PersistenceMiddlewareConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.storage = LocalStorageManager;
  }

  private shouldPersistKey(key: string): boolean {
    if (this.config.whitelist) {
      return this.config.whitelist.includes(key as keyof RootState);
    }
    if (this.config.blacklist) {
      return !this.config.blacklist.includes(key as keyof RootState);
    }
    return true;
  }

  private filterState(state: RootState): Partial<RootState> {
    const filtered: Partial<RootState> = {};
    
    for (const [key, value] of Object.entries(state)) {
      if (this.shouldPersistKey(key)) {
        (filtered as any)[key] = value;
      }
    }
    
    return filtered;
  }

  private serialize(state: Partial<RootState>): string {
    if (this.config.serialize) {
      return this.config.serialize(state);
    }

    const persistedState: PersistedState = {
      version: '1.0.0',
      timestamp: Date.now(),
      state,
    };

    return JSON.stringify(persistedState);
  }

  private deserialize(serialized: string): Partial<RootState> {
    if (this.config.deserialize) {
      return this.config.deserialize(serialized);
    }

    try {
      const persistedState: PersistedState = JSON.parse(serialized);
      
      if (persistedState.version !== '1.0.0' && this.config.migrate) {
        return this.config.migrate(persistedState.state, persistedState.version);
      }
      
      return persistedState.state;
    } catch (error) {
      console.error('Failed to deserialize persisted state:', error);
      return {};
    }
  }

  private schedulePersist(state: RootState): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.persistState(state);
      this.timeoutId = null;
    }, this.config.throttle);
  }

  private async persistState(state: RootState): Promise<void> {
    try {
      const filteredState = this.filterState(state);
      const serialized = this.serialize(filteredState);
      
      await this.storage.setItem(this.config.key, filteredState, {
        version: '1.0.0',
      });
    } catch (error) {
      console.error('Failed to persist state:', error);
    }
  }

  async rehydrate(): Promise<Partial<RootState>> {
    try {
      const persistedState = await this.storage.getItem<Partial<RootState>>(this.config.key);
      
      if (persistedState) {
        return persistedState;
      }
      
      return {};
    } catch (error) {
      console.error('Failed to rehydrate state:', error);
      return {};
    }
  }

  createMiddleware(): Middleware<{}, RootState> {
    return (store: Store<RootState>) => (next: any) => (action: any) => {
      const result = next(action);
      
      // Only persist on successful actions
      if (result && !result.error) {
        this.schedulePersist(store.getState());
      }
      
      return result;
    };
  }

  async clearPersistedState(): Promise<void> {
    try {
      await this.storage.removeItem(this.config.key);
    } catch (error) {
      console.error('Failed to clear persisted state:', error);
      throw error;
    }
  }

  async getPersistedState(): Promise<Partial<RootState> | null> {
    try {
      return await this.storage.getItem<Partial<RootState>>(this.config.key);
    } catch (error) {
      console.error('Failed to get persisted state:', error);
      return null;
    }
  }

  isPersisted(): boolean {
    return this.storage.hasKey(this.config.key);
  }

  async forcePersist(state: RootState): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    await this.persistState(state);
  }
}

// Factory function for creating middleware instances
export function createPersistenceMiddleware(config: PersistenceMiddlewareConfig): {
  middleware: Middleware<{}, RootState>;
  rehydrate: () => Promise<Partial<RootState>>;
  clearPersistedState: () => Promise<void>;
  getPersistedState: () => Promise<Partial<RootState> | null>;
  isPersisted: () => boolean;
  forcePersist: (state: RootState) => Promise<void>;
} {
  const persistence = new PersistenceMiddleware(config);
  
  return {
    middleware: persistence.createMiddleware(),
    rehydrate: () => persistence.rehydrate(),
    clearPersistedState: () => persistence.clearPersistedState(),
    getPersistedState: () => persistence.getPersistedState(),
    isPersisted: () => persistence.isPersisted(),
    forcePersist: (state: RootState) => persistence.forcePersist(state),
  };
}

// Pre-configured middleware for common use cases
export const createThemePersistence = () => createPersistenceMiddleware({
  key: 'theme-config',
  whitelist: ['config'],
});

export const createUserDataPersistence = () => createPersistenceMiddleware({
  key: 'user-data',
  whitelist: ['building', 'floor', 'unit', 'parking', 'resident', 'facility', 'deposit'],
});

export const createQuickAccessPersistence = () => createPersistenceMiddleware({
  key: 'quick-access',
  whitelist: ['calendar', 'config'],
  throttle: 500,
});

export const createFullPersistence = () => createPersistenceMiddleware({
  key: 'full-state',
  blacklist: ['eventBus'], // Don't persist real-time events
  throttle: 2000,
});