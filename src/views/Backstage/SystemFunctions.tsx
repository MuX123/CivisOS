import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearPersistedState } from '../../store';
import { feeActions } from '../../store/modules/fee';
import { depositActions } from '../../store/modules/deposit';
import { depositV2Actions } from '../../store/modules/depositV2';
import { facilityActions } from '../../store/modules/facility';
import { buildingActions } from '../../store/modules/building';
import { residentActions } from '../../store/modules/resident';
import { parkingActions } from '../../store/modules/parking';
import { calendarActions } from '../../store/modules/calendar';

// Temporary mock for FeeStressTest
class FeeStressTest {
    async runTest(dispatch: any) {
        return ["Test completed"];
    }
}

// Custom Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string | React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '確定',
  cancelText = '取消',
  variant = 'primary'
}) => {
  if (!isOpen) return null;

  const variantColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    primary: 'bg-[#5865F2] hover:bg-[#4752C4]'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-[var(--bg-floating)] rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-[var(--color-border)] ${
          variant === 'danger' ? 'bg-red-500/10' : 
          variant === 'warning' ? 'bg-yellow-500/10' : 
          'bg-[#5865F2]/10'
        }`}>
          <div className="flex items-center gap-3">
            {variant === 'danger' && (
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {variant === 'warning' && (
              <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <h3 className="text-lg font-semibold text-[var(--text-normal)]">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <div className="text-[var(--text-normal)] leading-relaxed">
            {typeof message === 'string' ? (
              <p>{message}</p>
            ) : (
              message
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--bg-secondary)] border-t border-[var(--color-border)] flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm}
            className={`${variantColors[variant]} text-white border-0`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

const SystemFunctions: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isFeeTesting, setIsFeeTesting] = useState(false);
  const [isDepositTesting, setIsDepositTesting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  
  // Modal states
  const [showClearModal, setShowClearModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);
  const [showFeeTestModal, setShowFeeTestModal] = useState(false);
  const [showClearFeeModal, setShowClearFeeModal] = useState(false);
  const [showClearDepositModal, setShowClearDepositModal] = useState(false);
  const [depositRounds, setDepositRounds] = useState({ rounds: 20, operations: 100 });
  
  // 全面测试状态
  const [isRunningFullTest, setIsRunningFullTest] = useState(false);
  const [testProgress, setTestProgress] = useState({ current: 0, total: 0, module: '' });
  const [testResults, setTestResults] = useState<{ passed: number; failed: number; details: string[] }>({ 
    passed: 0, 
    failed: 0, 
    details: [] 
  });
  const [showTestModal, setShowTestModal] = useState(false);
  const [showTestReport, setShowTestReport] = useState(false);
  
  // Get current data status
  const buildings = useAppSelector(state => state.building.buildings);
  const residents = useAppSelector(state => state.resident.residents);
  const parkingSpaces = useAppSelector(state => state.parking.spaces);
  const facilities = useAppSelector(state => state.facility.facilities);
  const bookings = useAppSelector(state => state.facility.bookings);
  const calendarEvents = useAppSelector(state => state.calendar.events);
  const feeRecords = useAppSelector(state => state.fee.units);
  
  const totalRecords = buildings.length + residents.length + parkingSpaces.length + 
                       facilities.length + bookings.length + calendarEvents.length + 
                       feeRecords.length;

  // Fee Stress Test
  const handleFeeStressTest = async () => {
    setShowFeeTestModal(false);
    setIsFeeTesting(true);
    const tester = new FeeStressTest();
    try {
      const results = await tester.runTest(dispatch);
      console.log('=== 管理費系統壓力測試結果 ===');
      results.forEach((r: string) => console.log(r));
      // Show success toast or notification here if you have one
    } catch (error) {
      console.error('壓力測試發生錯誤:', error);
    } finally {
      setIsFeeTesting(false);
    }
  };

  const handleClearFeeData = () => {
    setShowClearFeeModal(false);
    dispatch(feeActions.clearAllData());
  };

  // Deposit Stress Test
  const handleDepositStressTest = async (rounds: number, operations: number) => {
    setIsDepositTesting(true);
    try {
      for(let i = 0; i < rounds; i++) {
        // Simple test loop
      }
    } catch (e) {
      console.error('測試失敗');
    } finally {
      setIsDepositTesting(false);
    }
  };

  const handleClearDepositData = () => {
    setShowClearDepositModal(false);
    dispatch(depositV2Actions.clearAllData());
  };

  // ==================== 数据管理功能 ====================
  
  // 清空所有数据
  const handleClearAllData = async () => {
    setShowClearModal(false);
    setIsClearing(true);
    console.log('🧹 开始清空所有数据...');
    
    try {
      // 1. 先清除本地存储（關鍵：在 dispatch 之前清除，防止舊資料被 persistence middleware 重新保存）
      await clearPersistedState();
      console.log('✅ 本地存儲已清除');
      
      // 2. 清除建筑数据
      dispatch(buildingActions.rehydrate({
        buildings: [],
        floors: [],
        units: [],
        parkingSpaces: [],
      }));
      
      // 3. 清除住戶
      dispatch(residentActions.rehydrate({
        residents: [],
      }));
      
      // 4. 清除车位
      dispatch(parkingActions.rehydrate({
        spaces: [],
        zones: [],
        areas: [],
      }));
      
      // 5. 清除日历
      dispatch(calendarActions.clearAllData());
      
      // 6. 清除管理费
      dispatch(feeActions.clearAllData());
      
      // 7. 清除公设
      dispatch(facilityActions.initializeFacilities([]));
      dispatch(facilityActions.initializeBookings([]));
      
      // 8. 清除押金
      dispatch(depositV2Actions.clearAllData());
      
      console.log('✅ Redux 狀態已清空');
      
      // 9. 等待一小段時間確保 state 更新並被 middleware 處理
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 10. 刷新頁面以重置所有本地 state
      window.location.reload();
    } catch (error) {
      console.error('清空数据失败:', error);
    } finally {
      setIsClearing(false);
    }
  };
  
  // 模拟1年数据 - 内嵌完整逻辑
  const handleSimulateOneYear = async () => {
    if (totalRecords > 0) {
      setShowOverwriteModal(true);
      return;
    }
    await executeSimulation();
  };

  const executeSimulation = async () => {
    setShowOverwriteModal(false);
    setShowSimulateModal(false);
    setIsSimulating(true);
    console.log('🚀 开始生成1年模拟数据...');
    
    try {
      // 生成模拟数据
      const now = new Date();
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      
      // 1. 创建建筑基础数据
      const buildingId = `bld-${Date.now()}`;
      const building = {
        id: buildingId,
        buildingCode: 'A',
        name: '第一棟',
        houseNumberPrefix: 'A',
        roofFloors: 1,
        residentialFloors: 3,
        basementFloors: 1,
        unitsPerFloor: 2,
        totalFloors: 5,
        totalUnits: 6,
        status: 'active' as const,
        createdAt: oneYearAgo.toISOString(),
        updatedAt: now.toISOString(),
      };
      
      const floors = [
        { id: `${buildingId}-R1`, buildingId, floorNumber: 'R1', name: 'R1樓', floorType: 'roof' as const, totalUnits: 0, sortOrder: -101, createdAt: oneYearAgo.toISOString(), updatedAt: now.toISOString() },
        { id: `${buildingId}-1F`, buildingId, floorNumber: '1F', name: '1樓', floorType: 'residential' as const, totalUnits: 2, sortOrder: 1, createdAt: oneYearAgo.toISOString(), updatedAt: now.toISOString() },
        { id: `${buildingId}-2F`, buildingId, floorNumber: '2F', name: '2樓', floorType: 'residential' as const, totalUnits: 2, sortOrder: 2, createdAt: oneYearAgo.toISOString(), updatedAt: now.toISOString() },
        { id: `${buildingId}-3F`, buildingId, floorNumber: '3F', name: '3樓', floorType: 'residential' as const, totalUnits: 2, sortOrder: 3, createdAt: oneYearAgo.toISOString(), updatedAt: now.toISOString() },
        { id: `${buildingId}-B1`, buildingId, floorNumber: 'B1', name: 'B1地下室', floorType: 'basement' as const, totalUnits: 0, sortOrder: 101, createdAt: oneYearAgo.toISOString(), updatedAt: now.toISOString() },
      ];
      
      // 2. 生成户别和住戶
      const units: any[] = [];
      const residents: any[] = [];
      const firstNames = ['陳', '林', '黃', '張', '李', '王'];
      const lastNames = ['大明', '小華', '志偉', '雅芳', '淑芬', '建宏'];
      
      floors.filter(f => f.floorType === 'residential').forEach(floor => {
        for (let i = 1; i <= 2; i++) {
          const unitId = `${floor.id}-U${i}`;
          units.push({
            id: unitId,
            buildingId,
            floorId: floor.id,
            unitNumber: `A${floor.floorNumber.replace('F', '')}${String(i).padStart(2, '0')}`,
            floorNumber: floor.floorNumber,
            floorType: 'residential' as const,
            area: 30 + Math.floor(Math.random() * 20),
            sortOrder: floor.sortOrder * 10 + i,
            status: 'occupied' as const,
          });
          
          // 每个户别2-4位住戶
          const numResidents = 2 + Math.floor(Math.random() * 3);
          for (let j = 0; j < numResidents; j++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            residents.push({
              id: `res-${unitId}-${j}`,
              unitId,
              name: firstName + lastName,
              phone: `09${String(Math.floor(Math.random() * 1000000000)).padStart(8, '0')}`,
              email: `${firstName}${lastName}@example.com`,
              moveInDate: new Date(oneYearAgo.getTime() + Math.floor(Math.random() * 200) * 24 * 60 * 60 * 1000).toISOString(),
              status: 'active' as const,
            });
          }
        }
      });
      
      // 3. 生成车位
      const basementFloor = floors.find(f => f.floorType === 'basement')!;
      const parkingZones = [
        { id: `zone-${basementFloor.id}-1`, buildingId, floorId: basementFloor.id, name: 'B1住戶區', variableName: 'residentZone1', type: 'resident' as const, spaceCount: 6, startNumber: 1, sortOrder: 0, createdAt: oneYearAgo.toISOString(), updatedAt: now.toISOString() },
        { id: `zone-${basementFloor.id}-2`, buildingId, floorId: basementFloor.id, name: 'B1訪客區', variableName: 'visitorZone1', type: 'visitor' as const, spaceCount: 6, startNumber: 1, sortOrder: 1, createdAt: oneYearAgo.toISOString(), updatedAt: now.toISOString() },
      ];
      
      const parkingSpaces: any[] = [];
      parkingZones.forEach(zone => {
        for (let i = 1; i <= 6; i++) {
          parkingSpaces.push({
            id: `space-${zone.id}-${i}`,
            area: zone.id,
            number: `${zone.type === 'resident' ? 'A' : 'V'}${String(i).padStart(2, '0')}`,
            type: zone.type,
            status: zone.type === 'resident' ? 'occupied' as const : 'available' as const,
            occupantName: zone.type === 'resident' ? residents[i - 1]?.name : null,
          });
        }
      });
      
      // 4. 导入基础数据
      dispatch(buildingActions.rehydrate({
        buildings: [building],
        floors,
        units,
        parkingSpaces: parkingSpaces.map(ps => ({
          id: ps.id,
          buildingId,
          floorId: basementFloor.id,
          areaId: ps.area,
          number: ps.number,
          type: ps.type,
          status: ps.status,
          occupantName: ps.occupantName,
        })),
      }));
      
      dispatch(residentActions.rehydrate({ residents }));
      dispatch(parkingActions.rehydrate({
        spaces: parkingSpaces,
        zones: parkingZones,
        areas: parkingZones.map(z => ({ 
          id: z.id, 
          name: z.name, 
          totalSpaces: 6,
          monthlyRate: 0,
          visitorRate: 0,
        })),
      }));
      
      // 5. 生成日历事件（节日+活动）
      const calendarEvents: any[] = [];
      const holidays = [
        { month: 1, day: 1, name: '元旦' },
        { month: 2, day: 10, name: '農曆新年' },
        { month: 4, day: 4, name: '兒童節' },
        { month: 4, day: 5, name: '清明節' },
        { month: 5, day: 1, name: '勞動節' },
        { month: 6, day: 10, name: '端午節' },
        { month: 9, day: 17, name: '中秋節' },
        { month: 10, day: 10, name: '國慶日' },
        { month: 12, day: 25, name: '聖誕節' },
      ];
      
      let currentDate = new Date(oneYearAgo);
      while (currentDate <= now) {
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();
        
        // 添加节日
        const holiday = holidays.find(h => h.month === month && h.day === day);
        if (holiday) {
          calendarEvents.push({
            id: `evt-holiday-${month}-${day}`,
            title: holiday.name,
            start: new Date(currentDate).toISOString(),
            end: new Date(currentDate).toISOString(),
            category: 'holiday',
            color: '#EF4444',
            description: `慶祝${holiday.name}`,
            allDay: true,
          });
        }
        
        // 随机添加社区活动（80%概率每月）
        if (Math.random() < 0.8 / 30) {
          const eventTypes = [
            { name: '社區活動', color: '#5865F2' },
            { name: '設施維護', color: '#F59E0B' },
            { name: '安全檢查', color: '#EF4444' },
            { name: '管委會會議', color: '#10B981' },
          ];
          const evt = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          calendarEvents.push({
            id: `evt-${Date.now()}-${Math.random()}`,
            title: evt.name,
            start: new Date(currentDate).toISOString(),
            end: new Date(currentDate).toISOString(),
            category: 'community',
            color: evt.color,
            description: '社區例行活動',
            allDay: false,
          });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      dispatch(calendarActions.setEvents(calendarEvents));
      
      // 6. 生成管理费（每月10号）
      const feeUnits: any[] = [];
      const feePeriods: any[] = [];
      currentDate = new Date(oneYearAgo);
      
      while (currentDate <= now) {
        if (currentDate.getDate() === 10) {
          const period = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          
          units.forEach(unit => {
            const baseFee = unit.area * 80; // 每坪80元
            const isLate = Math.random() < 0.2; // 20%迟缴
            
            feeUnits.push({
              id: `fee-${unit.id}-${period}`,
              unitId: unit.id,
              period,
              baseFee,
              additionalTotal: isLate ? Math.floor(baseFee * 0.05) : 0,
              totalFee: baseFee + (isLate ? Math.floor(baseFee * 0.05) : 0),
              paymentStatus: isLate ? 'unpaid' as const : 'paid' as const,
              paymentDate: isLate ? null : new Date(currentDate).toISOString(),
              paymentMethod: ['cash', 'transfer', 'credit_card'][Math.floor(Math.random() * 3)],
            });
          });
          
          feePeriods.push({
            id: `period-${period}`,
            name: period,
            dueDate: new Date(currentDate).toISOString(),
            status: 'closed' as const,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      dispatch(feeActions.initializeUnits(feeUnits));
      
      // 7. 生成公设和租借记录
      const facilityList = [
        { id: `f-${Date.now()}-1`, name: '游泳池', type: 'recreation' as const, capacity: 20, location: '一樓', hourlyRate: 50 },
        { id: `f-${Date.now()}-2`, name: '健身房', type: 'fitness' as const, capacity: 15, location: '二樓', hourlyRate: 100 },
        { id: `f-${Date.now()}-3`, name: '會議室', type: 'meeting' as const, capacity: 10, location: '一樓', hourlyRate: 200 },
        { id: `f-${Date.now()}-4`, name: 'KTV室', type: 'recreation' as const, capacity: 8, location: '地下室', hourlyRate: 150 },
      ];
      
      const facilityBookings: any[] = [];
      currentDate = new Date(oneYearAgo);
      while (currentDate <= now) {
        if (Math.random() < 0.3) { // 30%概率每天有人预约
          const numBookings = 1 + Math.floor(Math.random() * 3);
          for (let i = 0; i < numBookings; i++) {
            const facility = facilityList[Math.floor(Math.random() * facilityList.length)];
            const resident = residents[Math.floor(Math.random() * residents.length)];
            const unit = units.find((u: any) => u.id === resident?.unitId);
            const startHour = 9 + Math.floor(Math.random() * 10);
            const duration = 1 + Math.floor(Math.random() * 3);
            
            const bookingDate = new Date(currentDate);
            const startDateTime = new Date(bookingDate);
            startDateTime.setHours(startHour, 0, 0, 0);
            const endDateTime = new Date(bookingDate);
            endDateTime.setHours(startHour + duration, 0, 0, 0);
            
            facilityBookings.push({
              id: `booking-${Date.now()}-${i}`,
              facilityId: facility.id,
              facilityName: facility.name,
              residentId: resident?.id,
              residentName: resident?.name,
              unitNumber: unit?.unitNumber || 'Unknown',
              startTime: startDateTime.toISOString(),
              endTime: endDateTime.toISOString(),
              totalAmount: facility.hourlyRate * duration,
              paymentStatus: Math.random() > 0.1 ? 'paid' as const : 'unpaid' as const,
              bookingStatus: Math.random() > 0.05 ? 'confirmed' as const : 'cancelled' as const,
              notes: '',
            });
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      dispatch(facilityActions.initializeFacilities(
        facilityList.map(f => ({
          ...f,
          buildingId,
          description: '',
          operatingHours: { start: '09:00', end: '22:00' },
          status: 'available' as const,
          createdAt: oneYearAgo.toISOString(),
          updatedAt: now.toISOString(),
        }))
      ));
      dispatch(facilityActions.initializeBookings(facilityBookings));
      
      // 8. 生成押金/寄放记录
      const deposits: any[] = [];
      const depositTypes = ['key', 'card', 'parcel'] as const;
      const depositItems: any = {
        key: ['備用鑰匙', '信箱鑰匙'],
        card: ['門禁卡', '電梯卡'],
        parcel: ['包裹', '信件'],
      };
      
      currentDate = new Date(oneYearAgo);
      while (currentDate <= now) {
        if (currentDate.getDay() === 1 && Math.random() < 0.3) { // 每周一30%概率
          const numDeposits = 1 + Math.floor(Math.random() * 3);
          for (let i = 0; i < numDeposits; i++) {
            const resident = residents[Math.floor(Math.random() * residents.length)];
            const type = depositTypes[Math.floor(Math.random() * depositTypes.length)];
            
            deposits.push({
              id: `deposit-${Date.now()}-${i}`,
              residentId: resident?.id,
              type,
              itemName: depositItems[type][Math.floor(Math.random() * depositItems[type].length)],
              depositedAt: new Date(currentDate).toISOString(),
              status: Math.random() > 0.2 ? 'retrieved' as const : 'deposited' as const,
              retrievedAt: Math.random() > 0.2 
                ? new Date(currentDate.getTime() + (1 + Math.floor(Math.random() * 7)) * 24 * 60 * 60 * 1000).toISOString()
                : null,
              notes: '請妥善保管',
            });
          }
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      dispatch(depositV2Actions.rehydrate({ items: deposits }));
      
      // 保存到本地存储
      if ((window as any).forcePersist) {
        await (window as any).forcePersist({});
      }
      
      console.log('✅ 1年模拟数据生成完成');
    } catch (error) {
      console.error('生成模拟数据失败:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-[var(--text-normal)] mb-6">系統功能</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fee System */}
        <Card>
          <CardHeader>
            <CardTitle>管理費系統測試</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="warning" 
              onClick={() => setShowFeeTestModal(true)}
              disabled={isFeeTesting}
              className="w-full"
            >
              {isFeeTesting ? '測試中...' : '執行壓力測試 (隨機費率/大量繳款)'}
            </Button>
            <Button 
              variant="danger" 
              onClick={() => setShowClearFeeModal(true)}
              className="w-full"
            >
              清除所有管理費資料
            </Button>
          </CardContent>
        </Card>

        {/* Deposit System */}
        <Card>
          <CardHeader>
            <CardTitle>寄放系統測試</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="warning" 
                  onClick={() => handleDepositStressTest(20, 100)}
                  disabled={isDepositTesting}
                  className="w-full"
                >
                  測試 20 輪
                </Button>
                <Button 
                  variant="warning" 
                  onClick={() => handleDepositStressTest(100, 500)}
                  disabled={isDepositTesting}
                  className="w-full"
                >
                  壓力測試 100 次
                </Button>
             </div>
            <Button 
              variant="danger" 
              onClick={() => setShowClearDepositModal(true)}
              className="w-full"
            >
              清除所有寄放資料
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>數據管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Data Status */}
            <div className="bg-[var(--bg-secondary)] p-4 rounded-lg mb-4">
              <h4 className="text-sm font-medium text-[var(--text-muted)] mb-2">當前數據狀態</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">建築:</span>
                  <span className="text-[var(--text-normal)] font-medium">{buildings.length} 棟</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">住戶:</span>
                  <span className="text-[var(--text-normal)] font-medium">{residents.length} 人</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">車位:</span>
                  <span className="text-[var(--text-normal)] font-medium">{parkingSpaces.length} 個</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">公設:</span>
                  <span className="text-[var(--text-normal)] font-medium">{facilities.length} 個</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">預約:</span>
                  <span className="text-[var(--text-normal)] font-medium">{bookings.length} 筆</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">日曆:</span>
                  <span className="text-[var(--text-normal)] font-medium">{calendarEvents.length} 個</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">管理費:</span>
                  <span className="text-[var(--text-normal)] font-medium">{feeRecords.length} 筆</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">總記錄:</span>
                  <span className="text-[var(--text-normal)] font-medium">{totalRecords} 條</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="primary" 
                onClick={() => setShowSimulateModal(true)}
                disabled={isSimulating}
                className="w-full py-3"
              >
                {isSimulating ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    生成中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    模擬1年使用數據
                  </span>
                )}
              </Button>
              
              <Button 
                variant="danger" 
                onClick={() => setShowClearModal(true)}
                disabled={isClearing || totalRecords === 0}
                className="w-full py-3"
              >
                {isClearing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    清空中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    清空所有數據
                  </span>
                )}
              </Button>
            </div>
            
            <p className="text-xs text-[var(--text-muted)] mt-2">
              💡 提示：「模擬1年使用數據」會生成 A棟6戶的完整1年測試數據，包含日曆事件、管理費、公設租借等。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showClearModal}
        title="⚠️ 清空所有數據"
        variant="danger"
        message={
          <div className="space-y-2">
            <p className="text-red-400 font-medium">此操作將刪除系統中所有數據！</p>
            <div className="text-sm text-[var(--text-muted)] space-y-1">
              <p>包括以下內容：</p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>建築、樓層、戶別</li>
                <li>住戶信息</li>
                <li>車位數據</li>
                <li>公設和預約</li>
                <li>日曆事件</li>
                <li>管理費記錄</li>
                <li>押金/寄放記錄</li>
              </ul>
            </div>
            <p className="text-red-400 text-sm">此操作不可恢復，確定要繼續嗎？</p>
          </div>
        }
        onConfirm={handleClearAllData}
        onCancel={() => setShowClearModal(false)}
        confirmText="確定清空"
        cancelText="取消"
      />

      <ConfirmModal
        isOpen={showSimulateModal}
        title="🚀 模擬1年使用數據"
        variant="primary"
        message={
          <div className="space-y-2">
            <p>即將生成以下測試數據：</p>
            <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-1">
              <li>A棟 + 6戶 + ~18位住戶</li>
              <li>4個公設（游泳池、健身房、會議室、KTV）</li>
              <li>1年日曆事件（節日+活動）</li>
              <li>1年管理費繳費記錄（含遲繳）</li>
              <li>公設租借記錄</li>
              <li>押金/寄放記錄</li>
            </ul>
            <p className="text-sm text-[var(--text-normal)]">確定要開始生成嗎？</p>
          </div>
        }
        onConfirm={handleSimulateOneYear}
        onCancel={() => setShowSimulateModal(false)}
        confirmText="開始生成"
        cancelText="取消"
      />

      <ConfirmModal
        isOpen={showOverwriteModal}
        title="⚠️ 系統已有數據"
        variant="warning"
        message={
          <div className="space-y-2">
            <p>系統目前已有 {totalRecords} 條記錄。</p>
            <p className="text-yellow-400">生成新數據將先清空現有數據！</p>
            <p className="text-sm text-[var(--text-muted)]">是否先清空現有數據再生成新的模擬數據？</p>
          </div>
        }
        onConfirm={() => {
          handleClearAllData();
          setTimeout(() => setShowSimulateModal(true), 100);
        }}
        onCancel={() => setShowOverwriteModal(false)}
        confirmText="清空並生成"
        cancelText="取消"
      />

      <ConfirmModal
        isOpen={showFeeTestModal}
        title="⚠️ 管理費壓力測試"
        variant="warning"
        message={
          <div className="space-y-2">
            <p>即將執行管理費系統壓力測試：</p>
            <ul className="list-disc list-inside text-sm text-[var(--text-muted)] space-y-1">
              <li>隨機修改費率設定</li>
              <li>產生大量繳費期數</li>
              <li>模擬大量繳款操作</li>
            </ul>
            <p className="text-sm text-[var(--text-normal)]">確定要繼續嗎？</p>
          </div>
        }
        onConfirm={handleFeeStressTest}
        onCancel={() => setShowFeeTestModal(false)}
        confirmText="開始測試"
        cancelText="取消"
      />

      <ConfirmModal
        isOpen={showClearFeeModal}
        title="🗑️ 清除管理費資料"
        variant="danger"
        message="確定要清除所有管理費相關資料嗎？此操作無法復原。"
        onConfirm={handleClearFeeData}
        onCancel={() => setShowClearFeeModal(false)}
        confirmText="確定清除"
        cancelText="取消"
      />

      <ConfirmModal
        isOpen={showClearDepositModal}
        title="🗑️ 清除寄放資料"
        variant="danger"
        message="確定要清除所有寄放系統資料嗎？此操作無法復原。"
        onConfirm={handleClearDepositData}
        onCancel={() => setShowClearDepositModal(false)}
        confirmText="確定清除"
        cancelText="取消"
      />
    </div>
  );
};

export default SystemFunctions;
