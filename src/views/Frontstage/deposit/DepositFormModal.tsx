import React, { useState, useEffect } from 'react';
import { DepositItemV2, DepositType, PersonInfo } from '../../../store/modules/depositV2';
import Button from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';

interface DepositFormModalProps {
  item: DepositItemV2 | null;
  buildings: any[];
  units: any[];
  onClose: () => void;
  onSave: (data: any) => void;
}

export const DepositFormModal: React.FC<DepositFormModalProps> = ({
  item,
  buildings,
  units,
  onClose,
  onSave,
}) => {
  const isEditing = !!item;
  
  // 類型選擇
  const [selectedTypes, setSelectedTypes] = useState<DepositType[]>(['item']);
  
  // 物品資訊
  const [itemName, setItemName] = useState('');
  
  // 寄件人資訊
  const [senderType, setSenderType] = useState<'resident' | 'external'>('resident');
  const [senderName, setSenderName] = useState('');
  const [senderBuilding, setSenderBuilding] = useState('');
  const [senderUnit, setSenderUnit] = useState('');
  
  // 收件人資訊
  const [receiverType, setReceiverType] = useState<'resident' | 'external'>('resident');
  const [receiverName, setReceiverName] = useState('');
  const [receiverBuilding, setReceiverBuilding] = useState('');
  const [receiverUnit, setReceiverUnit] = useState('');
  
  // 時間與工作人員
  const [depositTime, setDepositTime] = useState(new Date().toISOString().slice(0, 16));
  const [staffName, setStaffName] = useState('');
  const [notes, setNotes] = useState('');
  
  // 編輯時載入資料
  useEffect(() => {
    if (item) {
      setSelectedTypes(item.types);
      setItemName(item.itemName || '');
      
      setSenderType(item.sender.type);
      setSenderName(item.sender.name);
      setSenderBuilding(item.sender.buildingId || '');
      setSenderUnit(item.sender.unitId || '');
      
      setReceiverType(item.receiver.type);
      setReceiverName(item.receiver.name);
      setReceiverBuilding(item.receiver.buildingId || '');
      setReceiverUnit(item.receiver.unitId || '');
      
      setDepositTime(item.depositTime.slice(0, 16));
      setStaffName(item.staffName);
      setNotes(item.notes || '');
    }
  }, [item]);
  
  // 獲取指定棟的戶别
  const getUnitsByBuilding = (buildingId: string) => {
    return units.filter((u) => u.buildingId === buildingId);
  };
  
  const handleSave = () => {
    if (!staffName.trim()) {
      alert('請輸入工作人員名稱');
      return;
    }
    if (selectedTypes.length === 0) {
      alert('請至少選擇一個類型');
      return;
    }
    if (!receiverName.trim()) {
      alert('請輸入收件人名稱');
      return;
    }
    
    const sender: PersonInfo = {
      type: senderType,
      name: senderName,
      buildingId: senderType === 'resident' ? senderBuilding : undefined,
      unitId: senderType === 'resident' ? senderUnit : undefined,
    };
    
    const receiver: PersonInfo = {
      type: receiverType,
      name: receiverName,
      buildingId: receiverType === 'resident' ? receiverBuilding : undefined,
      unitId: receiverType === 'resident' ? receiverUnit : undefined,
    };
    
    onSave({
      types: selectedTypes,
      itemName: itemName || undefined,
      sender,
      receiver,
      depositTime: new Date(depositTime).toISOString(),
      staffName,
      notes: notes || undefined,
      status: 'active',
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-full max-w-2xl shadow-2xl border border-[var(--color-border)] max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-white mb-4">
          {isEditing ? '編輯登記' : '新增登記'}
        </h3>
        
        <div className="space-y-4">
          {/* 類型選擇 */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              寄放類型 <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-3">
              {[
                { key: 'item', label: '寄物' },
                { key: 'money', label: '寄錢' },
                { key: 'key', label: '寄KEY' },
              ].map((type) => (
                <label key={type.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type.key as DepositType)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTypes([...selectedTypes, type.key as DepositType]);
                      } else {
                        setSelectedTypes(selectedTypes.filter((t) => t !== type.key));
                      }
                    }}
                    className="rounded border-[var(--color-border)] w-4 h-4"
                  />
                  <span className="text-white">{type.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* 物品名稱 */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              物品名稱
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white"
              placeholder="輸入物品名稱..."
            />
          </div>
          
          {/* 寄件人資訊 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">寄件人資訊</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="senderType"
                      checked={senderType === 'resident'}
                      onChange={() => setSenderType('resident')}
                      className="rounded-full"
                    />
                    <span className="text-white text-sm">住戶</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="senderType"
                      checked={senderType === 'external'}
                      onChange={() => setSenderType('external')}
                      className="rounded-full"
                    />
                    <span className="text-white text-sm">外人</span>
                  </label>
                </div>
                
                {senderType === 'resident' && (
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={senderBuilding}
                      onChange={(e) => {
                        setSenderBuilding(e.target.value);
                        setSenderUnit('');
                      }}
                      className="px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white"
                    >
                      <option value="">選擇棟别</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.buildingCode}棟
                        </option>
                      ))}
                    </select>
                    <select
                      value={senderUnit}
                      onChange={(e) => setSenderUnit(e.target.value)}
                      className="px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white"
                    >
                      <option value="">選擇戶别</option>
                      {getUnitsByBuilding(senderBuilding).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.unitNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white"
                  placeholder="輸入寄件人名稱..."
                />
              </div>
            </CardContent>
          </Card>
          
          {/* 收件人資訊 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">收件人資訊 <span className="text-red-400">*</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="receiverType"
                      checked={receiverType === 'resident'}
                      onChange={() => setReceiverType('resident')}
                      className="rounded-full"
                    />
                    <span className="text-white text-sm">住戶</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="receiverType"
                      checked={receiverType === 'external'}
                      onChange={() => setReceiverType('external')}
                      className="rounded-full"
                    />
                    <span className="text-white text-sm">外人</span>
                  </label>
                </div>
                
                {receiverType === 'resident' && (
                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={receiverBuilding}
                      onChange={(e) => {
                        setReceiverBuilding(e.target.value);
                        setReceiverUnit('');
                      }}
                      className="px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white"
                    >
                      <option value="">選擇棟别</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.buildingCode}棟
                        </option>
                      ))}
                    </select>
                    <select
                      value={receiverUnit}
                      onChange={(e) => setReceiverUnit(e.target.value)}
                      className="px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white"
                    >
                      <option value="">選擇戶别</option>
                      {getUnitsByBuilding(receiverBuilding).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.unitNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white"
                  placeholder="輸入收件人名稱..."
                />
              </div>
            </CardContent>
          </Card>
          
          {/* 時間與工作人員 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                寄件時間 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={depositTime}
                  onChange={(e) => setDepositTime(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">
                工作人員 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white"
                placeholder="輸入工作人員名稱..."
              />
            </div>
          </div>
          
          {/* 備註 */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              備註
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-white resize-none"
              placeholder="輸入備註..."
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6 pt-4 border-t border-[var(--color-border)]">
          <Button variant="primary" onClick={handleSave} className="flex-1">
            {isEditing ? '完成編輯' : '新增登記'}
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            取消
          </Button>
        </div>
      </div>
    </div>
  );
};
