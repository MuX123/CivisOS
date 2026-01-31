import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { FeeUnit } from '../../types/domain';
import '../../assets/styles/fee.css';

const FeeSystem: React.FC = () => {
  const [activeBuilding, setActiveBuilding] = useState<string>('all');
  const [feeUnits, setFeeUnits] = useState<FeeUnit[]>([]);
  const [defaultArea, setDefaultArea] = useState(30);
  const [defaultPrice, setDefaultPrice] = useState(100);

  const buildings = ['A棟', 'B棟', 'C棟'];

  useEffect(() => {
    // 模擬數據
    const mockFees: FeeUnit[] = [
      {
        id: 'F001',
        unitId: 'U001',
        unit: { id: 'U001', unitNumber: '101', floorId: '', buildingId: '', type: 'residential', size: 35 } as any,
        area: 35,
        pricePerPing: 100,
        totalFee: 3500,
        notes: '',
        paymentStatus: 'unpaid',
        isSpecial: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'F002',
        unitId: 'U002',
        unit: { id: 'U002', unitNumber: '102', floorId: '', buildingId: '', type: 'residential', size: 40 } as any,
        area: 40,
        pricePerPing: 100,
        totalFee: 4000,
        notes: '特殊坪數',
        paymentStatus: 'paid',
        lastPaymentDate: new Date().toISOString(),
        isSpecial: true,
        customArea: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setFeeUnits(mockFees);
  }, []);

  const filteredFees = activeBuilding === 'all'
    ? feeUnits
    : feeUnits.filter((f) => f.unit?.unitNumber?.startsWith(activeBuilding));

  const calculateTotal = (area: number, price: number) => {
    return area * price;
  };

  const handlePaymentStatus = (id: string, status: 'paid' | 'unpaid' | 'partial') => {
    setFeeUnits(feeUnits.map((f) => (f.id === id ? { ...f, paymentStatus: status, lastPaymentDate: status === 'paid' ? new Date().toISOString() : f.lastPaymentDate } : f)));
  };

  return (
    <div className="fee-system">
      <div className="page-header">
        <div className="header-content">
          <h1>管理費系統</h1>
          <p>管理住戶管理費繳納狀況</p>
        </div>
        <div className="header-actions">
          <Button variant="secondary">設定費率</Button>
          <Button variant="primary">匯出報表</Button>
        </div>
      </div>

      {/* 統計資訊 */}
      <div className="fee-stats">
        <div className="stat-card">
          <h4>總戶數</h4>
          <span className="stat-value">{feeUnits.length}</span>
        </div>
        <div className="stat-card">
          <h4>已繳費</h4>
          <span className="stat-value paid">{feeUnits.filter((f) => f.paymentStatus === 'paid').length}</span>
        </div>
        <div className="stat-card">
          <h4>未繳費</h4>
          <span className="stat-value unpaid">{feeUnits.filter((f) => f.paymentStatus === 'unpaid').length}</span>
        </div>
        <div className="stat-card">
          <h4>總金額</h4>
          <span className="stat-value">NT$ {feeUnits.reduce((sum, f) => sum + f.totalFee, 0).toLocaleString()}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="building-tabs">
            <button
              className={`building-tab ${activeBuilding === 'all' ? 'active' : ''}`}
              onClick={() => setActiveBuilding('all')}
            >
              全部
            </button>
            {buildings.map((building) => (
              <button
                key={building}
                className={`building-tab ${activeBuilding === building ? 'active' : ''}`}
                onClick={() => setActiveBuilding(building)}
              >
                {building}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="fee-table">
            <div className="table-header">
              <span className="col-unit">戶別</span>
              <span className="col-area">坪數</span>
              <span className="col-price">單價</span>
              <span className="col-total">總額</span>
              <span className="col-status">狀態</span>
              <span className="col-actions">操作</span>
            </div>
            {filteredFees.length === 0 ? (
              <div className="empty-state">
                <h4>沒有管理費資料</h4>
                <p>請先設定棟數和戶別資料</p>
              </div>
            ) : (
              filteredFees.map((fee) => (
                <div key={fee.id} className="table-row">
                  <span className="col-unit">
                    {fee.unit?.unitNumber}
                    {fee.isSpecial && <span className="special-badge">特</span>}
                  </span>
                  <span className="col-area">
                    <input
                      type="number"
                      className="area-input"
                      value={fee.area}
                      onChange={(e) => {
                        const newArea = parseInt(e.target.value) || 0;
                        setFeeUnits(
                          feeUnits.map((f) =>
                            f.id === fee.id ? { ...f, area: newArea, totalFee: calculateTotal(newArea, f.pricePerPing) } : f
                          )
                        );
                      }}
                    />
                  </span>
                  <span className="col-price">
                    <input
                      type="number"
                      className="price-input"
                      value={fee.pricePerPing}
                      onChange={(e) => {
                        const newPrice = parseInt(e.target.value) || 0;
                        setFeeUnits(
                          feeUnits.map((f) =>
                            f.id === fee.id ? { ...f, pricePerPing: newPrice, totalFee: calculateTotal(f.area, newPrice) } : f
                          )
                        );
                      }}
                    />
                  </span>
                  <span className="col-total">NT$ {fee.totalFee.toLocaleString()}</span>
                  <span className="col-status">
                    <span className={`status-badge ${fee.paymentStatus}`}>
                      {fee.paymentStatus === 'paid' ? '已繳費' : fee.paymentStatus === 'partial' ? '部分繳費' : '未繳費'}
                    </span>
                  </span>
                  <span className="col-actions">
                    {fee.paymentStatus !== 'paid' && (
                      <Button variant="success" size="small" onClick={() => handlePaymentStatus(fee.id, 'paid')}>
                        繳費
                      </Button>
                    )}
                    <Button variant="secondary" size="small">編輯</Button>
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeeSystem;
