import React, { useState, useEffect } from 'react'
import { Building } from '@/types/domain'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setBuildings,
  addBuilding,
  updateBuilding,
  deleteBuilding,
  setSelectedBuilding,
  setLoading
} from '@/store/modules/building'
import FloorManager from './FloorManager'
import UnitLayoutManager from './UnitLayoutManager'
import ColorConfigPanel from './ColorConfigPanel'

const BuildingFloorConfig: React.FC = () => {
  const dispatch = useAppDispatch()
  const { buildings, selectedBuilding, loading } = useAppSelector(state => state.building)
  const [showFloorManager, setShowFloorManager] = useState(false)
  const [showUnitLayout, setShowUnitLayout] = useState(false)
  const [showColorConfig, setShowColorConfig] = useState(false)

  useEffect(() => {
    // 模擬載入建築資料
    dispatch(setLoading(true))
    // 實際應用中會從API載入
    setTimeout(() => {
      const mockBuildings: Building[] = [
        {
          id: 'b1',
          buildingCode: 'A',
          name: '第一棟',
          address: '',
          totalFloors: 12,
          totalUnits: 48,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'b2',
          buildingCode: 'B',
          name: '第二棟',
          address: '',
          totalFloors: 10,
          totalUnits: 40,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      dispatch(setBuildings(mockBuildings))
      dispatch(setSelectedBuilding(mockBuildings[0]?.id || null))
    }, 1000)
  }, [dispatch])

  const handleAddBuilding = () => {
    const newBuilding: Building = {
      id: `b${Date.now()}`,
      buildingCode: `棟${buildings.length + 1}`,
      name: `新建棟${buildings.length + 1}`,
      address: '',
      totalFloors: 0,
      totalUnits: 0,
      sortOrder: buildings.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    dispatch(addBuilding(newBuilding))
  }

  const handleSelectBuilding = (buildingId: string) => {
    dispatch(setSelectedBuilding(buildingId))
  }

  const selectedBuildingData = buildings.find(b => b.id === selectedBuilding)

  return (
    <div className="building-floor-config">
      <div className="config-header">
        <h2>棟數樓層設定</h2>
        <div className="action-buttons">
          <button onClick={handleAddBuilding} className="btn-primary">
            + 新增棟別
          </button>
          <button
            onClick={() => setShowColorConfig(true)}
            className="btn-secondary"
          >
            🎨 顏色設定
          </button>
        </div>
      </div>

      <div className="building-selector">
        <h3>選擇棟別</h3>
        <div className="building-tabs">
          {buildings.map(building => (
            <button
              key={building.id}
              onClick={() => handleSelectBuilding(building.id)}
              className={`building-tab ${selectedBuilding === building.id ? 'active' : ''}`}
            >
              <div className="building-info">
                <h4>{building.name}</h4>
                <p>({building.buildingCode})</p>
                <div className="building-stats">
                  <span>樓層: {building.totalFloors}</span>
                  <span>戶數: {building.totalUnits}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedBuildingData && (
        <div className="building-actions">
          <div className="action-sections">
            <button
              onClick={() => setShowFloorManager(true)}
              className="action-btn"
            >
              🏠 樓層管理
            </button>
            <button
              onClick={() => setShowUnitLayout(true)}
              className="action-btn"
            >
              🏷️ 戶別格局
            </button>
          </div>
        </div>
      )}

      {/* 模態視窗 */}
      {showFloorManager && (
        <FloorManager
          buildingId={selectedBuilding!}
          onClose={() => setShowFloorManager(false)}
        />
      )}

      {showUnitLayout && (
        <UnitLayoutManager
          buildingId={selectedBuilding!}
          onClose={() => setShowUnitLayout(false)}
        />
      )}

      {showColorConfig && (
        <ColorConfigPanel
          onClose={() => setShowColorConfig(false)}
        />
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  )
}

export default BuildingFloorConfig