"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const getDataPath = () => {
  const userDataPath = electron.app.getPath("userData");
  const dataDir = path__namespace.join(userDataPath, "data");
  if (!fs__namespace.existsSync(dataDir)) {
    fs__namespace.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
};
const createWindow = () => {
  const mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path__namespace.join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    title: "CivisOS 智慧社區管理系統",
    show: false
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path__namespace.join(__dirname, "../dist/index.html"));
  }
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  return mainWindow;
};
electron.app.whenReady().then(() => {
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.ipcMain.handle("csv:writeFile", async (_, filename, content) => {
  try {
    const dataPath = getDataPath();
    const filePath = path__namespace.join(dataPath, filename);
    fs__namespace.writeFileSync(filePath, content, "utf-8");
    return { success: true, path: filePath };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "寫入失敗"
    };
  }
});
electron.ipcMain.handle("csv:readFile", async (_, filename) => {
  try {
    const dataPath = getDataPath();
    const filePath = path__namespace.join(dataPath, filename);
    if (!fs__namespace.existsSync(filePath)) {
      return { success: true, content: "", exists: false };
    }
    const content = fs__namespace.readFileSync(filePath, "utf-8");
    return { success: true, content, exists: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "讀取失敗"
    };
  }
});
electron.ipcMain.handle("csv:listFiles", async () => {
  try {
    const dataPath = getDataPath();
    const files = fs__namespace.readdirSync(dataPath).filter((f) => f.endsWith(".csv")).map((f) => ({
      name: f,
      path: path__namespace.join(dataPath, f),
      size: fs__namespace.statSync(path__namespace.join(dataPath, f)).size,
      modified: fs__namespace.statSync(path__namespace.join(dataPath, f)).mtime
    }));
    return { success: true, files };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "列出檔案失敗"
    };
  }
});
electron.ipcMain.handle("csv:export", async (_, filename, content) => {
  try {
    const { filePath } = await electron.dialog.showSaveDialog({
      defaultPath: filename,
      filters: [
        { name: "CSV 檔案", extensions: ["csv"] },
        { name: "所有檔案", extensions: ["*"] }
      ]
    });
    if (filePath) {
      fs__namespace.writeFileSync(filePath, content, "utf-8");
      return { success: true, path: filePath };
    }
    return { success: false, cancelled: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "匯出失敗"
    };
  }
});
electron.ipcMain.handle("csv:import", async () => {
  try {
    const { filePaths } = await electron.dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      filters: [
        { name: "CSV 檔案", extensions: ["csv"] },
        { name: "所有檔案", extensions: ["*"] }
      ]
    });
    if (filePaths && filePaths.length > 0) {
      const files = filePaths.map((filePath) => ({
        name: path__namespace.basename(filePath),
        path: filePath,
        content: fs__namespace.readFileSync(filePath, "utf-8")
      }));
      return { success: true, files };
    }
    return { success: false, cancelled: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "匯入失敗"
    };
  }
});
electron.ipcMain.handle("app:getDataPath", () => {
  return getDataPath();
});
electron.ipcMain.handle("csv:deleteFile", async (_, filename) => {
  try {
    const dataPath = getDataPath();
    const filePath = path__namespace.join(dataPath, filename);
    if (fs__namespace.existsSync(filePath)) {
      fs__namespace.unlinkSync(filePath);
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "刪除失敗"
    };
  }
});
//# sourceMappingURL=main.js.map
