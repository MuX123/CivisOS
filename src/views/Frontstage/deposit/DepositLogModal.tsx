import React from 'react';
import { DepositItemV2, DepositLog } from '../../../store/modules/depositV2';
import Button from '../../../components/ui/Button';

interface DepositLogModalProps {
  item: DepositItemV2;
  allItems: DepositItemV2[];
  activeTab: 'all' | 'item' | 'money' | 'key';
  onClose: () => void;
  onRevertItem: (item: DepositItemV2) => void;
}

export const DepositLogModal: React.FC<DepositLogModalProps> = ({
  item,
  allItems,
  activeTab,
  onClose,
  onRevertItem,
}) => {
  const isAllLogs = item.id === 'all';
  
  // 獲取要顯示的日誌
  const getLogsToShow = (): { log: DepositLog; item: DepositItemV2 }[] => {
    if (isAllLogs) {
      // 全部日誌 - 根據當前分頁過濾
      let itemsToShow = allItems;
      if (activeTab !== 'all') {
        itemsToShow = allItems.filter((i) => i.types.includes(activeTab));
      }
      
      const allLogs: { log: DepositLog; item: DepositItemV2 }[] = [];
      itemsToShow.forEach((i) => {
        i.logs.forEach((log) => {
          allLogs.push({ log, item: i });
        });
      });
      
      // 按時間排序
      return allLogs.sort((a, b) => new Date(b.log.timestamp).getTime() - new Date(a.log.timestamp).getTime());
    } else {
      // 單個項目的日誌
      return item.logs.map((log) => ({ log, item })).sort(
        (a, b) => new Date(b.log.timestamp).getTime() - new Date(a.log.timestamp).getTime()
      );
    }
  };
  
  const logs = getLogsToShow();
  
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      item: '寄物',
      money: '寄錢',
      key: '寄KEY',
    };
    return labels[type] || type;
  };
  
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      item: 'bg-blue-500',
      money: 'bg-green-500',
      key: 'bg-purple-500',
    };
    return colors[type] || 'bg-gray-500';
  };
  
  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: '新增登記',
      edit: '編輯資料',
      retrieve: '完成領取',
      cancel: '取消登記',
      add_money: '加款',
      subtract_money: '扣款',
    };
    return labels[action] || action;
  };
  
  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'text-green-400',
      edit: 'text-blue-400',
      retrieve: 'text-purple-400',
      cancel: 'text-red-400',
      add_money: 'text-green-400',
      subtract_money: 'text-orange-400',
    };
    return colors[action] || 'text-white';
  };
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-full max-w-3xl shadow-2xl border border-[var(--color-border)] max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {isAllLogs ? '全部日誌記錄' : '日誌記錄'}
          </h3>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {logs.map(({ log, item: logItem }) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border ${
                  log.isReverted
                    ? 'bg-gray-500/20 border-gray-500/30 opacity-50'
                    : 'bg-[var(--bg-secondary)] border-[var(--color-border)]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* 類型標籤 */}
                    <div className="flex gap-1 mb-2">
                      {logItem.types.map((type) => (
                        <span
                          key={type}
                          className={`px-1.5 py-0.5 rounded text-xs text-white font-medium ${getTypeColor(type)}`}
                        >
                          {getTypeLabel(type)}
                        </span>
                      ))}
                    </div>
                    
                    {/* 物品名稱 */}
                    <div className="text-white font-medium mb-1">
                      {logItem.itemName || '無物品名稱'}
                    </div>
                    
                    {/* 寄件人和收件人 */}
                    <div className="text-sm text-white/70 mb-2">
                      <span className="text-white/50">寄件人：</span>{logItem.sender.name}
                      <span className="mx-2">|</span>
                      <span className="text-white/50">收件人：</span>{logItem.receiver.name}
                    </div>
                    
                    {/* 動作 */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                      {log.isReverted && (
                        <span className="px-1.5 py-0.5 bg-gray-500/30 text-gray-400 text-xs rounded">
                          已還原
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-white/70">{log.details}</div>
                    
                    {/* 金額顯示 */}
                    {log.amount !== undefined && log.amount !== 0 && (
                      <div className={`text-sm font-medium mt-1 ${log.amount > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                        {log.action === 'subtract_money' || log.action === 'cancel' 
                          ? `扣款/返還：$${Math.abs(log.amount).toLocaleString()}` 
                          : `金額：$${log.amount.toLocaleString()}`}
                      </div>
                    )}
                    
                    <div className="text-xs text-white/40 mt-1">
                      {formatDate(log.timestamp)} · 工作人員：{log.staffName}
                    </div>
                  </div>
                  
                  {/* 還原按鈕（僅對新增的記錄且項目仍活動時顯示） */}
                  {log.action === 'create' && logItem.status === 'active' && (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => onRevertItem(logItem)}
                      className="ml-2"
                    >
                      還原
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {logs.length === 0 && (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <p>暫無日誌記錄</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
          <Button variant="secondary" onClick={onClose} className="w-full">
            關閉
          </Button>
        </div>
      </div>
    </div>
  );
};
