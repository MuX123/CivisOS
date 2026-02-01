import React, { useState, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

// ==================== 資料同步頁面 ====================

const DataSync: React.FC = () => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 從 Redux Store 取得所有資料
  const buildingState = useAppSelector((state) => state.building);
  const configState = useAppSelector((state) => state.config);
  
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<any>(null);
  const [isLargeDataset, setIsLargeDataset] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 檔案大小限制（10MB）
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  
  // 大資料集門檻（1000筆）
  const LARGE_DATASET_THRESHOLD = 1000;

  // 格式化檔案大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 匯出資料功能
  const handleExportData = () => {
    // 檢查資料量
    const totalRecords = 
      (buildingState.buildings?.length || 0) +
      (buildingState.floors?.length || 0) +
      (buildingState.units?.length || 0) +
      (buildingState.parkingSpaces?.length || 0);
    
    setIsLargeDataset(totalRecords > LARGE_DATASET_THRESHOLD);

    // 收集所有資料
    const exportData = {
      version: '1.0.0',
      exportTime: new Date().toISOString(),
      data: {
        building: buildingState,
        config: configState,
      },
    };

    // 轉換為 JSON 字串
    const jsonString = JSON.stringify(exportData, null, 2);
    const fileSize = new Blob([jsonString]).size;
    
    // 檔案大小警告
    if (fileSize > MAX_FILE_SIZE) {
      alert(`警告：檔案大小為 ${formatFileSize(fileSize)}，超過 ${formatFileSize(MAX_FILE_SIZE)} 限制。\n建議分批匯出或聯繫系統管理員。`);
      return;
    }
    
    // 大資料集提醒
    if (totalRecords > LARGE_DATASET_THRESHOLD) {
      const confirmExport = confirm(
        `資料量較大（${totalRecords} 筆記錄，檔案大小 ${formatFileSize(fileSize)}），\n` +
        `匯出可能需要一些時間，是否繼續？`
      );
      if (!confirmExport) return;
    }
    
    // 建立 Blob 物件
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 建立下載連結
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 產生檔案名稱（包含日期時間）
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(/:/g, '');
    const fileName = `CivisOS_資料備份_${dateStr}_${timeStr}.json`;
    
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 觸發檔案選擇
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // 處理檔案匯入
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 檢查檔案類型
    if (!file.name.endsWith('.json')) {
      setImportStatus('error');
      setImportMessage('請選擇 JSON 格式的檔案');
      return;
    }

    // 檢查檔案大小
    if (file.size > MAX_FILE_SIZE) {
      setImportStatus('error');
      setImportMessage(`檔案大小 ${formatFileSize(file.size)} 超過限制 ${formatFileSize(MAX_FILE_SIZE)}，無法匯入。`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        
        // 檢查解析後的資料大小
        if (jsonString.length > 50 * 1024 * 1024) { // 50MB 文字限制
          throw new Error('資料內容過大，無法處理');
        }
        
        const parsedData = JSON.parse(jsonString);

        // 驗證資料結構
        if (!parsedData.data || !parsedData.version) {
          throw new Error('無效的資料格式');
        }

        // 顯示確認對話框
        setPendingImportData(parsedData.data);
        setShowConfirmDialog(true);
        setImportStatus('idle');
        setImportMessage('');
      } catch (error) {
        setImportStatus('error');
        setImportMessage('檔案解析失敗：' + (error instanceof Error ? error.message : '未知錯誤'));
      }
    };
    reader.onerror = () => {
      setImportStatus('error');
      setImportMessage('檔案讀取失敗');
    };
    reader.readAsText(file);

    // 重置檔案輸入
    event.target.value = '';
  };

  // 確認匯入資料
  const handleConfirmImport = async () => {
    if (!pendingImportData) return;

    // 關閉確認對話框，顯示上傳視窗
    setShowConfirmDialog(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 模擬上傳進度（實際處理時間）
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // 實際執行資料匯入（使用 setTimeout 讓 UI 有時間更新）
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 使用 Redux rehydrate action 恢復資料
      if (pendingImportData.building) {
        dispatch({ type: 'building/rehydrate', payload: pendingImportData.building });
      }
      if (pendingImportData.config) {
        dispatch({ type: 'config/rehydrate', payload: pendingImportData.config });
      }

      // 完成進度
      clearInterval(progressInterval);
      setUploadProgress(100);

      // 短暫延遲後關閉上傳視窗並顯示成功
      setTimeout(() => {
        setIsUploading(false);
        setImportStatus('success');
        setImportMessage('資料匯入成功！頁面將重新整理以套用變更。');
        setPendingImportData(null);

        // 延遲重新整理頁面
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }, 500);
    } catch (error) {
      setIsUploading(false);
      setImportStatus('error');
      setImportMessage('資料匯入失敗：' + (error instanceof Error ? error.message : '未知錯誤'));
      setPendingImportData(null);
    }
  };

  // 取消匯入
  const handleCancelImport = () => {
    setShowConfirmDialog(false);
    setPendingImportData(null);
    setImportStatus('idle');
    setImportMessage('');
  };

  // 取得統計資訊
  const getStats = () => {
    const buildingCount = buildingState.buildings?.length || 0;
    const floorCount = buildingState.floors?.length || 0;
    const unitCount = buildingState.units?.length || 0;
    const parkingCount = buildingState.parkingSpaces?.length || 0;
    const totalRecords = buildingCount + floorCount + unitCount + parkingCount;

    return [
      { label: '棟別數量', value: buildingCount },
      { label: '樓層數量', value: floorCount },
      { label: '戶別數量', value: unitCount },
      { label: '車位數量', value: parkingCount },
      { label: '總記錄數', value: totalRecords, highlight: totalRecords > LARGE_DATASET_THRESHOLD },
    ];
  };

  // 計算預估檔案大小
  const getEstimatedFileSize = () => {
    const totalRecords = 
      (buildingState.buildings?.length || 0) +
      (buildingState.floors?.length || 0) +
      (buildingState.units?.length || 0) +
      (buildingState.parkingSpaces?.length || 0);
    
    // 平均每筆記錄約 500 bytes（JSON格式）
    const estimatedBytes = totalRecords * 500 + 2000; // 基礎結構大小
    return formatFileSize(estimatedBytes);
  };

  return (
    <div className="data-sync p-6 max-w-5xl mx-auto">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-normal)] mb-2">資料同步</h2>
        <p className="text-[var(--text-muted)]">
          將網站資料匯出到電腦備份，或從電腦匯入資料恢復系統
        </p>
      </div>

      {/* 狀態訊息 */}
      {importStatus !== 'idle' && (
        <div className={`mb-6 p-4 rounded-lg ${
          importStatus === 'success' 
            ? 'bg-green-500/10 border border-green-500/50 text-green-500' 
            : 'bg-red-500/10 border border-red-500/50 text-red-500'
        }`}>
          <div className="flex items-center gap-2">
            {importStatus === 'success' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{importMessage}</span>
          </div>
        </div>
      )}

      {/* 資料統計 */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-[var(--text-normal)] mb-4">目前資料概覽</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {getStats().map((stat) => (
            <div 
              key={stat.label}
              className={`rounded-lg p-4 border ${
                stat.highlight 
                  ? 'bg-yellow-500/10 border-yellow-500/50' 
                  : 'bg-[var(--bg-secondary)] border-[var(--color-border)]'
              }`}
            >
              <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
              <p className={`text-2xl font-bold ${
                stat.highlight ? 'text-yellow-500' : 'text-[var(--brand-experiment)]'
              }`}>
                {stat.value}
              </p>
              {stat.highlight && (
                <p className="text-xs text-yellow-500 mt-1">資料量較大</p>
              )}
            </div>
          ))}
        </div>
        
        {/* 檔案大小預估 */}
        <div className="mt-4 p-3 bg-[var(--bg-secondary)] rounded-lg border border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-[var(--text-muted)]">預估匯出檔案大小：</span>
            <span className="font-bold text-[var(--text-normal)]">{getEstimatedFileSize()}</span>
          </div>
          <span className="text-xs text-[var(--text-muted)]">限制：{formatFileSize(MAX_FILE_SIZE)}</span>
        </div>
      </div>

      {/* 功能卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 匯出資料 */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--brand-experiment)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              匯出資料到電腦
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--text-muted)] mb-4">
              將目前所有資料（棟別、樓層、戶別、車位設定等）匯出為 JSON 檔案，儲存到您的電腦中。
            </p>
            <Button 
              variant="primary" 
              onClick={handleExportData}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              下載資料檔案
            </Button>
          </CardContent>
        </Card>

        {/* 匯入資料 */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--brand-experiment)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              從電腦匯入資料
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[var(--text-muted)] mb-4">
              從電腦選擇之前匯出的 JSON 資料檔案，恢復系統資料。此操作會覆蓋目前所有資料。
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileImport}
              accept=".json"
              className="hidden"
            />
            <Button 
              variant="secondary" 
              onClick={handleImportClick}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              選擇資料檔案
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 說明文字 */}
      <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--color-border)]">
        <h4 className="font-bold text-[var(--text-normal)] mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          使用說明
        </h4>
        <ul className="text-sm text-[var(--text-muted)] space-y-1 list-disc list-inside">
          <li>匯出的檔案為 JSON 格式，可以使用任何文字編輯器查看</li>
          <li>匯入資料會完全覆蓋目前的系統資料，請確認後再操作</li>
          <li>建議在匯入前先匯出一份目前的資料作為備份</li>
          <li>資料檔案可以在不同電腦之間移動，實現資料轉移</li>
        </ul>
      </div>

      {/* 確認對話框 */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-md shadow-2xl border border-[var(--color-border)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[var(--text-normal)]">確認匯入資料</h3>
            </div>
            <p className="text-[var(--text-muted)] mb-6">
              匯入資料將會<span className="text-red-500 font-bold">覆蓋</span>目前系統中的所有資料。
              此操作無法復原，請確認您要繼續嗎？
            </p>
            <div className="flex gap-3">
              <Button 
                variant="primary" 
                onClick={handleConfirmImport}
                className="flex-1"
              >
                確認匯入
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleCancelImport}
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 上傳進度視窗（全螢幕遮罩） */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] backdrop-blur-md">
          <div className="bg-[var(--bg-floating)] p-8 rounded-2xl w-11/12 max-w-lg shadow-2xl border border-[var(--color-border)] text-center">
            {/* 上傳動畫圖示 */}
            <div className="mb-6 relative">
              <div className="w-20 h-20 mx-auto relative">
                {/* 外圈旋轉 */}
                <div className="absolute inset-0 border-4 border-[var(--brand-experiment)] border-t-transparent rounded-full animate-spin"></div>
                {/* 內圈反向旋轉 */}
                <div className="absolute inset-2 border-4 border-[var(--brand-experiment)] border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                {/* 中心圖示 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[var(--brand-experiment)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 上傳標題 */}
            <h3 className="text-2xl font-bold text-[var(--text-normal)] mb-2">
              正在匯入資料...
            </h3>
            <p className="text-[var(--text-muted)] mb-6">
              請勿關閉視窗或重新整理頁面
            </p>

            {/* 進度條 */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--text-muted)]">處理進度</span>
                <span className="font-bold text-[var(--brand-experiment)]">{uploadProgress}%</span>
              </div>
              <div className="h-3 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--brand-experiment)] to-[var(--brand-experiment-500)] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>

            {/* 處理狀態說明 */}
            <div className="text-sm text-[var(--text-muted)]">
              {uploadProgress < 30 && '正在讀取資料檔案...'}
              {uploadProgress >= 30 && uploadProgress < 60 && '正在驗證資料格式...'}
              {uploadProgress >= 60 && uploadProgress < 90 && '正在寫入系統資料...'}
              {uploadProgress >= 90 && '即將完成...'}
            </div>

            {/* 取消按鈕（僅在處理初期顯示） */}
            {uploadProgress < 50 && (
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  setIsUploading(false);
                  setImportStatus('error');
                  setImportMessage('已取消匯入');
                }}
                className="mt-6"
              >
                取消匯入
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSync;
