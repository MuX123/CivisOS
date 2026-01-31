import React, { useState } from 'react';
import { MoneyTransaction } from '../../types/domain';

interface TransactionModalProps {
  type: 'add' | 'subtract';
  onSubmit: (transaction: Omit<MoneyTransaction, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  type,
  onSubmit,
  onClose,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [collectedBy, setCollectedBy] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type,
      amount: Number(amount),
      transactionDate,
      collectedBy,
      notes,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{type === 'add' ? '加款' : '減款'}</h3>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>數目</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="輸入金額"
              required
              min="0"
            />
          </div>

          <div className="form-group">
            <label>收款時間</label>
            <input
              type="datetime-local"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>誰收的</label>
            <input
              type="text"
              value={collectedBy}
              onChange={(e) => setCollectedBy(e.target.value)}
              placeholder="輸入收款人姓名"
              required
            />
          </div>

          <div className="form-group">
            <label>備註</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="輸入備註說明"
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-submit">
              {type === 'add' ? '確認加款' : '確認減款'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
