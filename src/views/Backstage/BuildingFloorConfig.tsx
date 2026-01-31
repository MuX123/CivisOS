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
import FloorManager from './FloorManager';
import UnitLayoutManager from './UnitLayoutManager';
import ColorConfigPanel from './ColorConfigPanel';
import ParkingConfig from './ParkingConfig';

// Helper component for sections
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="section mb-6">
    <h3 className="text-lg font-bold mb-4">{title}</h3>
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

  const handleBlur = () => {
    // Save on blur or implement a save button. 
    // For better UX, let's use a save button or save on specific trigger.
    // But requirement says "Edit form", so maybe inputs.
    // I will trigger onSave when values change and valid, or provide a save button.
    // For simplicity, I'll provide a local "Save" button in the card if changed.
  };
  
  const hasChanges = 
    formData.buildingCode !== building.buildingCode ||
    formData.name !== building.name ||
    formData.roofFloors !== building.roofFloors ||
    formData.residentialFloors !== building.residentialFloors ||
    formData.basementFloors !== building.basementFloors ||
    formData.unitsPerFloor !== building.unitsPerFloor;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>{building.name} ({building.buildingCode})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label>代號</label>
            <input 
              className="border p-1 w-full"
              value={formData.buildingCode}
              onChange={e => handleChange('buildingCode', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>名稱</label>
            <input 
              className="border p-1 w-full"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>R樓層數</label>
            <input 
              type="number"
              className="border p-1 w-full"
              value={formData.roofFloors}
              onChange={e => handleChange('roofFloors', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>居住層數</label>
            <input 
              type="number"
              className="border p-1 w-full"
              value={formData.residentialFloors}
              onChange={e => handleChange('residentialFloors', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>地下室層數</label>
            <input 
              type="number"
              className="border p-1 w-full"
              value={formData.basementFloors}
              onChange={e => handleChange('basementFloors', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>每層戶數</label>
            <input 
              type="number"
              className="border p-1 w-full"
              value={formData.unitsPerFloor}
              onChange={e => handleChange('unitsPerFloor', Number(e.target.value))}
            />
          </div>
        </div>
        
        <div className="stats mt-4 text-sm text-gray-600">
          <p>總樓層: {building.totalFloors} | 總戶數: {building.totalUnits}</p>
        </div>

        <div className="actions mt-4 flex gap-2">
          {hasChanges && (
            <button 
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={() => onSave(formData)}
            >
              更新並重算
            </button>
          )}
          <button 
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={onDelete}
          >
            刪除
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

const BuildingFloorConfig: React.FC = () => {
  const dispatch = useAppDispatch();
  const { buildings, floors, selectedBuildingId, loading } = useAppSelector(state => state.building);
  
  const [showColorConfig, setShowColorConfig] = useState(false);
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
    <div className="building-floor-config p-6">
      <div className="header flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">棟數樓層設定</h2>
        <div className="buttons space-x-2">
          <button onClick={() => setShowColorConfig(true)} className="bg-purple-600 text-white px-4 py-2 rounded">
            🎨 顏色設定
          </button>
        </div>
      </div>

      {/* 區塊 1: 棟數設定 */}
      <Section title="棟數設定">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildings.map(building => (
            <div key={building.id} onClick={() => dispatch(setSelectedBuilding(building.id))} className={`cursor-pointer ${selectedBuildingId === building.id ? 'ring-2 ring-blue-500' : ''}`}>
              <BuildingEditCard
                building={building}
                onSave={(updates) => handleEditBuilding(building.id, updates)}
                onDelete={() => handleDeleteBuilding(building.id)}
              />
            </div>
          ))}
          <div className="add-card flex items-center justify-center border-2 border-dashed border-gray-300 rounded p-8 cursor-pointer hover:bg-gray-50" onClick={handleAddBuilding}>
            <span className="text-xl">+ 新增棟別</span>
          </div>
        </div>
      </Section>

      {selectedBuilding && (
        <>
          {/* 區塊 2: R樓設定 */}
          <Section title="R樓設定">
            <div className="bg-white p-4 rounded shadow">
              <p className="mb-2 text-sm text-gray-500">此處顯示自動生成的 R樓。若需調整數量，請修改棟別設定。</p>
              <div className="flex flex-wrap gap-2">
                {roofFloorsList.map(floor => (
                  <span key={floor.id} className="bg-purple-100 text-purple-800 px-3 py-1 rounded">
                    {floor.name}
                  </span>
                ))}
              </div>
            </div>
          </Section>

          {/* 區塊 3: 地下室設定 */}
          <Section title="地下室設定">
             <div className="bg-white p-4 rounded shadow">
              <div className="flex justify-between mb-2">
                <p className="text-sm text-gray-500">此處顯示自動生成的地下室。若需調整數量，請修改棟別設定。</p>
                <button 
                  onClick={() => setShowParkingConfig(true)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  管理車位配置 &gt;
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {basementFloorsList.map(floor => (
                  <span key={floor.id} className="bg-gray-100 text-gray-800 px-3 py-1 rounded">
                    {floor.name}
                  </span>
                ))}
              </div>
            </div>
          </Section>

           {/* 區塊: 戶別預覽 (UnitLayoutManager) */}
           <Section title="戶別格局預覽">
              <UnitLayoutManager buildingId={selectedBuilding.id} />
           </Section>
        </>
      )}

      {showColorConfig && (
        <ColorConfigPanel onClose={() => setShowColorConfig(false)} />
      )}

      {showParkingConfig && selectedBuilding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/4 max-h-[90vh] overflow-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">車位配置 - {selectedBuilding.name}</h3>
              <button onClick={() => setShowParkingConfig(false)} className="text-gray-500">✕</button>
            </div>
            <ParkingConfig buildingId={selectedBuilding.id} />
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default BuildingFloorConfig;
