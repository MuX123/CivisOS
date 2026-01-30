import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { unitActions } from '../../store/modules/unit';
import { floorActions } from '../../store/modules/floor';
import { buildingActions } from '../../store/modules/building';
import { Unit, Floor, Building } from '../../types/domain';
import '../../assets/styles/unit-layout-manager.css';

interface UnitLayout {
  id: string;
  buildingId: string;
  floorId: string;
  unitId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface FloorLayout {
  id: string;
  buildingId: string;
  floorNumber: string;
  units: UnitLayout[];
  background?: string;
  gridSize: number;
}

interface UnitLayoutManagerProps {
  buildingId?: string;
  onClose?: () => void;
}

const UnitLayoutManager: React.FC<UnitLayoutManagerProps> = ({ buildingId: initialBuildingId, onClose }) => {
  const dispatch = useAppDispatch();
  const { buildings } = useAppSelector(state => state.building);
  const { floors } = useAppSelector(state => state.floor);
  const { units } = useAppSelector(state => state.unit);

  const [selectedBuilding, setSelectedBuilding] = useState<string>(initialBuildingId || '');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [currentLayout, setCurrentLayout] = useState<FloorLayout | null>(null);
  const [draggedUnit, setDraggedUnit] = useState<UnitLayout | null>(null);
  const [gridSize, setGridSize] = useState<number>(20);
  const [isAutoLayout, setIsAutoLayout] = useState<boolean>(true);

  useEffect(() => {
    const mockBuildings: Building[] = [
      { id: 'B001', name: '第一社區大樓', buildingCode: 'A', address: '台北市信義區信義路五段7號', totalFloors: 12, totalUnits: 240, description: '主要住宅大樓', sortOrder: 1, createdAt: new Date(), updatedAt: new Date() },
      { id: 'B002', name: '第二社區大樓', buildingCode: 'B', address: '台北市信義區信義路五段3號', totalFloors: 8, totalUnits: 160, description: '次要住宅大樓', sortOrder: 2, createdAt: new Date(), updatedAt: new Date() },
    ];

    const mockFloors: Floor[] = [
      { id: 'F001', buildingId: 'B001', floorNumber: '1', name: '一樓', floorType: 'residential', totalUnits: 20, sortOrder: 1, description: '商用樓層', createdAt: new Date(), updatedAt: new Date() },
      { id: 'F002', buildingId: 'B001', floorNumber: '2', name: '二樓', floorType: 'residential', totalUnits: 20, sortOrder: 2, description: '住宅樓層', createdAt: new Date(), updatedAt: new Date() },
      { id: 'F003', buildingId: 'B001', floorNumber: '3', name: '三樓', floorType: 'residential', totalUnits: 20, sortOrder: 3, description: '住宅樓層', createdAt: new Date(), updatedAt: new Date() },
      { id: 'F004', buildingId: 'B001', floorNumber: '4', name: '四樓', floorType: 'residential', totalUnits: 20, sortOrder: 4, description: '住宅樓層', createdAt: new Date(), updatedAt: new Date() },
      { id: 'F005', buildingId: 'B001', floorNumber: '5', name: '五樓', floorType: 'residential', totalUnits: 20, sortOrder: 5, description: '住宅樓層', createdAt: new Date(), updatedAt: new Date() },
      { id: 'F006', buildingId: 'B001', floorNumber: '6', name: '六樓', floorType: 'residential', totalUnits: 20, sortOrder: 6, description: '住宅樓層', createdAt: new Date(), updatedAt: new Date() },
      { id: 'F007', buildingId: 'B001', floorNumber: '7', name: '七樓', floorType: 'residential', totalUnits: 20, sortOrder: 7, description: '住宅樓層', createdAt: new Date(), updatedAt: new Date() },
      { id: 'F008', buildingId: 'B001', floorNumber: '8', name: '八樓', floorType: 'residential', totalUnits: 20, sortOrder: 8, description: '住宅樓層', createdAt: new Date(), updatedAt: new Date() },
      { id: 'F009', buildingId: 'B001', floorNumber: '9', name: '九樓', floorType: 'residential', totalUnits: 20, sortOrder: 9, description: '住宅樓層', createdAt: new Date(), updatedAt: new Date() },
      { id: 'F010', buildingId: 'B001', floorNumber: '10', name: '十樓', floorType: 'residential', totalUnits: 20, sortOrder: 10, description: '住宅樓層', createdAt: new Date(), updatedAt: new Date() },
      { id: 'F011', buildingId: 'B001', floorNumber: '11', name: '十一樓', floorType: 'residential', totalUnits: 20, sortOrder: 11, description: '住宅樓層', createdAt: new Date(), updatedAt: new Date() },
      { id: 'F012', buildingId: 'B001', floorNumber: '12', name: '十二樓', floorType: 'roof', totalUnits: 20, sortOrder: 12, description: '頂層住宅', createdAt: new Date(), updatedAt: new Date() },
    ];

    const mockUnits: Unit[] = [
      { id: 'U001', floorId: 'F002', buildingId: 'B001', unitNumber: '201', type: 'residential', size: 85, bedrooms: 3, bathrooms: 2, ownerName: '陳先生', residentId: 'R001', status: 'occupied', monthlyFee: 25000, createdAt: new Date(), updatedAt: new Date() },
      { id: 'U002', floorId: 'F002', buildingId: 'B001', unitNumber: '202', type: 'residential', size: 85, bedrooms: 3, bathrooms: 2, status: 'vacant', monthlyFee: 25000, createdAt: new Date(), updatedAt: new Date() },
      { id: 'U003', floorId: 'F002', buildingId: 'B001', unitNumber: '203', type: 'residential', size: 95, bedrooms: 3, bathrooms: 2, ownerName: '林女士', residentId: 'R002', status: 'occupied', monthlyFee: 28000, createdAt: new Date(), updatedAt: new Date() },
      { id: 'U004', floorId: 'F002', buildingId: 'B001', unitNumber: '204', type: 'residential', size: 85, bedrooms: 3, bathrooms: 2, status: 'vacant', monthlyFee: 25000, createdAt: new Date(), updatedAt: new Date() },
      { id: 'U005', floorId: 'F002', buildingId: 'B001', unitNumber: '205', type: 'residential', size: 75, bedrooms: 2, bathrooms: 2, ownerName: '張先生', residentId: 'R003', status: 'occupied', monthlyFee: 22000, createdAt: new Date(), updatedAt: new Date() },
      { id: 'U006', floorId: 'F002', buildingId: 'B001', unitNumber: '206', type: 'residential', size: 85, bedrooms: 3, bathrooms: 2, status: 'maintenance', monthlyFee: 25000, createdAt: new Date(), updatedAt: new Date() },
      { id: 'U007', floorId: 'F002', buildingId: 'B001', unitNumber: '207', type: 'residential', size: 110, bedrooms: 4, bathrooms: 2, ownerName: '王女士', residentId: 'R004', status: 'occupied', monthlyFee: 35000, createdAt: new Date(), updatedAt: new Date() },
      { id: 'U008', floorId: 'F002', buildingId: 'B001', unitNumber: '208', type: 'residential', size: 85, bedrooms: 3, bathrooms: 2, status: 'vacant', monthlyFee: 25000, createdAt: new Date(), updatedAt: new Date() },
      { id: 'U009', floorId: 'F002', buildingId: 'B001', unitNumber: '209', type: 'residential', size: 95, bedrooms: 3, bathrooms: 2, status: 'vacant', monthlyFee: 28000, createdAt: new Date(), updatedAt: new Date() },
      { id: 'U010', floorId: 'F002', buildingId: 'B001', unitNumber: '210', type: 'residential', size: 75, bedrooms: 2, bathrooms: 2, ownerName: '李先生', residentId: 'R005', status: 'occupied', monthlyFee: 22000, createdAt: new Date(), updatedAt: new Date() },
    ];

    dispatch(buildingActions.setBuildings(mockBuildings));
    dispatch(floorActions.setFloors(mockFloors));
    dispatch(unitActions.setUnits(mockUnits));
  }, [dispatch]);

  const generateAutoLayout = useCallback((floorId: string, unitsForFloor: Unit[]) => {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return null;

    const layout: UnitLayout = {
      id: `layout-${floorId}`,
      buildingId: floor.buildingId,
      floorId: floor.id,
      unitId: '',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0,
    };

    const unitLayouts: UnitLayout[] = unitsForFloor.map((unit, index) => {
      const row = Math.floor(index / 5);
      const col = index % 5;

      return {
        id: `layout-${unit.id}`,
        buildingId: unit.buildingId,
        floorId: unit.floorId,
        unitId: unit.id,
        x: col * 150 + 50,
        y: row * 120 + 50,
        width: 120,
        height: 90,
        rotation: 0,
      };
    });

    return {
      id: `layout-${floorId}`,
      buildingId: floor.buildingId,
      floorNumber: floor.floorNumber,
      units: unitLayouts,
      gridSize: gridSize,
    };
  }, [floors, gridSize]);

  useEffect(() => {
    if (selectedFloor && isAutoLayout) {
      const unitsForFloor = units.filter(unit => unit.floorId === selectedFloor);
      const autoLayout = generateAutoLayout(selectedFloor, unitsForFloor);
      setCurrentLayout(autoLayout);
    }
  }, [selectedFloor, units, isAutoLayout, generateAutoLayout]);

  const handleBuildingSelect = (buildingId: string) => {
    setSelectedBuilding(buildingId);
    setSelectedFloor('');
    setCurrentLayout(null);
  };

  const handleFloorSelect = (floorId: string) => {
    setSelectedFloor(floorId);
    const unitsForFloor = units.filter(unit => unit.floorId === floorId);

    if (isAutoLayout) {
      const autoLayout = generateAutoLayout(floorId, unitsForFloor);
      setCurrentLayout(autoLayout);
    }
  };

  const handleUnitDragStart = (e: React.DragEvent, unit: UnitLayout) => {
    setDraggedUnit(unit);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleUnitDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleUnitDrop = (e: React.DragEvent, targetUnit?: UnitLayout) => {
    e.preventDefault();
    if (!draggedUnit || !currentLayout) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const updatedLayout = {
      ...currentLayout,
      units: currentLayout.units.map(unit =>
        unit.id === draggedUnit.id
          ? { ...unit, x, y }
          : unit
      ),
    };

    setCurrentLayout(updatedLayout);
    setDraggedUnit(null);
  };

  const handleUnitResize = (unitId: string, newSize: { width: number; height: number }) => {
    if (!currentLayout) return;

    const updatedLayout = {
      ...currentLayout,
      units: currentLayout.units.map(unit =>
        unit.id === unitId
          ? { ...unit, ...newSize }
          : unit
      ),
    };

    setCurrentLayout(updatedLayout);
  };

  const handleUnitRotate = (unitId: string, rotation: number) => {
    if (!currentLayout) return;

    const updatedLayout = {
      ...currentLayout,
      units: currentLayout.units.map(unit =>
        unit.id === unitId
          ? { ...unit, rotation }
          : unit
      ),
    };

    setCurrentLayout(updatedLayout);
  };

  const saveLayout = () => {
    if (!currentLayout) return;

    console.log('保存佈局:', currentLayout);

  };

  const resetLayout = () => {
    if (!selectedFloor) return;

    const unitsForFloor = units.filter(unit => unit.floorId === selectedFloor);
    const autoLayout = generateAutoLayout(selectedFloor, unitsForFloor);
    setCurrentLayout(autoLayout);
  };

  const getUnitStyle = (unit: UnitLayout) => ({
    position: 'absolute' as const,
    left: `${unit.x}px`,
    top: `${unit.y}px`,
    width: `${unit.width}px`,
    height: `${unit.height}px`,
    transform: `rotate(${unit.rotation}deg)`,
  });

  const getUnitStatusColor = (unitId: string) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return 'var(--color-secondary)';

    const statusColors = {
      occupied: 'var(--color-status-occupied)',
      vacant: 'var(--color-status-available)',
      maintenance: 'var(--color-status-maintenance)',
    };

    return statusColors[unit.status as keyof typeof statusColors] || 'var(--color-secondary)';
  };

  const availableFloors = selectedBuilding
    ? floors.filter(floor => floor.buildingId === selectedBuilding)
    : [];

  const unitsForSelectedFloor = selectedFloor
    ? units.filter(unit => unit.floorId === selectedFloor)
    : [];

  return (
    <div className="unit-layout-manager">
      <div className="layout-header">
        <h1>室內地圖編輯器</h1>
        <div className="layout-controls">
          <div className="control-group">
            <label>建築物：</label>
            <select value={selectedBuilding} onChange={(e) => handleBuildingSelect(e.target.value)}>
              <option value="">選擇建築物</option>
              {buildings.map(building => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>樓層：</label>
            <select value={selectedFloor} onChange={(e) => handleFloorSelect(e.target.value)} disabled={!selectedBuilding}>
              <option value="">選擇樓層</option>
              {availableFloors.map(floor => (
                <option key={floor.id} value={floor.id}>
                  {floor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={isAutoLayout}
                onChange={(e) => setIsAutoLayout(e.target.checked)}
              />
              自動佈局
            </label>
          </div>

          <div className="control-group">
            <label>網格大小：</label>
            <input
              type="range"
              min="10"
              max="50"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              disabled={!isAutoLayout}
            />
            <span>{gridSize}px</span>
          </div>

          <div className="layout-actions">
            <Button variant="primary" onClick={saveLayout} disabled={!currentLayout}>
              保存佈局
            </Button>
            <Button variant="secondary" onClick={resetLayout} disabled={!currentLayout}>
              重置佈局
            </Button>
          </div>
        </div>
      </div>

      {currentLayout && (
        <div className="layout-workspace">
          <div className="layout-canvas">
            <div
              className="layout-grid"
              style={{
                backgroundImage: `repeating-linear-gradient(0deg, var(--color-border) 0px, transparent 1px, transparent ${gridSize - 1}px, var(--color-border) ${gridSize}px),
                                 repeating-linear-gradient(90deg, var(--color-border) 0px, transparent 1px, transparent ${gridSize - 1}px, var(--color-border) ${gridSize}px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
              onDragOver={handleUnitDragOver}
              onDrop={handleUnitDrop}
            >
              {currentLayout.units.map(unit => {
                const unitData = units.find(u => u.id === unit.unitId);
                return (
                  <div
                    key={unit.id}
                    className={`unit-layout-item ${unit.id === draggedUnit?.id ? 'dragging' : ''}`}
                    style={{
                      ...getUnitStyle(unit),
                      backgroundColor: getUnitStatusColor(unit.unitId),
                      border: '2px solid var(--color-border)',
                      borderRadius: '8px',
                      cursor: 'move',
                    }}
                    draggable={!isAutoLayout}
                    onDragStart={(e) => handleUnitDragStart(e, unit)}
                  >
                    <div className="unit-info">
                      <div className="unit-number">{unitData?.unitNumber}</div>
                      <div className="unit-type">{unitData?.type}</div>
                      <div className="unit-size">{unitData?.size}m²</div>
                    </div>

                    {!isAutoLayout && (
                      <div className="unit-controls">
                        <button
                          className="resize-handle nw"
                          onMouseDown={(e) => {

                          }}
                        />
                        <button
                          className="resize-handle ne"
                          onMouseDown={(e) => {

                          }}
                        />
                        <button
                          className="rotate-handle"
                          onMouseDown={(e) => {

                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="layout-sidebar">
            <Card>
              <CardHeader>
                <CardTitle>佈局資訊</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="layout-stats">
                  <div className="stat-item">
                    <label>樓層：</label>
                    <span>{availableFloors.find(f => f.id === selectedFloor)?.name || '-'}</span>
                  </div>
                  <div className="stat-item">
                    <label>單元總數：</label>
                    <span>{currentLayout.units.length}</span>
                  </div>
                  <div className="stat-item">
                    <label>已佔用：</label>
                    <span>{unitsForSelectedFloor.filter(u => u.status === 'occupied').length}</span>
                  </div>
                  <div className="stat-item">
                    <label>空置：</label>
                    <span>{unitsForSelectedFloor.filter(u => u.status === 'vacant').length}</span>
                  </div>
                  <div className="stat-item">
                    <label>維護中：</label>
                    <span>{unitsForSelectedFloor.filter(u => u.status === 'maintenance').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>操作說明</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="instructions">
                  <p><strong>自動佈局模式：</strong></p>
                  <ul>
                    <li>系統自動排列單元位置</li>
                    <li>可調整網格大小</li>
                    <li>無法手動拖曳單元</li>
                  </ul>
                  <p><strong>手動佈局模式：</strong></p>
                  <ul>
                    <li>可自由拖曳單元</li>
                    <li>可調整單元大小</li>
                    <li>可旋轉單元</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>狀態圖例</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="status-legend">
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: 'var(--color-status-available)' }}></div>
                    <span>空置</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: 'var(--color-status-occupied)' }}></div>
                    <span>已佔用</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ backgroundColor: 'var(--color-status-maintenance)' }}></div>
                    <span>維護中</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnitLayoutManager;