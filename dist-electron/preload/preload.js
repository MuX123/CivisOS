"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // CSV 檔案操作
  csv: {
    // 寫入檔案（自動儲存到資料目錄）
    writeFile: (filename, content) => electron.ipcRenderer.invoke("csv:writeFile", filename, content),
    // 讀取檔案
    readFile: (filename) => electron.ipcRenderer.invoke("csv:readFile", filename),
    // 列出所有 CSV 檔案
    listFiles: () => electron.ipcRenderer.invoke("csv:listFiles"),
    // 匯出檔案（選擇位置）
    export: (filename, content) => electron.ipcRenderer.invoke("csv:export", filename, content),
    // 匯入檔案（選擇檔案）
    import: () => electron.ipcRenderer.invoke("csv:import"),
    // 刪除檔案
    deleteFile: (filename) => electron.ipcRenderer.invoke("csv:deleteFile", filename)
  },
  // 應用程式資訊
  app: {
    getDataPath: () => electron.ipcRenderer.invoke("app:getDataPath")
  }
});
//# sourceMappingURL=preload.js.map
