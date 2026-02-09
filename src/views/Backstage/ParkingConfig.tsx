import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setParkingSpaces, addParkingSpace, deleteParkingSpace } from '../../store/modules/building';
import { parkingActions, ParkingSpaceType } from '../../store/modules/parking'; // Import new actions
import { ParkingSpaceConfig, Floor, StatusConfig } from '../../types/domain';
import { autoGenerateParkingSpaces } from '../../utils/autoGenerate';
import Button from '@/components/ui/Button';

interface ParkingConfigProps {
  buildingId: string;
}

const ParkingConfig: React.FC<ParkingConfigProps> = ({ buildingId }) => {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector(state => state.building.buildings);
  const floors = useAppSelector(state => state.building.floors);
  const parkingSpaces = useAppSelector(state => state.building.parkingSpaces);
  const parkingStatuses = (useAppSelector((state: any) => state.config.parkingStatuses) || []) as StatusConfig[]; 
  const spaceTypes = useAppSelector((state: any) => state.parking.spaceTypes) as ParkingSpaceType[] || []; // Get space types

  const building = buildings.find(b => b.id === buildingId);
  const basementFloors = floors.filter(f => f.buildingId === buildingId && f.floorType === 'basement');
  
  const [spacesPerFloor, setSpacesPerFloor] = useState(20);
  const [editingType, setEditingType] = useState<boolean>(false);
  const [newTypeName, setNewTypeName] = useState('');

  const handleRegenerate = () => {
    if (!building) return;
    if (confirm('重新生成將清除現有車位資料及狀態，確定嗎？')) {
        const newSpaces = autoGenerateParkingSpaces(building, floors, spacesPerFloor);
        const otherSpaces = parkingSpaces.filter(p => p.buildingId !== buildingId);
        dispatch(setParkingSpaces([...otherSpaces, ...newSpaces]));
    }
  };

  const getParkingByFloor = (floorId: string) => {
    return parkingSpaces.filter(p => p.floorId === floorId);
  };

  const handleDeleteSpace = (id: string) => {
    dispatch(deleteParkingSpace(id));
  };
  
  const handleAddSpace = (floorId: string) => {
      const floorSpaces = getParkingByFloor(floorId);
      const floor = floors.find(f => f.id === floorId);
      const numStr = String(floorSpaces.length + 1).padStart(3, '0');
      
      const newSpace: ParkingSpaceConfig = {
          id: `${Date.now()}`,
          buildingId,
          floorId,
          areaId: 'M', 
          number: `M-${floor?.floorNumber}-${numStr}`,
          type: 'resident',
          status: 'available'
      };
      dispatch(addParkingSpace(newSpace));
  };

  const getStatusColor = (status: string) => {
      const map: Record<string, string> = {
          'available': '可租用',
          'occupied': '已佔用',
          'reserved': '保留',
          'maintenance': '維護中'
      };
      const targetName = map[status];
      const config = parkingStatuses.find((s: StatusConfig) => s.name === targetName);
      return config?.color || '#999';
  };

  const handleAddType = () => {
      if(!newTypeName.trim()) return;
      const id = `type-${Date.now()}`;
      dispatch(parkingActions.addSpaceType({
          id,
          name: newTypeName,
          code: `custom-${Date.now()}`
      }));
      setNewTypeName('');
  };

  const handleDeleteType = (id: string) => {
      if(confirm('確定刪除此車位類型？')) {
          dispatch(parkingActions.deleteSpaceType(id));
      }
  };

  if (!building) return <div>找不到棟別資料</div>;

  return (
    <div className="parking-config">
        {/* Type Configuration Section */}
        <div className="bg-[var(--bg-secondary)] p-4 rounded mb-6 border border-[var(--color-border)]">
             <div className="flex justify-between items-center mb-4">
                 <h4 className="font-bold text-[var(--text-normal)]">車位類型設定 (預設類型)</h4>
                 <Button onClick={() => setEditingType(!editingType)} size="small" variant="secondary">
                     {editingType ? '結束編輯' : '編輯類型'}
                 </Button>
             </div>
             
             <div className="flex flex-wrap gap-2">
                 {spaceTypes.map(type => (
                     <div key={type.id} className="bg-[var(--bg-tertiary)] px-3 py-1 rounded border border-[var(--color-border)] flex items-center gap-2 text-[var(--text-normal)]">
                         <span>{type.name}</span>
                         {editingType && (
                             <button onClick={() => handleDeleteType(type.id)} className="text-red-500 hover:text-red-700 ml-1">×</button>
                         )}
                     </div>
                 ))}
             </div>
             
             {editingType && (
                 <div className="mt-4 flex gap-2">
                     <input 
                        value={newTypeName}
                        onChange={e => setNewTypeName(e.target.value)}
                        placeholder="新類型名稱"
                        className="border border-[var(--color-border)] p-1 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                     />
                     <Button onClick={handleAddType} size="small" variant="primary">新增</Button>
                 </div>
             )}
        </div>

      <div className="bg-gray-50 p-4 rounded mb-4 flex items-center justify-between border border-gray-200">
        <div className="flex items-center gap-4">
          <label className="font-bold text-[var(--text-normal)]">每層預設車位數:</label>
          <input
            type="number"
            value={spacesPerFloor}
            onChange={(e) => setSpacesPerFloor(Number(e.target.value))}
            className="border p-2 rounded w-24 focus:ring-2 focus:ring-[#5a7fd6] focus:border-[#5a7fd6] text-black"
          />
          <Button 
            onClick={handleRegenerate}
            variant="primary"
          >
            重新生成所有車位
          </Button>
        </div>
        <div className="text-sm text-[var(--text-normal)] font-medium">
           總車位數: {parkingSpaces.filter(p => p.buildingId === buildingId).length}
        </div>
      </div>
      
      {/* 按地下室樓層分組 */}
      <div className="space-y-6">
        {basementFloors.map(floor => (
          <div key={floor.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="bg-gray-100 p-3 font-bold flex justify-between items-center">
                <span className="text-black">{floor.name} ({floor.floorNumber})</span>
                <Button onClick={() => handleAddSpace(floor.id)} variant="secondary" size="small">+ 手動新增</Button>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 bg-white">
              {getParkingByFloor(floor.id).map(space => (
                <div 
                    key={space.id} 
                    className="border rounded p-2 flex flex-col items-center justify-center relative group hover:shadow-md transition-shadow"
                    style={{ borderColor: getStatusColor(space.status), borderWidth: '1px' }}
                >
                  <span className="font-mono font-bold text-lg text-black">{space.number}</span>
                  <span 
                    className="text-xs px-2 py-0.5 rounded text-white mt-1"
                    style={{ backgroundColor: getStatusColor(space.status) }}
                  >
                    {space.status}
                  </span>
                  
                  {/* Hover Actions */}
                  <button 
                    onClick={() => handleDeleteSpace(space.id)}
                    className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full w-5 h-5 flex items-center justify-center"
                    title="刪除"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {getParkingByFloor(floor.id).length === 0 && (
                  <div className="col-span-full text-center text-gray-400 py-4 italic">無車位資料</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingConfig;
