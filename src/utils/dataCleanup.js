/**
 * 資料清理工具 v2.0
 * 用於徹底清理系統中的所有資料（包含 localStorage 和 Redux State）
 * 
 * 使用方法：在瀏覽器控制台中運行 window.runDataCleanup()
 * 
 * 注意：清理後會自動重新整理頁面，以確保資料完全清除
 */

(function DataCleanupTool() {
  'use strict';
  
  console.clear();
  console.log('🔍 資料清理工具 v2.0 啟動...\n');
  console.log('⚠️ 警告：此操作將清除所有資料並重新整理頁面\n');

  const store = window.store;
  if (!store) {
    console.error('❌ 找不到 Redux store');
    alert('錯誤：找不到系統狀態，請確認頁面已正確載入');
    return;
  }

  const dispatch = store.dispatch;
  
  // 顯示當前資料統計
  function showCurrentStats() {
    const state = store.getState();
    const stats = {
      buildings: state.building?.buildings?.length || 0,
      floors: state.building?.floors?.length || 0,
      units: state.building?.units?.length || 0,
      residents: state.resident?.residents?.length || 0,
      parkingSpaces: state.parking?.spaces?.length || 0,
      parkingZones: state.parking?.zones?.length || 0,
      facilities: state.facility?.facilities?.length || 0,
      bookings: state.facility?.bookings?.length || 0,
      calendarEvents: state.calendar?.events?.length || 0,
      feeUnits: state.fee?.units?.length || 0,
      depositItems: state.depositV2?.items?.length || 0,
      iotDevices: state.eventBus?.devices?.length || 0,
      iotEvents: state.eventBus?.events?.length || 0,
    };

    const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0);
    
    console.log('📊 當前資料統計：');
    console.log('  建築:', stats.buildings);
    console.log('  樓層:', stats.floors);
    console.log('  戶別:', stats.units);
    console.log('  住戶:', stats.residents);
    console.log('  車位:', stats.parkingSpaces);
    console.log('  車位分區:', stats.parkingZones);
    console.log('  公設:', stats.facilities);
    console.log('  預約:', stats.bookings);
    console.log('  日曆事件:', stats.calendarEvents);
    console.log('  管理費:', stats.feeUnits);
    console.log('  寄放物品:', stats.depositItems);
    console.log('  IoT裝置:', stats.iotDevices);
    console.log('  IoT事件:', stats.iotEvents);
    console.log('');
    console.log('📦 總記錄數:', totalRecords);
    
    return { stats, totalRecords };
  }

  // 徹底清理所有 localStorage 資料
  function clearAllLocalStorage() {
    console.log('\n🗑️ 正在清除 localStorage...');
    
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        // 清除所有相關的 key
        if (key.includes('redux') || key.includes('persist') || key.includes('backup') || 
            key.includes('civis') || key.includes('state') || key.includes('storage')) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`  ✅ 已清除: ${key}`);
    });
    
    console.log(`  共清除 ${keysToRemove.length} 個 localStorage 項目`);
  }

  // 清理 Redux State
  function clearReduxState() {
    console.log('\n🧹 正在清除 Redux State...');
    
    // 清理建築資料
    dispatch({ type: 'building/clearAllData' });
    console.log('  ✅ 建築資料');
    
    // 清理住戶資料
    dispatch({ type: 'resident/setResidents', payload: [] });
    console.log('  ✅ 住戶資料');
    
    // 清理車位資料
    dispatch({ type: 'parking/initializeSpaces', payload: [] });
    dispatch({ type: 'parking/setZones', payload: [] });
    console.log('  ✅ 車位資料');
    
    // 清理公設資料
    dispatch({ type: 'facility/initializeFacilities', payload: [] });
    dispatch({ type: 'facility/initializeBookings', payload: [] });
    console.log('  ✅ 公設資料');
    
    // 清理日曆資料
    dispatch({ type: 'calendar/clearEvents' });
    console.log('  ✅ 日曆資料');
    
    // 清理管理費資料
    dispatch({ type: 'fee/setFeeUnits', payload: [] });
    dispatch({ type: 'fee/setPeriods', payload: [] });
    console.log('  ✅ 管理費資料');
    
    // 清理寄放資料
    dispatch({ type: 'depositV2/clearAllData' });
    dispatch({ type: 'deposit/initializeItems', payload: [] });
    dispatch({ type: 'deposit/initializeMoneyRecords', payload: [] });
    console.log('  ✅ 寄放資料');
    
    // 清理IoT資料
    dispatch({ type: 'eventBus/setDevices', payload: [] });
    dispatch({ type: 'eventBus/clearEvents' });
    console.log('  ✅ IoT資料');
    
    // 清理其他資料
    dispatch({ type: 'introduction/resetToDefault' });
    console.log('  ✅ 介紹設定');
    
    dispatch({ type: 'config/resetToDefault' });
    console.log('  ✅ 系統設定');
  }

  // 強制同步保存（立即寫入 localStorage）
  function forceSaveEmptyState() {
    console.log('\n💾 正在保存空白狀態...');
    
    // 使用 forcePersist 如果可用
    if (window.forcePersist && typeof window.forcePersist === 'function') {
      try {
        window.forcePersist(store.getState());
        console.log('  ✅ 已強制保存空白狀態');
      } catch (e) {
        console.log('  ⚠️ forcePersist 失敗，使用替代方案');
        saveEmptyStateDirectly();
      }
    } else {
      saveEmptyStateDirectly();
    }
  }

  // 直接保存空白狀態到 localStorage
  function saveEmptyStateDirectly() {
    const emptyState = {
      version: '1.0.0',
      timestamp: Date.now(),
      state: {
        building: {
          buildings: [],
          floors: [],
          units: [],
          parkingSpaces: []
        },
        resident: {
          residents: [],
          statuses: []
        },
        parking: {
          spaces: [],
          areas: [],
          zones: [],
          stats: {
            total: 0, occupied: 0, available: 0, reserved: 0,
            maintenance: 0, residentOccupied: 0, visitorOccupied: 0,
            monthlyRevenue: 0, dailyRevenue: 0
          }
        },
        facility: {
          facilities: [],
          bookings: [],
          stats: {
            totalFacilities: 0, availableFacilities: 0,
            totalBookings: 0, todayBookings: 0
          }
        },
        calendar: {
          events: []
        },
        fee: {
          units: [],
          periods: []
        },
        depositV2: {
          items: []
        },
        eventBus: {
          devices: [],
          events: [],
          isConnected: false
        },
        deposit: {
          items: [],
          totalDeposits: 0
        }
      }
    };
    
    try {
      localStorage.setItem('full-state', JSON.stringify(emptyState));
      console.log('  ✅ 已直接寫入空白狀態到 localStorage');
    } catch (e) {
      console.error('  ❌ 寫入失敗:', e);
    }
  }

  // 主函數：執行清理
  function executeCleanup() {
    const { totalRecords } = showCurrentStats();
    
    if (totalRecords === 0) {
      console.log('\n✅ 系統已經是空白狀態，無需清理');
      alert('系統已經是空白狀態，無需清理');
      return;
    }
    
    const confirmMessage = `確定要清除所有 ${totalRecords} 筆資料嗎？\n\n` +
      '此操作將：\n' +
      '1. 清除所有建築、住戶、車位資料\n' +
      '2. 清除所有預約、日曆、管理費記錄\n' +
      '3. 清除 localStorage 中的所有資料\n' +
      '4. 自動重新整理頁面\n\n' +
      '⚠️ 此操作無法復原！';
    
    if (!confirm(confirmMessage)) {
      console.log('\n❌ 使用者取消清理');
      return;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🚀 開始執行資料清理...');
    console.log('='.repeat(50));
    
    // 步驟 1: 清除 localStorage（先清 storage，避免 rehydrate 干擾）
    clearAllLocalStorage();
    
    // 步驟 2: 清除 Redux State
    clearReduxState();
    
    // 步驟 3: 強制保存空白狀態
    forceSaveEmptyState();
    
    // 步驟 4: 顯示完成訊息
    console.log('\n' + '='.repeat(50));
    console.log('✅ 資料清理完成！');
    console.log('🔄 即將重新整理頁面...');
    console.log('='.repeat(50));
    
    // 步驟 5: 設定標記，表示這是清理後的重新整理
    localStorage.setItem('data_cleanup_completed', Date.now().toString());
    
    // 延遲一下讓 console 輸出完成
    setTimeout(() => {
      alert('✅ 資料清理完成！\n\n即將重新整理頁面...');
      // 步驟 6: 重新整理頁面（最重要的一步！）
      window.location.reload();
    }, 500);
  }

  // 檢查是否是清理後的重新整理
  function checkPostCleanup() {
    if (localStorage.getItem('data_cleanup_completed')) {
      localStorage.removeItem('data_cleanup_completed');
      console.log('\n✅ 資料清理已完成，系統已重置為初始狀態');
      
      // 顯示清理後的統計
      setTimeout(() => {
        const state = store.getState();
        const stats = {
          buildings: state.building?.buildings?.length || 0,
          residents: state.resident?.residents?.length || 0,
          parkingSpaces: state.parking?.spaces?.length || 0,
          facilities: state.facility?.facilities?.length || 0,
          bookings: state.facility?.bookings?.length || 0,
        };
        
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        
        if (total === 0) {
          console.log('✅ 驗證成功：所有資料已清除');
          alert('✅ 資料清理成功！\n\n系統已重置為初始狀態。');
        } else {
          console.log('⚠️ 警告：仍有 ' + total + ' 筆資料殘留');
          console.log('請再次執行清理，或檢查 localStorage');
        }
      }, 1000);
    }
  }

  // 匯出到全域
  window.runDataCleanup = function() {
    executeCleanup();
  };

  // 自動檢查是否是清理後的重新整理
  checkPostCleanup();

  console.log('\n💡 提示: 資料清理工具已就緒');
  console.log('   運行 window.runDataCleanup() 執行徹底清理');
  console.log('   清理後會自動重新整理頁面以確保資料完全清除');

})();
