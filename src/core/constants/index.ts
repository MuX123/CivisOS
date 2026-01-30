export interface SystemConfig {
  appVersion: string;
  apiBaseURL: string;
  theme: 'discord' | 'light' | 'dark';
  pagination: {
    defaultPageSize: number;
    maxPageSize: number;
  };
  cache: {
    ttl: number; // Time to live in seconds
    maxSize: number; // Maximum number of cached items
  };
}

export const systemConfig: SystemConfig = {
  appVersion: '1.0.0',
  apiBaseURL: '/api',
  theme: 'discord',
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
  cache: {
    ttl: 300, // 5 minutes
    maxSize: 1000,
  },
}