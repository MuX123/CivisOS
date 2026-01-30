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
          category: 'general',
          description: 'Demo theme setting',
        },
        {
          id: 'demo-language',
          key: 'language',
          value: 'zh-TW',
          category: 'general',
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
      category: 'general' as const,
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
          <div className="bg-[var(--color-surface)] p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">當前配置數據</h3>
            <div className="space-y-2">
              {configs.map(config => (
                <div key={config.id} className="flex justify-between items-center text-[var(--color-text-primary)]">
                  <span className="font-medium">{config.key}</span>
                  <span className="text-[var(--color-text-secondary)]">{config.value}</span>
                </div>
              ))}
              {configs.length === 0 && (
                <p className="text-[var(--color-text-secondary)]">暫無配置數據</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={simulateDataChange}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
              disabled={isRunningTests}
            >
              模擬數據變更
            </Button>

            <Button
              onClick={runPersistenceTests}
              className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/80"
              disabled={isRunningTests}
            >
              {isRunningTests ? '測試中...' : '運行持久化測試'}
            </Button>

            <Button
              onClick={clearPersistedData}
              className="bg-[var(--color-danger)] hover:bg-[var(--color-danger)]/80"
              disabled={isRunningTests}
            >
              清除持久化數據
            </Button>
          </div>

          {testResults && (
            <div className="bg-[var(--color-surface)] p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-3">測試結果</h3>
              <div className="space-y-2">
                {Object.entries(testResults).map(([test, passed]) => (
                  <div key={test} className="flex justify-between items-center text-[var(--color-text-primary)]">
                    <span className="capitalize">{test.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={passed ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
                      {passed ? '✓ 通過' : '✗ 失敗'}
                    </span>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">整體結果</span>
                    <span className={Object.values(testResults).every(v => v) ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}>
                      {Object.values(testResults).every(v => v) ? '✓ 全部通過' : '✗ 部分失敗'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-[var(--color-surface)] p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">使用說明</h3>
            <ul className="space-y-2 text-[var(--color-text-primary)] text-sm">
              <li className="flex items-start">
                <span className="text-[var(--color-text-secondary)] mr-2">•</span>
                <span>點擊「模擬數據變更」來創建新的配置數據，這些數據會自動保存到本地存儲</span>
              </li>
              <li className="flex items-start">
                <span className="text-[var(--color-text-secondary)] mr-2">•</span>
                <span>點擊「運行持久化測試」來驗證本地存儲功能是否正常工作</span>
              </li>
              <li className="flex items-start">
                <span className="text-[var(--color-text-secondary)] mr-2">•</span>
                <span>刷新頁面後，你的數據應該會自動恢復（除非你清除了持久化數據）</span>
              </li>
              <li className="flex items-start">
                <span className="text-[var(--color-text-secondary)] mr-2">•</span>
                <span>點擊「清除持久化數據」來重置所有保存的數據</span>
              </li>
            </ul>
          </div>

          <div className="bg-[var(--color-info)] bg-opacity-20 border border-[var(--color-info)] p-3 rounded-lg">
            <p className="text-sm text-[var(--color-info)]">
              💡 提示：嘗試創建一些配置數據，然後刷新頁面來測試數據是否會被恢復！
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PersistenceDemo;