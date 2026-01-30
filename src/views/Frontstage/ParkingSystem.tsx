import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { parkingActions } from '../../store/modules/parking';
import { ParkingSpace, ParkingStats, ParkingArea } from '../../types/domain';
import '../../assets/styles/parking.css';

const ParkingSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  const { spaces, areas, stats, loading } = useAppSelector(state => state.parking);
  const [selectedArea, setSelectedArea] = useState<string>('all');

  useEffect(() => {
    const mockSpaces: ParkingSpace[] = [
      { id: 'P001', area: 'A', number: 'A-101', type: 'resident', status: 'occupied', residentId: 'R001', plateNumber: 'ABC-1234', monthlyFee: 2500 },
      { id: 'P002', area: 'A', number: 'A-102', type: 'resident', status: 'available' },
      { id: 'P003', area: 'A', number: 'A-103', type: 'visitor', status: 'occupied', residentId: 'R002', plateNumber: 'DEF-5678', startTime: new Date(), hourlyRate: 60 },
      { id: 'P004', area: 'B', number: 'B-201', type: 'resident', status: 'occupied', residentId: 'R003', plateNumber: 'GHI-9012', monthlyFee: 2800 },
      { id: 'P005', area: 'B', number: 'B-202', type: 'visitor', status: 'available' },
      { id: 'P006', area: 'B', number: 'B-203', type: 'reserved', status: 'reserved', reason: '施工預留', reservedUntil: new Date(Date.now() + 86400000 * 7) },
      { id: 'P007', area: 'C', number: 'C-301', type: 'resident', status: 'occupied', residentId: 'R004', plateNumber: 'JKL-3456', monthlyFee: 3000 },
      { id: 'P008', area: 'C', number: 'C-302', type: 'resident', status: 'maintenance', reason: '地面維修', maintenanceUntil: new Date(Date.now() + 86400000) },
      { id: 'P009', area: 'C', number: 'C-303', type: 'visitor', status: 'available' },
      { id: 'P010', area: 'C', number: 'C-304', type: 'visitor', status: 'available' },
    ];

    const mockAreas: ParkingArea[] = [
      { id: 'A', name: 'A區 - 住戶專用', totalSpaces: 100, monthlyRate: 2500, visitorRate: 60 },
      { id: 'B', name: 'B區 - 混合停車', totalSpaces: 80, monthlyRate: 2800, visitorRate: 80 },
      { id: 'C', name: 'C區 - 臨時停車', totalSpaces: 60, monthlyRate: 3000, visitorRate: 100 },
    ];

    dispatch(parkingActions.initializeSpaces(mockSpaces));
    dispatch(parkingActions.initializeAreas(mockAreas));
  }, [dispatch]);

  useEffect(() => {
    const statsData: ParkingStats = {
      total: spaces.length,
      occupied: spaces.filter(s => s.status === 'occupied').length,
      available: spaces.filter(s => s.status === 'available').length,
      reserved: spaces.filter(s => s.status === 'reserved').length,
      maintenance: spaces.filter(s => s.status === 'maintenance').length,
      residentOccupied: spaces.filter(s => s.type === 'resident' && s.status === 'occupied').length,
      visitorOccupied: spaces.filter(s => s.type === 'visitor' && s.status === 'occupied').length,
      monthlyRevenue: spaces
        .filter(s => s.type === 'resident' && s.status === 'occupied')
        .reduce((sum, s) => sum + (s.monthlyFee || 0), 0),
      dailyRevenue: spaces
        .filter(s => s.type === 'visitor' && s.status === 'occupied' && s.startTime)
        .reduce((sum, s) => {
          const hours = Math.ceil((Date.now() - new Date(s.startTime!).getTime()) / (1000 * 60 * 60));
          return sum + (hours * (s.hourlyRate || 60));
        }, 0),
    };

    dispatch(parkingActions.updateStats(statsData));
  }, [spaces, dispatch]);

  const filteredSpaces = selectedArea === 'all' 
    ? spaces 
    : spaces.filter(space => space.area === selectedArea);

  const getStatusColor = (status: string) => {
    const colors = {
      available: 'var(--color-status-available)',
      occupied: 'var(--color-status-occupied)',
      reserved: 'var(--color-status-reserved)',
      maintenance: 'var(--color-status-maintenance)',
    };
    return colors[status as keyof typeof colors] || 'var(--color-secondary)';
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      available: '可用',
      occupied: '佔用',
      reserved: '預留',
      maintenance: '維護',
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };

  const getTypeText = (type: string) => {
    const typeTexts = {
      resident: '住戶',
      visitor: '訪客',
      reserved: '預留',
    };
    return typeTexts[type as keyof typeof typeTexts] || type;
  };

  const handleSpaceClick = (space: ParkingSpace) => {
    console.log('点击停车位:', space);
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="parking-system">
      <div className="parking-header">
        <h1>停車管理系統</h1>
        <div className="parking-actions">
          <Button variant="primary" onClick={() => {}}>
            車位分配
          </Button>
          <Button variant="secondary" onClick={() => {}}>
            費用設定
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        <Card>
          <CardHeader>
            <CardTitle>總車位</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="stat-available">
          <CardHeader>
            <CardTitle>可用車位</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.available}</div>
            <div className="stat-percentage">
              {stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="stat-occupied">
          <CardHeader>
            <CardTitle>佔用車位</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.occupied}</div>
            <div className="stat-percentage">
              {stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="stat-reserved">
          <CardHeader>
            <CardTitle>預留車位</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.reserved}</div>
          </CardContent>
        </Card>

        <Card className="stat-maintenance">
          <CardHeader>
            <CardTitle>維護車位</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">{stats.maintenance}</div>
          </CardContent>
        </Card>

        <Card className="stat-revenue">
          <CardHeader>
            <CardTitle>月收入</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-number">NT$ {stats.monthlyRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="area-filter">
        <label>停車區域：</label>
        <select 
          value={selectedArea} 
          onChange={(e) => setSelectedArea(e.target.value)}
          className="area-select"
        >
          <option value="all">所有區域</option>
          {areas.map(area => (
            <option key={area.id} value={area.id}>
              {area.name} (車位總數: {area.totalSpaces})
            </option>
          ))}
        </select>
      </div>

      <div className="parking-grid">
        {filteredSpaces.map(space => (
          <div
            key={space.id}
            className={`parking-space ${space.status}`}
            style={{ backgroundColor: getStatusColor(space.status) }}
            onClick={() => handleSpaceClick(space)}
          >
            <div className="space-number">{space.number}</div>
            <div className="space-type">{getTypeText(space.type)}</div>
            <div className="space-status">{getStatusText(space.status)}</div>
            {space.status === 'occupied' && space.plateNumber && (
              <div className="plate-number">{space.plateNumber}</div>
            )}
            {space.status === 'reserved' && space.reason && (
              <div className="reserved-reason">{space.reason}</div>
            )}
            {space.status === 'maintenance' && space.reason && (
              <div className="maintenance-reason">{space.reason}</div>
            )}
          </div>
        ))}
      </div>

      <Card className="detailed-stats">
        <CardHeader>
          <CardTitle>詳細統計</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="stats-grid-detailed">
            <div className="stat-item">
              <label>住戶車位佔用：</label>
              <span>{stats.residentOccupied}</span>
            </div>
            <div className="stat-item">
              <label>訪客車位佔用：</label>
              <span>{stats.visitorOccupied}</span>
            </div>
            <div className="stat-item">
              <label>今日預估收入：</label>
              <span>NT$ {stats.dailyRevenue.toLocaleString()}</span>
            </div>
            <div className="stat-item">
              <label>使用率：</label>
              <span>
                {stats.total > 0 ? Math.round(((stats.occupied + stats.reserved) / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParkingSystem;