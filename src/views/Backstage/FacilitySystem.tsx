import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { facilityActions } from '../../store/modules/facility';
import { FacilityBookingV2, Facility } from '../../types/domain';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '@/components/ui/Button';

// Mock Component since I cannot find the original FacilityBooking.tsx to modify
// I am creating this as the new "Facility System" page.

const FacilitySystem: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const buildings = useAppSelector(state => state.building.buildings);
  const bookings = useAppSelector(state => state.facility.bookings);
  const facilities = useAppSelector(state => state.facility.facilities);
  const units = useAppSelector(state => state.building.units); // To pick units
  const floors = useAppSelector(state => state.building.floors);
  
  // State
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(buildings[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'cancelled' | 'deleted'>('current');
  const [showModal, setShowModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<FacilityBookingV2 | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<FacilityBookingV2>>({
      bookingType: 'resident',
      paymentStatus: 'unpaid',
      bookingStatus: 'confirmed'
  });

  // Filter Logic
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
        // 1. Filter by Building (if resident booking)
        // If 'other', maybe show in all or specific tab?
        // User said: "Default major tab: Building as block".
        // If bookingType is 'resident', check residentBuildingId.
        // If 'other', maybe assign to 'Public' or show if buildingId matches 'All'? 
        // For now, if resident, strict match. If other, maybe show in first building or separate tab?
        // Let's assume 'Other' bookings don't belong to a building, but the UI is strictly segmented by building tabs.
        // Or maybe 'Other' is just not filtered by building?
        // Let's filter: if resident, match building. If other, show everywhere? No that's clutter.
        // Let's Assume "Other" bookings might not have buildingId, but maybe we should force selecting one?
        // User requirement: "Rent Resident: Set Building... Rent Other: Name..."
        // If "Other", it doesn't have a building.
        // Perhaps add an "External/Other" tab to Building list?
        
        const matchesBuilding = b.bookingType === 'resident' 
            ? b.residentBuildingId === selectedBuildingId 
            : true; // TODO: Decide where to show 'Other'. For now show in all or add "Non-resident" tab.

        if (b.bookingType === 'resident' && b.residentBuildingId !== selectedBuildingId) return false;
        
        // 2. Filter by Status Tab
        // 1. Current (現在): Status confirmed & Unpaid? Or just future date? 
        // User: "Current: Current booking list". "Past: When Paid button pressed".
        // This implies "Paid" bookings go to "Past".
        // "Cancel: When Cancel button pressed".
        // "Delete: When Delete button pressed".
        
        if (activeTab === 'deleted') return b.bookingStatus === 'deleted';
        if (activeTab === 'cancelled') return b.bookingStatus === 'cancelled';
        
        // Past vs Current logic based on User Input "When Paid -> Past"
        if (b.paymentStatus === 'paid') return activeTab === 'past';
        
        // If not paid, and confirmed -> Current
        if (b.bookingStatus === 'confirmed' && b.paymentStatus === 'unpaid') return activeTab === 'current';

        return false;
    });
  }, [bookings, selectedBuildingId, activeTab]);

  const handleOpenModal = (booking?: FacilityBookingV2) => {
      if (booking) {
          setEditingBooking(booking);
          setFormData(booking);
      } else {
          setEditingBooking(null);
          setFormData({
              id: `${Date.now()}`,
              bookingType: 'resident',
              paymentStatus: 'unpaid',
              bookingStatus: 'confirmed',
              bookingDate: new Date().toISOString().split('T')[0],
              startTime: '09:00',
              endTime: '10:00',
              residentBuildingId: selectedBuildingId
          });
      }
      setShowModal(true);
  };

  const handleSave = () => {
      // Validate
      if (!formData.facilityId || !formData.bookingDate) {
          alert('請填寫完整資料');
          return;
      }
      
      const newBooking = formData as FacilityBookingV2;
      
      if (editingBooking) {
          dispatch(facilityActions.updateBooking({ id: editingBooking.id, updates: newBooking }));
      } else {
          dispatch(facilityActions.createBooking(newBooking));
      }
      setShowModal(false);
  };

  const handlePay = (id: string) => {
      dispatch(facilityActions.setPaymentStatus({ id, status: 'paid' }));
  };

  const handleCancel = (id: string) => {
      if(confirm('確定取消此預約？')) {
          dispatch(facilityActions.cancelBooking(id));
      }
  };

  const handleDelete = (id: string) => {
      if(confirm('確定刪除此預約？(將移至刪除區)')) {
          dispatch(facilityActions.softDeleteBooking(id));
      }
  };

  const selectedBuilding = buildings.find(b => b.id === selectedBuildingId);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-[var(--text-normal)] mb-6">公設系統 - {selectedBuildingId === 'other' ? '外部/其他' : selectedBuilding?.name || ''}</h2>
      
      {/* Building Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--color-border)] overflow-x-auto">
          {buildings.map(b => (
              <button
                  key={b.id}
                  onClick={() => setSelectedBuildingId(b.id)}
                  className={`px-4 py-2 whitespace-nowrap ${selectedBuildingId === b.id ? 'border-b-2 border-[#5a7fd6] text-[#5a7fd6] font-bold' : 'text-[var(--text-muted)]'}`}
              >
{b.buildingCode}棟
              </button>
          ))}
          <button
             onClick={() => setSelectedBuildingId('other')} // Virtual tab for 'Other'
             className={`px-4 py-2 whitespace-nowrap ${selectedBuildingId === 'other' ? 'border-b-2 border-[#5a7fd6] text-[#5a7fd6] font-bold' : 'text-[var(--text-muted)]'}`}
          >
              外部/其他
          </button>
      </div>

      {/* Sub Tabs (Status) */}
      <div className="flex gap-2 mb-4">
          {[
              { id: 'current', label: '現在 (未付款)' },
              { id: 'past', label: '過去 (已付款)' },
              { id: 'cancelled', label: '取消' },
              { id: 'deleted', label: '刪除' }
          ].map(tab => (
              <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1 rounded-full text-sm ${activeTab === tab.id ? 'bg-[#5a7fd6] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
              >
                  {tab.label}
              </button>
          ))}
          <div className="flex-grow"></div>
          <Button onClick={() => handleOpenModal()} variant="primary" size="small">+ 新增預約</Button>
      </div>

      {/* Booking List (Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map(booking => (
              <Card key={booking.id} className="relative hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg text-[var(--text-normal)]">
                              {facilities.find(f => f.id === booking.facilityId)?.name || '未知設施'}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-xs ${booking.paymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                              {booking.paymentStatus === 'paid' ? '已付款' : '未付款'}
                          </span>
                      </div>
                      
                      <div className="text-sm text-[var(--text-muted)]">
                          {booking.bookingType === 'resident' ? (
                              <p>住戶: {booking.residentName} ({buildings.find(b=>b.id===booking.residentBuildingId)?.name})</p>
                          ) : (
                              <p>租借人: {booking.otherName} (外部)</p>
                          )}
                          <p>日期: {typeof booking.bookingDate === 'string' ? booking.bookingDate : new Date(booking.bookingDate).toLocaleDateString()}</p>
                          <p>時間: {booking.startTime} - {booking.endTime}</p>
                          <p>經手人: {booking.staffName}</p>
                          {booking.notes && <p className="italic mt-1">備註: {booking.notes}</p>}
                      </div>
                      
                      {/* Actions */}
                      <div className="pt-2 flex gap-2 border-t border-[var(--color-border)] mt-2">
                          {activeTab === 'current' && (
                              <>
                                <Button size="small" variant="success" onClick={() => handlePay(booking.id)}>付款</Button>
                                <Button size="small" variant="secondary" onClick={() => handleOpenModal(booking)}>編輯</Button>
                                <Button size="small" variant="warning" onClick={() => handleCancel(booking.id)}>取消</Button>
                              </>
                          )}
                          {(activeTab === 'current' || activeTab === 'cancelled' || activeTab === 'past') && (
                                <Button size="small" variant="danger" onClick={() => handleDelete(booking.id)}>刪除</Button>
                          )}
                      </div>
                  </CardContent>
              </Card>
          ))}
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-[var(--bg-floating)] p-6 rounded-xl w-full max-w-lg shadow-2xl border border-[var(--color-border)]">
                  <h3 className="text-xl font-bold mb-4 text-[var(--text-normal)]">{editingBooking ? '編輯預約' : '新增預約'}</h3>
                  
                  <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                      {/* Type Selection */}
                      <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-[var(--text-normal)]">
                              <input 
                                  type="radio" 
                                  checked={formData.bookingType === 'resident'} 
                                  onChange={() => setFormData({...formData, bookingType: 'resident'})}
                              />
                              住戶
                          </label>
                          <label className="flex items-center gap-2 text-[var(--text-normal)]">
                              <input 
                                  type="radio" 
                                  checked={formData.bookingType === 'other'} 
                                  onChange={() => setFormData({...formData, bookingType: 'other'})}
                              />
                              其他
                          </label>
                      </div>

                      {/* Dynamic Fields */}
                      {formData.bookingType === 'resident' ? (
                          <div className="grid grid-cols-2 gap-4">
                               <div className="col-span-2">
                                   <label className="block text-sm text-[var(--text-muted)]">棟別</label>
                                   <select 
                                      className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                      value={formData.residentBuildingId}
                                      onChange={e => setFormData({...formData, residentBuildingId: e.target.value})}
                                   >
                                       {buildings.map(b => <option key={b.id} value={b.id}>{b.buildingCode}棟</option>)}
                                   </select>
                               </div>
                               {/* Floor/Unit would require filtered lists based on building, simplifying for brevity */}
                               <div className="col-span-2">
                                   <label className="block text-sm text-[var(--text-muted)]">姓名</label>
                                   <input 
                                      className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                      value={formData.residentName || ''}
                                      onChange={e => setFormData({...formData, residentName: e.target.value})}
                                      placeholder="輸入住戶姓名"
                                   />
                               </div>
                          </div>
                      ) : (
                           <div>
                               <label className="block text-sm text-[var(--text-muted)]">姓名</label>
                               <input 
                                  className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                  value={formData.otherName || ''}
                                  onChange={e => setFormData({...formData, otherName: e.target.value})}
                                  placeholder="輸入租借人姓名"
                               />
                           </div>
                      )}

                      <div>
                           <label className="block text-sm text-[var(--text-muted)]">設施</label>
                           <select 
                              className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                              value={formData.facilityId}
                              onChange={e => setFormData({...formData, facilityId: e.target.value})}
                           >
                               <option value="">請選擇設施</option>
                               {facilities.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                           </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                                <label className="block text-sm text-[var(--text-muted)]">日期</label>
                                <div className="relative">
                                  <input 
                                     type="date"
                                     className="w-full border p-2 pr-10 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                     value={typeof formData.bookingDate === 'string' ? formData.bookingDate.split('T')[0] : ''}
                                     onChange={e => setFormData({...formData, bookingDate: e.target.value})}
                                  />
                                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                           </div>
                           <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm text-[var(--text-muted)]">開始</label>
                                    <div className="relative">
                                      <input 
                                         type="time"
                                         className="w-full border p-2 pr-10 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                         value={formData.startTime}
                                         onChange={e => setFormData({...formData, startTime: e.target.value})}
                                      />
                                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm text-[var(--text-muted)]">結束</label>
                                    <div className="relative">
                                      <input 
                                         type="time"
                                         className="w-full border p-2 pr-10 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                                         value={formData.endTime}
                                         onChange={e => setFormData({...formData, endTime: e.target.value})}
                                      />
                                      <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    </div>
                                </div>
                           </div>
                      </div>

                      <div>
                           <label className="block text-sm text-[var(--text-muted)]">預約人 (工作人員)</label>
                           <input 
                              className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                              value={formData.staffName || ''}
                              onChange={e => setFormData({...formData, staffName: e.target.value})}
                              placeholder="工作人員姓名"
                           />
                      </div>

                      <div>
                           <label className="block text-sm text-[var(--text-muted)]">付款狀態</label>
                           <div className="flex gap-4 mt-1">
                               <label className="flex items-center gap-1 text-[var(--text-normal)]">
                                   <input 
                                      type="radio"
                                      checked={formData.paymentStatus === 'paid'}
                                      onChange={() => setFormData({...formData, paymentStatus: 'paid'})}
                                   />
                                   已付款
                               </label>
                               <label className="flex items-center gap-1 text-[var(--text-normal)]">
                                   <input 
                                      type="radio"
                                      checked={formData.paymentStatus === 'unpaid'}
                                      onChange={() => setFormData({...formData, paymentStatus: 'unpaid'})}
                                   />
                                   未付款
                               </label>
                           </div>
                      </div>
                      
                      <div>
                           <label className="block text-sm text-[var(--text-muted)]">備註</label>
                           <textarea 
                              className="w-full border p-2 rounded bg-[var(--bg-primary)] text-[var(--text-normal)]"
                              value={formData.notes || ''}
                              onChange={e => setFormData({...formData, notes: e.target.value})}
                              rows={3}
                           />
                      </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-6">
                      <Button variant="secondary" onClick={() => setShowModal(false)}>取消</Button>
                      <Button variant="primary" onClick={handleSave}>儲存</Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default FacilitySystem;
