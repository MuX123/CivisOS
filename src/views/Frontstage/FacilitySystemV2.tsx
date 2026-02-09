import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import IntroductionButton from '../../components/ui/IntroductionButton';
import BookingCard from '../../components/facility/BookingCard';
import BookingModal from '../../components/facility/BookingModal';
import { Facility, FacilityBookingV2 } from '../../types/domain';
import { useAppSelector } from '../../store/hooks';
import '../../assets/styles/facility.css';

const FacilitySystemV2: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'past' | 'cancelled' | 'deleted'>('current');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [bookings, setBookings] = useState<FacilityBookingV2[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<FacilityBookingV2 | undefined>();

  // 從 store 讀取棟別和公設資料
  const buildings = useAppSelector(state => state.building.buildings);
  const facilities = useAppSelector(state => state.facility.facilities);
  
  // 根據選擇的棟別過濾公設
  const filteredFacilities = useMemo(() => {
    if (!selectedBuilding) return facilities;
    return facilities.filter(f => f.buildingId === selectedBuilding || !f.buildingId);
  }, [facilities, selectedBuilding]);

  useEffect(() => {
    // 模擬數據
    const mockBookings: FacilityBookingV2[] = [
      {
        id: 'B001',
        facilityId: 'F001',
        facility: facilities[0],
        bookingType: 'resident',
        residentName: '張先生',
        bookingDate: new Date(Date.now() + 86400000).toISOString(),
        startTime: '09:00',
        endTime: '11:00',
        staffName: '管理員小明',
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'B002',
        facilityId: 'F002',
        facility: facilities[1],
        bookingType: 'other',
        otherName: '王訪客',
        bookingDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        startTime: '14:00',
        endTime: '15:00',
        staffName: '管理員小明',
        paymentStatus: 'unpaid',
        bookingStatus: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'B003',
        facilityId: 'F001',
        facility: facilities[0],
        bookingType: 'resident',
        residentName: '李女士',
        bookingDate: new Date(Date.now() - 86400000 * 2).toISOString(),
        startTime: '10:00',
        endTime: '12:00',
        staffName: '管理員大明',
        paymentStatus: 'paid',
        bookingStatus: 'cancelled',
        notes: '因天候取消',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setBookings(mockBookings);
  }, []);

  const filteredBookings = bookings.filter((b) => {
    switch (activeTab) {
      case 'current':
        return b.bookingStatus === 'confirmed';
      case 'past':
        return b.bookingStatus === 'confirmed';
      case 'cancelled':
        return b.bookingStatus === 'cancelled';
      case 'deleted':
        return b.bookingStatus === 'deleted';
      default:
        return true;
    }
  });

  const handlePay = (id: string) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, paymentStatus: 'paid' } : b)));
  };

  const handleCancel = (id: string) => {
    if (confirm('確定要取消此預約嗎？')) {
      setBookings(bookings.map((b) => (b.id === id ? { ...b, bookingStatus: 'cancelled' } : b)));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此預約嗎？')) {
      setBookings(bookings.map((b) => (b.id === id ? { ...b, bookingStatus: 'deleted' } : b)));
    }
  };

  const handleSave = (bookingData: Partial<FacilityBookingV2>) => {
    if (selectedBooking) {
      setBookings(bookings.map((b) => (b.id === selectedBooking.id ? { ...b, ...bookingData } : b)));
    } else {
      const newBooking: FacilityBookingV2 = {
        id: `booking-${Date.now()}`,
        facilityId: bookingData.facilityId || '',
        facility: facilities.find((f) => f.id === bookingData.facilityId),
        bookingType: bookingData.bookingType || 'resident',
        bookingDate: bookingData.bookingDate || new Date().toISOString(),
        startTime: bookingData.startTime || '09:00',
        endTime: bookingData.endTime || '10:00',
        staffName: bookingData.staffName || '',
        paymentStatus: 'unpaid',
        bookingStatus: 'confirmed',
        ...bookingData,
      } as FacilityBookingV2;
      setBookings([...bookings, newBooking]);
    }
    setIsModalOpen(false);
    setSelectedBooking(undefined);
  };

  const getCount = (status: string) => {
    return bookings.filter((b) => {
      if (status === 'current') return b.bookingStatus === 'confirmed';
      if (status === 'past') return b.bookingStatus === 'confirmed';
      if (status === 'cancelled') return b.bookingStatus === 'cancelled';
      if (status === 'deleted') return b.bookingStatus === 'deleted';
      return false;
    }).length;
  };

  return (
    <div className="facility-system">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-3xl font-bold text-white">公設預約</h2>
        <div className="flex items-center gap-2">
          <IntroductionButton pageId="facility" />
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              setSelectedBooking(undefined);
              setIsModalOpen(true);
            }}
          >
            新增
          </Button>
        </div>
      </div>

      {/* 棟別分頁 */}
      <div className="building-tabs flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            selectedBuilding === ''
              ? 'bg-[#5865F2] text-white shadow-md'
              : 'bg-[var(--dark-mode-cardBg,#2f3136)] text-[var(--dark-mode-text,#FFFFFF)] hover:bg-[var(--dark-mode-hoverBg,#36393f)] border border-[var(--dark-mode-cardBorder,#202225)]'
          }`}
          onClick={() => setSelectedBuilding('')}
        >
          全部
        </button>
        {buildings.map((b) => (
          <button
            key={b.id}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedBuilding === b.id
                ? 'bg-[#5865F2] text-white shadow-md'
                : 'bg-[var(--dark-mode-cardBg,#2f3136)] text-[var(--dark-mode-text,#FFFFFF)] hover:bg-[var(--dark-mode-hoverBg,#36393f)] border border-[var(--dark-mode-cardBorder,#202225)]'
            }`}
            onClick={() => setSelectedBuilding(b.id)}
          >
            {b.buildingCode}棟
          </button>
        ))}
      </div>

      <Card>
          <CardHeader>
            <div className="status-tabs flex gap-1 bg-[var(--dark-mode-cardBorder,#202225)] p-1 rounded-lg inline-flex">
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'current'
                    ? 'bg-[#5865F2] text-white shadow-sm'
                    : 'text-[var(--dark-mode-text,#FFFFFF)] hover:text-[#dcddde]'
                }`}
                onClick={() => setActiveTab('current')}
              >
                現在
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === 'current' ? 'bg-[#7B7BE6]' : 'bg-[var(--dark-mode-cardBorder,#202225)]'
                }`}>
                  {getCount('current')}
                </span>
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'past'
                    ? 'bg-[#5865F2] text-white shadow-sm'
                    : 'text-[var(--dark-mode-text,#FFFFFF)] hover:text-[#dcddde]'
                }`}
                onClick={() => setActiveTab('past')}
              >
                過去
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === 'past' ? 'bg-[#7B7BE6]' : 'bg-[var(--dark-mode-cardBorder,#202225)]'
                }`}>
                  {getCount('past')}
                </span>
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'cancelled'
                    ? 'bg-[#5865F2] text-white shadow-sm'
                    : 'text-[var(--dark-mode-text,#FFFFFF)] hover:text-[#dcddde]'
                }`}
                onClick={() => setActiveTab('cancelled')}
              >
                取消
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === 'cancelled' ? 'bg-[#7B7BE6]' : 'bg-[var(--dark-mode-cardBorder,#202225)]'
                }`}>
                  {getCount('cancelled')}
                </span>
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'deleted'
                    ? 'bg-[#5865F2] text-white shadow-sm'
                    : 'text-[var(--dark-mode-text,#FFFFFF)] hover:text-[#dcddde]'
                }`}
                onClick={() => setActiveTab('deleted')}
              >
                刪除
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === 'deleted' ? 'bg-[#7B7BE6]' : 'bg-[var(--dark-mode-cardBorder,#202225)]'
                }`}>
                  {getCount('deleted')}
                </span>
              </button>
            </div>
          </CardHeader>
        <CardContent>
          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h4>沒有預約記錄</h4>
              <p>點擊上方按鈕新增預約</p>
            </div>
          ) : (
            <div className="bookings-list">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onPay={handlePay}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                  onEdit={(b) => {
                    setSelectedBooking(b);
                    setIsModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <BookingModal
          booking={selectedBooking}
          facilities={facilities}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(undefined);
          }}
        />
      )}
    </div>
  );
};

export default FacilitySystemV2;
