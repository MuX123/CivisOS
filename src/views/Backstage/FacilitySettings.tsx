import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { facilityActions } from '../../store/modules/facility';
import { Facility } from '../../types/domain';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '@/components/ui/Button';

// ==================== 後台公設設定頁面 ====================

const FacilitySettings: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const buildings = useAppSelector(state => state.building.buildings);
  const facilities = useAppSelector(state => state.facility.facilities);
  
  // State
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id || '');
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    type: 'recreation' | 'fitness' | 'meeting' | 'study' | 'other';
    capacity: number;
    location: string;
    description: string;
    buildingId: string;
    operatingHours: { start: string; end: string };
    status: 'available' | 'occupied' | 'maintenance' | 'unavailable';
  }>({
    name: '',
    type: 'recreation',
    capacity: 10,
    location: '',
    description: '',
    buildingId: '',
    operatingHours: { start: '09:00', end: '22:00' },
    status: 'available'
  });
  
  // Filter facilities by selected building
  const filteredFacilities = facilities.filter(f => 
    !selectedBuildingId || f.buildingId === selectedBuildingId || !f.buildingId
  );
  
  const handleOpenModal = (facility?: Facility) => {
    if (facility) {
      setEditingFacility(facility);
      setFormData({
        name: facility.name || '',
        type: facility.type || 'recreation',
        capacity: facility.capacity || 10,
        location: facility.location || '',
        description: facility.description || '',
        buildingId: facility.buildingId || selectedBuildingId,
        operatingHours: facility.operatingHours || { start: '09:00', end: '22:00' },
        status: facility.status || 'available'
      });
    } else {
      setEditingFacility(null);
      setFormData({
        name: '',
        type: 'recreation',
        capacity: 10,
        location: '',
        description: '',
        buildingId: selectedBuildingId,
        operatingHours: { start: '09:00', end: '22:00' },
        status: 'available'
      });
    }
    setShowModal(true);
  };
  
  const handleSave = () => {
    if (!formData.name) {
      alert('請輸入公設名稱');
      return;
    }
    
    if (editingFacility) {
      dispatch(facilityActions.updateFacility({
        id: editingFacility.id,
        updates: formData
      }));
    } else {
      const newFacility: Facility = {
        id: `facility-${Date.now()}`,
        name: formData.name || '',
        type: formData.type || 'recreation',
        capacity: formData.capacity || 10,
        description: formData.description || '',
        location: formData.location || '',
        buildingId: formData.buildingId || selectedBuildingId,
        operatingHours: formData.operatingHours || { start: '09:00', end: '22:00' },
        status: formData.status || 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dispatch(facilityActions.addFacility(newFacility));
    }
    setShowModal(false);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此公設嗎？')) {
      dispatch(facilityActions.deleteFacility(id));
    }
  };
  
  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      'recreation': '休閒娛樂',
      'fitness': '健身運動',
      'meeting': '會議空間',
      'other': '其他'
    };
    return map[type] || type;
  };
  
  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);
  
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-[var(--text-normal)] mb-6">公設設定</h2>
      
      {/* Building Selection */}
      <div className="mb-6">
        <label className="block text-sm text-[var(--text-muted)] mb-2">選擇棟別</label>
        <div className="flex gap-2 flex-wrap">
          {buildings.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBuildingId(b.id)}
              className={`px-4 py-2 rounded-md ${
                selectedBuildingId === b.id
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-normal)] border border-[var(--color-border)]'
              }`}
            >
              {b.buildingCode}棟
            </button>
          ))}
        </div>
      </div>
      
      {/* Facilities List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {selectedBuilding ? `${selectedBuilding.buildingCode}棟 公設列表` : '公設列表'}
            </CardTitle>
            <Button variant="primary" size="small" onClick={() => handleOpenModal()}>
              + 新增公設
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFacilities.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]">
              尚未設定任何公設，請點擊「新增公設」按鈕添加
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFacilities.map(facility => (
                <div
                  key={facility.id}
                  className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--bg-card)] hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-[var(--text-normal)]">{facility.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      facility.status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {facility.status === 'available' ? '啟用中' : '停用'}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text-muted)] space-y-1">
                    <div>類型: {getTypeLabel(facility.type)}</div>
                    <div>容納人數: {facility.capacity} 人</div>
                    <div>位置: {facility.location || '未設定'}</div>
                    <div>營業時間: {facility.operatingHours?.start} - {facility.operatingHours?.end}</div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="small" onClick={() => handleOpenModal(facility)}>
                      編輯
                    </Button>
                    <Button size="small" variant="danger" onClick={() => handleDelete(facility.id)}>
                      刪除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-[var(--text-normal)] mb-4">
              {editingFacility ? '編輯公設' : '新增公設'}
            </h3>
            
            <div className="space-y-4">
              {/* Building Selection for New Facility */}
              {!editingFacility && (
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">所屬棟別</label>
                  <select
                    className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                    value={formData.buildingId || selectedBuildingId}
                    onChange={e => setFormData({...formData, buildingId: e.target.value})}
                  >
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.buildingCode}棟</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Facility Name */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">公設名稱 *</label>
                <input
                  className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                  value={formData.name || ''}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="例如: 游泳池、健身房"
                />
              </div>
              
              {/* Type */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">公設類型</label>
                <select
                  className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="recreation">休閒娛樂</option>
                  <option value="fitness">健身運動</option>
                  <option value="meeting">會議空間</option>
                  <option value="other">其他</option>
                </select>
              </div>
              
              {/* Capacity */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">容納人數</label>
                <input
                  type="number"
                  className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                  value={formData.capacity || 10}
                  onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                />
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">所在位置</label>
                <input
                  className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                  value={formData.location || ''}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="例如: 一樓、地下室"
                />
              </div>
              
              {/* Operating Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">開始時間</label>
                  <div className="relative">
                    <input
                      type="time"
                      className="w-full border p-2 pr-10 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                      value={formData.operatingHours?.start || '09:00'}
                      onChange={e => setFormData({
                        ...formData, 
                        operatingHours: {...formData.operatingHours, start: e.target.value}
                      })}
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-1">結束時間</label>
                  <div className="relative">
                    <input
                      type="time"
                      className="w-full border p-2 pr-10 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                      value={formData.operatingHours?.end || '22:00'}
                      onChange={e => setFormData({
                        ...formData, 
                        operatingHours: {...formData.operatingHours, end: e.target.value}
                      })}
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">說明</label>
                <textarea
                  className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="公設相關說明..."
                />
              </div>
              
              {/* Status */}
              <div>
                <label className="block text-sm text-[var(--text-muted)] mb-1">狀態</label>
                <select
                  className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="available">啟用</option>
                  <option value="maintenance">停用</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                取消
              </Button>
              <Button variant="primary" onClick={handleSave}>
                儲存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilitySettings;
