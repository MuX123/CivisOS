import { DepositItemV2, PersonInfo, depositV2Actions, DepositLog, MoneyTransaction } from '../../../store/modules/depositV2';

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 測試數據生成器 - 修復版
export class DepositTestSimulator {
  private dispatch: any;
  private getState: any;
  private buildings: any[];
  private units: any[];
  private testResults: string[] = [];
  private createdItemIds: string[] = [];

  constructor(dispatch: any, getState: any, buildings: any[], units: any[]) {
    this.dispatch = dispatch;
    this.getState = getState;
    this.buildings = buildings;
    this.units = units;
  }

  // 獲取隨機棟和戶
  private getRandomBuildingAndUnit(): { buildingId: string; unitId: string } {
    if (this.buildings.length === 0) {
      return { buildingId: 'B1', unitId: 'U1' };
    }
    const building = this.buildings[Math.floor(Math.random() * this.buildings.length)];
    const buildingUnits = this.units.filter((u) => u.buildingId === building.id);
    const unit = buildingUnits.length > 0 
      ? buildingUnits[Math.floor(Math.random() * buildingUnits.length)]
      : null;
    return { 
      buildingId: building.id, 
      unitId: unit?.id || 'U1',
    };
  }

  // 創建人員資訊
  private createPersonInfo(type: 'resident' | 'external'): PersonInfo {
    const names = ['張三', '李四', '王五', '趙六', '陳七', '劉八', '楊九', '黃十', '周十一', '吳十二'];
    const name = names[Math.floor(Math.random() * names.length)];
    
    if (type === 'resident') {
      const { buildingId, unitId } = this.getRandomBuildingAndUnit();
      return {
        type: 'resident',
        name,
        buildingId,
        unitId,
      };
    }
    return {
      type: 'external',
      name: `訪客-${name}`,
    };
  }

  // 直接添加item到store（不經過dispatch）
  private addItemDirectly(item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'>): string {
    const id = generateId();
    const now = new Date().toISOString();
    
    const newItem: DepositItemV2 = {
      ...item,
      id,
      createdAt: now,
      updatedAt: now,
      logs: [
        {
          id: generateId(),
          action: 'create',
          timestamp: now,
          staffName: item.staffName,
          details: `新增登記：${item.itemName || '無物品名稱'}`,
        },
      ],
    };

    // 直接dispatch到store
    this.dispatch(depositV2Actions.addDepositItem(item));
    
    // 記錄創建的ID
    this.createdItemIds.push(id);
    
    return id;
  }

  // 獲取最新創建的item（從state中查找）
  private getLatestItem(): DepositItemV2 | null {
    const state = this.getState();
    const items = state.depositV2?.items || [];
    if (items.length === 0) return null;
    // 返回最後一個（最新的）
    return items[items.length - 1];
  }

  // 獲取指定ID的item
  private getItemById(id: string): DepositItemV2 | null {
    const state = this.getState();
    const items = state.depositV2?.items || [];
    return items.find((i: DepositItemV2) => i.id === id) || null;
  }

  // 驗證結果
  private verifyResult(condition: boolean, successMsg: string, errorMsg: string): boolean {
    if (condition) {
      this.testResults.push(`✅ ${successMsg}`);
      return true;
    } else {
      this.testResults.push(`❌ ${errorMsg}`);
      return false;
    }
  }

