import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  addUnit, 
  updateUnit, 
  deleteUnit, 
  setUnits,
  reorderUnits 
} from '../../store/modules/building';
import { UnitConfig, Floor, StatusConfig } from '../../types/domain';
import { autoGenerateUnits } from '../../utils/autoGenerate';
import Button from '@/components/ui/Button';

interface UnitLayoutManagerProps {
  buildingId: string;
  onClose?: () => void;
}

const UnitLayoutManager: React.FC<UnitLayoutManagerProps> = ({ buildingId, onClose }) => {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector(state => state.building.buildings);
  const floors = useAppSelector(state => state.building.floors);
  const units = useAppSelector(state => state.building.units);
  const houseStatuses = useAppSelector((state: any) => state.config.houseStatuses) as StatusConfig[];

  // 編輯狀態
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const building = buildings.find(b => b.id === buildingId);
  const floorsInBuilding = floors.filter(f => f.buildingId === buildingId);
  
  // Sort floors: R floors (desc), Residential (desc), Basement (desc)
  const sortedFloors = [...floorsInBuilding].sort((a, b) => {
      // Custom sort logic based on floor type and order
      const typeOrder = { 'roof': 0, 'residential': 1, 'basement': 2 };
      if (typeOrder[a.floorType] !== typeOrder[b.floorType]) {
          return typeOrder[a.floorType] - typeOrder[b.floorType];
      }
      // For same type, sort by sortOrder. 
      // Usually higher floors (smaller sortOrder for R? larger for B?)
      // Let's assume sortOrder is consistent (e.g. 1, 2, 3...)
      // For visual stack: R2, R1, 10F...1F, B1, B2
      if (a.floorType === 'roof') return b.sortOrder - a.sortOrder; // R2 above R1
      if (a.floorType === 'residential') return b.sortOrder - a.sortOrder; // 10F above 1F
      if (a.floorType === 'basement') return a.sortOrder - b.sortOrder; // B1 above B2
      return 0;
  });

  const getUnitsByFloor = (floorId: string) => {
    return units
      .filter(u => u.floorId === floorId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const handleAutoGenerate = () => {
    if (!building) return;
    if (confirm('重新生成將清除現有格局，確定嗎？')) {
      const newUnits = autoGenerateUnits(building, floors);
      // Remove old units for this building
      const otherUnits = units.filter(u => u.buildingId !== buildingId);
      dispatch(setUnits([...otherUnits, ...newUnits]));
    }
  };

  const handleDeleteUnit = (id: string) => {
    dispatch(deleteUnit(id));
  };

  const handleAddUnit = (floor: Floor) => {
    const floorUnits = getUnitsByFloor(floor.id);
    const nextNum = floorUnits.length + 1;
    const unitNumStr = String(nextNum).padStart(2, '0');
    
    const newUnit: UnitConfig = {
      id: `${floor.id}-U${Date.now()}`,
      buildingId,
      floorId: floor.id,
      unitNumber: `${building?.buildingCode}-${floor.floorNumber}-${unitNumStr}`,
      floorNumber: floor.floorNumber,
      floorType: 'residential',
      sortOrder: nextNum,
      status: 'vacant',
      area: 0
    };
    dispatch(addUnit(newUnit));
  };
  
  const handleStatusChange = (unit: UnitConfig, status: 'vacant' | 'occupied' | 'maintenance') => {
      dispatch(updateUnit({ ...unit, status }));
  };

  // 開始編輯戶別名稱
  const handleStartEdit = (unit: UnitConfig) => {
    setEditingUnitId(unit.id);
    setEditingValue(unit.unitNumber);
  };

  // 儲存編輯後的戶別名稱
  const handleSaveEdit = (unit: UnitConfig) => {
    if (editingValue.trim() && editingValue !== unit.unitNumber) {
      dispatch(updateUnit({ ...unit, unitNumber: editingValue.trim() }));
    }
    setEditingUnitId(null);
    setEditingValue('');
  };

  // 取消編輯
  const handleCancelEdit = () => {
    setEditingUnitId(null);
    setEditingValue('');
  };

  const getStatusColor = (status: string) => {
      // Map 'vacant' -> '空屋', 'occupied' -> '已入住', 'maintenance' -> '裝修中'
      const map: Record<string, string> = {
          'vacant': '空屋',
          'occupied': '已入住',
          'maintenance': '裝修中'
      };
      const name = map[status];
      const config = houseStatuses.find(s => s.name === name);
      return config ? config.color : '#ccc';
  };

  return (
    <div className="unit-layout-manager bg-[var(--bg-secondary)] p-6 rounded-lg border border-[var(--color-border)]">
      <div className="header flex justify-between items-center mb-6">
        <div>
           <h3 className="text-xl font-bold text-[var(--text-normal)]">格局配置</h3>
           <p className="text-sm font-bold text-[var(--text-muted)]">管理 {building?.name} 的戶別</p>
        </div>
        <div className="actions flex gap-2">
            <Button 
                onClick={handleAutoGenerate}
                variant="primary"
            >
                自動生成格局
            </Button>
            {onClose && (
                <Button onClick={onClose} variant="secondary" size="small">✕</Button>
            )}
        </div>
      </div>

      <div className="floors-container space-y-4">
        {sortedFloors.map(floor => (
          <div key={floor.id} className="floor-section bg-[var(--bg-tertiary)] p-3 rounded-lg shadow-sm border border-[var(--color-border)] flex items-start gap-4">
            <div className="floor-header flex flex-col items-center justify-center w-24 flex-shrink-0 pt-2">
              <h4 className="font-bold text-lg text-[var(--text-normal)]">{floor.name}</h4>
              <Button 
                onClick={() => handleAddUnit(floor)}
                variant="secondary"
                size="small"
                className="mt-2 text-xs px-2 py-1 w-full"
              >
                + 戶別
              </Button>
            </div>
            
            <div className="units-grid grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 flex-1">
              {getUnitsByFloor(floor.id).map(unit => (
                <div 
                    key={unit.id} 
                    className="unit-card border border-[var(--color-border)] rounded p-1 relative group hover:shadow-md transition-shadow bg-[var(--bg-secondary)] flex items-center justify-center h-12"
                    style={{ borderTopColor: getStatusColor(unit.status), borderTopWidth: 3 }}
                >
                  {editingUnitId === unit.id ? (
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onBlur={() => handleSaveEdit(unit)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(unit);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="w-full px-1 text-sm text-center font-bold text-[var(--text-normal)] bg-[var(--bg-primary)] border border-[var(--brand-experiment)] rounded"
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="font-bold text-center text-sm text-[var(--text-normal)] truncate w-full px-1 cursor-pointer hover:text-[var(--brand-experiment)]"
                      onClick={() => handleStartEdit(unit)}
                      title="點擊編輯戶別名稱"
                    >
                      {unit.unitNumber}
                    </div>
                  )}

                  <button 
                    onClick={() => handleDeleteUnit(unit.id)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm hover:bg-red-600 transition-all text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {getUnitsByFloor(floor.id).length === 0 && (
                  <div className="col-span-full text-center text-xs text-[var(--text-muted)] py-2 italic bg-[var(--bg-primary)]/50 rounded border border-dashed border-[var(--color-border)]">
                      無戶別
                  </div>
              )}
            </div>
          </div>
        ))}
        {sortedFloors.length === 0 && (
            <div className="text-center py-10 font-bold text-[var(--text-muted)]">
                無樓層資料，請先在棟別設定中增加樓層。
            </div>
        )}
      </div>
    </div>
  );
};

export default UnitLayoutManager;
