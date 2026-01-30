import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateConfigs } from '../../store/modules/config';
import { initializeStore } from '../../store/storeInitializer';
import PersistenceTester from '../../utils/persistenceTester';

const PersistenceDemo: React.FC = () => {
  const dispatch = useAppDispatch();
  const { configs } = useAppSelector(state => state.config);
  const [testResults, setTestResults] = useState<Record<string, boolean> | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  useEffect(() => {
    // Initialize demo data if needed
    if (configs.length === 0) {
      dispatch(updateConfigs([
        {
          id: 'demo-theme',
          key: 'theme',
          value: 'discord-dark',
          category: 'ui',
          description: 'Demo theme setting',
        },
        {
          id: 'demo-language',
          key: 'language',
          value: 'zh-TW',
          category: 'ui',
          description: 'Demo language setting',
        },
      ]));
    }
  }, [configs, dispatch]);

  const runPersistenceTests = async () => {
    setIsRunningTests(true);
    const tester = new PersistenceTester();
    const results = await tester.runAllTests();
    setTestResults(results);
    setIsRunningTests(false);
  };

  const simulateDataChange = () => {
    const newConfig = {
      id: `demo-${Date.now()}`,
      key: 'test-setting',
      value: `value-${Date.now()}`,
      category: 'test' as const,
      description: 'Test configuration created at ' + new Date().toLocaleString(),
    };
    
    dispatch(updateConfigs([newConfig]));
  };

  const clearPersistedData = async () => {
    const { clearPersistedState } = await import('../../store');
    await clearPersistedState();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-white mb-6">數據持久化測試</h2>
        
        <div className="space-y-4">
          <div className="bg-[#36393f] p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">當前配置數據</h3>
            <div className="space-y-2">
              {configs.map(config => (
                <div key={config.id} className="flex justify-between items-center text-[#dcddde]">
                  <span className="font-medium">{config.key}</span>
                  <span className="text-[#b9bbbe]">{config.value}</span>
                </div>
              ))}
              {configs.length === 0 && (
                <p className="text-[#b9bbbe]">暫無配置數據</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={simulateDataChange}
              className="bg-[#5865f2] hover:bg-[#4752c4]"
              disabled={isRunningTests}
            >
              模擬數據變更
            </Button>
            
            <Button 
              onClick={runPersistenceTests}
              className="bg-[#57f287] hover:bg-[#3ba55d]"
              disabled={isRunningTests}
            >
              {isRunningTests ? '測試中...' : '運行持久化測試'}
            </Button>
            
            <Button 
              onClick={clearPersistedData}
              className="bg-[#ed4245] hover:bg-[#c93a3a]"
              disabled={isRunningTests}
            >
              清除持久化數據
            </Button>
          </div>

          {testResults && (
            <div className="bg-[#36393f] p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">測試結果</h3>
              <div className="space-y-2">
                {Object.entries(testResults).map(([test, passed]) => (
                  <div key={test} className="flex justify-between items-center text-[#dcddde]">
                    <span className="capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={passed ? 'text-[#57f287]' : 'text-[#ed4245]'}>
                      {passed ? '✓ 通過' : '✗ 失敗'}
                    </span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-[#4f545c]">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">整體結果</span>
                    <span className={Object.values(testResults).every(v => v) ? 'text-[#57f287]' : 'text-[#ed4245]'}>
                      {Object.values(testResults).every(v => v) ? '✓ 全部通過' : '✗ 部分失敗'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[#36393f] p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">使用說明</h3>
            <ul className="space-y-2 text-[#dcddde] text-sm">
              <li className="flex items-start">
                <span className="text-[#b9bbbe] mr-2">•</span>
                <span>點擊「模擬數據變更」來創建新的配置數據，這些數據會自動保存到本地存儲</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#b9bbbe] mr-2">•</span>
                <span>點擊「運行持久化測試」來驗證本地存儲功能是否正常工作</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#b9bbbe] mr-2">•</span>
                <span>刷新頁面後，你的數據應該會自動恢復（除非你清除了持久化數據）</span>
              </li>
              <li className="flex items-start">
                <span className="text-[#b9bbbe] mr-2">•</span>
                <span>點擊「清除持久化數據」來重置所有保存的數據</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#f38ba8] bg-opacity-20 border border-[#f38ba8] p-3 rounded-lg">
            <p className="text-sm text-[#f38ba8]">
              💡 提示：嘗試創建一些配置數據，然後刷新頁面來測試數據是否會被恢復！
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PersistenceDemo;