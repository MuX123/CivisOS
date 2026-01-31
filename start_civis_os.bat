@echo off
chcp 65001 >nul
echo ===========================================
echo   CivisOS 智慧社區管理系統 - 啟動器
echo ===========================================
echo.
echo 正在準備環境...
echo.

REM 檢查 node_modules 是否存在
if not exist "node_modules" (
    echo 偵測到首次執行，正在安裝依賴套件...
    call npm install
    if %errorlevel% neq 0 (
        echo [錯誤] 安裝失敗，請檢查 Node.js 是否已正確安裝。
        pause
        exit /b
    )
)

echo 正在啟動瀏覽器...
timeout /t 2 >nul
start http://localhost:5173

echo 正在啟動開發伺服器...
echo 請勿關閉此視窗，若要停止伺服器請按 Ctrl+C
echo.

npm run dev

pause