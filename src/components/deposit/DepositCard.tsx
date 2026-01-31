import React from 'react';
import { DepositItem, DepositMoney } from '../../types/domain';

interface DepositCardProps {
  type: 'key' | 'money';
  deposit: DepositItem | DepositMoney;
  onEdit?: (deposit: DepositItem | DepositMoney) => void;
  onAddTransaction?: (deposit: DepositMoney) => void;
  onDelete?: (id: string) => void;
}

const DepositCard: React.FC<DepositCardProps> = ({
  type,
  deposit,
  onEdit,
  onAddTransaction,
  onDelete,
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // 寄KEY/寄磁扣卡片
  if (type === 'key') {
    const keyDeposit = deposit as DepositItem;
    return (
      <div className="deposit-card key-card">
        <div className="deposit-header">
          <h4 className="deposit-title">
            {keyDeposit.unit?.unitNumber || '未知戶別'}
          </h4>
          <span className={`deposit-status ${keyDeposit.status}`}>
            {keyDeposit.status === 'deposited' ? '已寄放' : '已領回'}
          </span>
        </div>

        <div className="deposit-details">
          <div className="detail-row">
            <span className="detail-label">類型</span>
            <span className="detail-value">
              {keyDeposit.type === 'key' ? '鑰匙' : '磁扣'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">名稱</span>
            <span className="detail-value">{keyDeposit.itemName}</span>
          </div>
          {keyDeposit.depositedBy && (
            <div className="detail-row">
              <span className="detail-label">寄放人</span>
              <span className="detail-value">{keyDeposit.depositedBy}</span>
            </div>
          )}
          <div className="detail-row">
            <span className="detail-label">寄放時間</span>
            <span className="detail-value">{formatDate(keyDeposit.depositedAt)}</span>
          </div>
          {keyDeposit.notes && (
            <div className="detail-row notes">
              <span className="detail-label">備註</span>
              <span className="detail-value">{keyDeposit.notes}</span>
            </div>
          )}
        </div>

        <div className="deposit-actions">
          <button className="btn-action edit" onClick={() => onEdit?.(deposit)}>
            編輯
          </button>
          <button className="btn-action delete" onClick={() => onDelete?.(keyDeposit.id)}>
            刪除
          </button>
        </div>
      </div>
    );
  }

  // 寄錢卡片
  const moneyDeposit = deposit as DepositMoney;
  return (
    <div className="deposit-card money-card">
      <div className="deposit-header">
        <h4 className="deposit-title">
          {moneyDeposit.unit?.unitNumber || '未知戶別'}
        </h4>
        <span className="deposit-balance">
          餘額: ${moneyDeposit.balance.toLocaleString()}
        </span>
      </div>

      <div className="deposit-details">
        {/* 交易記錄 */}
        {moneyDeposit.transactions && moneyDeposit.transactions.length > 0 && (
          <div className="transaction-list">
            <h5>交易紀錄</h5>
            {moneyDeposit.transactions.map((tx) => (
              <div key={tx.id} className={`transaction-row ${tx.type}`}>
                <span className="tx-type">
                  {tx.type === 'add' ? '加款' : '減款'}
                </span>
                <span className="tx-amount">${tx.amount.toLocaleString()}</span>
                <span className="tx-date">{formatDate(tx.transactionDate)}</span>
                <span className="tx-collector">收款人: {tx.collectedBy}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="deposit-actions">
        <button
          className="btn-action add"
          onClick={() => onAddTransaction?.(moneyDeposit)}
        >
          加款
        </button>
        <button
          className="btn-action subtract"
          onClick={() => onAddTransaction?.(moneyDeposit)}
        >
          減款
        </button>
        <button className="btn-action edit" onClick={() => onEdit?.(deposit)}>
          編輯
        </button>
        <button className="btn-action delete" onClick={() => onDelete?.(moneyDeposit.id)}>
          刪除
        </button>
      </div>
    </div>
  );
};

export default DepositCard;
