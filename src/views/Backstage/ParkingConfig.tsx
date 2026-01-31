import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setParkingSpaces, addParkingSpace, updateParkingSpace, deleteParkingSpace } from '../../store/modules/building';
import { ParkingSpaceConfig, Floor, StatusConfig } from '../../types/domain';
import { autoGenerateParkingSpaces } from '../../utils/autoGenerate';

interface ParkingConfigProps {
  buildingId: string;
}

const ParkingConfig: React.FC<ParkingConfigProps> = ({ buildingId }) => {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector(state => state.building.buildings);
  const floors = useAppSelector(state => state.building.floors);
  const parkingSpaces = useAppSelector(state => state.building.parkingSpaces);
  const parkingStatuses = (useAppSelector((state: any) => state.config.parkingStatuses) || []) as StatusConfig[]; // Explicit cast if inference fails or types mismatch

  const building = buildings.find(b => b.id === buildingId);
  const basementFloors = floors.filter(f => f.buildingId === buildingId && f.floorType === 'basement');
  
  const [spacesPerFloor, setSpacesPerFloor] = useState(20);

  const handleRegenerate = () => {
    if (!building) return;
    if (confirm('重新生成將清除現有車位資料及狀態，確定嗎？')) {
        // Generate new spaces
        const newSpaces = autoGenerateParkingSpaces(building, floors, spacesPerFloor);
        
        // Remove old spaces for this building
        const otherSpaces = parkingSpaces.filter(p => p.buildingId !== buildingId);
        
        // Update store
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
      // Create a manual space
      // Need a unique number.
      const floorSpaces = getParkingByFloor(floorId);
      const floor = floors.find(f => f.id === floorId);
      const numStr = String(floorSpaces.length + 1).padStart(3, '0');
      
      const newSpace: ParkingSpaceConfig = {
          id: `${Date.now()}`,
          buildingId,
          floorId,
          areaId: 'M', // Manual
          number: `M-${floor?.floorNumber}-${numStr}`,
          type: 'resident',
          status: 'available'
      };
      dispatch(addParkingSpace(newSpace));
  };

  const getStatusColor = (status: string) => {
      return parkingStatuses.find(s => s.name === status || s.type === 'parking' && s.id === status)?.color || '#ccc'; // Fallback logic
      // Actually status in ParkingSpaceConfig is 'available' | 'occupied' etc.
      // But parkingStatuses in config are user defined.
      // We need to map 'available' to the specific config entry if we want to use the colors.
      // Task 2 defines defaults: '可租用' (available?), '已佔用' (occupied?), '保留' (reserved?), '維護中' (maintenance?)
      // We should probably match by name or add a 'code' to StatusConfig.
      // For now, I'll match by name if possible, or hardcode mapping based on the defaults provided in Task 2.
      // Task 2 defaults:
      // { name: '可租用', color: '#22c55e' } -> available
      // { name: '已佔用', color: '#ef4444' } -> occupied
      // { name: '保留', color: '#f59e0b' } -> reserved
      // { name: '維護中', color: '#6b7280' } -> maintenance
      
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

  if (!building) return <div>找不到棟別資料</div>;

  return (
    <div className="parking-config">
      <div className="bg-gray-50 p-4 rounded mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <label className="font-bold">每層預設車位數:</label>
          <input
            type="number"
            value={spacesPerFloor}
            onChange={(e) => setSpacesPerFloor(Number(e.target.value))}
            className="border p-2 rounded w-24"
          />
          <button 
            onClick={handleRegenerate}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            重新生成所有車位
          </button>
        </div>
        <div className="text-sm text-gray-500">
           總車位數: {parkingSpaces.filter(p => p.buildingId === buildingId).length}
        </div>
      </div>
      
      {/* 按地下室樓層分組 */}
      <div className="space-y-6">
        {basementFloors.map(floor => (
          <div key={floor.id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-100 p-3 font-bold flex justify-between">
                <span>{floor.name} ({floor.floorNumber})</span>
                <button onClick={() => handleAddSpace(floor.id)} className="text-sm text-blue-600">+ 手動新增</button>
            </div>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {getParkingByFloor(floor.id).map(space => (
                <div 
                    key={space.id} 
                    className="border rounded p-2 flex flex-col items-center justify-center relative group"
                    style={{ borderColor: getStatusColor(space.status) }}
                >
                  <span className="font-mono font-bold text-lg">{space.number}</span>
                  <span 
                    className="text-xs px-2 py-0.5 rounded text-white mt-1"
                    style={{ backgroundColor: getStatusColor(space.status) }}
                  >
                    {space.status}
                  </span>
                  
                  {/* Hover Actions */}
                  <button 
                    onClick={() => handleDeleteSpace(space.id)}
                    className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100"
                    title="刪除"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {getParkingByFloor(floor.id).length === 0 && (
                  <div className="col-span-full text-center text-gray-400 py-4">無車位資料</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingConfig;
