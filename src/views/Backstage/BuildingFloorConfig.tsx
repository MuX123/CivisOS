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
}> = ({ building, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    buildingCode: building.buildingCode,
    name: building.name,
    roofFloors: building.roofFloors,
    residentialFloors: building.residentialFloors,
    basementFloors: building.basementFloors,
    unitsPerFloor: building.unitsPerFloor
  });

  const handleChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field !== 'buildingCode' && field !== 'name' ? Number(value) : value
    }));
  };

  const hasChanges = 
    formData.buildingCode !== building.buildingCode ||
    formData.name !== building.name ||
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
            <label className="block text-sm font-medium text-gray-700 mb-1">代號</label>
            <input 
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.buildingCode}
              onChange={e => handleChange('buildingCode', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">名稱</label>
            <input 
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">R樓層數</label>
            <input 
              type="number"
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.roofFloors}
              onChange={e => handleChange('roofFloors', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">居住層數</label>
            <input 
              type="number"
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.residentialFloors}
              onChange={e => handleChange('residentialFloors', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">地下室層數</label>
            <input 
              type="number"
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.basementFloors}
              onChange={e => handleChange('basementFloors', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-1">每層戶數</label>
            <input 
              type="number"
              className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.unitsPerFloor}
              onChange={e => handleChange('unitsPerFloor', Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="stats mt-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <p>總樓層: {building.totalFloors} | 總戶數: {building.totalUnits}</p>
        </div>

        <div className="actions mt-4 flex gap-2 justify-end">
          {hasChanges && (
            <Button 
              variant="primary"
              size="small"
              onClick={() => onSave(formData)}
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
  
  const [showParkingConfig, setShowParkingConfig] = useState(false);

  // Initial load simulation (or just use what's in store)
  useEffect(() => {
    // If empty, maybe add one? Or wait for user.
  }, []);

  const handleAddBuilding = () => {
    const newBuildingData = {
      buildingCode: `A`,
      name: `新建棟別`,
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

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
  
  // Filter floors for lists
  const roofFloorsList = floors.filter(f => f.buildingId === selectedBuildingId && f.floorType === 'roof');
  const basementFloorsList = floors.filter(f => f.buildingId === selectedBuildingId && f.floorType === 'basement');

  return (
    <div className="building-floor-config p-6 max-w-7xl mx-auto">
      <div className="header flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-normal)]">棟數樓層設定</h2>

      </div>

      {/* 區塊 1: 棟數設定 */}
      <Section title="棟數設定">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buildings.map(building => (
            <div key={building.id} onClick={() => dispatch(setSelectedBuilding(building.id))} className={`cursor-pointer transform transition-all duration-200 ${selectedBuildingId === building.id ? 'ring-2 ring-blue-500 rounded-lg scale-[1.02]' : 'hover:scale-[1.01]'}`}>
              <BuildingEditCard
                building={building}
                onSave={(updates) => handleEditBuilding(building.id, updates)}
                onDelete={() => handleDeleteBuilding(building.id)}
              />
            </div>
          ))}
          <div className="add-card flex flex-col items-center justify-center border-2 border-dashed border-[var(--color-border)] rounded-lg p-8 cursor-pointer hover:bg-[var(--bg-hover)] hover:border-[var(--brand-experiment)] transition-colors h-full min-h-[300px]" onClick={handleAddBuilding}>
            <div className="w-16 h-16 bg-[var(--brand-experiment)] bg-opacity-20 rounded-full flex items-center justify-center mb-4 text-[var(--brand-experiment)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xl font-medium text-[var(--text-muted)]">+ 新增棟別</span>
          </div>
        </div>
      </Section>

      {selectedBuilding && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 區塊 2: R樓設定 */}
            <Section title="R樓設定">
              <Card>
                <CardContent>
                  <p className="mb-4 text-sm text-[var(--text-muted)] flex items-center">
                    <span className="mr-2">ℹ️</span> 此處顯示自動生成的 R樓。若需調整數量，請修改棟別設定。
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {roofFloorsList.map(floor => (
                      <span key={floor.id} className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-md font-medium shadow-sm">
                        {floor.name}
                      </span>
                    ))}
                    {roofFloorsList.length === 0 && <span className="text-[var(--text-muted)] italic">無 R樓層</span>}
                  </div>
                </CardContent>
              </Card>
            </Section>

            {/* 區塊 3: 地下室設定 */}
            <Section title="地下室設定">
               <Card>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-[var(--text-muted)] flex items-center">
                      <span className="mr-2">ℹ️</span> 此處顯示自動生成的地下室。
                    </p>
                    <Button 
                      variant="secondary"
                      size="small"
                      onClick={() => setShowParkingConfig(true)}
                    >
                      管理車位配置 &gt;
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {basementFloorsList.map(floor => (
                      <span key={floor.id} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md font-medium shadow-sm border border-[var(--color-border)]">
                        {floor.name}
                      </span>
                    ))}
                    {basementFloorsList.length === 0 && <span className="text-[var(--text-muted)] italic">無地下樓層</span>}
                  </div>
                </CardContent>
              </Card>
            </Section>
          </div>

           {/* 區塊: 戶別預覽 (UnitLayoutManager) */}
           <Section title="戶別格局預覽">
              <UnitLayoutManager buildingId={selectedBuilding.id} />
           </Section>
        </div>
      )}

      {showParkingConfig && selectedBuilding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-11/12 max-w-5xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-800">車位配置 - {selectedBuilding.name}</h3>
              <button onClick={() => setShowParkingConfig(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ParkingConfig buildingId={selectedBuilding.id} />
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default BuildingFloorConfig;
