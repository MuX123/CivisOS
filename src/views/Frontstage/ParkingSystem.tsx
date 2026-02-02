import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import IntroductionButton from '../../components/ui/IntroductionButton';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { parkingActions } from '../../store/modules/parking';
import { ParkingSpace, ParkingStats } from '../../types/domain';
import { StatusConfig } from '../../types/domain';
import '../../assets/styles/parking.css';

const ParkingSystem: React.FC = () => {
  const dispatch = useAppDispatch();
  // Fetch data from Redux store instead of mock data
  const buildingParkingSpaces = useAppSelector(state => state.building.parkingSpaces);
  const parkingStatuses = useAppSelector((state: any) => state.config.parkingStatuses) as StatusConfig[];
  const { spaces, areas, stats, loading } = useAppSelector(state => state.parking);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  
  // Transform building parking spaces to domain ParkingSpace type if needed
  // Or sync them. For now, let's assume we need to sync building parking spaces to parking module.
  useEffect(() => {
     if (buildingParkingSpaces.length > 0 && spaces.length === 0) {
        // Convert Building ParkingSpaceConfig to Domain ParkingSpace
        // This is a simple mapping for demo purposes.
        // In real app, this might come from a different API or stored differently.
        const domainSpaces: ParkingSpace[] = buildingParkingSpaces.map(bp => ({
            id: bp.id,
            area: bp.floorId, // Using floorId as area for now, or define areaId
            number: bp.number,
            type: bp.type === 'visitor' ? 'visitor' : 'resident', // Map types
            status: bp.status as any, // Cast status
            // Other fields map as needed
            monthlyFee: bp.monthlyFee
        }));
        dispatch(parkingActions.initializeSpaces(domainSpaces));
     }
  }, [buildingParkingSpaces, spaces.length, dispatch]);

  const getStatusColor = (statusName: string) => {
    // Find status config by name mapping or id
    // The domain status is 'available', 'occupied' etc.
    // The config status has a name (e.g. '可租用') and a color.
    // We need to map domain status to config status name?
    // Or, better, use the status ID if possible.
    // But existing domain uses string literals.
    
    const statusMap: Record<string, string> = {
        'available': '可租用',
        'occupied': '已佔用',
        'reserved': '保留',
        'maintenance': '維護中'
    };
    
    const configName = statusMap[statusName];
    if (configName) {
        const config = parkingStatuses.find(s => s.name === configName);
        if (config) return config.color;
    }
    
    // Fallback if no config matches
    return '#cccccc';
  };

  useEffect(() => {
    // Use data from store, no mock data initialization here if we rely on building data
    // Or initialize with empty if needed
    if (spaces.length === 0 && buildingParkingSpaces.length === 0) {
        // Only initialize mock if BOTH are empty to show something (or just show empty state)
        // For now, let's allow empty state to reflect "no content" as requested,
        // unless building data exists.
    }
  }, [spaces, buildingParkingSpaces]);
  
  // Calculate stats dynamically based on current spaces
  useEffect(() => {
    if (spaces.length === 0) {
        const emptyStats: ParkingStats = {
            total: 0,
            occupied: 0,
            available: 0,
            reserved: 0,
            maintenance: 0,
            residentOccupied: 0,
            visitorOccupied: 0,
            monthlyRevenue: 0,
            dailyRevenue: 0,
        };
        dispatch(parkingActions.updateStats(emptyStats));
        return;
    }

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
    // console.log('点击停车位:', space);
  };

  if (loading) {
    return <div className="loading">載入中...</div>;
  }

  return (
    <div className="parking-system p-4">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-3xl font-bold text-white">停車管理</h2>
        <div className="flex items-center gap-2">
          <IntroductionButton pageId="parking" />
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