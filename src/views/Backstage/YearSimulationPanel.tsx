/**
 * 一年模擬測試面板
 * 提供完整的模擬功能，顯示創建順序，以穩定速度創建資料
 */
import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { simulationService, SimulationLog } from '../../services/simulationService';
import { useAppDispatch } from '../../store/hooks';

interface SimulationProgress {
  phase: string;
  step: string;
  progress: number;
  total: number;
  message: string;
}

const YearSimulationPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<SimulationProgress | null>(null);
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const [config, setConfig] = useState({
    buildingCount: 2,
    floorsPerBuilding: 12,
    unitsPerFloor: 4,
    residentPercentage: 0.7,
    yearDuration: 12,
    creationSpeed: 100, // 毫秒
  });

  const handleProgress = useCallback((phase: string, step: string, prog: number, total: number, message: string) => {
    setProgress({ phase, step, progress: prog, total, message });
  }, []);

  const runSimulation = async () => {
    if (isRunning) return;
    
    if (!confirm(`⚠️ 準備執行一年模擬測試\n\n此操作將會創建：\n- ${config.buildingCount} 棟建築物\n- ${config.floorsPerBuilding * config.buildingCount} 層樓\n- ${config.floorsPerBuilding * config.unitsPerFloor * config.buildingCount} 戶住戶\n- 車位、公設、管理費、預約等資料\n\n確定要繼續嗎？`)) {
      return;
    }

    setIsRunning(true);
    setLogs([]);
    
    try {
      await simulationService.runSimulation(config, handleProgress);
      
      // 獲取最終日誌
      setLogs(simulationService.getLogs());
      
      alert(`✅ 一年模擬測試完成！\n\n請查看控制台或下方的日誌記錄以了解詳細創建過程。`);
    } catch (error) {
      console.error('模擬失敗:', error);
      alert(`❌ 模擬失敗：${error}`);
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  const stopSimulation = () => {
    simulationService.stop();
    setIsRunning(false);
    setProgress(null);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // 創建順序說明
  const creationOrder = [
    { phase: 'PHASE_1', name: '後台設定', description: '系統設定、狀態顏色、車位類型等基礎配置' },
    { phase: 'PHASE_2', name: '建築物結構', description: '棟別、樓層、戶別的建立' },
    { phase: 'PHASE_3', name: '車位設定', description: '停車區域與車位的創建' },
    { phase: 'PHASE_4', name: '住戶資料', description: '住戶、成員、車牌、門禁卡的登記' },
    { phase: 'PHASE_5', name: '公設資料', description: '游泳池、健身房、會議室等公設' },
    { phase: 'PHASE_6', name: '管理費設定', description: '費率配置與額外費用項目' },
    { phase: 'PHASE_7', name: '公設預約', description: '住戶對公設的預約紀錄' },
    { phase: 'PHASE_8', name: '寄放資料', description: '包裹、鑰匙、款項的寄放紀錄' },
    { phase: 'PHASE_9', name: '行事曆事件', description: '社區活動、會議、公告等事件' },
  ];

  return (
    <div className="year-simulation-panel">
      <Card>
        <CardHeader>
          <CardTitle>📅 一年模擬測試</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 創建順序說明 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-3 uppercase tracking-wide">
              創建順序說明
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {creationOrder.map((item, index) => (
                <div 
                  key={item.phase}
                  className="flex items-start gap-3 p-3 bg-[var(--bg-tertiary)] rounded-lg"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-[var(--brand-experiment)] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-[var(--text-normal)]">{item.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 配置選項 */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-3 uppercase tracking-wide">
              模擬配置
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">棟數</label>
                <input
                  type="number"
                  value={config.buildingCount}
                  onChange={(e) => setConfig({ ...config, buildingCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--color-border)] rounded text-[var(--text-normal)]"
                  min="1"
                  max="10"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">每棟樓層數</label>
                <input
                  type="number"
                  value={config.floorsPerBuilding}
                  onChange={(e) => setConfig({ ...config, floorsPerBuilding: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--color-border)] rounded text-[var(--text-normal)]"
                  min="1"
                  max="30"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">每層戶數</label>
                <input
                  type="number"
                  value={config.unitsPerFloor}
                  onChange={(e) => setConfig({ ...config, unitsPerFloor: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--color-border)] rounded text-[var(--text-normal)]"
                  min="1"
                  max="10"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">入住率 (%)</label>
                <input
                  type="number"
                  value={Math.round(config.residentPercentage * 100)}
                  onChange={(e) => setConfig({ ...config, residentPercentage: (parseInt(e.target.value) || 70) / 100 })}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--color-border)] rounded text-[var(--text-normal)]"
                  min="0"
                  max="100"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">模擬月數</label>
                <input
                  type="number"
                  value={config.yearDuration}
                  onChange={(e) => setConfig({ ...config, yearDuration: parseInt(e.target.value) || 12 })}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--color-border)] rounded text-[var(--text-normal)]"
                  min="1"
                  max="24"
                  disabled={isRunning}
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">創建速度 (ms)</label>
                <input
                  type="number"
                  value={config.creationSpeed}
                  onChange={(e) => setConfig({ ...config, creationSpeed: parseInt(e.target.value) || 100 })}
                  className="w-full px-3 py-2 bg-[var(--bg-tertiary)] border border-[var(--color-border)] rounded text-[var(--text-normal)]"
                  min="10"
                  max="1000"
                  disabled={isRunning}
                />
              </div>
            </div>
            <div className="mt-2 text-xs text-[var(--text-muted)]">
              預計創建：{config.buildingCount * config.floorsPerBuilding * config.unitsPerFloor} 戶住戶，
              約 {Math.round(config.buildingCount * config.floorsPerBuilding * config.unitsPerFloor * config.residentPercentage)} 位住戶
            </div>
          </div>

          {/* 進度顯示 */}
          {progress && (
            <div className="mb-6 p-4 bg-[var(--bg-tertiary)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[var(--text-normal)]">
                  {progress.phase.replace('PHASE_', '第 ').replace('_', ' 階段：')}
                </span>
                <span className="text-sm text-[var(--text-muted)]">
                  {progress.progress} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 mb-2">
                <div 
                  className="bg-[var(--brand-experiment)] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.progress / progress.total) * 100}%` }}
                />
              </div>
              <div className="text-sm text-[var(--text-muted)]">{progress.message}</div>
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="flex gap-3 mb-6">
            {!isRunning ? (
              <Button 
                variant="primary" 
                onClick={runSimulation}
                className="px-6 py-2"
              >
                🚀 開始一年模擬
              </Button>
            ) : (
              <Button 
                variant="danger" 
                onClick={stopSimulation}
                className="px-6 py-2"
              >
                ⏹️ 停止模擬
              </Button>
            )}
            <Button 
              variant="secondary" 
              onClick={clearLogs}
              className="px-6 py-2"
              disabled={logs.length === 0}
            >
              🧹 清除日誌
            </Button>
          </div>

          {/* 日誌記錄 */}
          {logs.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  創建日誌 ({logs.length} 筆)
                </h3>
              </div>
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-1">
                  {logs.map((log, index) => (
                    <div 
                      key={index}
                      className={`text-xs font-mono py-1 px-2 rounded ${
                        log.success 
                          ? 'text-[var(--text-normal)] bg-[var(--bg-secondary)]' 
                          : 'text-red-400 bg-red-900/20'
                      }`}
                    >
                      <span className="text-[var(--text-muted)]">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                      <span className="text-[var(--brand-experiment)] ml-2">[{log.phase}]</span>
                      <span className="ml-2">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default YearSimulationPanel;
