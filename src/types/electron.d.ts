/**
 * Electron API 類型聲明
 * 為渲染進程提供型別支援
 */

export interface ElectronAPI {
  csv: {
    writeFile: (filename: string, content: string) => Promise<{
      success: boolean;
      path?: string;
      error?: string;
    }>;
    readFile: (filename: string) => Promise<{
      success: boolean;
      content?: string;
      exists?: boolean;
      error?: string;
    }>;
    listFiles: () => Promise<{
      success: boolean;
      files?: Array<{
        name: string;
        path: string;
        size: number;
        modified: Date;
      }>;
      error?: string;
    }>;
    export: (filename: string, content: string) => Promise<{
      success: boolean;
      path?: string;
      cancelled?: boolean;
      error?: string;
    }>;
    import: () => Promise<{
      success: boolean;
      files?: Array<{
        name: string;
        path: string;
        content: string;
      }>;
      cancelled?: boolean;
      error?: string;
    }>;
    deleteFile: (filename: string) => Promise<{
      success: boolean;
      error?: string;
    }>;
  };
  app: {
    getDataPath: () => Promise<string>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
