import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { BuildingConfig, Floor, ParkingZoneConfig, ParkingSpace } from '../../types/domain';
import { parkingActions } from '../../store/modules/parking';
import Button from '../../components/ui/Button';
import IntroductionButton from '../../components/ui/IntroductionButton';
import * as XLSX from 'xlsx';

// ==================== 類型定義 ====================

interface ParkingSpaceSettingsProps {}

interface ZoneFormData {
  name: string;
  variableName: string;
  spaceCount: number;
  type: ParkingZoneConfig['type'];
}

// ==================== 輔助函數 ====================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatBasementFloorNumber = (index: number): string => `B${index}`;

const formatBasementFloorName = (index: number): string => `地下室 ${index}樓`;

const formatParkingNumber = (startNum: number, index: number): string => {
  return String(startNum + index).padStart(2, '0');
};

const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    resident: '住戶車位',
    visitor: '訪客車位',
    motorcycle: '機車位',
    disabled: '無障礙車位',
    reserved: '保留車位',
    custom: '自定義',
  };
  return labels[type] || type;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    available: '可使用',
    occupied: '已佔用',
    reserved: '保留中',
    maintenance: '維護中',
  };
  return labels[status] || status;
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    available: 'bg-green-500/20 text-green-400 border-green-500/50',
    occupied: 'bg-red-500/20 text-red-400 border-red-500/50',
    reserved: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    maintenance: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50';
};

// ==================== 子元件：單一車位編輯卡片 ====================

interface ParkingSpaceCardProps {
  space: ParkingSpace;
  onUpdate: (id: string, updates: Partial<ParkingSpace>) => void;
  onDelete: (id: string) => void;
}

const ParkingSpaceCard: React.FC<ParkingSpaceCardProps> = ({ space, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    number: space.number,
    type: space.type,
    status: space.status,
    note: space.reason || '', // Using reason field for notes temporarily if note doesn't exist
  });

  const handleSave = () => {
    onUpdate(space.id, {
      number: editForm.number,
      type: editForm.type,
      status: editForm.status,
      reason: editForm.note,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-[var(--bg-tertiary)] border border-[#5865F2] rounded p-3 text-sm">
        <div className="space-y-2">
          <div>
            <label className="text-xs text-[var(--text-muted)]">編號</label>
            <input
              type="text"
              value={editForm.number}
              onChange={(e) => setEditForm({...editForm, number: e.target.value})}
              className="w-full px-2 py-1 bg-[var(--bg-primary)] border border-[var(--color-border)] rounded text-[var(--text-normal)]"
            />
          </div>
            <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-[var(--text-muted)]">類型</label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm({...editForm, type: e.target.value as any})}
                className="w-full px-2 py-1 bg-[var(--bg-primary)] border border-[var(--color-border)] rounded text-[var(--text-normal)]"
              >
                <option value="resident">住戶</option>
                <option value="visitor">訪客</option>
                <option value="disabled">身障</option>
                <option value="reserved">保留</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)]">狀態</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                className="w-full px-2 py-1 bg-[var(--bg-primary)] border border-[var(--color-border)] rounded text-[var(--text-normal)]"
              >
                <option value="available">可用</option>
                <option value="occupied">佔用</option>
                <option value="reserved">保留</option>
                <option value="maintenance">維護</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={handleSave}
              className="flex-1 bg-[#5865F2] text-white py-1 rounded hover:bg-[#4752c4] transition-colors"
            >
              儲存
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-[var(--bg-secondary)] text-[var(--text-normal)] py-1 rounded hover:bg-[var(--bg-hover)] transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-tertiary)] border border-[var(--color-border)] rounded p-3 text-sm hover:border-[var(--text-muted)] transition-colors group relative">
      <div className="flex justify-between items-start mb-2">
        <span className="font-mono font-bold text-[var(--text-normal)] text-base">{space.number}</span>
        <div className={`text-xs px-1.5 py-0.5 rounded border ${getStatusColor(space.status)}`}>
          {getStatusLabel(space.status)}
        </div>
      </div>
      <div className="text-xs text-[var(--text-muted)] mb-1">
        {getTypeLabel(space.type)}
      </div>
      
      {/* 操作按鈕 (Hover 顯示) */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--bg-tertiary)] p-1 rounded shadow-sm">
        <button 
          onClick={() => setIsEditing(true)}
          className="p-1 text-[var(--text-muted)] hover:text-[#5865F2] hover:bg-[var(--bg-hover)] rounded"
          title="編輯"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button 
          onClick={() => onDelete(space.id)}
          className="p-1 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded"
          title="刪除"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ==================== 子元件：車位分區卡片 (改為顯示個別車位) ====================

