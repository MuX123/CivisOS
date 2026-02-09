/**
 * Electron Preload 腳本
 * 在安全環境中暴露必要的 API 給渲染進程
 */

import { contextBridge, ipcRenderer } from 'electron';

// 暴露給渲染進程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // CSV 檔案操作
  csv: {
    // 寫入檔案（自動儲存到資料目錄）
    writeFile: (filename: string, content: string) => 
      ipcRenderer.invoke('csv:writeFile', filename, content),
    
    // 讀取檔案
    readFile: (filename: string) => 
      ipcRenderer.invoke('csv:readFile', filename),
    
    // 列出所有 CSV 檔案
    listFiles: () => 
      ipcRenderer.invoke('csv:listFiles'),
    
    // 匯出檔案（選擇位置）
    export: (filename: string, content: string) => 
      ipcRenderer.invoke('csv:export', filename, content),
    
    // 匯入檔案（選擇檔案）
    import: () => 
      ipcRenderer.invoke('csv:import'),
    
    // 刪除檔案
    deleteFile: (filename: string) => 
      ipcRenderer.invoke('csv:deleteFile', filename),
  },
  
  // 應用程式資訊
  app: {
    getDataPath: () => 
      ipcRenderer.invoke('app:getDataPath'),
  },
});

// 類型定義（供 TypeScript 使用）
declare global {
  interface Window {
    electronAPI: {
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
    };
  }
}

export {};
