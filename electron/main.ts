/**
 * Electron 主進程
 * 處理視窗管理和檔案系統操作
 */

import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// 資料儲存路徑
const getDataPath = () => {
  const userDataPath = app.getPath('userData');
  const dataDir = path.join(userDataPath, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
};

// 創建主視窗
const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    title: 'CivisOS 智慧社區管理系統',
    show: false,
  });

  // 載入應用
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    // 只在 DEBUG 模式下自動開啟 DevTools
    if (process.env.DEBUG === 'true') {
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 註冊快捷鍵開啟/關閉 DevTools (F12 或 Ctrl+Shift+I)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // 註冊 F12 快捷鍵
    globalShortcut.register('F12', () => {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    });
    
    // 註冊 Ctrl+Shift+I (macOS 上為 Cmd+Option+I)
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    });
  });

  // 視窗關閉時取消註冊快捷鍵
  mainWindow.on('closed', () => {
    globalShortcut.unregisterAll();
  });

  return mainWindow;
};

// 應用程式就緒
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============== IPC 處理器 ==============

// 寫入 CSV 檔案（自動儲存）
ipcMain.handle('csv:writeFile', async (_, filename: string, content: string) => {
  try {
    const dataPath = getDataPath();
    const filePath = path.join(dataPath, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true, path: filePath };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '寫入失敗' 
    };
  }
});

// 讀取 CSV 檔案
ipcMain.handle('csv:readFile', async (_, filename: string) => {
  try {
    const dataPath = getDataPath();
    const filePath = path.join(dataPath, filename);
    
    if (!fs.existsSync(filePath)) {
      return { success: true, content: '', exists: false };
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content, exists: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '讀取失敗' 
    };
  }
});

// 列出所有 CSV 檔案
ipcMain.handle('csv:listFiles', async () => {
  try {
    const dataPath = getDataPath();
    const files = fs.readdirSync(dataPath)
      .filter(f => f.endsWith('.csv'))
      .map(f => ({
        name: f,
        path: path.join(dataPath, f),
        size: fs.statSync(path.join(dataPath, f)).size,
        modified: fs.statSync(path.join(dataPath, f)).mtime,
      }));
    return { success: true, files };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '列出檔案失敗' 
    };
  }
});

// 匯出 CSV（選擇位置）
ipcMain.handle('csv:export', async (_, filename: string, content: string) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: filename,
      filters: [
        { name: 'CSV 檔案', extensions: ['csv'] },
        { name: '所有檔案', extensions: ['*'] },
      ],
    });

    if (filePath) {
      fs.writeFileSync(filePath, content, 'utf-8');
      return { success: true, path: filePath };
    }
    return { success: false, cancelled: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '匯出失敗' 
    };
  }
});

// 匯入 CSV（選擇檔案）
ipcMain.handle('csv:import', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'CSV 檔案', extensions: ['csv'] },
        { name: '所有檔案', extensions: ['*'] },
      ],
    });

    if (filePaths && filePaths.length > 0) {
      const files = filePaths.map(filePath => ({
        name: path.basename(filePath),
        path: filePath,
        content: fs.readFileSync(filePath, 'utf-8'),
      }));
      return { success: true, files };
    }
    return { success: false, cancelled: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '匯入失敗' 
    };
  }
});

// 取得資料目錄路徑
ipcMain.handle('app:getDataPath', () => {
  return getDataPath();
});

// 刪除 CSV 檔案
ipcMain.handle('csv:deleteFile', async (_, filename: string) => {
  try {
    const dataPath = getDataPath();
    const filePath = path.join(dataPath, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '刪除失敗' 
    };
  }
});
