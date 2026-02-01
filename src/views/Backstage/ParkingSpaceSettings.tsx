import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector } from '../../store/hooks';
import { BuildingConfig, Floor, ParkingZoneConfig } from '../../types/domain';
import Button from '../../components/ui/Button';
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

// ==================== 子元件：車位分區卡片 ====================

interface ZoneCardProps {
  zone: ParkingZoneConfig;
  buildingCode: string;
  floorNumber: string;
  onUpdate: (zone: ParkingZoneConfig) => void;
  onDelete: (zoneId: string) => void;
}

const ZoneCard: React.FC<ZoneCardProps> = ({ zone, buildingCode, floorNumber, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ZoneFormData>({
    name: zone.name,
    variableName: zone.variableName,
    spaceCount: zone.spaceCount,
    type: zone.type,
  });

  const handleSave = () => {
    onUpdate({
      ...zone,
      name: formData.name,
      variableName: formData.variableName,
      spaceCount: formData.spaceCount,
      type: formData.type,
      updatedAt: new Date().toISOString(),
    });
    setIsEditing(false);
  };

  const parkingNumbers = Array.from({ length: zone.spaceCount }, (_, i) => 
    formatParkingNumber(zone.startNumber, i)
  );

  if (isEditing) {
    return (
      <div className="border-2 border-[#5865F2] rounded-lg p-4 bg-[var(--bg-secondary)]">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              分區名稱
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
              placeholder="如：住戶區、訪客區"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
              變數名稱 <span className="text-xs text-white">(用於程式引用)</span>
            </label>
            <input
              type="text"
              value={formData.variableName}
              onChange={(e) => setFormData({ ...formData, variableName: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
              placeholder="如：residentZone、visitorZone"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                車位類型
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ParkingZoneConfig['type'] })}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
              >
                <option value="resident">住戶車位</option>
                <option value="visitor">訪客車位</option>
                <option value="motorcycle">機車位</option>
                <option value="disabled">無障礙車位</option>
                <option value="reserved">保留車位</option>
                <option value="custom">自定義</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                車位數量
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.spaceCount}
                onChange={(e) => setFormData({ ...formData, spaceCount: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-sm focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="primary" size="small" onClick={handleSave} className="flex-1">
            儲存
          </Button>
          <Button variant="secondary" size="small" onClick={() => setIsEditing(false)} className="flex-1">
            取消
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--bg-secondary)] hover:border-[#5865F2] transition-colors group">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-[var(--text-normal)]">{zone.name}</h4>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            變數：{zone.variableName} | {getTypeLabel(zone.type)}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-[var(--text-muted)] hover:text-[#5865F2] hover:bg-[var(--bg-hover)] rounded transition-colors"
            title="編輯"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(zone.id)}
            className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="刪除"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mb-2">
        <span className="text-sm text-[var(--text-muted)]">車位數量：</span>
        <span className="font-bold text-[var(--text-normal)]">{zone.spaceCount} 個</span>
      </div>
      
      {/* 車位編號預覽 */}
      <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--text-muted)] mb-2">車位編號預覽：</p>
        <div className="flex flex-wrap gap-1.5">
          {parkingNumbers.slice(0, 10).map((num) => (
            <span
              key={num}
              className="px-2 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-normal)] text-xs rounded border border-[var(--color-border)] font-mono"
            >
              {buildingCode}-{floorNumber}-{num}
            </span>
          ))}
          {parkingNumbers.length > 10 && (
            <span className="px-2 py-0.5 text-[var(--text-muted)] text-xs">
              +{parkingNumbers.length - 10} 更多
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const getTypeLabel = (type: ParkingZoneConfig['type']): string => {
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

// ==================== 主元件 ====================

const ParkingSpaceSettings: React.FC<ParkingSpaceSettingsProps> = () => {
  const buildings = useAppSelector((state) => state.building.buildings);
  const floors = useAppSelector((state) => state.building.floors);
  
  // 狀態管理
  const [selectedBasementFloor, setSelectedBasementFloor] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [zones, setZones] = useState<ParkingZoneConfig[]>([]);
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneData, setNewZoneData] = useState<ZoneFormData>({
    name: '',
    variableName: '',
    spaceCount: 10,
    type: 'resident',
  });

  // 取得地下室樓層（根據選中的棟別過濾）
  // 如果有選中棟別，只顯示該棟有的地下室樓層；否則顯示所有
  const basementFloors = React.useMemo(() => {
    let filteredFloors = floors.filter((f) => f.floorType === 'basement');
    
    // 如果已選中棟別，只顯示該棟的地下室樓層
    if (selectedBuildingId) {
      filteredFloors = filteredFloors.filter((f) => f.buildingId === selectedBuildingId);
    }
    
    // 去重（同樓層編號只顯示一次）
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

  // 取得有特定地下室樓層的棟別列表
  // 如果有選中樓層，只顯示有該樓層的棟別；否則顯示所有
  const availableBuildings = React.useMemo(() => {
    if (!selectedBasementFloor) {
      return buildings;
    }
    
    // 找出有該地下室樓層的棟別ID
    const buildingIdsWithFloor = new Set(
      floors
        .filter((f) => f.floorType === 'basement' && f.floorNumber === selectedBasementFloor)
        .map((f) => f.buildingId)
    );
    
    return buildings.filter((b) => buildingIdsWithFloor.has(b.id));
  }, [buildings, floors, selectedBasementFloor]);

  // 預設選中第一個地下室樓層
  useEffect(() => {
    if (basementFloors.length > 0 && !selectedBasementFloor) {
      setSelectedBasementFloor(basementFloors[0].floorNumber);
    }
  }, [basementFloors, selectedBasementFloor]);

  // 預設選中第一個棟別
  useEffect(() => {
    if (availableBuildings.length > 0 && !selectedBuildingId) {
      setSelectedBuildingId(availableBuildings[0].id);
    }
  }, [availableBuildings, selectedBuildingId]);

  // 當選中樓層改變時，檢查當前棟別是否還有效
  useEffect(() => {
    if (selectedBasementFloor && selectedBuildingId) {
      const buildingHasFloor = floors.some(
        (f) => f.buildingId === selectedBuildingId && 
               f.floorType === 'basement' && 
               f.floorNumber === selectedBasementFloor
      );
      
      // 如果當前棟別沒有該樓層，重置棟別選擇
      if (!buildingHasFloor) {
        setSelectedBuildingId(null);
      }
    }
  }, [selectedBasementFloor, selectedBuildingId, floors]);

  // 當選中棟別改變時，檢查當前樓層是否還有效
  useEffect(() => {
    if (selectedBuildingId && selectedBasementFloor) {
      const floorExists = floors.some(
        (f) => f.buildingId === selectedBuildingId && 
               f.floorType === 'basement' && 
               f.floorNumber === selectedBasementFloor
      );
      
      // 如果該棟沒有當前樓層，重置樓層選擇
      if (!floorExists) {
        setSelectedBasementFloor(null);
      }
    }
  }, [selectedBuildingId, selectedBasementFloor, floors]);

  // 過濾當前選中的樓層和棟別的車位分區
  const currentZones = React.useMemo(() => {
    if (!selectedBuildingId || !selectedBasementFloor) return [];
    
    const currentFloor = floors.find(
      (f) => f.buildingId === selectedBuildingId && f.floorNumber === selectedBasementFloor
    );
    
    if (!currentFloor) return [];
    
    return zones
      .filter((z) => z.buildingId === selectedBuildingId && z.floorId === currentFloor.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [zones, selectedBuildingId, selectedBasementFloor, floors]);

  // 新增分區
  const handleAddZone = () => {
    if (!selectedBuildingId || !selectedBasementFloor) return;
    if (!newZoneData.name.trim() || !newZoneData.variableName.trim()) return;

    const currentFloor = floors.find(
      (f) => f.buildingId === selectedBuildingId && f.floorNumber === selectedBasementFloor
    );

    if (!currentFloor) return;

    // 計算起始編號
    const existingZones = zones.filter(
      (z) => z.buildingId === selectedBuildingId && z.floorId === currentFloor.id
    );
    const startNumber = existingZones.reduce((sum, z) => sum + z.spaceCount, 1);

    const newZone: ParkingZoneConfig = {
      id: generateId(),
      buildingId: selectedBuildingId,
      floorId: currentFloor.id,
      name: newZoneData.name,
      variableName: newZoneData.variableName,
      spaceCount: newZoneData.spaceCount,
      startNumber,
      type: newZoneData.type,
      sortOrder: existingZones.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setZones([...zones, newZone]);
    setIsAddingZone(false);
    setNewZoneData({
      name: '',
      variableName: '',
      spaceCount: 10,
      type: 'resident',
    });
  };

  // 更新分區
  const handleUpdateZone = (updatedZone: ParkingZoneConfig) => {
    setZones(zones.map((z) => (z.id === updatedZone.id ? updatedZone : z)));
  };

  // 刪除分區
  const handleDeleteZone = (zoneId: string) => {
    if (confirm('確定要刪除此分區嗎？')) {
      setZones(zones.filter((z) => z.id !== zoneId));
    }
  };

  // 匯出 Excel 功能
  const handleExportExcel = () => {
    if (!currentBuilding || !selectedBasementFloor || currentZones.length === 0) {
      alert('請先選擇棟別和地下室樓層，並確保有車位分區資料');
      return;
    }

    // 準備匯出資料（全中文表頭）
    const exportData = currentZones.map((zone, index) => {
      // 生成該分區的所有車位編號
      const parkingNumbers = Array.from({ length: zone.spaceCount }, (_, i) => 
        `${currentBuilding.buildingCode}-${selectedBasementFloor}-${String(zone.startNumber + i).padStart(2, '0')}`
      );

      return {
        '序號': index + 1,
        '棟別': `${currentBuilding.buildingCode}棟`,
        '樓層': selectedBasementFloor,
        '分區名稱': zone.name,
        '變數名稱': zone.variableName,
        '車位類型': getTypeLabel(zone.type),
        '車位數量': zone.spaceCount,
        '起始編號': String(zone.startNumber).padStart(2, '0'),
        '結束編號': String(zone.startNumber + zone.spaceCount - 1).padStart(2, '0'),
        '車位編號列表': parkingNumbers.join(', '),
        '建立時間': new Date(zone.createdAt).toLocaleString('zh-TW'),
        '更新時間': new Date(zone.updatedAt).toLocaleString('zh-TW'),
      };
    });

    // 建立工作表
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // 設定欄位寬度
    const columnWidths = [
      { wch: 6 },   // 序號
      { wch: 10 },  // 棟別
      { wch: 10 },  // 樓層
      { wch: 20 },  // 分區名稱
      { wch: 20 },  // 變數名稱
      { wch: 15 },  // 車位類型
      { wch: 12 },  // 車位數量
      { wch: 12 },  // 起始編號
      { wch: 12 },  // 結束編號
      { wch: 50 },  // 車位編號列表
      { wch: 20 },  // 建立時間
      { wch: 20 },  // 更新時間
    ];
    worksheet['!cols'] = columnWidths;

    // 建立工作簿
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '車位設定');

    // 產生檔案名稱（包含日期時間）
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(/:/g, '');
    const fileName = `車位設定_${currentBuilding.buildingCode}棟_${selectedBasementFloor}_${dateStr}_${timeStr}.xlsx`;

    // 下載檔案
    XLSX.writeFile(workbook, fileName);
  };

  // 統整匯出 Excel 功能（多工作表）
  const handleExportAllExcel = () => {
    if (zones.length === 0) {
      alert('目前沒有任何車位分區資料可以匯出');
      return;
    }

    // 建立工作簿
    const workbook = XLSX.utils.book_new();

    // 準備總覽資料
    const summaryData: any[] = [];
    let totalParkingSpaces = 0;

    // 按棟別和樓層分組處理
    buildings.forEach((building) => {
      // 取得該棟的所有地下室樓層
      const buildingBasementFloors = floors.filter(
        (f) => f.buildingId === building.id && f.floorType === 'basement'
      );

      buildingBasementFloors.forEach((floor) => {
        // 取得該棟該樓層的所有分區
        const floorZones = zones
          .filter((z) => z.buildingId === building.id && z.floorId === floor.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);

        if (floorZones.length === 0) return;

        const floorTotalSpaces = floorZones.reduce((sum, z) => sum + z.spaceCount, 0);
        totalParkingSpaces += floorTotalSpaces;

        // 添加到總覽
        summaryData.push({
          '棟別': `${building.buildingCode}棟`,
          '樓層': floor.floorNumber,
          '分區數量': floorZones.length,
          '車位總數': floorTotalSpaces,
        });

        // 準備該工作表的詳細資料
        const sheetData = floorZones.map((zone, index) => {
          const parkingNumbers = Array.from({ length: zone.spaceCount }, (_, i) => 
            `${building.buildingCode}-${floor.floorNumber}-${String(zone.startNumber + i).padStart(2, '0')}`
          );

          return {
            '序號': index + 1,
            '分區名稱': zone.name,
            '變數名稱': zone.variableName,
            '車位類型': getTypeLabel(zone.type),
            '車位數量': zone.spaceCount,
            '起始編號': String(zone.startNumber).padStart(2, '0'),
            '結束編號': String(zone.startNumber + zone.spaceCount - 1).padStart(2, '0'),
            '車位編號列表': parkingNumbers.join(', '),
            '建立時間': new Date(zone.createdAt).toLocaleString('zh-TW'),
            '更新時間': new Date(zone.updatedAt).toLocaleString('zh-TW'),
          };
        });

        // 建立工作表名稱（限制長度，Excel工作表名稱最多31字元）
        const sheetName = `${building.buildingCode}棟_${floor.floorNumber}`.slice(0, 31);
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        // 設定欄位寬度
        worksheet['!cols'] = [
          { wch: 6 },   // 序號
          { wch: 20 },  // 分區名稱
          { wch: 20 },  // 變數名稱
          { wch: 15 },  // 車位類型
          { wch: 12 },  // 車位數量
          { wch: 12 },  // 起始編號
          { wch: 12 },  // 結束編號
          { wch: 50 },  // 車位編號列表
          { wch: 20 },  // 建立時間
          { wch: 20 },  // 更新時間
        ];

        // 加入工作簿
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      });
    });

    // 建立總覽工作表（放在第一個）
    const summarySheetData = [
      {
        '項目': '匯出時間',
        '數值': new Date().toLocaleString('zh-TW'),
      },
      {
        '項目': '總棟數',
        '數值': buildings.length,
      },
      {
        '項目': '總樓層數',
        '數值': summaryData.length,
      },
      {
        '項目': '總車位數',
        '數值': totalParkingSpaces,
      },
      ...summaryData.map((item, idx) => ({
        '項目': `資料 ${idx + 1}`,
        '數值': `${item['棟別']} ${item['樓層']} - ${item['分區數量']}個分區, 共${item['車位總數']}個車位`,
      })),
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summarySheetData);
    summaryWorksheet['!cols'] = [
      { wch: 20 },  // 項目
      { wch: 50 },  // 數值
    ];

    // 將總覽工作表插入到第一個位置
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, '總覽');

    // 產生檔案名稱
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 5).replace(/:/g, '');
    const fileName = `車位設定_統整匯出_${dateStr}_${timeStr}.xlsx`;

    // 下載檔案
    XLSX.writeFile(workbook, fileName);
  };

  // 取得當前選中的建築物
  const currentBuilding = buildings.find((b) => b.id === selectedBuildingId);
  const currentFloor = floors.find(
    (f) => f.buildingId === selectedBuildingId && f.floorNumber === selectedBasementFloor
  );

  // 計算該棟該層的總車位數
  const totalSpaces = currentZones.reduce((sum, z) => sum + z.spaceCount, 0);

  return (
    <div className="parking-space-settings p-6 max-w-7xl mx-auto">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-normal)] mb-2">車位設定</h2>
        <p className="text-[var(--text-muted)]">
          設定各棟別各樓層的車位分區與數量，車位編號將從 01 開始自動生成
        </p>
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
            {availableBuildings.length === 0 && (
              <p className="text-[var(--text-muted)] italic">
                {selectedBasementFloor 
                  ? `沒有棟別擁有 ${selectedBasementFloor} 樓層`
                  : '尚未設定棟別，請先在「棟數設定」中新增棟別'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 分區設定區域 */}
      {selectedBasementFloor && selectedBuildingId && currentBuilding && currentFloor && (
        <div className="space-y-6">
          {/* 統計資訊 */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4 border border-[var(--color-border)]">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-sm text-[var(--text-muted)]">當前設定：</span>
                <span className="font-bold text-[var(--text-normal)] ml-2">
                  {currentBuilding.buildingCode}棟 {selectedBasementFloor}
                </span>
              </div>
              <div className="h-6 w-px bg-[var(--color-border)]" />
              <div>
                <span className="text-sm text-[var(--text-muted)]">總車位數：</span>
                <span className="font-bold text-[#5865F2] ml-2">{totalSpaces} 個</span>
              </div>
              <div className="h-6 w-px bg-[var(--color-border)]" />
              <div>
                <span className="text-sm text-[var(--text-muted)]">分區數量：</span>
                <span className="font-bold text-[var(--text-normal)] ml-2">{currentZones.length} 個</span>
              </div>
            </div>
          </div>

          {/* 新增分區按鈕與匯出 Excel */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-[var(--text-normal)]">車位分區設定</h3>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleExportAllExcel}
                disabled={zones.length === 0}
                title="匯出所有棟別所有樓層的車位資料"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                統整匯出
              </Button>
              <Button
                variant="secondary"
                onClick={handleExportExcel}
                disabled={!selectedBuildingId || !selectedBasementFloor || currentZones.length === 0}
                title="匯出目前選中的棟別和樓層"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                匯出目前頁面
              </Button>
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
            <div className="border-2 border-[#5865F2] border-dashed rounded-lg p-4 bg-[var(--bg-secondary)]">
              <h4 className="font-bold text-[var(--text-normal)] mb-4">新增車位分區</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    分區名稱 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newZoneData.name}
                    onChange={(e) => setNewZoneData({ ...newZoneData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                    placeholder="如：住戶區、訪客區、機車區"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    變數名稱 <span className="text-red-500">*</span>{' '}
                    <span className="text-xs text-white">(用於程式引用)</span>
                  </label>
                  <input
                    type="text"
                    value={newZoneData.variableName}
                    onChange={(e) =>
                      setNewZoneData({
                        ...newZoneData,
                        variableName: e.target.value.replace(/[^a-zA-Z0-9_]/g, ''),
                      })
                    }
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                    placeholder="如：residentZone、visitorZone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    車位類型
                  </label>
                  <select
                    value={newZoneData.type}
                    onChange={(e) =>
                      setNewZoneData({
                        ...newZoneData,
                        type: e.target.value as ParkingZoneConfig['type'],
                      })
                    }
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                  >
                    <option value="resident">住戶車位</option>
                    <option value="visitor">訪客車位</option>
                    <option value="motorcycle">機車位</option>
                    <option value="disabled">無障礙車位</option>
                    <option value="reserved">保留車位</option>
                    <option value="custom">自定義</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">
                    車位數量
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newZoneData.spaceCount}
                    onChange={(e) =>
                      setNewZoneData({
                        ...newZoneData,
                        spaceCount: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)] focus:ring-2 focus:ring-[#5865F2] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <Button variant="primary" onClick={handleAddZone} className="px-6">
                  確認新增
                </Button>
                <Button variant="secondary" onClick={() => setIsAddingZone(false)}>
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 分區列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentZones.map((zone) => (
              <ZoneCard
                key={zone.id}
                zone={zone}
                buildingCode={currentBuilding.buildingCode}
                floorNumber={selectedBasementFloor}
                onUpdate={handleUpdateZone}
                onDelete={handleDeleteZone}
              />
            ))}
          </div>

          {currentZones.length === 0 && !isAddingZone && (
            <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-lg border border-dashed border-[var(--color-border)]">
              <svg
                className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p className="text-[var(--text-muted)] mb-2">尚未設定任何車位分區</p>
              <p className="text-sm text-[var(--text-muted)] opacity-70">
                點擊上方「新增分區」按鈕開始設定
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParkingSpaceSettings;