  // 場景1: 純寄物
  async testScenario1(): Promise<boolean> {
    try {
      const staffName = '管理員-A';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('external');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['item'],
        itemName: '行李箱',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      const latestItem = this.getLatestItem();
      return this.verifyResult(
        latestItem !== null && latestItem.types.includes('item'),
        '場景1: 住戶寄放行李箱給訪客成功',
        '場景1: 無法找到創建的寄物項目'
      );
    } catch (error) {
      this.testResults.push(`❌ 場景1發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景2: 純寄KEY
  async testScenario2(): Promise<boolean> {
    try {
      const staffName = '管理員-B';
      const sender = this.createPersonInfo('external');
      const receiver = this.createPersonInfo('resident');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['key'],
        itemName: '備用鑰匙',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      const latestItem = this.getLatestItem();
      return this.verifyResult(
        latestItem !== null && latestItem.types.includes('key'),
        '場景2: 訪客寄放鑰匙給住戶成功',
        '場景2: 無法找到創建的寄KEY項目'
      );
    } catch (error) {
      this.testResults.push(`❌ 場景2發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景3: 純寄錢（初始餘額0）
  async testScenario3(): Promise<boolean> {
    try {
      const staffName = '管理員-C';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('resident');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['money'],
        itemName: '管理費押金',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      const latestItem = this.getLatestItem();
      return this.verifyResult(
        latestItem !== null && latestItem.types.includes('money') && latestItem.currentBalance === 0,
        '場景3: 住戶間寄放管理費押金成功（初始餘額0）',
        '場景3: 寄錢項目創建失敗或餘額不為0'
      );
    } catch (error) {
      this.testResults.push(`❌ 場景3發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景4: 寄物+寄KEY
  async testScenario4(): Promise<boolean> {
    try {
      const staffName = '管理員-D';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('resident');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['item', 'key'],
        itemName: '包裹+信箱鑰匙',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      const latestItem = this.getLatestItem();
      const hasBothTypes = (latestItem?.types.includes('item') && latestItem?.types.includes('key')) || false;
      return this.verifyResult(
        hasBothTypes,
        '場景4: 同時寄放包裹和鑰匙成功',
        '場景4: 複合類型項目創建失敗'
      );
    } catch (error) {
      this.testResults.push(`❌ 場景4發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景5: 寄物+寄錢（然後加款）
  async testScenario5(): Promise<boolean> {
    try {
      const staffName = '管理員-E';
      const sender = this.createPersonInfo('external');
      const receiver = this.createPersonInfo('resident');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['item', 'money'],
        itemName: '包裹+押金',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      // 獲取剛新增的項目
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景5: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      // 加款 5000
      this.dispatch(depositV2Actions.addMoney({
        id: itemId,
        amount: 5000,
        staffName: '管理員-E',
      }));
      await this.delay(50);
      
      // 驗證加款結果
      latestItem = this.getItemById(itemId);
      return this.verifyResult(
        latestItem !== null && latestItem.currentBalance === 5000,
        '場景5: 寄物+寄錢並加款5000成功',
        `場景5: 加款後餘額不正確（預期5000，實際${latestItem?.currentBalance}）`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景5發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景6: 寄錢（加款後扣款）
  async testScenario6(): Promise<boolean> {
    try {
      const staffName = '管理員-F';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('external');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['money'],
        itemName: '維修押金',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景6: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      // 先加款 10000
      this.dispatch(depositV2Actions.addMoney({ id: itemId, amount: 10000, staffName: '管理員-F' }));
      await this.delay(50);
      
      // 再扣款 3000
      this.dispatch(depositV2Actions.subtractMoney({ id: itemId, amount: 3000, staffName: '管理員-F' }));
      await this.delay(50);
      
      // 驗證結果
      latestItem = this.getItemById(itemId);
      return this.verifyResult(
        latestItem !== null && latestItem.currentBalance === 7000,
        '場景6: 寄錢加款10000後扣款3000成功，餘額7000',
        `場景6: 餘額計算錯誤（預期7000，實際${latestItem?.currentBalance}）`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景6發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景7: 寄物後領取
  async testScenario7(): Promise<boolean> {
    try {
      const staffName = '管理員-G';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('external');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['item'],
        itemName: '文件袋',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景7: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      // 領取
      this.dispatch(depositV2Actions.retrieveDepositItem({
        id: itemId,
        staffName: '管理員-G',
      }));
      await this.delay(50);
      
      // 驗證領取結果（項目應該從活動列表中移除，但還在store中）
      latestItem = this.getItemById(itemId);
      return this.verifyResult(
        latestItem !== null && latestItem.status === 'retrieved',
        '場景7: 寄物後領取成功（狀態變為已領取）',
        `場景7: 領取失敗，狀態為${latestItem?.status}`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景7發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景8: 寄錢後還原（測試返還金額）
  async testScenario8(): Promise<boolean> {
    try {
      const staffName = '管理員-H';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('resident');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['money'],
        itemName: '臨時押金',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景8: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      // 加款 8000
      this.dispatch(depositV2Actions.addMoney({ id: itemId, amount: 8000, staffName: '管理員-H' }));
      await this.delay(50);
      
      // 還原（應返還8000）
      this.dispatch(depositV2Actions.revertDepositItem({
        id: itemId,
        staffName: '管理員-H',
      }));
      await this.delay(50);
      
      // 驗證結果
      latestItem = this.getItemById(itemId);
      const isReverted = latestItem?.status === 'cancelled' && latestItem?.currentBalance === 0;
      return this.verifyResult(
        isReverted,
        '場景8: 寄錢加款8000後還原成功，餘額返還為0',
        `場景8: 還原失敗，狀態=${latestItem?.status}，餘額=${latestItem?.currentBalance}`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景8發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景9: 三種類型混合
  async testScenario9(): Promise<boolean> {
    try {
      const staffName = '管理員-I';
      const sender = this.createPersonInfo('external');
      const receiver = this.createPersonInfo('resident');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['item', 'money', 'key'],
        itemName: '包裹+押金+門禁卡',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      const latestItem = this.getLatestItem();
      const hasAllTypes = (latestItem?.types.includes('item') && 
                          latestItem?.types.includes('money') && 
                          latestItem?.types.includes('key')) || false;
      return this.verifyResult(
        hasAllTypes,
        '場景9: 同時寄放物品、金額和KEY三種類型成功',
        '場景9: 三種類型項目創建失敗'
      );
    } catch (error) {
      this.testResults.push(`❌ 場景9發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景10: 外人寄給外人（無棟戶資訊）
  async testScenario10(): Promise<boolean> {
    try {
      const staffName = '管理員-J';
      const sender: PersonInfo = { type: 'external', name: '訪客-張三' };
      const receiver: PersonInfo = { type: 'external', name: '訪客-李四' };
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['item'],
        itemName: '快遞包裹',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      const latestItem = this.getLatestItem();
      const noBuildingInfo = !latestItem?.sender.buildingId && !latestItem?.receiver.buildingId;
      return this.verifyResult(
        latestItem !== null && noBuildingInfo,
        '場景10: 訪客間互相寄放成功（無棟戶資訊）',
        '場景10: 無棟戶資訊的項目創建失敗'
      );
    } catch (error) {
      this.testResults.push(`❌ 場景10發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景11: 寄錢多次加款
  async testScenario11(): Promise<boolean> {
    try {
      const staffName = '管理員-K';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('external');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['money'],
        itemName: '多次存款測試',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景11: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      // 連續加款三次
      this.dispatch(depositV2Actions.addMoney({ id: itemId, amount: 1000, staffName: '管理員-K' }));
      await this.delay(30);
      this.dispatch(depositV2Actions.addMoney({ id: itemId, amount: 2000, staffName: '管理員-K' }));
      await this.delay(30);
      this.dispatch(depositV2Actions.addMoney({ id: itemId, amount: 3000, staffName: '管理員-K' }));
      await this.delay(50);
      
      // 驗證結果
      latestItem = this.getItemById(itemId);
      return this.verifyResult(
        latestItem !== null && latestItem.currentBalance === 6000,
        '場景11: 連續加款三次成功（1000+2000+3000=6000）',
        `場景11: 餘額計算錯誤（預期6000，實際${latestItem?.currentBalance}）`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景11發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景12: 寄錢多次扣款
  async testScenario12(): Promise<boolean> {
    try {
      const staffName = '管理員-L';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('external');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['money'],
        itemName: '多次扣款測試',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景12: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      // 先加款 10000
      this.dispatch(depositV2Actions.addMoney({ id: itemId, amount: 10000, staffName: '管理員-L' }));
      await this.delay(50);
      
      // 然後多次扣款
      this.dispatch(depositV2Actions.subtractMoney({ id: itemId, amount: 2000, staffName: '管理員-L' }));
      await this.delay(30);
      this.dispatch(depositV2Actions.subtractMoney({ id: itemId, amount: 1500, staffName: '管理員-L' }));
      await this.delay(50);
      
      // 驗證結果
      latestItem = this.getItemById(itemId);
      return this.verifyResult(
        latestItem !== null && latestItem.currentBalance === 6500,
        '場景12: 多次扣款成功（10000-2000-1500=6500）',
        `場景12: 餘額計算錯誤（預期6500，實際${latestItem?.currentBalance}）`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景12發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景13: 編輯資料
  async testScenario13(): Promise<boolean> {
    try {
      const staffName = '管理員-M';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('external');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['item'],
        itemName: '原始名稱',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景13: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      // 編輯物品名稱
      this.dispatch(depositV2Actions.editDepositItem({
        id: itemId,
        updates: { itemName: '編輯後的名稱' },
        staffName: '管理員-M',
      }));
      await this.delay(50);
      
      // 驗證結果
      latestItem = this.getItemById(itemId);
      return this.verifyResult(
        latestItem !== null && latestItem.itemName === '編輯後的名稱',
        '場景13: 編輯物品名稱成功',
        `場景13: 編輯失敗，名稱仍為${latestItem?.itemName}`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景13發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景14: 寄KEY後領取
  async testScenario14(): Promise<boolean> {
    try {
      const staffName = '管理員-N';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('resident');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['key'],
        itemName: '車位鑰匙',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景14: 無法找到創建的項目');
        return false;
      }
      
      // 領取
      this.dispatch(depositV2Actions.retrieveDepositItem({
        id: latestItem.id,
        staffName: '管理員-N',
      }));
      await this.delay(50);
      
      // 驗證結果
      latestItem = this.getItemById(latestItem.id);
      return this.verifyResult(
        latestItem !== null && latestItem.status === 'retrieved',
        '場景14: 寄KEY後領取成功',
        `場景14: 領取失敗，狀態為${latestItem?.status}`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景14發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景15: 寄物+寄錢+寄KEY 複雜組合
  async testScenario15(): Promise<boolean> {
    try {
      const staffName = '管理員-O';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('external');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['item', 'money', 'key'],
        itemName: '綜合包裹',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景15: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      // 執行各種操作
      this.dispatch(depositV2Actions.addMoney({ id: itemId, amount: 5000, staffName: '管理員-O' }));
      await this.delay(50);
      this.dispatch(depositV2Actions.subtractMoney({ id: itemId, amount: 1000, staffName: '管理員-O' }));
      await this.delay(50);
      
      // 驗證結果
      latestItem = this.getItemById(itemId);
      return this.verifyResult(
        latestItem !== null && latestItem.currentBalance === 4000,
        '場景15: 三種類型組合，加款5000扣款1000成功',
        `場景15: 餘額計算錯誤（預期4000，實際${latestItem?.currentBalance}）`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景15發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景16: 餘額不足扣款被拒絕測試
  async testScenario16(): Promise<boolean> {
    try {
      const staffName = '管理員-P';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('external');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['money'],
        itemName: '餘額不足測試',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景16: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      // 嘗試直接扣款5000（但餘額為0，應該被拒絕）
      this.dispatch(depositV2Actions.subtractMoney({ id: itemId, amount: 5000, staffName: '管理員-P' }));
      await this.delay(50);
      
      // 驗證結果：扣款應該被拒絕，餘額維持0
      latestItem = this.getItemById(itemId);
      const balanceIsZero = latestItem !== null && latestItem.currentBalance === 0;
      const hasErrorLog = latestItem?.logs.some(log => 
        log.action === 'subtract_money' && log.details.includes('餘額不足')
      ) || false;
      
      return this.verifyResult(
        balanceIsZero && hasErrorLog,
        '場景16: 餘額不足時扣款被拒絕成功（餘額維持0，記錄錯誤日誌）',
        `場景16: 扣款限制失效（餘額=${latestItem?.currentBalance}，錯誤記錄=${hasErrorLog}）`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景16發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景17: 餘額檢查與還原流程測試
  async testScenario17(): Promise<boolean> {
    try {
      const staffName = '管理員-Q';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('external');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['money'],
        itemName: '餘額檢查流程測試',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景17: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      // 步驟1: 嘗試扣款3000（餘額為0，應該被拒絕）
      this.dispatch(depositV2Actions.subtractMoney({ id: itemId, amount: 3000, staffName: '管理員-Q' }));
      await this.delay(50);
      
      latestItem = this.getItemById(itemId);
      if (latestItem?.currentBalance !== 0) {
        this.testResults.push(`❌ 場景17: 餘額不足時扣款應該被拒絕，但餘額變為${latestItem?.currentBalance}`);
        return false;
      }
      
      // 步驟2: 加款5000（餘額變為5000）
      this.dispatch(depositV2Actions.addMoney({ id: itemId, amount: 5000, staffName: '管理員-Q' }));
      await this.delay(50);
      
      latestItem = this.getItemById(itemId);
      if (latestItem?.currentBalance !== 5000) {
        this.testResults.push(`❌ 場景17: 加款失敗，餘額=${latestItem?.currentBalance}（預期5000）`);
        return false;
      }
      
      // 步驟3: 再次扣款3000（餘額充足，應該成功，餘額變為2000）
      this.dispatch(depositV2Actions.subtractMoney({ id: itemId, amount: 3000, staffName: '管理員-Q' }));
      await this.delay(50);
      
      latestItem = this.getItemById(itemId);
      if (latestItem?.currentBalance !== 2000) {
        this.testResults.push(`❌ 場景17: 扣款失敗，餘額=${latestItem?.currentBalance}（預期2000）`);
        return false;
      }
      
      // 步驟4: 還原項目（餘額應該歸0）
      this.dispatch(depositV2Actions.revertDepositItem({ id: itemId, staffName: '管理員-Q' }));
      await this.delay(50);
      
      // 驗證最終結果
      latestItem = this.getItemById(itemId);
      return this.verifyResult(
        latestItem !== null && latestItem.status === 'cancelled' && latestItem.currentBalance === 0,
        '場景17: 餘額檢查流程測試成功（拒絕超額扣款→加款→成功扣款→還原歸零）',
        `場景17: 最終驗證失敗，狀態=${latestItem?.status}，餘額=${latestItem?.currentBalance}`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景17發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景18: 大量物品名稱
  async testScenario18(): Promise<boolean> {
    try {
      const staffName = '管理員-R';
      const items = ['筆記本電腦', '行李箱', '文件袋', '雨傘', '運動背包', '相機', '平板電腦'];
      const randomItem = items[Math.floor(Math.random() * items.length)];
      
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo(Math.random() > 0.5 ? 'resident' : 'external');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['item'],
        itemName: randomItem,
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      const latestItem = this.getLatestItem();
      return this.verifyResult(
        latestItem !== null && latestItem.itemName === randomItem,
        `場景18: 寄放${randomItem}成功`,
        `場景18: 寄放${randomItem}失敗`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景18發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景19: 帶備註的複雜案例
  async testScenario19(): Promise<boolean> {
    try {
      const staffName = '管理員-S';
      const sender = this.createPersonInfo('external');
      const receiver = this.createPersonInfo('resident');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['item', 'money'],
        itemName: '裝修押金',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
        notes: '裝修期間押金，預計3個月後退還，需檢查無損壞',
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景19: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      this.dispatch(depositV2Actions.addMoney({ id: itemId, amount: 20000, staffName: '管理員-S' }));
      await this.delay(50);
      
      // 驗證結果
      latestItem = this.getItemById(itemId);
      return this.verifyResult(
        latestItem !== null && latestItem.currentBalance === 20000 && (latestItem.notes?.includes('裝修') || false),
        '場景19: 帶詳細備註的裝修押金20000元成功',
        `場景19: 驗證失敗，餘額=${latestItem?.currentBalance}，備註=${latestItem?.notes}`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景19發生錯誤: ${error}`);
      return false;
    }
  }

  // 場景20: 全部操作後還原
  async testScenario20(): Promise<boolean> {
    try {
      const staffName = '管理員-T';
      const sender = this.createPersonInfo('resident');
      const receiver = this.createPersonInfo('external');
      
      const item: Omit<DepositItemV2, 'id' | 'createdAt' | 'updatedAt' | 'logs'> = {
        types: ['item', 'money', 'key'],
        itemName: '全套測試案例',
        sender,
        receiver,
        depositTime: new Date().toISOString(),
        staffName,
        status: 'active',
        transactions: [],
        currentBalance: 0,
        notes: '這是一個完整的測試案例，包含所有操作後還原',
      };

      this.dispatch(depositV2Actions.addDepositItem(item));
      await this.delay(50);
      
      let latestItem = this.getLatestItem();
      if (!latestItem) {
        this.testResults.push('❌ 場景20: 無法找到創建的項目');
        return false;
      }
      
      const itemId = latestItem.id;
      
      // 執行一連申操作
      this.dispatch(depositV2Actions.addMoney({ id: itemId, amount: 10000, staffName: '管理員-T' }));
      await this.delay(50);
      this.dispatch(depositV2Actions.subtractMoney({ id: itemId, amount: 3000, staffName: '管理員-T' }));
      await this.delay(50);
      this.dispatch(depositV2Actions.addMoney({ id: itemId, amount: 5000, staffName: '管理員-T' }));
      await this.delay(50);
      
      // 計算預期餘額：10000 - 3000 + 5000 = 12000
      const expectedBalance = 12000;
      
      // 驗證操作後餘額
      latestItem = this.getItemById(itemId);
      if (latestItem?.currentBalance !== expectedBalance) {
        this.testResults.push(`❌ 場景20: 操作後餘額不正確（預期${expectedBalance}，實際${latestItem?.currentBalance}）`);
        return false;
      }
      
      // 最後還原
      this.dispatch(depositV2Actions.revertDepositItem({ id: itemId, staffName: '管理員-T' }));
      await this.delay(50);
      
      // 驗證還原結果
      latestItem = this.getItemById(itemId);
      const success = latestItem?.status === 'cancelled' && latestItem?.currentBalance === 0;
      return this.verifyResult(
        success,
        '場景20: 全套操作後還原成功（加10000-3000+5000=12000，還原後返還12000，餘額歸0）',
        `場景20: 還原失敗，狀態=${latestItem?.status}，餘額=${latestItem?.currentBalance}`
      );
    } catch (error) {
      this.testResults.push(`❌ 場景20發生錯誤: ${error}`);
      return false;
    }
  }

  // 清理測試數據
  cleanupTestData(): void {
    // 標記所有測試創建的項目為已取消
    this.createdItemIds.forEach((id) => {
      try {
        this.dispatch(depositV2Actions.revertDepositItem({
          id,
          staffName: '測試清理',
        }));
      } catch (e) {
        // 忽略清理錯誤
      }
    });
    this.createdItemIds = [];
  }

  // 延遲函數
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // 執行所有測試
  async runAllTests(): Promise<string[]> {
    this.testResults = [];
    this.createdItemIds = [];
    
    this.testResults.push('🚀 開始執行20輪寄放系統測試...');
    this.testResults.push(`⏰ 開始時間: ${new Date().toLocaleString()}\n`);
    
    const results: boolean[] = [];
    
    results.push(await this.testScenario1());
    results.push(await this.testScenario2());
    results.push(await this.testScenario3());
    results.push(await this.testScenario4());
    results.push(await this.testScenario5());
    results.push(await this.testScenario6());
    results.push(await this.testScenario7());
    results.push(await this.testScenario8());
    results.push(await this.testScenario9());
    results.push(await this.testScenario10());
    results.push(await this.testScenario11());
    results.push(await this.testScenario12());
    results.push(await this.testScenario13());
    results.push(await this.testScenario14());
    results.push(await this.testScenario15());
    results.push(await this.testScenario16());
    results.push(await this.testScenario17());
    results.push(await this.testScenario18());
    results.push(await this.testScenario19());
    results.push(await this.testScenario20());
    
    const successCount = results.filter((r) => r).length;
    const failCount = results.length - successCount;
    
    this.testResults.push('\n📊 測試結果統計：');
    this.testResults.push(`✅ 通過: ${successCount}/20`);
    this.testResults.push(`❌ 失敗: ${failCount}/20`);
    
    if (failCount === 0) {
      this.testResults.push('\n🎉 所有測試全部通過！');
    } else {
      this.testResults.push('\n⚠️ 部分測試失敗，請檢查上述錯誤訊息');
    }
    
    this.testResults.push(`\n⏰ 結束時間: ${new Date().toLocaleString()}`);
    
    return this.testResults;
  }
}

export default DepositTestSimulator;
