import React, { useState, useEffect } from 'react';
import { BuildingConfig, Floor, UnitRule, UnitConfig } from '../../types/domain';
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

// Component to display unit preview for a building
const BuildingUnitPreview: React.FC<{
  building: BuildingConfig;
  floors: Floor[];
  units: UnitConfig[];
}> = ({ building, floors, units }) => {
  const buildingFloors = floors.filter(f => f.buildingId === building.id && f.floorType === 'residential');
  const buildingUnits = units.filter(u => u.buildingId === building.id);
  
  // Sort floors: higher floors first
  const sortedFloors = [...buildingFloors].sort((a, b) => b.sortOrder - a.sortOrder);

  const getUnitsByFloor = (floorId: string) => {
    return buildingUnits
      .filter(u => u.floorId === floorId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  if (sortedFloors.length === 0) {
    return (
      <div className="mt-4 p-4 bg-[var(--bg-primary)]/50 rounded text-sm text-[var(--text-muted)] text-center">
        尚未設定樓層，請設定居住層數後點擊「更新並重算」
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-[var(--color-border)] pt-4">
      <h4 className="text-sm font-medium text-[var(--text-muted)] mb-3">格局預覽</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {sortedFloors.map(floor => {
          const floorUnits = getUnitsByFloor(floor.id);
          return (
            <div key={floor.id} className="flex items-center gap-2 text-sm">
              <span className="w-12 font-medium text-[var(--text-normal)]">{floor.name}</span>
              <div className="flex-1 flex gap-1 flex-wrap">
                {floorUnits.length > 0 ? (
                  floorUnits.map(unit => (
                    <span 
                      key={unit.id} 
                      className="px-2 py-0.5 bg-[var(--brand-experiment)]/10 text-[var(--text-normal)] rounded text-xs border border-[var(--brand-experiment)]/30"
                    >
                      {unit.unitNumber}
                    </span>
                  ))
                ) : (
                  <span className="text-[var(--text-muted)] text-xs italic">無戶別</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Component to edit a single building card
const BuildingEditCard: React.FC<{ 
  building: BuildingConfig; 
  floors: Floor[];
  units: UnitConfig[];
  onSave: (updates: Partial<BuildingConfig>) => void;
  onDelete: () => void;
  onOpenParkingConfig: () => void;
}> = ({ building, floors, units, onSave, onDelete, onOpenParkingConfig }) => {
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
          {/* 戶號前綴隱藏，因為可能混淆 */}
           {/* <div className="form-group">
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1">戶號前綴</label>
            <input 
              className="border border-[var(--color-border)] p-2 w-full rounded focus:ring-2 focus:ring-[#5a7fd6] focus:border-[#5a7fd6] bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
              value={formData.houseNumberPrefix}
              onChange={e => handleChange('houseNumberPrefix', e.target.value)}
              placeholder="如: 101、102、A01"
            />
          </div> */}
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
        
        {/* 格局預覽 */}
        <BuildingUnitPreview building={building} floors={floors} units={units} />
      </CardContent>
    </Card>
  );
};

// Unit Rule Editor Component
const UnitRuleEditor: React.FC<{
  buildings: BuildingConfig[];
  onSave: (buildingId: string, rules: UnitRule[]) => void;
}> = ({ buildings, onSave }) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id || '');
  const [rules, setRules] = useState<UnitRule[]>([]);
  
  // Load rules when building selection changes
  useEffect(() => {
    const building = buildings.find(b => b.id === selectedBuildingId);
    if (building && building.unitRules) {
      setRules(building.unitRules);
    } else {
      setRules([]);
    }
  }, [selectedBuildingId, buildings]);

  const handleAddRule = () => {
    const newRule: UnitRule = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      unitNumber: '',
      code: ''
    };
    setRules([...rules, newRule]);
  };
  
  // Support batch addition (user requested clicking "+" adds a row, but we can also just support adding multiple empty rows)
  // Or better, just keep clicking +

  const handleUpdateRule = (id: string, field: keyof UnitRule, value: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const handleSave = () => {
    if (!selectedBuildingId) return;
    onSave(selectedBuildingId, rules);
    alert('戶別設定已更新並重新生成格局！');
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">綁定棟別選項</label>
        <select 
          className="border border-[var(--color-border)] p-2 w-full max-w-xs rounded bg-[var(--bg-tertiary)] text-[var(--text-normal)]"
          value={selectedBuildingId}
          onChange={e => setSelectedBuildingId(e.target.value)}
        >
          {buildings.map(b => (
            <option key={b.id} value={b.id}>{b.name} ({b.buildingCode})</option>
          ))}
        </select>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          共 {rules.length} 個戶別設定
        </p>
      </div>

      <div className="overflow-x-auto border border-[var(--color-border)] rounded-lg">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider w-16">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">戶號 (顯示)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">代號 (識別)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider w-20">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)] bg-[var(--bg-tertiary)]">
            {rules.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[var(--text-muted)] text-sm">
                  尚無戶別設定，請點擊「+ 新增一行」開始新增
                </td>
              </tr>
            )}
            {rules.map((rule, index) => (
              <tr key={rule.id} className="hover:bg-[var(--bg-hover)]">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--text-muted)]">
                  {index + 1}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                   <input 
                      className="border border-[var(--color-border)] p-2 rounded w-full bg-[var(--bg-primary)] text-[var(--text-normal)] focus:ring-2 focus:ring-[#5a7fd6] focus:border-[#5a7fd6]"
                      value={rule.unitNumber}
                      onChange={e => handleUpdateRule(rule.id, 'unitNumber', e.target.value)}
                      placeholder="如: 1, 01"
                   />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                   <input 
                      className="border border-[var(--color-border)] p-2 rounded w-full bg-[var(--bg-primary)] text-[var(--text-normal)] focus:ring-2 focus:ring-[#5a7fd6] focus:border-[#5a7fd6]"
                      value={rule.code}
                      onChange={e => handleUpdateRule(rule.id, 'code', e.target.value)}
                      placeholder="如: A, B"
                   />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button 
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                    onClick={() => handleDeleteRule(rule.id)}
                    title="刪除此行"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <Button onClick={handleAddRule} variant="secondary" size="small" className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          新增一行
        </Button>
        <Button onClick={handleSave} variant="primary" size="small">
          確定新增
        </Button>
        {rules.length > 0 && (
          <span className="text-sm text-[var(--text-muted)] ml-auto">
            提示: 戶別將依照設定自動排入各居住樓層
          </span>
        )}
      </div>
    </Card>
  );
};

const BuildingFloorConfig: React.FC = () => {
  const dispatch = useAppDispatch();
  const { buildings, floors, units, selectedBuildingId, loading } = useAppSelector(state => state.building);
  
  const [showParkingConfig, setShowParkingConfig] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'building' | 'unit'>('building');

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

  const handleSaveUnitRules = (buildingId: string, rules: UnitRule[]) => {
      dispatch(updateBuildingWithRegeneration({ 
          id: buildingId, 
          updates: { unitRules: rules, unitsPerFloor: rules.length > 0 ? rules.length : 4 } // Auto update unitsPerFloor count
      }));
      // Also update selected building to preview immediately
      dispatch(setSelectedBuilding(buildingId));
  };

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
  
  return (
    <div className="building-floor-config p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-3xl font-bold text-[var(--text-normal)]">棟數樓層設定</h2>
        <div className="flex items-center gap-2">
          <IntroductionButton pageId="building" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-[var(--color-border)]">
        <button
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'building' ? 'border-[#5a7fd6] text-[#5a7fd6]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-normal)]'}`}
          onClick={() => setActiveTab('building')}
        >
          棟數設定
        </button>
        <button
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${activeTab === 'unit' ? 'border-[#5a7fd6] text-[#5a7fd6]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-normal)]'}`}
          onClick={() => setActiveTab('unit')}
        >
          戶別設定
        </button>
      </div>

      {/* Tab Content */}
      <div className="mb-8">
        {activeTab === 'building' ? (
          <Section title="棟數設定">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buildings.map(building => (
                <div key={building.id} onClick={() => dispatch(setSelectedBuilding(building.id))} className={`cursor-pointer transform transition-all duration-200 ${selectedBuildingId === building.id ? 'ring-2 ring-[#5a7fd6] rounded-lg scale-[1.02]' : 'hover:scale-[1.01]'}`}>
                    <BuildingEditCard
                        building={building}
                        floors={floors}
                        units={units}
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
        ) : (
          <Section title="戶別設定">
             <UnitRuleEditor buildings={buildings} onSave={handleSaveUnitRules} />
          </Section>
        )}
      </div>

      {selectedBuilding && (
        <div className="space-y-8 animate-fade-in">
           {/* Removed Title as requested */}
           <div className="section mb-6">
              <UnitLayoutManager buildingId={selectedBuilding.id} />
           </div>
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
