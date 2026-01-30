import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { facilityActions } from '../../store/modules/facility';
import { Facility, FacilityBooking, FacilityStats } from '../../types/domain';
import '../../assets/styles/facility.css';

const FacilitySystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const { facilities, bookings, stats, loading } = useAppSelector(state => state.facility);
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'grid' | 'list' | 'calendar'>('grid');

  useEffect(() => {
    const mockFacilities: Facility[] = [
      {
        id: 'F001',
        name: '游泳池',
        type: 'recreation',
        capacity: 30,
        description: '室內恆溫游泳池，設施齊全',
        location: '一樓',
        operatingHours: { start: '06:00', end: '22:00' },
        amenities: ['淋浴設備', '儲物櫃', '救生員'],
        hourlyRate: 100,
        bookingRules: {
          maxHoursPerBooking: 2,
          maxBookingsPerDay: 1,
          requiresApproval: false,
        },
        status: 'available',
      },
      {
        id: 'F002',
        name: '健身房',
        type: 'fitness',
        capacity: 20,
        description: '專業健身器材，24小時開放',
        location: '二樓',
        operatingHours: { start: '00:00', end: '24:00' },
        amenities: ['跑步機', '重訓區', '瑜珈室', '淋浴間'],
        hourlyRate: 50,
        bookingRules: {
          maxHoursPerBooking: 3,
          maxBookingsPerDay: 2,
          requiresApproval: false,
        },
        status: 'available',
      },
      {
        id: 'F003',
        name: '會議室A',
        type: 'meeting',
        capacity: 12,
        description: '配備投影儀和音響設備',
        location: '三樓',
        operatingHours: { start: '08:00', end: '20:00' },
        amenities: ['投影儀', '白板', 'WiFi', '空調'],
        hourlyRate: 200,
        bookingRules: {
          maxHoursPerBooking: 4,
          maxBookingsPerDay: 1,
          requiresApproval: true,
        },
        status: 'available',
      },
      {
        id: 'F004',
        name: '兒童遊戲區',
        type: 'recreation',
        capacity: 15,
        description: '安全室內兒童遊樂設施',
        location: '一樓',
        operatingHours: { start: '09:00', end: '18:00' },
        amenities: ['軟墊', '玩具', '監控'],
        hourlyRate: 0,
        bookingRules: {
          maxHoursPerBooking: 2,
          maxBookingsPerDay: 2,
          requiresApproval: false,
        },
        status: 'maintenance',
        maintenanceReason: '設備更新',
      },
      {
        id: 'F005',
        name: '閱覽室',
        type: 'study',
        capacity: 25,
        description: '安靜閱讀空間，提供WiFi',
        location: '四樓',
        operatingHours: { start: '07:00', end: '23:00' },
        amenities: ['WiFi', '閱讀燈', '書籍雜誌'],
        hourlyRate: 0,
        bookingRules: {
          maxHoursPerBooking: 3,
          maxBookingsPerDay: 3,
          requiresApproval: false,
        },
        status: 'available',
      },
    ];

    const mockBookings: FacilityBooking[] = [
      {
        id: 'B001',
        facilityId: 'F001',
        residentId: 'R001',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 + 2 * 3600000).toISOString(),
        purpose: '游泳練習',
        status: 'confirmed',
        totalAmount: 200,
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'B002',
        facilityId: 'F002',
        residentId: 'R002',
        startTime: new Date(Date.now() + 2 * 86400000).toISOString(),
        endTime: new Date(Date.now() + 2 * 86400000 + 3600000).toISOString(),
        purpose: '健身訓練',
        status: 'confirmed',
        totalAmount: 50,
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'B003',
        facilityId: 'F003',
        residentId: 'R003',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        endTime: new Date(Date.now() + 86400000 + 3 * 3600000).toISOString(),
        purpose: '會議',
        status: 'pending_approval',
        totalAmount: 600,
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    dispatch(facilityActions.initializeFacilities(mockFacilities));
    dispatch(facilityActions.initializeBookings(mockBookings));
  }, [dispatch]);

  useEffect(() => {
    const statsData: FacilityStats = {
      totalFacilities: facilities.length,
      availableFacilities: facilities.filter(f => f.status === 'available').length,
      totalBookings: bookings.length,
      todayBookings: bookings.filter(b => {
        const today = new Date();
        const bookingDate = new Date(b.startTime);
        return bookingDate.toDateString() === today.toDateString();
      }).length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      pendingBookings: bookings.filter(b => b.status === 'pending_approval').length,
      totalRevenue: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      averageUtilizationRate: 65.5,
    };

    dispatch(facilityActions.updateStats(statsData));
  }, [facilities, bookings, dispatch]);

  const filteredFacilities = selectedFacility === 'all'
    ? facilities
    : facilities.filter(facility => facility.id === selectedFacility);

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'var(--color-status-available)',
      occupied: 'var(--color-status-occupied)',
      maintenance: 'var(--color-status-maintenance)',
      unavailable: 'var(--color-danger)',
    };
    return colors[status as keyof typeof colors] || 'var(--color-secondary)';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      available: '可預約',
      occupied: '使用中',
      maintenance: '維護中',
      unavailable: '不可用',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getBookingStatusText = (status: string) => {
    const statusTexts = {
      confirmed: '已確認',
      pending_approval: '待審核',
      cancelled: '已取消',
      completed: '已完成',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getPaymentStatusText = (status: string) => {
    const statusTexts = {
      paid: '已付款',
      pending: '待付款',
      refunded: '已退款',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const handleFacilityClick = (facility: Facility) => {
    console.log('点击设施:', facility);
  };

  const handleNewBooking = (facility: Facility) => {
    console.log('新建预约:', facility);
  };

  const handleBookingAction = (booking: FacilityBooking, action: 'approve' | 'reject' | 'cancel') => {
    console.log('预约操作:', booking, action);
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="facility-system animate-fade-in">
      <div className="facility-header">
        <h1>設施預約系統</h1>
        <div className="facility-actions">
          <div className="view-switcher">
            <Button
              variant={currentView === 'grid' ? 'primary' : 'secondary'}
              onClick={() => setCurrentView('grid')}
            >
              網格
            </Button>
            <Button
              variant={currentView === 'list' ? 'primary' : 'secondary'}
              onClick={() => setCurrentView('list')}
            >
              列表
            </Button>
            <Button
              variant={currentView === 'calendar' ? 'primary' : 'secondary'}
              onClick={() => setCurrentView('calendar')}
            >
              日曆
            </Button>
          </div>
          <Button variant="primary" onClick={() => { }}>
            新增設施
          </Button>
        </div>
      </div>


      <div className="stats-grid">
        <Card>
          <CardHeader>
            <CardTitle>總設施</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.totalFacilities}</div>
          </CardContent>
        </Card>

        <Card className="stat-available">
          <CardHeader>
            <CardTitle>可預約</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.availableFacilities}</div>
          </CardContent>
        </Card>

        <Card className="stat-bookings">
          <CardHeader>
            <CardTitle>今日預約</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.todayBookings}</div>
          </CardContent>
        </Card>

        <Card className="stat-revenue">
          <CardHeader>
            <CardTitle>總收入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">NT$ {stats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="stat-utilization">
          <CardHeader>
            <CardTitle>平均使用率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.averageUtilizationRate}%</div>
          </CardContent>
        </Card>
      </div>


      <div className="facility-filter">
        <label>設施篩選：</label>
        <select
          value={selectedFacility}
          onChange={(e) => setSelectedFacility(e.target.value)}
          className="facility-select"
        >
          <option value="all">所有設施</option>
          {facilities.map(facility => (
            <option key={facility.id} value={facility.id}>
              {facility.name}
            </option>
          ))}
        </select>
      </div>


      {currentView === 'grid' && (
        <div className="facility-grid">
          {filteredFacilities.map(facility => (
            <Card key={facility.id} className="facility-card">
              <CardHeader>
                <CardTitle style={{ color: getStatusColor(facility.status) }}>
                  {facility.name}
                </CardTitle>
                <span className="facility-status">{getStatusText(facility.status)}</span>
              </CardHeader>
              <CardContent>
                <div className="facility-info">
                  <p><strong>類型：</strong>{facility.type}</p>
                  <p><strong>容量：</strong>{facility.capacity}人</p>
                  <p><strong>位置：</strong>{facility.location}</p>
                  <p><strong>費用：</strong>NT$ {facility.hourlyRate}/小時</p>
                  <p><strong>時間：</strong>{facility.operatingHours.start} - {facility.operatingHours.end}</p>
                </div>
                <div className="facility-actions-card">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleNewBooking(facility)}
                    disabled={facility.status !== 'available'}
                  >
                    預約
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleFacilityClick(facility)}
                  >
                    詳情
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}


      <Card className="recent-bookings">
        <CardHeader>
          <CardTitle>最近預約</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bookings-list">
            {bookings.slice(0, 5).map(booking => {
              const facility = facilities.find(f => f.id === booking.facilityId);
              return (
                <div key={booking.id} className="booking-item">
                  <div className="booking-info">
                    <div className="booking-facility">
                      <strong>{facility?.name}</strong>
                    </div>
                    <div className="booking-details">
                      <span>{new Date(booking.startTime).toLocaleDateString()} {new Date(booking.startTime).toLocaleTimeString()} - {new Date(booking.endTime).toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>{booking.purpose}</span>
                    </div>
                    <div className="booking-status">
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                        {getBookingStatusText(booking.status)}
                      </span>
                      <span className="payment-status">
                        {getPaymentStatusText(booking.paymentStatus)}
                      </span>
                      <span className="amount">NT$ {booking.totalAmount}</span>
                    </div>
                  </div>
                  <div className="booking-actions">
                    {booking.status === 'pending_approval' && (
                      <>
                        <Button
                          variant="primary"
                          size="small"
                          onClick={() => handleBookingAction(booking, 'approve')}
                        >
                          批准
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleBookingAction(booking, 'reject')}
                        >
                          拒绝
                        </Button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => handleBookingAction(booking, 'cancel')}
                      >
                        取消
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacilitySystem;