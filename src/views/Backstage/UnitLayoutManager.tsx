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

  const building = buildings.find(b => b.id === buildingId);
  const floorsInBuilding = floors.filter(f => f.buildingId === buildingId && f.floorType === 'residential');
  
  // Sort floors: usually lower floors first or higher first?
  // Let's sort by sortOrder ascending (1F, 2F...).
  floorsInBuilding.sort((a, b) => a.sortOrder - b.sortOrder);

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
    <div className="unit-layout-manager bg-gray-50 p-6 rounded-lg border border-gray-200">
      <div className="header flex justify-between items-center mb-6">
        <div>
           <h3 className="text-xl font-bold text-gray-800">格局配置</h3>
           <p className="text-sm font-bold text-gray-500">管理 {building?.name} 的戶別</p>
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

      <div className="floors-container space-y-6">
        {floorsInBuilding.map(floor => (
          <div key={floor.id} className="floor-section bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="floor-header flex justify-between items-center mb-4 border-b pb-2">
              <h4 className="font-bold text-lg text-gray-800">{floor.name} ({floor.floorNumber})</h4>
              <Button 
                onClick={() => handleAddUnit(floor)}
                variant="secondary"
                size="small"
              >
                + 新增戶別
              </Button>
            </div>
            
            <div className="units-grid grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {getUnitsByFloor(floor.id).map(unit => (
                <div 
                    key={unit.id} 
                    className="unit-card border rounded p-3 relative group hover:shadow-md transition-shadow bg-white"
                    style={{ borderTopColor: getStatusColor(unit.status), borderTopWidth: 4 }}
                >
                  <div className="font-bold text-center mb-1 text-gray-800">{unit.unitNumber}</div>
                  <div className="text-xs font-bold text-center text-gray-500 mb-2">
                      {unit.area ? `${unit.area}坪` : '- 坪'}
                  </div>
                  
                  <select 
                    className="text-xs font-bold w-full border rounded p-1 bg-gray-50 focus:ring-1 focus:ring-blue-500"
                    value={unit.status}
                    onChange={(e) => handleStatusChange(unit, e.target.value as any)}
                    onClick={(e) => e.stopPropagation()}
                  >
                      <option value="vacant">空屋</option>
                      <option value="occupied">已入住</option>
                      <option value="maintenance">裝修中</option>
                  </select>

                  <button 
                    onClick={() => handleDeleteUnit(unit.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-sm hover:bg-red-600 transition-all"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {getUnitsByFloor(floor.id).length === 0 && (
                  <div className="col-span-full text-center font-bold text-gray-400 py-4 italic">無戶別資料</div>
              )}
            </div>
          </div>
        ))}
        {floorsInBuilding.length === 0 && (
            <div className="text-center py-10 font-bold text-gray-500">
                無居住樓層，請先在棟別設定中增加居住層。
            </div>
        )}
      </div>
    </div>
  );
};

export default UnitLayoutManager;
