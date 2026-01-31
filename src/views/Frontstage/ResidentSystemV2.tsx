import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ResidentCard from '../../components/resident/ResidentCard';
import { useAppSelector } from '../../store/hooks';
import type { BuildingConfig, UnitConfig } from '../../types/building';
import type { StatusColorConfig } from '../../types/statusColor';
import '../../assets/styles/resident.css';

// 本地類型定義（兼容區塊一和區塊二）
interface LocalResident {
  id: string;
  unitId: string;
  unit?: UnitConfig;
  statusId: string;
  status?: { name: string; color: string };
  ownerName: string;
  ownerPhone: string;
  ownerNotes?: string;
  members: Array<{ id: string; name: string; phone?: string }>;
  tenants: Array<{ id: string; name: string; phone?: string }>;
  licensePlates: string[];
  generalCards: Array<{ member: string; cardNumber: string }>;
  etcCards: Array<{ plate: string; cardNumber: string }>;
  otherEtcCards: Array<{ type: string; cardNumber: string }>;
}

const ResidentSystemV2: React.FC = () => {
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(null);
  const [localResidents, setLocalResidents] = useState<Record<string, LocalResident>>({});

  // 從 Redux 獲取數據
  // TODO: 等後台 AI 完成後，使用以下方式讀取
  // const buildings = useAppSelector(state => state.building.buildings);
  // const units = useAppSelector(state => state.unit.units);
  // const houseStatuses = useAppSelector(state => state.config.houseStatuses);

  const buildings: any[] = useAppSelector((state) => state.building.buildings);
  const units: any[] = useAppSelector((state) => state.unit.units);
  const colorConfigs = useAppSelector((state) => state.config.colorConfigs);

  // TODO: 等後台 AI 完成後，從 houseStatuses 讀取狀態
  // const getStatusInfo = (statusId: string) => {
  //   const status = houseStatuses.find(s => s.id === statusId);
  //   return status ? { name: status.name, color: status.color } : { name: '未知', color: '#6b7280' };
  // };

  // 從顏色配置獲取戶別狀態顏色
  const activeConfig: StatusColorConfig | undefined = colorConfigs.configs.find((c: StatusColorConfig) => c.id === colorConfigs.activeConfigId);
  const unitStatusColors = activeConfig?.unit || {
    occupied: '#22c55e',
    vacant: '#94a3b8',
    maintenance: '#f59e0b',
    pending: '#3b82f6',
  };

  // 棟別統計
  const buildingStats = buildings.map((building: BuildingConfig) => {
    const buildingUnits = units.filter((u: UnitConfig) => u.buildingId === building.id);
    const occupied = buildingUnits.filter((u: UnitConfig) => u.status === 'occupied').length;
    const vacant = buildingUnits.filter((u: UnitConfig) => u.status === 'vacant').length;
    const maintenance = buildingUnits.filter((u: UnitConfig) => u.status === 'maintenance').length;

    return {
      ...building,
      unitCount: buildingUnits.length,
      occupied,
      vacant,
      maintenance,
    };
  });

  const getStatusInfo = (statusId: string) => {
    const statusMap: Record<string, { name: string; color: string }> = {
      occupied: { name: '已入住', color: unitStatusColors.occupied },
      vacant: { name: '空屋', color: unitStatusColors.vacant },
      maintenance: { name: '維護中', color: unitStatusColors.maintenance },
      pending: { name: '待處理', color: unitStatusColors.pending },
    };
    return statusMap[statusId] || { name: '未知', color: '#6b7280' };
  };

  // 初始化模擬住戶數據
  useEffect(() => {
    if (units.length > 0 && Object.keys(localResidents).length === 0) {
      const mockData: Record<string, LocalResident> = {};
      units.forEach((unit: UnitConfig) => {
        mockData[unit.id] = {
          id: `resident-${unit.id}`,
          unitId: unit.id,
          unit: unit,
          statusId: unit.status === 'occupied' ? 'occupied' : unit.status === 'maintenance' ? 'maintenance' : 'vacant',
          ownerName: unit.ownerName || '未設定',
          ownerPhone: '0912-345-678',
          members: [],
          tenants: [],
          licensePlates: [],
          generalCards: [],
          etcCards: [],
          otherEtcCards: [],
        };
      });
      setLocalResidents(mockData);
    }
  }, [units, localResidents]);

  const filteredUnits = activeBuildingId
    ? units.filter((u: UnitConfig) => u.buildingId === activeBuildingId)
    : units;

  const filteredResidents = filteredUnits.map((unit: UnitConfig) => localResidents[unit.id]).filter(Boolean);

  return (
    <div className="resident-system">
      <div className="page-header">
        <div className="header-content">
          <h1>住戶系統</h1>
          <p>管理住戶資料與相關設定</p>
        </div>
        <Button variant="primary">新增住戶</Button>
      </div>

      {/* 狀態統計 */}
      <div className="status-summary">
        {buildingStats.map((building: typeof buildingStats[0]) => {
          const statusInfo = getStatusInfo('occupied');
          return (
            <div key={building.id} className="status-item">
              <span className="color-dot" style={{ backgroundColor: statusInfo.color }} />
              <span className="count">{building.unitCount}</span>
              <span className="label">{building.name}</span>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="building-tabs">
            <button
              className={`building-tab ${activeBuildingId === null ? 'active' : ''}`}
              onClick={() => setActiveBuildingId(null)}
            >
              全部 ({units.length})
            </button>
            {buildings.map((building: BuildingConfig) => (
              <button
                key={building.id}
                className={`building-tab ${activeBuildingId === building.id ? 'active' : ''}`}
                onClick={() => setActiveBuildingId(building.id)}
              >
                {building.name} ({units.filter((u: UnitConfig) => u.buildingId === building.id).length})
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filteredResidents.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h4>沒有住戶資料</h4>
              <p>請先在後台設定棟數和戶別</p>
            </div>
          ) : (
            <div className="residents-grid">
              {filteredResidents.map((resident: LocalResident) => {
                const statusInfo = getStatusInfo(resident.statusId);
                return (
                  <ResidentCard
                    key={resident.id}
                    resident={{
                      ...resident,
                      status: statusInfo,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }}
                    onEdit={(r) => console.log('編輯住戶:', r)}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResidentSystemV2;
