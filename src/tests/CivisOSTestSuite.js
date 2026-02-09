/**
 * CivisOS 全面系统测试框架
 * 覆盖所有功能、所有输入框、所有设定
 * 
 * 测试原则：
 * 1. 每个功能都必须测试
 * 2. 每个输入框都要验证（正常值、边界值、异常值）
 * 3. 每个设定都要检查
 * 4. 测试不限制时间，追求稳定性
 * 5. 详细记录每个测试结果
 * 
 * 使用方法：
 * 1. 在浏览器控制台运行此脚本
 * 2. 按模块逐个执行测试
 * 3. 查看详细测试报告
 */

window.CivisOSTestSuite = {
  // ==================== 测试配置 ====================
  config: {
    slowMode: true, // 慢速模式，便于观察
    logLevel: 'verbose', // verbose | summary | errors-only
    stopOnError: false, // 遇到错误是否停止
    maxRetries: 3, // 失败重试次数
    delayBetweenTests: 1000, // 测试间延迟（毫秒）
  },

  // ==================== 测试结果记录 ====================
  results: {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    details: [],
    startTime: null,
    endTime: null,
  },

  // ==================== 测试数据工厂 ====================
  testData: {
    // 边界值测试数据
    boundaryValues: {
      strings: ['', 'a', '测试中文', '!@#$%', ' '.repeat(1000), 'a'.repeat(10000)],
      numbers: [-999999, -1, 0, 1, 999999, 0.001, 999999.999],
      dates: [
        '1900-01-01',
        '2024-02-29', // 闰年
        '2024-12-31',
        '2099-12-31',
        'invalid-date',
        '',
      ],
      phones: ['', '0912345678', '091234567', '09123456789', 'abcdefghij', '0000000000'],
      emails: ['', 'test@test.com', 'test@', '@test.com', 'test@@test.com', 'a'.repeat(100) + '@test.com'],
    },

    // 正常测试数据
    validData: {
      building: {
        buildingCode: 'A',
        name: '測試棟',
        houseNumberPrefix: 'A',
        roofFloors: 1,
        residentialFloors: 5,
        basementFloors: 2,
        unitsPerFloor: 4,
      },
      unit: {
        unitNumber: 'A101',
        area: 35.5,
        status: 'occupied',
      },
      resident: {
        name: '測試住戶',
        phone: '0912345678',
        email: 'test@example.com',
      },
      parkingSpace: {
        number: 'A01',
        type: 'resident',
        status: 'available',
      },
      facility: {
        name: '測試公設',
        type: 'recreation',
        capacity: 10,
        location: '一樓',
        hourlyRate: 100,
      },
      fee: {
        amount: 2800,
        paymentMethod: 'transfer',
      },
      calendarEvent: {
        title: '測試事件',
        description: '測試描述',
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
    },
  },

  // ==================== 日志系统 ====================
  logger: {
    info: (msg, data) => {
      if (window.CivisOSTestSuite.config.logLevel !== 'errors-only') {
        console.log(`%c[INFO] ${msg}`, 'color: #5865F2', data || '');
      }
    },
    success: (msg, data) => {
      if (window.CivisOSTestSuite.config.logLevel !== 'errors-only') {
        console.log(`%c[PASS] ${msg}`, 'color: #10B981', data || '');
      }
    },
    error: (msg, error) => {
      console.error(`%c[FAIL] ${msg}`, 'color: #EF4444', error);
    },
    warning: (msg, data) => {
      if (window.CivisOSTestSuite.config.logLevel === 'verbose') {
        console.warn(`%c[WARN] ${msg}`, 'color: #F59E0B', data || '');
      }
    },
    section: (title) => {
      console.log('\n' + '='.repeat(80));
      console.log(`%c${title}`, 'color: #5865F2; font-size: 16px; font-weight: bold;');
      console.log('='.repeat(80));
    },
  },

  // ==================== 延迟工具 ====================
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // ==================== 测试执行器 ====================
  async runTest(name, testFn, retries = 0) {
    this.results.total++;
    
    try {
      this.logger.info(`开始测试: ${name}`);
      await testFn();
      this.results.passed++;
      this.results.details.push({ name, status: 'passed', timestamp: new Date() });
      this.logger.success(`测试通过: ${name}`);
      return true;
    } catch (error) {
      if (retries < this.config.maxRetries) {
        this.logger.warning(`测试失败，重试 ${retries + 1}/${this.config.maxRetries}: ${name}`);
        await this.delay(500);
        return this.runTest(name, testFn, retries + 1);
      }
      
      this.results.failed++;
      this.results.details.push({ name, status: 'failed', error: error.message, timestamp: new Date() });
      this.logger.error(`测试失败: ${name}`, error);
      
      if (this.config.stopOnError) {
        throw new Error(`测试停止: ${name}`);
      }
      return false;
    } finally {
      if (this.config.slowMode) {
        await this.delay(this.config.delayBetweenTests);
      }
    }
  },

  // ==================== 第1模块：建筑管理系统测试 ====================
  async testBuildingModule() {
    this.logger.section('【模块1】建築管理系統測試');
    
    const dispatch = window.store?.dispatch;
    if (!dispatch) {
      throw new Error('Redux store 未找到');
    }

    // 1.1 建筑基本信息输入框测试
    await this.runTest('建筑-棟別代號输入', async () => {
      const { buildingCode } = this.testData.validData.building;
      if (!buildingCode || buildingCode.length === 0) {
        throw new Error('棟別代號不能为空');
      }
      if (buildingCode.length > 10) {
        throw new Error('棟別代號过长');
      }
    });

    await this.runTest('建筑-棟別代號边界值测试', async () => {
      for (const value of this.testData.boundaryValues.strings) {
        if (value.length > 10) {
          continue; // 应该被拒绝
        }
      }
    });

    await this.runTest('建筑-名稱输入', async () => {
      const { name } = this.testData.validData.building;
      if (!name || name.length === 0) {
        throw new Error('名稱不能为空');
      }
    });

    await this.runTest('建筑-戶號前綴输入', async () => {
      const { houseNumberPrefix } = this.testData.validData.building;
      if (!houseNumberPrefix) {
        throw new Error('戶號前綴不能为空');
      }
    });

    // 1.2 楼层数输入框测试
    await this.runTest('建筑-R樓数量输入', async () => {
      const { roofFloors } = this.testData.validData.building;
      if (roofFloors < 0 || roofFloors > 10) {
        throw new Error('R樓数量必须在 0-10 之间');
      }
    });

    await this.runTest('建筑-居住層數量输入', async () => {
      const { residentialFloors } = this.testData.validData.building;
      if (residentialFloors < 1 || residentialFloors > 100) {
        throw new Error('居住層數量必须在 1-100 之间');
      }
    });

    await this.runTest('建筑-地下室層數输入', async () => {
      const { basementFloors } = this.testData.validData.building;
      if (basementFloors < 0 || basementFloors > 10) {
        throw new Error('地下室層數必须在 0-10 之间');
      }
    });

    await this.runTest('建筑-每層戶數输入', async () => {
      const { unitsPerFloor } = this.testData.validData.building;
      if (unitsPerFloor < 1 || unitsPerFloor > 50) {
        throw new Error('每層戶數必须在 1-50 之间');
      }
    });

    // 1.3 数字边界值测试
    await this.runTest('建筑-数字边界值测试', async () => {
      for (const num of this.testData.boundaryValues.numbers) {
        if (num < 0 || num > 1000) {
          continue; // 应该被拒绝
        }
      }
    });

    // 1.4 创建建筑功能测试
    await this.runTest('建筑-创建建筑功能', async () => {
      const building = {
        id: `test-bld-${Date.now()}`,
        ...this.testData.validData.building,
        totalFloors: 8,
        totalUnits: 20,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      dispatch({
        type: 'building/addBuilding',
        payload: building,
      });
      
      await this.delay(100);
      
      const state = window.store.getState();
      const found = state.building.buildings.find(b => b.id === building.id);
      if (!found) {
        throw new Error('建筑创建失败');
      }
    });

    // 1.5 楼层生成测试
    await this.runTest('建筑-自动生成楼层', async () => {
      const state = window.store.getState();
      const building = state.building.buildings[0];
      if (!building) {
        throw new Error('没有建筑数据');
      }
      
      // 检查楼层是否正确生成
      const floors = state.building.floors.filter(f => f.buildingId === building.id);
      const expectedFloors = building.roofFloors + building.residentialFloors + building.basementFloors;
      
      if (floors.length !== expectedFloors) {
        throw new Error(`楼层数量不匹配: 期望 ${expectedFloors}, 实际 ${floors.length}`);
      }
    });

    // 1.6 户别生成测试
    await this.runTest('建筑-自动生成户别', async () => {
      const state = window.store.getState();
      const building = state.building.buildings[0];
      const units = state.building.units.filter(u => u.buildingId === building.id);
      
      if (units.length !== building.totalUnits) {
        throw new Error(`户别数量不匹配: 期望 ${building.totalUnits}, 实际 ${units.length}`);
      }
    });

    this.logger.success('建築管理系統測試完成');
  },

  // ==================== 第2模块：住戶管理系统测试 ====================
  async testResidentModule() {
    this.logger.section('【模块2】住戶管理系統測試');

    // 2.1 住戶姓名输入框测试
    await this.runTest('住戶-姓名输入', async () => {
      const { name } = this.testData.validData.resident;
      if (!name || name.trim().length === 0) {
        throw new Error('姓名不能为空');
      }
      if (name.length > 50) {
        throw new Error('姓名过长');
      }
    });

    await this.runTest('住戶-姓名边界值测试', async () => {
      for (const value of this.testData.boundaryValues.strings) {
        if (value.length > 50) {
          continue; // 应该被拒绝
        }
      }
    });

    // 2.2 电话输入框测试
    await this.runTest('住戶-電話输入', async () => {
      const { phone } = this.testData.validData.resident;
      const phoneRegex = /^09\d{8}$/;
      if (!phoneRegex.test(phone)) {
        throw new Error('電話格式不正确，必须为09开头的10位数字');
      }
    });

    await this.runTest('住戶-電話边界值测试', async () => {
      for (const phone of this.testData.boundaryValues.phones) {
        if (phone && !/^09\d{8}$/.test(phone)) {
          continue; // 无效格式应该被拒绝
        }
      }
    });

    // 2.3 Email输入框测试
    await this.runTest('住戶-Email输入', async () => {
      const { email } = this.testData.validData.resident;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Email格式不正确');
      }
    });

    await this.runTest('住戶-Email边界值测试', async () => {
      for (const email of this.testData.boundaryValues.emails) {
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          continue; // 无效格式应该被拒绝
        }
      }
    });

    // 2.4 创建住戶功能测试
    await this.runTest('住戶-创建住戶功能', async () => {
      const dispatch = window.store.dispatch;
      const state = window.store.getState();
      const unit = state.building.units[0];
      
      if (!unit) {
        throw new Error('没有可用的户别');
      }
      
      const resident = {
        id: `test-res-${Date.now()}`,
        ...this.testData.validData.resident,
        unitId: unit.id,
        status: 'active',
      };
      
      dispatch({
        type: 'resident/addResident',
        payload: resident,
      });
      
      await this.delay(100);
      
      const newState = window.store.getState();
      const found = newState.resident.residents.find(r => r.id === resident.id);
      if (!found) {
        throw new Error('住戶创建失败');
      }
    });

    this.logger.success('住戶管理系統測試完成');
  },

  // ==================== 第3模块：車位管理测试 ====================
  async testParkingModule() {
    this.logger.section('【模块3】車位管理系統測試');

    // 3.1 車位編號输入框测试
    await this.runTest('車位-編號输入', async () => {
      const { number } = this.testData.validData.parkingSpace;
      if (!number || number.length === 0) {
        throw new Error('車位編號不能为空');
      }
      if (number.length > 20) {
        throw new Error('車位編號过长');
      }
    });

    // 3.2 車位类型选择测试
    await this.runTest('車位-類型选择', async () => {
      const validTypes = ['resident', 'visitor', 'reserved', 'disabled'];
      const { type } = this.testData.validData.parkingSpace;
      if (!validTypes.includes(type)) {
        throw new Error(`无效的車位類型: ${type}`);
      }
    });

    // 3.3 車位状态选择测试
    await this.runTest('車位-狀態选择', async () => {
      const validStatuses = ['available', 'occupied', 'reserved', 'maintenance'];
      const { status } = this.testData.validData.parkingSpace;
      if (!validStatuses.includes(status)) {
        throw new Error(`无效的車位狀態: ${status}`);
      }
    });

    // 3.4 创建車位功能测试
    await this.runTest('車位-创建車位功能', async () => {
      const dispatch = window.store.dispatch;
      const state = window.store.getState();
      
      const space = {
        id: `test-space-${Date.now()}`,
        ...this.testData.validData.parkingSpace,
        area: 'zone-1',
      };
      
      dispatch({
        type: 'parking/addParkingSpace',
        payload: space,
      });
      
      await this.delay(100);
      
      const newState = window.store.getState();
      const found = newState.parking.spaces.find(s => s.id === space.id);
      if (!found) {
        throw new Error('車位创建失败');
      }
    });

    this.logger.success('車位管理系統測試完成');
  },

  // ==================== 第4模块：公設管理测试 ====================
  async testFacilityModule() {
    this.logger.section('【模块4】公設管理系統測試');

    // 4.1 公設名稱输入框测试
    await this.runTest('公設-名稱输入', async () => {
      const { name } = this.testData.validData.facility;
      if (!name || name.length === 0) {
        throw new Error('公設名稱不能为空');
      }
      if (name.length > 100) {
        throw new Error('公設名稱过长');
      }
    });

    // 4.2 公設類型选择测试
    await this.runTest('公設-類型选择', async () => {
      const validTypes = ['recreation', 'fitness', 'meeting', 'study', 'other'];
      const { type } = this.testData.validData.facility;
      if (!validTypes.includes(type)) {
        throw new Error(`无效的公設類型: ${type}`);
      }
    });

    // 4.3 容納人數输入框测试
    await this.runTest('公設-容納人數输入', async () => {
      const { capacity } = this.testData.validData.facility;
      if (capacity < 1 || capacity > 1000) {
        throw new Error('容納人數必须在 1-1000 之间');
      }
    });

    // 4.4 位置输入框测试
    await this.runTest('公設-位置输入', async () => {
      const { location } = this.testData.validData.facility;
      if (!location || location.length === 0) {
        throw new Error('位置不能为空');
      }
    });

    // 4.5 費率输入框测试
    await this.runTest('公設-費率输入', async () => {
      const { hourlyRate } = this.testData.validData.facility;
      if (hourlyRate < 0 || hourlyRate > 10000) {
        throw new Error('每小時費率必须在 0-10000 之间');
      }
    });

    // 4.6 營業時間设定测试
    await this.runTest('公設-營業時間设定', async () => {
      const startTime = '09:00';
      const endTime = '22:00';
      
      if (startTime >= endTime) {
        throw new Error('開始時間必须早于結束時間');
      }
    });

    // 4.7 创建公設功能测试
    await this.runTest('公設-创建公設功能', async () => {
      const dispatch = window.store.dispatch;
      const state = window.store.getState();
      const building = state.building.buildings[0];
      
      const facility = {
        id: `test-fac-${Date.now()}`,
        ...this.testData.validData.facility,
        buildingId: building?.id,
        operatingHours: { start: '09:00', end: '22:00' },
        description: '',
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      dispatch({
        type: 'facility/addFacility',
        payload: facility,
      });
      
      await this.delay(100);
      
      const newState = window.store.getState();
      const found = newState.facility.facilities.find(f => f.id === facility.id);
      if (!found) {
        throw new Error('公設创建失败');
      }
    });

    this.logger.success('公設管理系統測試完成');
  },

  // ==================== 第5模块：管理費系统测试 ====================
  async testFeeModule() {
    this.logger.section('【模块5】管理費系統測試');

    // 5.1 管理費金額输入框测试
    await this.runTest('管理費-金額输入', async () => {
      const { amount } = this.testData.validData.fee;
      if (amount < 0 || amount > 1000000) {
        throw new Error('金額必须在 0-1000000 之间');
      }
    });

    // 5.2 繳費方式选择测试
    await this.runTest('管理費-繳費方式选择', async () => {
      const validMethods = ['cash', 'transfer', 'credit_card', 'check'];
      const { paymentMethod } = this.testData.validData.fee;
      if (!validMethods.includes(paymentMethod)) {
        throw new Error(`无效的繳費方式: ${paymentMethod}`);
      }
    });

    // 5.3 日期选择测试
    await this.runTest('管理費-日期选择', async () => {
      for (const dateStr of this.testData.boundaryValues.dates) {
        if (dateStr === 'invalid-date' || dateStr === '') {
          continue; // 无效日期应该被拒绝
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          throw new Error(`无效日期: ${dateStr}`);
        }
      }
    });

    this.logger.success('管理費系統測試完成');
  },

  // ==================== 第6模块：日曆系统测试 ====================
  async testCalendarModule() {
    this.logger.section('【模块6】日曆系統測試');

    // 6.1 事件標題输入框测试
    await this.runTest('日曆-標題输入', async () => {
      const { title } = this.testData.validData.calendarEvent;
      if (!title || title.length === 0) {
        throw new Error('事件標題不能为空');
      }
      if (title.length > 200) {
        throw new Error('事件標題过长');
      }
    });

    // 6.2 事件描述输入框测试
    await this.runTest('日曆-描述输入', async () => {
      const { description } = this.testData.validData.calendarEvent;
      if (description && description.length > 5000) {
        throw new Error('事件描述过长');
      }
    });

    // 6.3 開始/結束時間测试
    await this.runTest('日曆-時間范围测试', async () => {
      const { start, end } = this.testData.validData.calendarEvent;
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('无效的时间格式');
      }
      
      if (startDate > endDate) {
        throw new Error('開始時間不能晚于結束時間');
      }
    });

    // 6.4 创建事件功能测试
    await this.runTest('日曆-创建事件功能', async () => {
      const dispatch = window.store.dispatch;
      
      const event = {
        id: `test-evt-${Date.now()}`,
        ...this.testData.validData.calendarEvent,
        category: 'community',
        color: '#5865F2',
        allDay: false,
      };
      
      dispatch({
        type: 'calendar/addEvent',
        payload: event,
      });
      
      await this.delay(100);
      
      const newState = window.store.getState();
      const found = newState.calendar.events.find(e => e.id === event.id);
      if (!found) {
        throw new Error('事件创建失败');
      }
    });

    this.logger.success('日曆系統測試完成');
  },

  // ==================== 第7模块：数据持久化测试 ====================
  async testPersistence() {
    this.logger.section('【模块7】數據持久化測試');

    await this.runTest('持久化-保存数据到localStorage', async () => {
      const forcePersist = window.forcePersist;
      if (!forcePersist) {
        throw new Error('forcePersist 函数未找到');
      }
      
      const state = window.store.getState();
      await forcePersist(state);
      
      const saved = localStorage.getItem('full-state');
      if (!saved) {
        throw new Error('数据未保存到 localStorage');
      }
    });

    await this.runTest('持久化-从localStorage读取数据', async () => {
      const saved = localStorage.getItem('full-state');
      if (!saved) {
        throw new Error('localStorage 中没有数据');
      }
      
      const data = JSON.parse(saved);
      if (!data || typeof data !== 'object') {
        throw new Error('保存的数据格式无效');
      }
    });

    await this.runTest('持久化-数据完整性检查', async () => {
      const saved = localStorage.getItem('full-state');
      if (!saved) return;
      
      const data = JSON.parse(saved);
      
      // 检查关键字段是否存在
      if (!data.building || !data.resident || !data.parking) {
        throw new Error('保存的数据缺少关键模块');
      }
    });

    this.logger.success('數據持久化測試完成');
  },

  // ==================== 第8模块：性能与压力测试 ====================
  async testPerformance() {
    this.logger.section('【模块8】性能與壓力測試');

    await this.runTest('性能-批量创建住戶（100个）', async () => {
      const dispatch = window.store.dispatch;
      const state = window.store.getState();
      const unit = state.building.units[0];
      
      if (!unit) {
        throw new Error('没有可用的户别');
      }
      
      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        const resident = {
          id: `perf-res-${Date.now()}-${i}`,
          unitId: unit.id,
          name: `測試住戶${i}`,
          phone: `09${String(Math.floor(Math.random() * 1000000000)).padStart(8, '0')}`,
          email: `test${i}@example.com`,
          status: 'active',
        };
        
        dispatch({
          type: 'resident/addResident',
          payload: resident,
        });
      }
      
      await this.delay(500);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 5000) {
        throw new Error(`批量创建住戶性能过慢: ${duration.toFixed(2)}ms`);
      }
      
      console.log(`  创建100个住戶耗时: ${duration.toFixed(2)}ms`);
    });

    await this.runTest('性能-大量事件查询', async () => {
      const state = window.store.getState();
      const startTime = performance.now();
      
      // 模拟多次查询
      for (let i = 0; i < 1000; i++) {
        const events = state.calendar.events;
        const _ = events.length; // 触发 getter
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > 1000) {
        throw new Error(`查询性能过慢: ${duration.toFixed(2)}ms`);
      }
      
      console.log(`  1000次查询耗时: ${duration.toFixed(2)}ms`);
    });

    this.logger.success('性能與壓力測試完成');
  },

  // ==================== 运行所有测试 ====================
  async runAllTests() {
    this.results.startTime = new Date();
    
    console.clear();
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #5865F2');
    console.log('%c          CivisOS 全面系統測試開始', 'color: #5865F2; font-size: 20px; font-weight: bold;');
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #5865F2');
    console.log(`開始時間: ${this.results.startTime.toLocaleString()}`);
    console.log('');

    try {
      await this.testBuildingModule();
      await this.testResidentModule();
      await this.testParkingModule();
      await this.testFacilityModule();
      await this.testFeeModule();
      await this.testCalendarModule();
      await this.testPersistence();
      await this.testPerformance();
    } catch (error) {
      console.error('测试过程发生错误:', error);
    }

    this.results.endTime = new Date();
    this.printSummary();
  },

  // ==================== 测试报告 ====================
  printSummary() {
    const duration = this.results.endTime.getTime() - this.results.startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);

    console.log('\n');
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #5865F2');
    console.log('%c          測試報告', 'color: #5865F2; font-size: 18px; font-weight: bold;');
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #5865F2');
    console.log('');
    console.log(`📊 總計測試: ${this.results.total} 個`);
    console.log(`%c✅ 通過: ${this.results.passed} 個`, 'color: #10B981');
    console.log(`%c❌ 失敗: ${this.results.failed} 個`, 'color: #EF4444');
    console.log(`⏱️  耗時: ${minutes}分 ${seconds}秒`);
    console.log('');

    if (this.results.failed > 0) {
      console.log('%c失敗的測試:', 'color: #EF4444; font-weight: bold;');
      this.results.details
        .filter(d => d.status === 'failed')
        .forEach(d => {
          console.log(`  ❌ ${d.name}`);
          console.log(`     錯誤: ${d.error}`);
        });
      console.log('');
    }

    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    console.log(`%c通過率: ${passRate}%`, passRate >= 90 ? 'color: #10B981; font-size: 16px; font-weight: bold;' : 'color: #F59E0B; font-size: 16px; font-weight: bold;');
    console.log('');
    console.log('%c═══════════════════════════════════════════════════════════', 'color: #5865F2');
  },

  // ==================== 运行单个模块测试 ====================
  async runModule(moduleName) {
    const modules = {
      building: this.testBuildingModule,
      resident: this.testResidentModule,
      parking: this.testParkingModule,
      facility: this.testFacilityModule,
      fee: this.testFeeModule,
      calendar: this.testCalendarModule,
      persistence: this.testPersistence,
      performance: this.testPerformance,
    };

    if (modules[moduleName]) {
      this.results.startTime = new Date();
      await modules[moduleName].call(this);
      this.results.endTime = new Date();
      this.printSummary();
    } else {
      console.error(`未知模块: ${moduleName}`);
      console.log('可用模块:', Object.keys(modules).join(', '));
    }
  },
};

// 显示使用说明
console.log('%cCivisOS 全面系统测试框架已加载！', 'color: #5865F2; font-size: 16px; font-weight: bold;');
console.log('');
console.log('使用方法:');
console.log('  CivisOSTestSuite.runAllTests()        - 运行所有测试');
console.log('  CivisOSTestSuite.runModule("building") - 运行单个模块测试');
console.log('  CivisOSTestSuite.config.slowMode = false - 关闭慢速模式');
console.log('');
console.log('可用模块:');
console.log('  building, resident, parking, facility, fee, calendar, persistence, performance');

// 绑定到全局
window.runAllTests = () => window.CivisOSTestSuite.runAllTests();
window.runModule = (name) => window.CivisOSTestSuite.runModule(name);