interface ZoneCardProps {
  zone: ParkingZoneConfig;
  buildingCode: string;
  floorNumber: string;
  onUpdate: (zone: ParkingZoneConfig) => void;
  onDelete: (zoneId: string) => void;
  // 新增 props
  spaces: ParkingSpace[];
  onAddSpace: (zoneId: string, spaceData: Partial<ParkingSpace>) => void;
  onUpdateSpace: (spaceId: string, updates: Partial<ParkingSpace>) => void;
  onDeleteSpace: (spaceId: string) => void;
}

const ZoneCard: React.FC<ZoneCardProps> = ({ 
  zone, buildingCode, floorNumber, onUpdate, onDelete,
  spaces, onAddSpace, onUpdateSpace, onDeleteSpace
}) => {
  const [isEditingZone, setIsEditingZone] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [zoneFormData, setZoneFormData] = useState<ZoneFormData>({
    name: zone.name,
    variableName: zone.variableName,
    spaceCount: zone.spaceCount,
    type: zone.type,
  });

  const handleSaveZone = () => {
    onUpdate({
      ...zone,
      name: zoneFormData.name,
      variableName: zoneFormData.variableName,
      // spaceCount 由實際車位數量決定，不再直接編輯
      type: zoneFormData.type,
      updatedAt: new Date().toISOString(),
    });
    setIsEditingZone(false);
  };

  // 批量生成車位
  const handleBatchGenerate = () => {
    const count = parseInt(prompt('請輸入要生成的車位數量', '10') || '0');
    if (count <= 0) return;

    const startNum = spaces.length + 1;
    for (let i = 0; i < count; i++) {
      const numStr = String(startNum + i).padStart(2, '0');
      onAddSpace(zone.id, {
        number: `${buildingCode}-${floorNumber}-${numStr}`,
        type: zone.type,
      });
    }
  };

  // 手動新增單一車位
  const handleAddSingleSpace = () => {
    const defaultNum = `${buildingCode}-${floorNumber}-${String(spaces.length + 1).padStart(2, '0')}`;
    const num = prompt('請輸入車位編號', defaultNum);
    if (!num) return;

    onAddSpace(zone.id, {
      number: num,
      type: zone.type,
    });
  };

  if (isEditingZone) {
    return (
      <div className="border-2 border-[#5865F2] rounded-lg p-4 bg-[var(--bg-secondary)] mb-4">
        <div className="space-y-3">
          <h4 className="font-bold text-[var(--text-normal)]">編輯分區設定</h4>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">分區名稱</label>
            <input
              type="text"
              value={zoneFormData.name}
              onChange={(e) => setZoneFormData({ ...zoneFormData, name: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">變數名稱</label>
            <input
              type="text"
              value={zoneFormData.variableName}
              onChange={(e) => setZoneFormData({ ...zoneFormData, variableName: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">預設類型</label>
            <select
              value={zoneFormData.type}
              onChange={(e) => setZoneFormData({ ...zoneFormData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm"
            >
              <option value="resident">住戶車位</option>
              <option value="visitor">訪客車位</option>
              <option value="motorcycle">機車位</option>
              <option value="disabled">無障礙車位</option>
              <option value="reserved">保留車位</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" size="small" onClick={handleSaveZone} className="flex-1">儲存</Button>
            <Button variant="secondary" size="small" onClick={() => setIsEditingZone(false)} className="flex-1">取消</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[var(--color-border)] rounded-lg bg-[var(--bg-secondary)] mb-4 overflow-hidden">
      {/* 分區標題列 */}
      <div className="flex justify-between items-center p-4 bg-[var(--bg-hover)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <button className="text-[var(--text-muted)]">
            <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div>
            <h4 className="font-bold text-[var(--text-normal)] text-lg flex items-center gap-2">
              {zone.name}
              <span className="text-xs font-normal text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full border border-[var(--color-border)]">
                {spaces.length} 車位
              </span>
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              {getTypeLabel(zone.type)} | {zone.variableName}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="secondary" size="small" onClick={handleBatchGenerate}>
            批量新增
          </Button>
          <Button variant="secondary" size="small" onClick={handleAddSingleSpace}>
            新增單一
          </Button>
          <div className="w-px h-6 bg-[var(--color-border)] mx-1"></div>
          <button
            onClick={() => setIsEditingZone(true)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[#5865F2] hover:bg-[var(--bg-primary)] rounded transition-colors"
            title="編輯分區資訊"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(zone.id)}
            className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-primary)] rounded transition-colors"
            title="刪除分區 (包含所有車位)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 車位網格區域 */}
      {isExpanded && (
        <div className="p-4">
          {spaces.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {spaces.map((space) => (
                <ParkingSpaceCard
                  key={space.id}
                  space={space}
                  onUpdate={onUpdateSpace}
                  onDelete={onDeleteSpace}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--text-muted)] bg-[var(--bg-tertiary)] rounded-lg border border-dashed border-[var(--color-border)]">
              <p>此分區尚未新增任何車位</p>
              <p className="text-xs mt-1">請使用右上角的「批量新增」或「新增單一」功能</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==================== 主元件 ====================

const ParkingSpaceSettings: React.FC<ParkingSpaceSettingsProps> = () => {
  const dispatch = useAppDispatch();
  const buildings = useAppSelector((state) => state.building.buildings);
  const floors = useAppSelector((state) => state.building.floors);
  const allSpaces = useAppSelector((state) => state.parking.spaces);
  
  // 改為從 Redux 獲取 zones
  // 注意：這裡假設 ParkingState 介面已更新，zones 存在於 parking slice 中
  // 由於 TypeScript 靜態檢查可能因為還未完全重新整理而不準確，使用 as any 暫時繞過（如果需要）
  // 但我們剛才已經更新了 ParkingState，理論上這裡應該可以直接存取
  const allZones = useAppSelector((state) => (state.parking as any).zones as ParkingZoneConfig[]) || [];
  
  // 狀態管理
  const [selectedBasementFloor, setSelectedBasementFloor] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  
  // 移除 local zones state
  // const [zones, setZones] = useState<ParkingZoneConfig[]>([]); 

  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneData, setNewZoneData] = useState<ZoneFormData>({
    name: '',
    variableName: '',
    spaceCount: 0, 
    type: 'resident',
  });

  // 取得地下室樓層（根據選中的棟別過濾）
  const basementFloors = React.useMemo(() => {
    let filteredFloors = floors.filter((f) => f.floorType === 'basement');
    if (selectedBuildingId) {
      filteredFloors = filteredFloors.filter((f) => f.buildingId === selectedBuildingId);
    }
    const basementFloorMap = new Map<string, Floor>();
    filteredFloors.forEach((f) => {
      if (!basementFloorMap.has(f.floorNumber)) {
        basementFloorMap.set(f.floorNumber, f);
      }
    });
    return Array.from(basementFloorMap.values()).sort((a, b) => {
      const aNum = parseInt(a.floorNumber.replace('B', ''));
      const bNum = parseInt(b.floorNumber.replace('B', ''));
      return aNum - bNum;
    });
  }, [floors, selectedBuildingId]);

  const availableBuildings = React.useMemo(() => {
    if (!selectedBasementFloor) return buildings;
    const buildingIdsWithFloor = new Set(
      floors
        .filter((f) => f.floorType === 'basement' && f.floorNumber === selectedBasementFloor)
        .map((f) => f.buildingId)
    );
    return buildings.filter((b) => buildingIdsWithFloor.has(b.id));
  }, [buildings, floors, selectedBasementFloor]);

  useEffect(() => {
    if (basementFloors.length > 0 && !selectedBasementFloor) {
      setSelectedBasementFloor(basementFloors[0].floorNumber);
    }
  }, [basementFloors, selectedBasementFloor]);

  useEffect(() => {
    if (availableBuildings.length > 0 && !selectedBuildingId) {
      setSelectedBuildingId(availableBuildings[0].id);
    }
  }, [availableBuildings, selectedBuildingId]);

  // 過濾當前選中的樓層和棟別的車位分區
  const currentZones = React.useMemo(() => {
    if (!selectedBuildingId || !selectedBasementFloor) return [];
    const currentFloor = floors.find(
      (f) => f.buildingId === selectedBuildingId && f.floorNumber === selectedBasementFloor
    );
    if (!currentFloor) return [];
    return allZones
      .filter((z) => z.buildingId === selectedBuildingId && z.floorId === currentFloor.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [allZones, selectedBuildingId, selectedBasementFloor, floors]);

  // 根據 Zone ID 過濾車位
  const getSpacesByZone = useCallback((zoneId: string) => {
    return allSpaces.filter(space => space.area === zoneId); // 假設 ParkingSpace 的 area 欄位存的是 zoneId
  }, [allSpaces]);

  // Actions
  const handleAddZone = () => {
    if (!selectedBuildingId || !selectedBasementFloor) return;
    if (!newZoneData.name.trim() || !newZoneData.variableName.trim()) return;

    const currentFloor = floors.find(
      (f) => f.buildingId === selectedBuildingId && f.floorNumber === selectedBasementFloor
    );
    if (!currentFloor) return;

    const newZone: ParkingZoneConfig = {
      id: generateId(),
      buildingId: selectedBuildingId,
      floorId: currentFloor.id,
      name: newZoneData.name,
      variableName: newZoneData.variableName,
      spaceCount: 0,
      startNumber: 1,
      type: newZoneData.type,
      sortOrder: allZones.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch((parkingActions as any).addZone(newZone));
    setIsAddingZone(false);
    setNewZoneData({ name: '', variableName: '', spaceCount: 0, type: 'resident' });
  };

  const handleUpdateZone = (updatedZone: ParkingZoneConfig) => {
    dispatch((parkingActions as any).updateZone({ id: updatedZone.id, updates: updatedZone }));
  };

  const handleDeleteZone = (zoneId: string) => {
    if (confirm('確定要刪除此分區及其所有車位嗎？')) {
      dispatch((parkingActions as any).deleteZone(zoneId));
      dispatch(parkingActions.deleteParkingSpacesByArea(zoneId)); // 刪除該區域所有車位
    }
  };

  // 車位 CRUD
  const handleAddSpace = (zoneId: string, spaceData: Partial<ParkingSpace>) => {
    const newSpace: ParkingSpace = {
      id: generateId(),
      area: zoneId, // Map zoneId to area
      number: spaceData.number || '未命名',
      type: spaceData.type || 'resident',
      status: 'available',
      ...spaceData,
    };
    dispatch(parkingActions.addParkingSpace(newSpace));
    
    // Update zone space count (optional, if we want to sync count)
    const zone = allZones.find(z => z.id === zoneId);
    if (zone) {
        handleUpdateZone({ ...zone, spaceCount: zone.spaceCount + 1 });
    }
  };

  const handleUpdateSpace = (spaceId: string, updates: Partial<ParkingSpace>) => {
    dispatch(parkingActions.updateParkingSpace({ id: spaceId, updates }));
  };

  const handleDeleteSpace = (spaceId: string) => {
    if (confirm('確定刪除此車位？')) {
        // Find space to update count before deleting
        const space = allSpaces.find(s => s.id === spaceId);
        if (space) {
            const zone = allZones.find(z => z.id === space.area);
            if (zone) {
                handleUpdateZone({ ...zone, spaceCount: Math.max(0, zone.spaceCount - 1) });
            }
        }
        dispatch(parkingActions.deleteParkingSpace(spaceId));
    }
  };

  // 取得當前選中的建築物
  const currentBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const currentFloor = floors.find(
    (f) => f.buildingId === selectedBuildingId && f.floorNumber === selectedBasementFloor
  );

  return (
    <div className="parking-space-settings p-6 max-w-[1600px] mx-auto">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-3xl font-bold text-[var(--text-normal)]">車位設定</h2>
        <div className="flex items-center gap-2">
          <IntroductionButton pageId="parking-settings" />
        </div>
      </div>

      {/* 第一層：地下室樓層書籤頁 (B1, B2, B3...) */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          選擇地下室樓層
        </h3>
        <div className="flex flex-wrap gap-2">
          {basementFloors.map((floor) => (
            <button
              key={floor.id}
              onClick={() => setSelectedBasementFloor(floor.floorNumber)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedBasementFloor === floor.floorNumber
                  ? 'bg-[#5865F2] text-white shadow-md'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-normal)]'
              }`}
            >
              <span className="text-lg">{floor.floorNumber}</span>
              <span className="block text-xs opacity-80">{floor.name}</span>
            </button>
          ))}
          {basementFloors.length === 0 && (
            <p className="text-[var(--text-muted)] italic">
              尚未設定地下室樓層，請先在「棟數設定」中設定地下室層數
            </p>
          )}
        </div>
      </div>

      {/* 第二層：棟別分頁 */}
      {selectedBasementFloor && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
            選擇棟別
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableBuildings.map((building) => (
              <button
                key={building.id}
                onClick={() => setSelectedBuildingId(building.id)}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 border-2 ${
                  selectedBuildingId === building.id
                    ? 'border-[#5865F2] bg-[#5865F2] bg-opacity-10 text-[#5865F2]'
                    : 'border-[var(--color-border)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text-normal)]'
                }`}
              >
                {building.buildingCode}棟
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 分區設定區域 */}
      {selectedBasementFloor && selectedBuildingId && currentBuilding && currentFloor && (
        <div className="space-y-6">
          {/* 新增分區按鈕 */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-[var(--text-normal)]">車位分區與個別車位管理</h3>
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => setIsAddingZone(true)}
                disabled={isAddingZone}
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新增分區
              </Button>
            </div>
          </div>

          {/* 新增分區表單 */}
          {isAddingZone && (
            <div className="border-2 border-[#5865F2] border-dashed rounded-lg p-4 bg-[var(--bg-secondary)] mb-6">
              <h4 className="font-bold text-[var(--text-normal)] mb-4">新增車位分區</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">分區名稱 *</label>
                  <input
                    type="text"
                    value={newZoneData.name}
                    onChange={(e) => setNewZoneData({ ...newZoneData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                    placeholder="如：住戶區、訪客區"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">變數名稱 *</label>
                  <input
                    type="text"
                    value={newZoneData.variableName}
                    onChange={(e) => setNewZoneData({ ...newZoneData, variableName: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                    placeholder="如：residentZone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">預設類型</label>
                  <select
                    value={newZoneData.type}
                    onChange={(e) => setNewZoneData({ ...newZoneData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
                  >
                    <option value="resident">住戶車位</option>
                    <option value="visitor">訪客車位</option>
                    <option value="motorcycle">機車位</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="primary" onClick={handleAddZone} className="px-6">確認新增</Button>
                <Button variant="secondary" onClick={() => setIsAddingZone(false)}>取消</Button>
              </div>
            </div>
          )}

          {/* 分區列表 (改為垂直排列的展開式卡片) */}
          <div className="space-y-4">
            {currentZones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                buildingCode={currentBuilding.buildingCode}
                floorNumber={selectedBasementFloor}
                spaces={getSpacesByZone(zone.id)}
                onUpdate={handleUpdateZone}
                onDelete={handleDeleteZone}
                onAddSpace={handleAddSpace}
                onUpdateSpace={handleUpdateSpace}
                onDeleteSpace={handleDeleteSpace}
              />
            ))}
          </div>

          {currentZones.length === 0 && !isAddingZone && (
            <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-lg border border-dashed border-[var(--color-border)]">
              <p className="text-[var(--text-muted)] mb-2">此區域尚未設定任何車位分區</p>
              <p className="text-sm text-[var(--text-muted)] opacity-70">
                點擊上方「新增分區」按鈕，建立如「住戶區」或「機車區」等分區，再於分區內新增個別車位。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParkingSpaceSettings;
