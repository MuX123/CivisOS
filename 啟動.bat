@echo off
chcp 65001 >nul
title CivisOS 智慧社區管理系統

echo ╔════════════════════════════════════════╗
echo ║   CivisOS 智慧社區管理系統 - 啟動中   ║
echo ╚════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: 檢查 node_modules 是否存在
if not exist "node_modules" (
    echo [!] 偵測到尚未安裝依賴，正在執行 npm install ...
    call npm install
    echo.
)

echo [*] 啟動開發伺服器 (Electron + Vite) ...
echo [*] 請稍候，視窗將自動開啟 ...
echo.

call npm run dev

pause
