import React, { useState, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  CSVStorageManager,
  DataTableName,
  exportTableToCSV,
  exportAllTablesToCSV,
  importTableFromCSV,
} from '../../services/CSVStorageManager';
import { RootState } from '../../store/types';
import { buildingActions } from '../../store/modules/building';
import { residentActions } from '../../store/modules/resident';
import { feeActions } from '../../store/modules/fee';
import { depositV2Actions } from '../../store/modules/depositV2';

interface CSVDataManagerProps {
  className?: string;
}

const TABLE_LABELS: Record<DataTableName, string> = {
  buildings: '棟別資料',
  floors: '樓層資料',
  units: '戶別資料',
  parkingSpaces: '車位資料',
  residents: '住戶資料',
  residentStatuses: '住戶狀態',
  facilities: '設施資料',
  facilityBookings: '設施預約',
  calendarEvents: '行事曆事件',
  calendarStatuses: '行事曆狀態',
  depositItems: '寄放項目',
  depositMoney: '寄放金額',
  feeUnits: '管理費資料',
  feePeriods: '繳費期數',
  feeBaseConfigs: '管理費基本設定',
  feeSpecialConfigs: '管理費特殊設定',
  config: '系統設定',
  parkingStatuses: '車位狀態',
  houseStatuses: '房屋狀態',
};

export const CSVDataManager: React.FC<CSVDataManagerProps> = ({ className = '' }) => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedTables, setSelectedTables] = useState<Set<DataTableName>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [importPreview, setImportPreview] = useState<{ tableName: DataTableName; count: number } | null>(null);
  
  const tableNames = CSVStorageManager.getTableNames();
  
  // 匯出功能
  const handleExportTable = async (tableName: DataTableName) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const result = await exportTableToCSV(state, tableName);
      
      if (result.success) {
        setMessage({ type: 'success', text: `${TABLE_LABELS[tableName]} 匯出成功！` });
      } else {
        setMessage({ type: 'error', text: result.error || '匯出失敗' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '匯出時發生錯誤' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportAll = async () => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const result = await exportAllTablesToCSV(state);
      
      if (result.success) {
        const successCount = result.results.filter(r => r.success).length;
        setMessage({ type: 'success', text: `成功匯出 ${successCount} 個資料表！` });
      } else {
        const failedCount = result.results.filter(r => !r.success).length;
        setMessage({ type: 'error', text: `${failedCount} 個資料表匯出失敗` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '批次匯出時發生錯誤' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportSelected = async () => {
    if (selectedTables.size === 0) {
      setMessage({ type: 'error', text: '請至少選擇一個資料表' });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const tableName of selectedTables) {
      try {
        const result = await exportTableToCSV(state, tableName);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errorCount++;
      }
    }
    
    setMessage({
      type: errorCount === 0 ? 'success' : 'error',
      text: `匯出完成：${successCount} 成功，${errorCount} 失敗`,
    });
    setIsLoading(false);
  };
  
  // 匯入功能
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      const result = await importTableFromCSV(file);
      
      if (result.success && result.tableName && result.data) {
        setImportPreview({
          tableName: result.tableName,
          count: result.data.length,
        });
      } else {
        setMessage({ type: 'error', text: result.error || '無法識別檔案格式' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '讀取檔案時發生錯誤' });
    } finally {
      setIsLoading(false);
      // 重置檔案輸入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleImportConfirm = async () => {
    if (!importPreview) return;
    
    setIsLoading(true);
    
    try {
      // 重新讀取檔案並匯入
      const fileInput = fileInputRef.current;
      if (!fileInput?.files?.[0]) return;
      
      const result = await importTableFromCSV(fileInput.files[0]);
      
      if (result.success && result.data) {
        // 根據資料表類型 dispatch 對應的 action
        importDataToStore(result.tableName!, result.data);
        setMessage({
          type: 'success',
          text: `成功匯入 ${result.data.length} 筆資料到 ${TABLE_LABELS[result.tableName!]}`,
        });
        setImportPreview(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: '匯入資料時發生錯誤' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const importDataToStore = (tableName: DataTableName, data: any[]) => {
    switch (tableName) {
      case 'buildings':
        dispatch(buildingActions.setBuildings(data));
        break;
      case 'floors':
        dispatch(buildingActions.setFloors(data));
        break;
      case 'units':
        dispatch(buildingActions.setUnits(data));
        break;
      case 'parkingSpaces':
        dispatch(buildingActions.setParkingSpaces(data));
        break;
      case 'residents':
        dispatch(residentActions.setResidents(data));
        break;
      case 'feeUnits':
        dispatch(feeActions.initializeUnits(data));
        break;
      case 'feePeriods':
        dispatch(feeActions.setPeriods(data));
        break;
      case 'depositItems':
        dispatch(depositV2Actions.rehydrate({ items: data }));
        break;
      // 其他資料表可以根據需要添加
      default:
        console.warn(`未處理的資料表類型: ${tableName}`);
    }
  };
  
  const toggleTableSelection = (tableName: DataTableName) => {
    const newSelected = new Set(selectedTables);
    if (newSelected.has(tableName)) {
      newSelected.delete(tableName);
    } else {
      newSelected.add(tableName);
    }
    setSelectedTables(newSelected);
  };
  
  const selectAllTables = () => {
    setSelectedTables(new Set(tableNames));
  };
  
  const clearSelection = () => {
    setSelectedTables(new Set());
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-4 text-gray-800">資料管理</h2>
      
      {/* 分頁標籤 */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'export'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('export')}
        >
          匯出資料
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'import'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('import')}
        >
          匯入資料
        </button>
      </div>
      
      {/* 訊息顯示 */}
      {message && (
        <div
          className={`p-3 rounded mb-4 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
      
      {/* 匯出頁面 */}
      {activeTab === 'export' && (
        <div>
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleExportAll}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              匯出全部資料
            </button>
            <button
              onClick={handleExportSelected}
              disabled={isLoading || selectedTables.size === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              匯出選中 ({selectedTables.size})
            </button>
            <button
              onClick={selectAllTables}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              全選
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              清除
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {tableNames.map((tableName) => (
              <div
                key={tableName}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedTables.has(tableName)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleTableSelection(tableName)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{TABLE_LABELS[tableName]}</span>
                  <input
                    type="checkbox"
                    checked={selectedTables.has(tableName)}
                    onChange={() => {}}
                    className="ml-2"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExportTable(tableName);
                  }}
                  disabled={isLoading}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                >
                  單獨匯出
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 匯入頁面 */}
      {activeTab === 'import' && (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              選擇 CSV 檔案進行匯入。系統會自動識別檔案類型。
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                選擇檔案
              </button>
              <span className="text-sm text-gray-500">
                {fileInputRef.current?.files?.[0]?.name || '未選擇檔案'}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={isLoading}
                className="hidden"
              />
            </div>
          </div>
          
          {/* 匯入預覽 */}
          {importPreview && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <h4 className="font-medium text-yellow-800 mb-2">匯入預覽</h4>
              <p className="text-sm text-yellow-700">
                資料表：{TABLE_LABELS[importPreview.tableName]}
              </p>
              <p className="text-sm text-yellow-700">
                資料筆數：{importPreview.count} 筆
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleImportConfirm}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400"
                >
                  確認匯入
                </button>
                <button
                  onClick={() => setImportPreview(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  取消
                </button>
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-500 mt-4">
            <p className="font-medium mb-1">支援的檔案名稱：</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              {tableNames.map((name) => {
                const info = CSVStorageManager.getTableInfo(name);
                return (
                  <li key={name}>
                    {info?.filename} - {TABLE_LABELS[name]}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
      
      {isLoading && (
        <div className="mt-4 text-center text-gray-500">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2">處理中...</span>
        </div>
      )}
    </div>
  );
};

export default CSVDataManager;
