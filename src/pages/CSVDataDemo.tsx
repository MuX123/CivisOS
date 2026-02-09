import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { CSVDataManager } from '../components/data-management';

/**
 * CSV 資料管理示範頁面
 * 
 * 此頁面展示如何使用 CSVDataManager 組件進行資料的匯入/匯出
 */
const CSVDataDemo: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              CSV 資料管理系統
            </h1>
            <p className="text-gray-600">
              將資料匯出為 UTF-8 BOM 編碼的 CSV 檔案，或從 CSV 檔案匯入資料
            </p>
          </header>

          <CSVDataManager />

          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800">使用說明</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. <strong>匯出資料</strong>：選擇要匯出的資料表，點擊「匯出選中」或「單獨匯出」</p>
              <p>2. <strong>批次匯出</strong>：點擊「匯出全部資料」可一次匯出所有資料表</p>
              <p>3. <strong>匯入資料</strong>：切換到「匯入資料」頁籤，選擇 CSV 檔案</p>
              <p>4. <strong>檔案命名</strong>：系統會自動識別檔案類型，請保持預設檔名</p>
            </div>
          </div>

          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-bold text-blue-800 mb-2">技術資訊</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 編碼格式：UTF-8 BOM（確保 Excel 正確顯示中文）</li>
              <li>• 分隔符號：逗號 (,)</li>
              <li>• 日期格式：ISO 8601</li>
              <li>• 巢狀資料：自動轉換為 JSON 字串</li>
            </ul>
          </div>
        </div>
      </div>
    </Provider>
  );
};

export default CSVDataDemo;
