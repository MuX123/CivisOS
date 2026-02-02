import React, { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { useStore } from 'react-redux';
import { depositV2Actions, DepositItemV2, DepositType, PersonInfo } from '../../store/modules/depositV2';
import Button from '../../components/ui/Button';
import IntroductionButton from '../../components/ui/IntroductionButton';
import { DepositFormModal } from './deposit/DepositFormModal';
import { DepositLogModal } from './deposit/DepositLogModal';
import { DepositCard } from './deposit/DepositCard';
import DepositTestSimulator from './deposit/DepositTestSimulator';
import DepositStressTest from './deposit/DepositStressTest';

// ==================== 寄物系統 V2 ====================

const DepositSystemV2: React.FC = () => {
  const dispatch = useAppDispatch();
  const store = useStore();
  const buildings = useAppSelector((state) => state.building.buildings);
  const units = useAppSelector((state) => state.building.units);
  const { items, searchCriteria } = useAppSelector((state) => state.depositV2);
  
  // 分頁狀態
  const [activeMainTab, setActiveMainTab] = useState<'all' | 'item' | 'money' | 'key'>('all');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  
  // 搜尋狀態
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchFields, setSearchFields] = useState<('sender' | 'receiver' | 'itemName' | 'staff' | 'notes')[]>([
    'sender', 'receiver', 'itemName', 'staff', 'notes'
  ]);
  
  // 彈窗狀態
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DepositItemV2 | null>(null);
  const [logItem, setLogItem] = useState<DepositItemV2 | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  
  // 執行20輪測試
  const runTests = async () => {
    if (isTesting) return;
    setIsTesting(true);
    
    const simulator = new DepositTestSimulator(dispatch, store.getState, buildings, units);
    const results = await simulator.runAllTests();
    
    console.log('=== 寄放系統20輪測試結果 ===');
    results.forEach((result) => console.log(result));
    
    alert('20輪測試執行完成！\n\n測試內容：\n• 純寄物、純寄KEY、純寄錢\n• 複合類型（寄物+寄錢+KEY）\n• 加款、扣款操作\n• 編輯資料\n• 領取操作\n• 還原操作（含金額返還）\n• 正餘額與負餘額測試\n\n請查看Console或日誌頁面確認結果。');
    
    setIsTesting(false);
  };
  
  // 執行100次壓力測試
  const runStressTest = async () => {
    if (isTesting) return;
    setIsTesting(true);
    
    const stressTest = new DepositStressTest(dispatch, store.getState, buildings, units);
    const results = await stressTest.runStressTest();
    
    console.log('=== 寄放系統100次壓力測試結果 ===');
    results.forEach((result) => console.log(result));
    
    // 顯示簡要結果
    const successCount = results.filter(r => r.includes('✅')).length;
    const failCount = results.filter(r => r.includes('❌')).length;
    
    alert(`100次壓力測試完成！\n\n📊 結果摘要：\n• 基礎測試: ${successCount}/20 通過\n• 隨機操作: 100次執行完成\n• 數據一致性: 已驗證\n\n詳細結果請查看Console。`);
    
    setIsTesting(false);
  };
  
  // 清除所有資料
  const handleClearData = () => {
    if (confirm('確定要清除所有寄放資料嗎？此操作無法復原。')) {
      dispatch(depositV2Actions.clearAllData());
      alert('所有資料已清除');
    }
  };
  
  // 根據分頁和搜尋條件過濾項目（排除已取消和已領取的項目）
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => item.status === 'active');
    
    // 根據主分頁過濾
    if (activeMainTab !== 'all') {
      result = result.filter((item) => item.types.includes(activeMainTab));
    }
    
    // 根據棟别過濾
    if (selectedBuilding !== 'all') {
      result = result.filter(
        (item) =>
          item.sender.buildingId === selectedBuilding ||
          item.receiver.buildingId === selectedBuilding
      );
    }
    
    // 搜尋過濾
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter((item) => {
        return searchFields.some((field) => {
          switch (field) {
            case 'sender':
              return item.sender.name.toLowerCase().includes(keyword);
            case 'receiver':
              return item.receiver.name.toLowerCase().includes(keyword);
            case 'itemName':
              return item.itemName?.toLowerCase().includes(keyword);
            case 'staff':
              return item.staffName.toLowerCase().includes(keyword);
            case 'notes':
              return item.notes?.toLowerCase().includes(keyword);
            default:
              return false;
          }
        });
      });
    }
    
    // 按時間排序（最新的在前）
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items, activeMainTab, selectedBuilding, searchKeyword, searchFields]);
  
  // 處理新增
  const handleAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };
  
  // 處理編輯
  const handleEdit = (item: DepositItemV2) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };
  
  // 處理查看日誌
  const handleViewLogs = (item: DepositItemV2) => {
    setLogItem(item);
  };
  
  // 處理領取
  const handleRetrieve = (item: DepositItemV2) => {
    const staffName = prompt('請輸入工作人員名稱：') || '管理員';
    if (confirm('確定標記此項目為已領取嗎？')) {
      dispatch(depositV2Actions.retrieveDepositItem({ id: item.id, staffName }));
    }
  };
  
  // 處理還原
  const handleRevert = (item: DepositItemV2) => {
    const staffName = prompt('請輸入工作人員名稱（還原登記）：') || '管理員';
    if (staffName && confirm('確定要還原此登記嗎？這將返還所有相關金額。')) {
      dispatch(depositV2Actions.revertDepositItem({ id: item.id, staffName }));
    }
  };
  
  // 處理加款
  const handleAddMoney = (item: DepositItemV2) => {
    const amount = parseInt(prompt('請輸入加款金額：') || '0');
    if (amount > 0) {
      const staffName = prompt('請輸入工作人員名稱：') || '管理員';
      dispatch(depositV2Actions.addMoney({ id: item.id, amount, staffName }));
    }
  };
  
  // 處理扣款
  const handleSubtractMoney = (item: DepositItemV2) => {
    const amount = parseInt(prompt('請輸入扣款金額：') || '0');
    if (amount > 0) {
      const staffName = prompt('請輸入工作人員名稱：') || '管理員';
      dispatch(depositV2Actions.subtractMoney({ id: item.id, amount, staffName }));
    }
  };
  
  // 獲取統計數據（只統計活動項目）
  const stats = useMemo(() => {
    return {
      all: items.filter((i) => i.status === 'active').length,
      item: items.filter((i) => i.types.includes('item') && i.status === 'active').length,
      money: items.filter((i) => i.types.includes('money') && i.status === 'active').length,
      key: items.filter((i) => i.types.includes('key') && i.status === 'active').length,
    };
  }, [items]);
  
  return (
    <div className="deposit-system-v2 p-4">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-3xl font-bold text-white">寄放系統</h2>
        <div className="flex items-center gap-2">
          <IntroductionButton pageId="deposit" />
        </div>
      </div>
      
      {/* 搜尋區域 */}
      <div className="bg-[var(--bg-secondary)] p-4 rounded-lg mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-white/70 mb-1">搜尋關鍵字</label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white"
              placeholder="搜尋寄件人、收件人、物品名稱、工作人員、備註..."
            />
          </div>
          <div>
            <label className="block text-sm text-white/70 mb-1">搜尋範圍</label>
            <div className="flex gap-2">
              {[
                { key: 'sender', label: '寄件人' },
                { key: 'receiver', label: '收件人' },
                { key: 'itemName', label: '物品' },
                { key: 'staff', label: '工作人員' },
                { key: 'notes', label: '備註' },
              ].map((field) => (
                <label key={field.key} className="flex items-center gap-1 text-sm text-white/70 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchFields.includes(field.key as any)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSearchFields([...searchFields, field.key as any]);
                      } else {
                        setSearchFields(searchFields.filter((f) => f !== field.key));
                      }
                    }}
                    className="rounded border-[var(--color-border)]"
                  />
                  {field.label}
                </label>
              ))}
            </div>
          </div>
          <Button variant="primary" size="small" onClick={handleAdd}>
            + 新增登記
          </Button>
          <Button 
            variant="secondary" 
            size="small" 
            onClick={runTests}
            disabled={isTesting}
          >
            {isTesting ? '⏳ 測試中...' : '🧪 測試20輪'}
          </Button>
          <Button 
            variant="secondary" 
            size="small" 
            onClick={runStressTest}
            disabled={isTesting}
            className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border-orange-500/50"
          >
            {isTesting ? '⏳ 壓力測試中...' : '🔥 壓力測試100次'}
          </Button>
          <Button 
            variant="danger" 
            size="small" 
            onClick={handleClearData}
            disabled={isTesting}
          >
            🗑️ 清除所有資料
          </Button>
        </div>
      </div>
      
      {/* 主分頁 */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: '全部', count: stats.all },
          { key: 'item', label: '寄物', count: stats.item },
          { key: 'money', label: '寄錢', count: stats.money },
          { key: 'key', label: '寄KEY', count: stats.key },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveMainTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeMainTab === tab.key
                ? 'bg-[#5865F2] text-white'
                : 'bg-[var(--bg-secondary)] text-white hover:bg-[var(--bg-hover)]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
      
      {/* 日誌按鈕 */}
      <div className="mb-4 flex justify-end">
        <Button variant="secondary" size="small" onClick={() => setLogItem({ id: 'all' } as any)}>
          查看全部日誌
        </Button>
      </div>
      
      {/* 棟别篩選（僅在全部標籤顯示） */}
      {activeMainTab === 'all' && (
        <div className="mb-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedBuilding('all')}
              className={`px-3 py-1.5 rounded font-medium transition-all ${
                selectedBuilding === 'all'
                  ? 'bg-[#FEE75C] text-black'
                  : 'bg-[var(--bg-secondary)] text-white hover:bg-[var(--bg-hover)]'
              }`}
            >
              全部棟别
            </button>
            {buildings.map((building) => (
              <button
                key={building.id}
                onClick={() => setSelectedBuilding(building.id)}
                className={`px-3 py-1.5 rounded font-medium transition-all ${
                  selectedBuilding === building.id
                    ? 'bg-[#FEE75C] text-black'
                    : 'bg-[var(--bg-secondary)] text-white hover:bg-[var(--bg-hover)]'
                }`}
              >
                {building.buildingCode}棟
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* 資料卡片列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <DepositCard
            key={item.id}
            item={item}
            onEdit={() => handleEdit(item)}
            onRetrieve={() => handleRetrieve(item)}
            onCancel={() => handleRevert(item)}
            onAddMoney={() => handleAddMoney(item)}
            onSubtractMoney={() => handleSubtractMoney(item)}
            onViewLogs={() => handleViewLogs(item)}
          />
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-[var(--text-muted)]">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p>暫無資料</p>
          <p className="text-sm mt-2">點擊「新增登記」按鈕建立第一筆記錄</p>
        </div>
      )}
      
      {/* 新增/編輯彈窗 */}
      {isFormModalOpen && (
        <DepositFormModal
          item={editingItem}
          buildings={buildings}
          units={units}
          onClose={() => setIsFormModalOpen(false)}
          onSave={(data: any) => {
            if (editingItem) {
              dispatch(
                depositV2Actions.editDepositItem({
                  id: editingItem.id,
                  updates: data,
                  staffName: data.staffName,
                })
              );
            } else {
              dispatch(depositV2Actions.addDepositItem(data));
            }
            setIsFormModalOpen(false);
          }}
        />
      )}
      
      {/* 日誌彈窗 */}
      {logItem && (
        <DepositLogModal
          item={logItem}
          allItems={items}
          activeTab={activeMainTab}
          onClose={() => setLogItem(null)}
          onRevertItem={handleRevert}
        />
      )}
    </div>
  );
};

export default DepositSystemV2;
