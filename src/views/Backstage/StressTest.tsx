import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DepositStressTest from '../Frontstage/deposit/DepositStressTest';
import { FeeStressTest } from './fee/FeeStressTest';
import { CalendarStressTest } from './calendar/CalendarStressTest';
import { ParkingStressTest } from './parking/ParkingStressTest';
import { FacilityStressTest } from './facility/FacilityStressTest';
import { ResidentStressTest } from './resident/ResidentStressTest';
import { IoTStressTest } from './iot/IoTStressTest';
import YearSimulationPanel from './YearSimulationPanel';
import { calendarActions } from '../../store/modules/calendar';
import { backupState, restoreBackup, store } from '../../store/index';
import LocalStorageManager from '../../services/LocalStorageManager';
import { useAppDispatch } from '../../store/hooks';

const StressTest: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'deposit' | 'fee' | 'calendar' | 'parking' | 'facility' | 'resident' | 'iot' | 'yearly' | 'cleanup'>('yearly');
  const [isBackupRestoring, setIsBackupRestoring] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // 壓力測試數據備份與還原
  const STRESS_TEST_BACKUP_KEY = 'backup_before_stress_test';

  const handleBackup = async () => {
    try {
      await backupState(STRESS_TEST_BACKUP_KEY, store.getState());
      alert('✅ 原有數據已備份，現在可以安全執行壓力測試。');
    } catch (error) {
      console.error('Backup failed:', error);
      alert('❌ 數據備份失敗，請稍後再試。');
    }
  };

  const handleRestore = async () => {
    if (!confirm('⚠️ 警告：這將會清除當前所有壓力測試數據，並還原至測試前的狀態。\n\n確定要繼續嗎？')) return;
    
    setIsBackupRestoring(true);
    try {
      const restoredState = await restoreBackup(STRESS_TEST_BACKUP_KEY);
      if (restoredState) {
        // 這裡需要重新整理頁面以套用還原的狀態，因為 Redux state 需要完全重置
        // 更好的做法是 dispatch 一個 ROOT_RESET action，但這裡我們用最簡單的 reload
        localStorage.setItem('force_reload_restore', 'true');
        window.location.reload();
      } else {
        alert('❌ 找不到備份檔案，無法還原。');
      }
    } catch (error) {
      console.error('Restore failed:', error);
      alert('❌ 數據還原失敗。');
    } finally {
      setIsBackupRestoring(false);
    }
  };

  const runCalendarStressTest = async () => {
    if (isTesting) return;
    if (!confirm('即將執行行事曆壓力測試，這將會產生大量隨機事件。\n\n確定要繼續嗎？')) return;

    setIsTesting(true);
    try {
      const test = new CalendarStressTest(dispatch, store.getState);
      const results = await test.runTest();
      
      console.log('=== 行事曆壓力測試結果 ===');
      results.forEach(r => console.log(r));
      
      const successCount = results.filter(r => !r.includes('❌')).length;
      alert(`壓力測試完成！\n\n產生大量事件已成功寫入。\n總計步驟: ${results.length}\n無錯誤步驟: ${successCount}`);
    } catch (error) {
      console.error('壓力測試發生錯誤:', error);
      alert('壓力測試發生未預期的錯誤');
    } finally {
      setIsTesting(false);
    }
  };

  const runParkingStressTest = async () => {
    if (isTesting) return;
    if (!confirm('即將執行停車管理系統壓力測試（30次基準）。\n這將產生大量車位、分區與承租資料。\n\n確定要繼續嗎？')) return;

    setIsTesting(true);
    setTestResults([]);
    try {
      const state = store.getState();
      const buildings = (state as any).building.buildings || [];
      const units = (state as any).building.units || [];

      const test = new ParkingStressTest(dispatch, store.getState, buildings, units);
      const results = await test.runStressTest();
      
      console.log('=== 停車管理系統壓力測試結果 ===');
      results.forEach(r => console.log(r));
      setTestResults(results);
      
      const successCount = results.filter(r => r.includes('✅')).length;
      alert(`停車管理系統壓力測試完成！\n\n總計步驟: ${results.length}\n成功步驟: ${successCount}\n請查看控制台詳細結果。`);
    } catch (error) {
      console.error('壓力測試發生錯誤:', error);
      alert('壓力測試發生未預期的錯誤');
    } finally {
      setIsTesting(false);
    }
  };

  const runFacilityStressTest = async () => {
    if (isTesting) return;
    if (!confirm('即將執行公設預約系統壓力測試（30次基準）。\n這將產生大量公設、預約與付款資料。\n\n確定要繼續嗎？')) return;

    setIsTesting(true);
    setTestResults([]);
    try {
      const state = store.getState();
      const buildings = (state as any).building.buildings || [];
      const units = (state as any).building.units || [];

      const test = new FacilityStressTest(dispatch, store.getState, buildings, units);
      const results = await test.runStressTest();
      
      console.log('=== 公設預約系統壓力測試結果 ===');
      results.forEach(r => console.log(r));
      setTestResults(results);
      
      const successCount = results.filter(r => r.includes('✅')).length;
      alert(`公設預約系統壓力測試完成！\n\n總計步驟: ${results.length}\n成功步驟: ${successCount}\n請查看控制台詳細結果。`);
    } catch (error) {
      console.error('壓力測試發生錯誤:', error);
      alert('壓力測試發生未預期的錯誤');
    } finally {
      setIsTesting(false);
    }
  };

  const runResidentStressTest = async () => {
    if (isTesting) return;
    if (!confirm('即將執行住戶管理系統壓力測試（30次基準）。\n這將產生大量住戶、成員、車牌與門禁卡資料。\n\n確定要繼續嗎？')) return;

    setIsTesting(true);
    setTestResults([]);
    try {
      const state = store.getState();
      const buildings = (state as any).building.buildings || [];
      const units = (state as any).building.units || [];

      const test = new ResidentStressTest(dispatch, store.getState, buildings, units);
      const results = await test.runStressTest();
      
      console.log('=== 住戶管理系統壓力測試結果 ===');
      results.forEach(r => console.log(r));
      setTestResults(results);
      
      const successCount = results.filter(r => r.includes('✅')).length;
      alert(`住戶管理系統壓力測試完成！\n\n總計步驟: ${results.length}\n成功步驟: ${successCount}\n請查看控制台詳細結果。`);
    } catch (error) {
      console.error('壓力測試發生錯誤:', error);
      alert('壓力測試發生未預期的錯誤');
    } finally {
      setIsTesting(false);
    }
  };

  const runIoTStressTest = async () => {
    if (isTesting) return;
    if (!confirm('即將執行IoT事件匯流排壓力測試（30次基準）。\n這將產生大量裝置、事件與監控資料。\n\n確定要繼續嗎？')) return;

    setIsTesting(true);
    setTestResults([]);
    try {
      const test = new IoTStressTest(dispatch, store.getState);
      const results = await test.runStressTest();
      
      console.log('=== IoT事件匯流排壓力測試結果 ===');
      results.forEach(r => console.log(r));
      setTestResults(results);
      
      const successCount = results.filter(r => r.includes('✅')).length;
      alert(`IoT事件匯流排壓力測試完成！\n\n總計步驟: ${results.length}\n成功步驟: ${successCount}\n請查看控制台詳細結果。`);
    } catch (error) {
      console.error('壓力測試發生錯誤:', error);
      alert('壓力測試發生未預期的錯誤');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="stress-test-container p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-normal)]">系統壓力測試與模擬</h2>
          <p className="text-[var(--text-muted)] mt-1">執行各模組的大量數據測試與效能驗證</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={handleBackup}
            title="在開始測試前備份當前數據"
          >
            💾 備份原有數據
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRestore}
            disabled={isBackupRestoring}
            title="清除測試數據並還原備份"
          >
            {isBackupRestoring ? '還原中...' : '🔄 退出測試並還原'}
          </Button>
        </div>
      </div>

      <div className="tabs-navigation flex gap-2 mb-6 border-b border-[var(--color-border)] pb-1 overflow-x-auto">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'yearly'
              ? 'border-[var(--brand-experiment)] text-[var(--brand-experiment)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('yearly')}
        >
          全年度模擬
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'cleanup'
              ? 'border-[var(--brand-experiment)] text-[var(--brand-experiment)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('cleanup')}
        >
          🧹 資料清理
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'deposit'
              ? 'border-[var(--brand-experiment)] text-[var(--brand-experiment)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('deposit')}
        >
          寄放管理測試
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'fee'
              ? 'border-[var(--brand-experiment)] text-[var(--brand-experiment)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('fee')}
        >
          管理費測試
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'calendar'
              ? 'border-[var(--brand-experiment)] text-[var(--brand-experiment)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('calendar')}
        >
          行事曆測試
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'parking'
              ? 'border-[var(--brand-experiment)] text-[var(--brand-experiment)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('parking')}
        >
          停車管理測試
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'facility'
              ? 'border-[var(--brand-experiment)] text-[var(--brand-experiment)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('facility')}
        >
          公設預約測試
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'resident'
              ? 'border-[var(--brand-experiment)] text-[var(--brand-experiment)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('resident')}
        >
          住戶管理測試
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'iot'
              ? 'border-[var(--brand-experiment)] text-[var(--brand-experiment)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('iot')}
        >
          IoT事件測試
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'yearly' && (
          <YearSimulationPanel />
        )}

        {activeTab === 'deposit' && (
           <div className="deposit-test-section">
             <Card>
               <CardHeader>
                 <CardTitle>寄放管理壓力測試</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-center py-10 text-[var(--text-muted)]">
                   請至寄放管理頁面執行壓力測試，或在此處整合 DepositStressTest 邏輯
                 </div>
               </CardContent>
             </Card>
           </div>
        )}
        
        {activeTab === 'fee' && (
           <div className="fee-test-section">
             <Card>
               <CardHeader>
                 <CardTitle>管理費壓力測試</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-center py-10 text-[var(--text-muted)]">
                   請至管理費設定頁面執行壓力測試，或在此處整合 FeeStressTest 邏輯
                 </div>
               </CardContent>
             </Card>
           </div>
        )}

        {activeTab === 'calendar' && (
          <Card>
            <CardHeader>
              <CardTitle>行事曆壓力測試</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-[var(--text-muted)] mb-4">此測試將產生大量隨機事件，用於驗證月曆視圖渲染效能與資料載入速度。</p>
                <Button 
                  variant="danger" 
                  onClick={runCalendarStressTest}
                  disabled={isTesting}
                >
                  {isTesting ? '測試執行中...' : '🔥 執行行事曆壓力測試'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'parking' && (
          <Card>
            <CardHeader>
              <CardTitle>停車管理壓力測試 (30次基準)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-[var(--text-muted)] mb-4">
                  此測試將執行30次隨機操作，包含：創建分區、創建車位、更新狀態、分配車位、釋放車位等。<br/>
                  用於驗證停車管理系統在高負載下的穩定性。
                </p>
                <Button 
                  variant="danger" 
                  onClick={runParkingStressTest}
                  disabled={isTesting}
                >
                  {isTesting ? '測試執行中...' : '🅿️ 執行停車管理壓力測試'}
                </Button>
                {testResults.length > 0 && activeTab === 'parking' && (
                  <div className="mt-6 text-left bg-[var(--bg-secondary)] p-4 rounded-lg max-h-96 overflow-y-auto">
                    <h4 className="font-bold mb-2">測試結果：</h4>
                    <pre className="text-xs whitespace-pre-wrap">{testResults.join('\n')}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'facility' && (
          <Card>
            <CardHeader>
              <CardTitle>公設預約壓力測試 (30次基準)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-[var(--text-muted)] mb-4">
                  此測試將執行30次隨機操作，包含：創建公設、創建預約、更新付款、取消預約、刪除預約等。<br/>
                  用於驗證公設預約系統在高負載下的穩定性。
                </p>
                <Button 
                  variant="danger" 
                  onClick={runFacilityStressTest}
                  disabled={isTesting}
                >
                  {isTesting ? '測試執行中...' : '🏢 執行公設預約壓力測試'}
                </Button>
                {testResults.length > 0 && activeTab === 'facility' && (
                  <div className="mt-6 text-left bg-[var(--bg-secondary)] p-4 rounded-lg max-h-96 overflow-y-auto">
                    <h4 className="font-bold mb-2">測試結果：</h4>
                    <pre className="text-xs whitespace-pre-wrap">{testResults.join('\n')}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'resident' && (
          <Card>
            <CardHeader>
              <CardTitle>住戶管理壓力測試 (30次基準)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-[var(--text-muted)] mb-4">
                  此測試將執行30次隨機操作，包含：創建住戶、添加成員、添加車牌、添加門禁卡、添加承租人等。<br/>
                  用於驗證住戶管理系統在高負載下的穩定性。
                </p>
                <Button 
                  variant="danger" 
                  onClick={runResidentStressTest}
                  disabled={isTesting}
                >
                  {isTesting ? '測試執行中...' : '👥 執行住戶管理壓力測試'}
                </Button>
                {testResults.length > 0 && activeTab === 'resident' && (
                  <div className="mt-6 text-left bg-[var(--bg-secondary)] p-4 rounded-lg max-h-96 overflow-y-auto">
                    <h4 className="font-bold mb-2">測試結果：</h4>
                    <pre className="text-xs whitespace-pre-wrap">{testResults.join('\n')}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'iot' && (
          <Card>
            <CardHeader>
              <CardTitle>IoT事件匯流排壓力測試 (30次基準)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-[var(--text-muted)] mb-4">
                  此測試將執行30次隨機操作，包含：創建裝置、更新狀態、更新數據、創建事件、處理事件等。<br/>
                  用於驗證IoT事件匯流排系統在高負載下的穩定性。
                </p>
                <Button 
                  variant="danger" 
                  onClick={runIoTStressTest}
                  disabled={isTesting}
                >
                  {isTesting ? '測試執行中...' : '📡 執行IoT事件匯流排壓力測試'}
                </Button>
                {testResults.length > 0 && activeTab === 'iot' && (
                  <div className="mt-6 text-left bg-[var(--bg-secondary)] p-4 rounded-lg max-h-96 overflow-y-auto">
                    <h4 className="font-bold mb-2">測試結果：</h4>
                    <pre className="text-xs whitespace-pre-wrap">{testResults.join('\n')}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'cleanup' && (
          <Card>
            <CardHeader>
              <CardTitle>🧹 資料清理工具</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <div className="text-[var(--text-muted)] mb-6 space-y-2">
                  <p className="text-lg">⚠️ 徹底清除系統中的所有資料</p>
                  <div className="text-sm opacity-80 text-left max-w-lg mx-auto bg-[var(--bg-secondary)] p-4 rounded-lg">
                    <p className="mb-2">📝 此工具將：</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>清除 localStorage 中的所有資料</li>
                      <li>清除 Redux State 中的所有資料</li>
                      <li>清除建築、住戶、車位等所有記錄</li>
                      <li>清除預約、日曆、管理費等所有記錄</li>
                      <li>寫入空白狀態並重新整理頁面</li>
                    </ul>
                    <p className="mt-3 text-red-400 font-bold">⚠️ 此操作無法復原！</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 items-center">
                  <Button 
                    variant="danger" 
                    onClick={async () => {
                      if (!confirm('⚠️ 確定要徹底清除所有資料嗎？\n\n此操作將：\n- 清除所有建築、住戶、車位資料\n- 清除所有預約、日曆、管理費記錄\n- 清除 localStorage 中的所有資料\n- 自動重新整理頁面\n\n此操作無法復原！')) {
                        return;
                      }
                      
                      try {
                        // 使用 LocalStorageManager 清除所有資料
                        await LocalStorageManager.clear();
                        
                        // 清除 Redux state - 使用 clearAllData action
                        dispatch({ type: 'building/clearAllData' });
                        dispatch({ type: 'resident/setResidents', payload: [] });
                        dispatch({ type: 'parking/initializeSpaces', payload: [] });
                        dispatch({ type: 'parking/setZones', payload: [] });
                        dispatch({ type: 'facility/initializeFacilities', payload: [] });
                        dispatch({ type: 'facility/initializeBookings', payload: [] });
                        dispatch({ type: 'calendar/clearAllData' });
                        dispatch({ type: 'fee/clearAllData' });
                        dispatch({ type: 'depositV2/clearAllData' });
                        dispatch({ type: 'eventBus/setDevices', payload: [] });
                        dispatch({ type: 'eventBus/clearEvents' });
                        dispatch({ type: 'deposit/initializeItems', payload: [] });
                        dispatch({ type: 'deposit/initializeMoneyRecords', payload: [] });
                        
                        // 寫入空白狀態到 LocalStorageManager
                        const emptyState = {
                          version: '1.0.0',
                          timestamp: Date.now(),
                          state: {
                            building: { buildings: [], floors: [], units: [], parkingSpaces: [] },
                            resident: { residents: [], statuses: [] },
                            parking: { spaces: [], areas: [], zones: [], spaceTypes: [] },
                            facility: { facilities: [], bookings: [] },
                            calendar: { events: [], currentView: { currentView: 'month', currentDate: new Date().toISOString(), selectedEvents: [] }, selectedDate: new Date().toISOString(), loading: false, error: null },
                            fee: { units: [], periods: [], baseConfigs: [], specialConfigs: [], unitFeeDetails: [], customFeeItems: [] },
                            depositV2: { items: [] },
                            eventBus: { devices: [], events: [] },
                            deposit: { items: [], totalDeposits: 0 }
                          }
                        };
                        await LocalStorageManager.setItem('full-state', emptyState);
                        
                        alert('✅ 資料清理完成！\n\n即將重新整理頁面...');
                        window.location.reload();
                      } catch (error) {
                        console.error('清理失敗:', error);
                        alert('❌ 清理失敗，請查看控制台錯誤訊息');
                      }
                    }}
                    className="px-8 py-3 text-lg"
                  >
                    🧹 執行資料清理
                  </Button>
                  
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    提示：清理後會自動重新整理頁面
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StressTest;

