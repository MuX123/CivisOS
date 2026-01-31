import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { DepositItem, DepositMoney } from '../../types/domain';
import '../../assets/styles/deposit.css';

const DepositSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'key' | 'money'>('key');
  const [items, setItems] = useState<DepositItem[]>([]);
  const [moneyRecords, setMoneyRecords] = useState<DepositMoney[]>([]);
  const [isMoneyModalOpen, setIsMoneyModalOpen] = useState(false);

  useEffect(() => {
    // 模擬物品寄放數據
    const mockItems: DepositItem[] = [
      {
        id: 'D001',
        unitId: 'U001',
        type: 'key',
        itemName: '大門鑰匙',
        notes: '住戶出差寄放',
        depositedAt: new Date().toISOString(),
        depositedBy: '張三',
        status: 'deposited',
      },
      {
        id: 'D002',
        unitId: 'U002',
        type: 'card',
        itemName: '電梯磁扣',
        notes: '',
        depositedAt: new Date(Date.now() - 86400000).toISOString(),
        depositedBy: '李四',
        status: 'deposited',
      },
    ];

    // 模擬金額寄放數據
    const mockMoney: DepositMoney[] = [
      {
        id: 'M001',
        unitId: 'U001',
        type: 'deposit',
        balance: 5000,
        transactions: [
          {
            id: 'T001',
            type: 'add',
            amount: 5000,
            transactionDate: new Date().toISOString(),
            collectedBy: '管理員',
            notes: '押金',
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    setItems(mockItems);
    setMoneyRecords(mockMoney);
  }, []);

  const handleRetrieve = (id: string) => {
    if (confirm('確定要領回此物品嗎？')) {
      setItems(items.map((i) => (i.id === id ? { ...i, status: 'retrieved', retrievedAt: new Date().toISOString() } : i)));
    }
  };

  const handleAddMoney = (data: { unitId: string; type: 'add' | 'subtract'; amount: number; collectedBy: string; notes?: string }) => {
    const record = moneyRecords.find((r) => r.unitId === data.unitId);
    if (record) {
      const newTransaction = {
        id: `T-${Date.now()}`,
        ...data,
        transactionDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setMoneyRecords(
        moneyRecords.map((r) =>
          r.id === record.id
            ? {
                ...r,
                balance: data.type === 'add' ? r.balance + data.amount : r.balance - data.amount,
                transactions: [...r.transactions, newTransaction],
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
    } else {
      // 新建記錄
      const newRecord: DepositMoney = {
        id: `M-${Date.now()}`,
        unitId: data.unitId,
        type: 'deposit',
        balance: data.type === 'add' ? data.amount : -data.amount,
        transactions: [
          {
            id: `T-${Date.now()}`,
            ...data,
            transactionDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setMoneyRecords([...moneyRecords, newRecord]);
    }
    setIsMoneyModalOpen(false);
  };

  return (
    <div className="deposit-system">
      <div className="page-header">
        <div className="header-content">
          <h1>寄放系統</h1>
          <p>管理住戶寄放物品與款項</p>
        </div>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => setIsMoneyModalOpen(true)}>
            金額操作
          </Button>
          <Button variant="primary">新增寄放</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="deposit-tabs">
            <button
              className={`deposit-tab ${activeTab === 'key' ? 'active' : ''}`}
              onClick={() => setActiveTab('key')}
            >
              鑰匙/磁扣
            </button>
            <button
              className={`deposit-tab ${activeTab === 'money' ? 'active' : ''}`}
              onClick={() => setActiveTab('money')}
            >
              寄錢/貨款
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'key' ? (
            <div className="deposit-list">
              {items.length === 0 ? (
                <div className="empty-state">
                  <h4>沒有寄放物品</h4>
                  <p>點擊上方按鈕新增寄放</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="deposit-item">
                    <div className="deposit-info">
                      <div className="deposit-type">
                        <span className={`type-badge ${item.type}`}>
                          {item.type === 'key' ? '鑰匙' : '磁扣'}
                        </span>
                      </div>
                      <div className="deposit-details">
                        <h4>{item.itemName}</h4>
                        <p>戶別：{item.unitId}</p>
                        {item.notes && <p className="notes">備註：{item.notes}</p>}
                        <p className="date">寄放日期：{new Date(item.depositedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="deposit-actions">
                      {item.status === 'deposited' && (
                        <Button variant="secondary" size="small" onClick={() => handleRetrieve(item.id)}>
                          領回
                        </Button>
                      )}
                      <span className={`status ${item.status}`}>
                        {item.status === 'deposited' ? '已寄放' : '已領回'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="money-list">
              {moneyRecords.length === 0 ? (
                <div className="empty-state">
                  <h4>沒有寄放款項</h4>
                  <p>點擊上方按鈕進行金額操作</p>
                </div>
              ) : (
                moneyRecords.map((record) => (
                  <div key={record.id} className="money-item">
                    <div className="money-header">
                      <h4>戶別：{record.unitId}</h4>
                      <span className="balance">NT$ {record.balance.toLocaleString()}</span>
                    </div>
                    <div className="transactions">
                      {record.transactions.map((txn) => (
                        <div key={txn.id} className={`transaction ${txn.type}`}>
                          <span className="txn-type">{txn.type === 'add' ? '加款' : '減款'}</span>
                          <span className="txn-amount">{txn.type === 'add' ? '+' : '-'}{txn.amount}</span>
                          <span className="txn-date">{new Date(txn.transactionDate).toLocaleDateString()}</span>
                          <span className="txn-collector">{txn.collectedBy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 金額操作 Modal (簡化版) */}
      {isMoneyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsMoneyModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>金額操作</h3>
              <button className="modal-close" onClick={() => setIsMoneyModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>戶別</label>
                <input type="text" id="deposit-unitId" placeholder="輸入戶別編號" />
              </div>
              <div className="form-group">
                <label>操作類型</label>
                <select id="deposit-type">
                  <option value="add">加款</option>
                  <option value="subtract">減款</option>
                </select>
              </div>
              <div className="form-group">
                <label>金額</label>
                <input type="number" id="deposit-amount" placeholder="輸入金額" />
              </div>
              <div className="form-group">
                <label>經手人</label>
                <input type="text" id="deposit-collector" placeholder="輸入經手人姓名" />
              </div>
              <div className="form-group">
                <label>備註</label>
                <input type="text" id="deposit-notes" placeholder="輸入備註" />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setIsMoneyModalOpen(false)}>取消</button>
                <button
                  className="btn-save"
                  onClick={() => {
                    handleAddMoney({
                      unitId: (document.getElementById('deposit-unitId') as HTMLInputElement).value,
                      type: (document.getElementById('deposit-type') as HTMLSelectElement).value as 'add' | 'subtract',
                      amount: parseInt((document.getElementById('deposit-amount') as HTMLInputElement).value) || 0,
                      collectedBy: (document.getElementById('deposit-collector') as HTMLInputElement).value,
                      notes: (document.getElementById('deposit-notes') as HTMLInputElement).value,
                    });
                  }}
                >
                  確認
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositSystem;
