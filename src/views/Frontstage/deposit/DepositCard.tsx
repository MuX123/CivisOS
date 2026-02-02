import React from 'react';
import { DepositItemV2 } from '../../../store/modules/depositV2';
import Button from '../../../components/ui/Button';

interface DepositCardProps {
  item: DepositItemV2;
  onEdit: () => void;
  onRetrieve: () => void;
  onCancel: () => void;
  onAddMoney: () => void;
  onSubtractMoney: () => void;
  onViewLogs: () => void;
}

export const DepositCard: React.FC<DepositCardProps> = ({
  item,
  onEdit,
  onRetrieve,
  onCancel,
  onAddMoney,
  onSubtractMoney,
  onViewLogs,
}) => {
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
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const hasMoney = item.types.includes('money');
  
  return (
    <div className="bg-[var(--bg-secondary)] rounded-lg border border-[var(--color-border)] p-4 relative">
      {/* 類型標籤 */}
      <div className="flex gap-1 mb-3">
        {item.types.map((type) => (
          <span
            key={type}
            className={`px-2 py-0.5 rounded text-xs text-white font-medium ${getTypeColor(type)}`}
          >
            {getTypeLabel(type)}
          </span>
        ))}
      </div>
      
      {/* 主要資訊 */}
      <div className="space-y-2 mb-4">
        <div className="text-white font-medium text-lg">
          {item.itemName || '無物品名稱'}
        </div>
        
        <div className="text-sm text-white/70">
          <span className="text-white/50">寄件人：</span>
          {item.sender.name}
          {item.sender.buildingId && item.sender.unitId && (
            <span className="text-xs ml-1 text-white/40">
              ({item.sender.unitId})
            </span>
          )}
        </div>
        
        <div className="text-sm text-white/70">
          <span className="text-white/50">收件人：</span>
          {item.receiver.name}
          {item.receiver.buildingId && item.receiver.unitId && (
            <span className="text-xs ml-1 text-white/40">
              ({item.receiver.unitId})
            </span>
          )}
        </div>
        
        {/* 餘額（如果是寄錢） */}
        {hasMoney && item.currentBalance !== undefined && (
          <div className="text-sm">
            {item.currentBalance === 0 ? (
              <>
                <span className="text-white/50">目前餘額：</span>
                <span className="text-gray-400">$0 (無餘額)</span>
              </>
            ) : item.currentBalance > 0 ? (
              <>
                <span className="text-white/50">目前餘額：</span>
                <span className="text-green-400">${item.currentBalance.toLocaleString()}</span>
              </>
            ) : (
              <>
                <span className="text-white/50">欠款金額：</span>
                <span className="text-red-400">${Math.abs(item.currentBalance).toLocaleString()}</span>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* 底部資訊 */}
      <div className="text-xs text-white/40 mb-4">
        <div>工作人員：{item.staffName}</div>
        <div>登記時間：{formatDate(item.createdAt)}</div>
      </div>
      
      {/* 按鈕區域 */}
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="small" onClick={onEdit}>
          編輯
        </Button>
        <Button variant="secondary" size="small" onClick={onViewLogs}>
          日誌
        </Button>
        
        {hasMoney && (
          <>
            <Button variant="secondary" size="small" onClick={onAddMoney}>
              加款
            </Button>
            <Button variant="secondary" size="small" onClick={onSubtractMoney}>
              扣款
            </Button>
          </>
        )}
        
        <Button variant="primary" size="small" onClick={onRetrieve}>
          領取
        </Button>
        <Button variant="primary" size="small" onClick={onCancel}>
          還原
        </Button>
      </div>
    </div>
  );
};
