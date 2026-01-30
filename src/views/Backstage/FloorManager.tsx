import React, { useState, useEffect } from 'react'
import { Floor } from '@/types/domain'
import { useAppDispatch } from '@/store/hooks'
import { floorActions } from '@/store/modules/floor'

interface FloorManagerProps {
  buildingId: string
  onClose: () => void
}

const FloorManager: React.FC<FloorManagerProps> = ({ buildingId, onClose }) => {
  const dispatch = useAppDispatch()
  const [floors, setFloors] = useState<Floor[]>([])
  const [loading, setLoading] = useState(false)
  const [newFloor, setNewFloor] = useState({
    floorNumber: '',
    floorType: 'residential' as 'roof' | 'residential' | 'basement',
    sortOrder: 0,
  })

  useEffect(() => {
    // 載入該棟的樓層資料
    loadFloors()
  }, [buildingId])

  const loadFloors = async () => {
    setLoading(true)
    // 實際應用中會從API載入
    setTimeout(() => {
      const mockFloors: Floor[] = [
        {
          id: `${buildingId}_r1`,
          buildingId,
          floorNumber: 'R1',
          name: '頂樓1',
          floorType: 'roof',
          totalUnits: 0,
          sortOrder: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `${buildingId}_f1`,
          buildingId,
          floorNumber: '1F',
          name: '1樓',
          floorType: 'residential',
          totalUnits: 10,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `${buildingId}_f2`,
          buildingId,
          floorNumber: '2F',
          name: '2樓',
          floorType: 'residential',
          totalUnits: 10,
          sortOrder: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: `${buildingId}_b1`,
          buildingId,
          floorNumber: 'B1',
          name: '地下1樓',
          floorType: 'basement',
          totalUnits: 5,
          sortOrder: -1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      setFloors(mockFloors)
      setLoading(false)
    }, 500)
  }

  const handleAddFloor = () => {
    if (!newFloor.floorNumber) return

    const floor: Floor = {
      id: `${buildingId}_${newFloor.floorType}_${newFloor.floorNumber}`,
      buildingId,
      floorNumber: newFloor.floorNumber,
      name: `${newFloor.floorNumber}層`,
      floorType: newFloor.floorType,
      totalUnits: 0,
      sortOrder: floors.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    dispatch(floorActions.addFloor(floor))
    setNewFloor({
      floorNumber: '',
      floorType: 'residential',
      sortOrder: 0,
    })
  }

  const handleDeleteFloor = (floorId: string) => {
    dispatch(floorActions.deleteFloor(floorId))
  }

  const handleBatchAddFloors = (type: 'roof' | 'residential' | 'basement') => {
    const startFloor = type === 'roof' ? 1 : type === 'basement' ? -2 : 1
    const count = type === 'roof' ? 2 : type === 'basement' ? 3 : 5

    for (let i = 0; i < count; i++) {
      const floor: Floor = {
        id: `${buildingId}_${type}_${startFloor + i}`,
        buildingId,
        floorNumber: type === 'roof' ? `R${i + 1}` : type === 'basement' ? `B${Math.abs(startFloor + i)}` : `${startFloor + i}F`,
        name: type === 'roof' ? `頂樓${i + 1}` : type === 'basement' ? `地下${Math.abs(startFloor + i)}樓` : `${startFloor + i}樓`,
        floorType: type,
        totalUnits: type === 'residential' ? 10 : 0,
        sortOrder: floors.length + i + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      dispatch(floorActions.addFloor(floor))
    }
  }

  const getFloorsByType = (type: 'roof' | 'residential' | 'basement') => {
    return floors.filter(f => f.floorType === type).sort((a, b) => a.sortOrder - b.sortOrder)
  }

  return (
    <div className="floor-manager">
      <div className="modal-header">
        <h3>樓層管理器</h3>
        <button onClick={onClose} className="close-btn">
          ✕
        </button>
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}

      <div className="floor-types">
        {/* 屋頂層 */}
        <div className="floor-section">
          <h4>🏛️ 屋頂層</h4>
          <div className="floor-controls">
            <button
              onClick={() => handleBatchAddFloors('roof')}
              className="batch-add-btn"
            >
              ⚡ 批次新增屋頂層
            </button>
            <div className="floor-grid">
              {getFloorsByType('roof').map(floor => (
                <div key={floor.id} className="floor-card roof">
                  <span className="floor-number">{floor.floorNumber}</span>
                  <button
                    onClick={() => handleDeleteFloor(floor.id)}
                    className="delete-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 一般居住層 */}
        <div className="floor-section">
          <h4>🏠 一般居住層</h4>
          <div className="floor-controls">
            <button
              onClick={() => handleBatchAddFloors('residential')}
              className="batch-add-btn"
            >
              ⚡ 批次新增居住層
            </button>
            <div className="floor-grid">
              {getFloorsByType('residential').map(floor => (
                <div key={floor.id} className="floor-card residential">
                  <span className="floor-number">{floor.floorNumber}</span>
                  <button
                    onClick={() => handleDeleteFloor(floor.id)}
                    className="delete-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 地下室層 */}
        <div className="floor-section">
          <h4>🅿️ 地下室層</h4>
          <div className="floor-controls">
            <button
              onClick={() => handleBatchAddFloors('basement')}
              className="batch-add-btn"
            >
              ⚡ 批次新增地下層
            </button>
            <div className="floor-grid">
              {getFloorsByType('basement').map(floor => (
                <div key={floor.id} className="floor-card basement">
                  <span className="floor-number">{floor.floorNumber}</span>
                  <button
                    onClick={() => handleDeleteFloor(floor.id)}
                    className="delete-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="add-single-floor">
        <h4>新增單一樓層</h4>
        <div className="form-group">
          <input
            type="text"
            placeholder="樓層號碼 (如: 1F, 2F, B1)"
            value={newFloor.floorNumber}
            onChange={(e) => setNewFloor({ ...newFloor, floorNumber: e.target.value })}
            className="floor-input"
          />
          <select
            value={newFloor.floorType}
            onChange={(e) => setNewFloor({ ...newFloor, floorType: e.target.value as any })}
            className="floor-type-select"
          >
            <option value="residential">居住層</option>
            <option value="roof">屋頂層</option>
            <option value="basement">地下層</option>
          </select>
          <button onClick={handleAddFloor} className="add-btn">
            + 新增樓層
          </button>
        </div>
      </div>
    </div>
  )
}

export default FloorManager