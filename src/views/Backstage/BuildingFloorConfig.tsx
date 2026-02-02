import React, { useState, useEffect } from 'react';
import { BuildingConfig, Floor } from '../../types/domain';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setBuildings,
  addBuildingWithGeneration,
  updateBuildingWithRegeneration,
  deleteBuilding,
  setSelectedBuilding,
  setLoading
} from '../../store/modules/building';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button'; // Import Button
import IntroductionButton from '../../components/ui/IntroductionButton';
import FloorManager from './FloorManager';
import UnitLayoutManager from './UnitLayoutManager';
import ColorConfigPanel from './ColorConfigPanel';
import ParkingConfig from './ParkingConfig';

// Helper component for sections
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="section mb-6">
    <h3 className="text-lg font-bold mb-4 text-[var(--text-normal)]">{title}</h3>
    <div className="section-content">
      {children}
    </div>
  </div>
);

// Component to edit a single building card
const BuildingEditCard: React.FC<{ 
  building: BuildingConfig; 
  onSave: (updates: Partial<BuildingConfig>) => void;
  onDelete: () => void;
  onOpenParkingConfig: () => void;
}> = ({ building, onSave, onDelete, onOpenParkingConfig }) => {
  const [formData, setFormData] = useState({
    name: building.name,
    buildingCode: building.buildingCode,
    houseNumberPrefix: building.houseNumberPrefix || building.buildingCode,
    roofFloors: building.roofFloors,
    residentialFloors: building.residentialFloors,
    basementFloors: building.basementFloors,
    unitsPerFloor: building.unitsPerFloor
  });

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'buildingCode' && field !== 'name' && field !== 'houseNumberPrefix' ? Number(value) : value
    }));
  };

  const hasChanges = 
    formData.buildingCode !== building.buildingCode ||
    formData.name !== building.name ||
    formData.houseNumberPrefix !== (building.houseNumberPrefix || building.buildingCode) ||
    formData.roofFloors !== building.roofFloors ||
    formData.residentialFloors !== building.residentialFloors ||
    formData.basementFloors !== building.basementFloors ||
    formData.unitsPerFloor !== building.unitsPerFloor;

  return (
    <Card className="mb-4 h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>{building.name} ({building.buildingCode})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">戶號</label>
            <input 
              className="border border-[var(--color-border)] p-2 w-full rounded focus:ring-2 focus:ring-[#5a7fd6] focus:border-[#5a7fd6] bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="如: 第一棟、日光棟"
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">棟別代號</label>
            <input 
              className="border border-[var(--color-border)] p-2 w-full rounded focus:ring-2 focus:ring-[#5a7fd6] focus:border-[#5a7fd6] bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
              value={formData.buildingCode}
              onChange={e => handleChange('buildingCode', e.target.value)}
              placeholder="如: A"
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">戶號前綴</label>
            <input 
              className="border border-[var(--color-border)] p-2 w-full rounded focus:ring-2 focus:ring-[#5a7fd6] focus:border-[#5a7fd6] bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
              value={formData.houseNumberPrefix}
              onChange={e => handleChange('houseNumberPrefix', e.target.value)}
              placeholder="如: 101、102、A01"
            />

          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">每層戶數</label>
            <input 
              type="number"
              className="border border-[var(--color-border)] p-2 w-full rounded focus:ring-2 focus:ring-[#5a7fd6] focus:border-[#5a7fd6] bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
              value={formData.unitsPerFloor}
              onChange={e => handleChange('unitsPerFloor', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">R樓層數</label>
            <input 
              type="number"
              className="border border-[var(--color-border)] p-2 w-full rounded focus:ring-2 focus:ring-[#5a7fd6] focus:border-[#5a7fd6] bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
              value={formData.roofFloors}
              onChange={e => handleChange('roofFloors', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">居住層數</label>
            <input 
              type="number"
              className="border border-[var(--color-border)] p-2 w-full rounded focus:ring-2 focus:ring-[#5a7fd6] focus:border-[#5a7fd6] bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
              value={formData.residentialFloors}
              onChange={e => handleChange('residentialFloors', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">地下室層數</label>
            <input 
              type="number"
              className="border border-[var(--color-border)] p-2 w-full rounded focus:ring-2 focus:ring-[#5a7fd6] focus:border-[#5a7fd6] bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
              value={formData.basementFloors}
              onChange={e => handleChange('basementFloors', Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="stats mt-4 text-sm text-[var(--text-muted)] bg-[var(--bg-secondary)] p-2 rounded">
          <p>總樓層: {building.totalFloors} | 總戶數: {building.totalUnits} | R樓: {building.roofFloors}層 | B樓: {building.basementFloors}層</p>
        </div>
        
        <div className="actions mt-4 flex gap-2 justify-end">
             <Button 
                variant="secondary"
                size="small"
                onClick={(e) => { e.stopPropagation(); onOpenParkingConfig(); }}
             >
               車位設定
             </Button>

           {hasChanges && (
             <Button 
               variant="primary"
               size="small"
               onClick={(e) => { e.stopPropagation(); onSave(formData); }}
             >
               更新並重算
             </Button>
           )}
           <Button 
             variant="danger"
             size="small"
             onClick={(e) => { e.stopPropagation(); onDelete(); }}
           >
             刪除
           </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const BuildingFloorConfig: React.FC = () => {
  const dispatch = useAppDispatch();
  const { buildings, floors, selectedBuildingId, loading } = useAppSelector(state => state.building);
  
  const [showParkingConfig, setShowParkingConfig] = useState<string | null>(null);

  // Initial load simulation (or just use what's in store)
  useEffect(() => {
    // If empty, maybe add one? Or wait for user.
  }, []);

  const handleAddBuilding = () => {
    const newBuildingData = {
      buildingCode: `A`,
      name: `第一棟`,
      houseNumberPrefix: `1`,
      roofFloors: 1,
      residentialFloors: 10,
      basementFloors: 2,
      unitsPerFloor: 4,
      status: 'active' as const
    };
    dispatch(addBuildingWithGeneration(newBuildingData));
  };

  const handleEditBuilding = (id: string, updates: Partial<BuildingConfig>) => {
    dispatch(updateBuildingWithRegeneration({ id, updates }));
  };

  const handleDeleteBuilding = (id: string) => {
    if (confirm('確定要刪除此棟別嗎？相關資料將一併刪除。')) {
      dispatch(deleteBuilding(id));
      if (selectedBuildingId === id) {
        dispatch(setSelectedBuilding(null));
      }
    }
  };
  
  const handleOpenParkingConfig = (buildingId: string) => {
      setShowParkingConfig(buildingId);
  }

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
  
  return (
    <div className="building-floor-config p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-3xl font-bold text-[var(--text-normal)]">棟數樓層設定</h2>
        <div className="flex items-center gap-2">
          <IntroductionButton pageId="building" />
        </div>
      </div>

      {/* 區塊 1: 棟數設定 */}
      <Section title="棟數設定">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map(building => (
            <div key={building.id} onClick={() => dispatch(setSelectedBuilding(building.id))} className={`cursor-pointer transform transition-all duration-200 ${selectedBuildingId === building.id ? 'ring-2 ring-[#5a7fd6] rounded-lg scale-[1.02]' : 'hover:scale-[1.01]'}`}>
                <BuildingEditCard
                    building={building}
                    onSave={(updates) => handleEditBuilding(building.id, updates)}
                    onDelete={() => handleDeleteBuilding(building.id)}
                    onOpenParkingConfig={() => handleOpenParkingConfig(building.id)}
                 />
            </div>
          ))}
          <div className="add-card flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 cursor-pointer hover:bg-[var(--bg-hover)] hover:border-[#5a7fd6] transition-colors h-full min-h-[300px]" onClick={handleAddBuilding}>
            <div className="w-16 h-16 bg-[#5a7fd6] bg-opacity-20 rounded-full flex items-center justify-center mb-4 text-[#5a7fd6]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xl font-medium text-[var(--text-muted)]">+ 新增棟別</span>
          </div>
        </div>
      </Section>

      {selectedBuilding && (
        <div className="space-y-8 animate-fade-in">
           {/* 區塊: 戶別預覽 (UnitLayoutManager) */}
           <Section title="戶別格局預覽">
              <UnitLayoutManager buildingId={selectedBuilding.id} />
           </Section>
        </div>
      )}

      {showParkingConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-5xl max-h-[90vh] overflow-auto shadow-2xl border border-[var(--color-border)]">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-border)]">
              <h3 className="text-2xl font-bold text-[var(--text-normal)]">車位配置 - {buildings.find(b => b.id === showParkingConfig)?.name}</h3>
              <button onClick={() => setShowParkingConfig(null)} className="text-[var(--text-muted)] hover:text-[var(--text-normal)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ParkingConfig buildingId={showParkingConfig} />
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/75 flex items-center justify-center z-50">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default BuildingFloorConfig;
