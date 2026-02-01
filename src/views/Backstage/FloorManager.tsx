import React, { useState } from 'react'
import { Floor } from '@/types/domain'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { floorActions } from '@/store/modules/floor'
import { addFloor, deleteFloor } from '@/store/modules/building'
import Button from '@/components/ui/Button'

// 樓層類型標籤 (Task 5 requirement)
type FloorType = 'roof' | 'residential' | 'basement'

const FloorTypeLabel: Record<FloorType, string> = {
  roof: 'R樓',
  residential: '居住層',
  basement: '地下室'
}

const FloorTypeColor: Record<FloorType, string> = {
  roof: '#8b5cf6',      // 紫色
  residential: '#5865F2', // 藍色
  basement: '#6b7280'     // 灰色
}

interface FloorManagerProps {
  buildingId: string
  onClose: () => void
}

const FloorManager: React.FC<FloorManagerProps> = ({ buildingId, onClose }) => {
  const dispatch = useAppDispatch()
  // Use store data instead of local state mock
  const floors = useAppSelector(state => state.building.floors.filter(f => f.buildingId === buildingId))
  
  const [newFloor, setNewFloor] = useState({
    floorNumber: '',
    floorType: 'residential' as FloorType,
    sortOrder: 0,
  })

  const handleAddFloor = () => {
    if (!newFloor.floorNumber) return

    const floor: Floor = {
      id: `${buildingId}_${newFloor.floorType}_${newFloor.floorNumber}_${Date.now()}`,
      buildingId,
      floorNumber: newFloor.floorNumber,
      name: `${newFloor.floorNumber}`,
      floorType: newFloor.floorType,
      totalUnits: newFloor.floorType === 'residential' ? 4 : 0, // Default to 4 or from config
      sortOrder: floors.length + 1, // Simple sort order
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    dispatch(addFloor(floor))
    setNewFloor({
      ...newFloor,
      floorNumber: '',
    })
  }

  const handleDeleteFloor = (floorId: string) => {
    if(confirm('確定要刪除此樓層嗎？關聯的戶別也會被刪除。')) {
       dispatch(deleteFloor(floorId))
    }
  }

  const getFloorsByType = (type: FloorType) => {
    // Sort logic: Roof desc, Residential asc (or desc), Basement desc (B1, B2)
    // Here relying on sortOrder if set correctly, or parsing number.
    return floors.filter(f => f.floorType === type).sort((a, b) => a.sortOrder - b.sortOrder)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-bold text-white">樓層管理</h3>
          <Button onClick={onClose} variant="secondary" size="small">
            ✕
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 屋頂層 */}
          <div className="floor-section bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h4 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              {FloorTypeLabel.roof}
            </h4>
            <div className="space-y-2">
              {getFloorsByType('roof').map(floor => (
                <div key={floor.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                  <span className="font-bold text-white">{floor.name}</span>
                  <button onClick={() => handleDeleteFloor(floor.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50">✕</button>
                </div>
              ))}
              {getFloorsByType('roof').length === 0 && <p className="text-white text-sm italic">無樓層</p>}
            </div>
          </div>

          {/* 一般居住層 */}
          <div className="floor-section bg-[#5865F2]/10 p-4 rounded-lg border border-[#5865F2]/30">
            <h4 className="font-bold text-[#5865F2] mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#5865F2]"></span>
              {FloorTypeLabel.residential}
            </h4>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {getFloorsByType('residential').map(floor => (
                <div key={floor.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center border-l-4 border-[#5865F2] hover:shadow-md transition-shadow">
                  <span className="font-bold text-white">{floor.name}</span>
                  <span className="text-xs text-white bg-gray-100 px-2 py-1 rounded">{floor.totalUnits} 戶</span>
                  <button onClick={() => handleDeleteFloor(floor.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50">✕</button>
                </div>
              ))}
               {getFloorsByType('residential').length === 0 && <p className="text-white text-sm italic">無樓層</p>}
            </div>
          </div>

          {/* 地下室層 */}
          <div className="floor-section bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              {FloorTypeLabel.basement}
            </h4>
            <div className="space-y-2">
              {getFloorsByType('basement').map(floor => (
                <div key={floor.id} className="bg-white p-3 rounded shadow-sm flex justify-between items-center border-l-4 border-gray-500 hover:shadow-md transition-shadow">
                  <span className="font-bold text-white">{floor.name}</span>
                  <button onClick={() => handleDeleteFloor(floor.id)} className="text-red-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50">✕</button>
                </div>
              ))}
               {getFloorsByType('basement').length === 0 && <p className="text-white text-sm italic">無樓層</p>}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <h4 className="font-bold mb-4 text-white">手動新增單一樓層</h4>
          <div className="flex gap-4">
            <select
              value={newFloor.floorType}
              onChange={(e) => setNewFloor({ ...newFloor, floorType: e.target.value as FloorType })}
              className="border p-2 rounded focus:ring-2 focus:ring-[#5865F2] focus:border-[#5865F2] bg-white"
            >
              <option value="residential">居住層</option>
              <option value="roof">R樓</option>
              <option value="basement">地下室</option>
            </select>
            <input
              type="text"
              placeholder="樓層名稱 (如: 13F)"
              value={newFloor.floorNumber}
              onChange={(e) => setNewFloor({ ...newFloor, floorNumber: e.target.value })}
              className="border p-2 rounded flex-1 focus:ring-2 focus:ring-[#5865F2] focus:border-[#5865F2]"
            />
            <Button 
                onClick={handleAddFloor} 
                variant="success"
            >
              + 新增
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloorManager