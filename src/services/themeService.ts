// src/services/themeService.ts
// 狀態顏色主題服務

import type {
  StatusColorConfig,
  StatusColorCategory,
  ParkingStatusColors,
  CalendarStatusColors,
  UnitStatusColors,
  FacilityBookingStatusColors,
  FacilityPaymentStatusColors,
} from '@/types/statusColor';
import {
  DEFAULT_THEME,
  DEFAULT_PARKING_STATUS_COLORS,
  DEFAULT_CALENDAR_STATUS_COLORS,
  DEFAULT_UNIT_STATUS_COLORS,
  DEFAULT_FACILITY_BOOKING_STATUS_COLORS,
  DEFAULT_FACILITY_PAYMENT_STATUS_COLORS,
} from '@/types/statusColor';

class ThemeService {
  private readonly STORAGE_KEY = 'civisos_status_colors';
  private readonly ACTIVE_CONFIG_KEY = 'civisos_active_color_config';

  /**
   * 生成 CSS 變數字串
   */
  generateCSSVariables(config: StatusColorConfig): string {
    const lines: string[] = [':root {'];

    // 車位狀態顏色
    Object.entries(config.parking).forEach(([key, value]) => {
      lines.push(`  --parking-status-${key}: ${value};`);
    });

    // 行事曆狀態顏色
    Object.entries(config.calendar).forEach(([key, value]) => {
      lines.push(`  --calendar-status-${key}: ${value};`);
    });

    // 房屋狀態顏色
    Object.entries(config.unit).forEach(([key, value]) => {
      lines.push(`  --unit-status-${key}: ${value};`);
    });

    // 公設預約狀態顏色
    Object.entries(config.facilityBooking).forEach(([key, value]) => {
      lines.push(`  --facility-booking-${key}: ${value};`);
    });

    // 公設付款狀態顏色
    Object.entries(config.facilityPayment).forEach(([key, value]) => {
      lines.push(`  --facility-payment-${key}: ${value};`);
    });

    lines.push('}');
    return lines.join('\n');
  }

  /**
   * 注入 CSS 到頁面
   */
  applyTheme(config: StatusColorConfig): void {
    const css = this.generateCSSVariables(config);

    // 移除舊的 style 標籤
    const oldStyle = document.getElementById('status-colors-theme');
    if (oldStyle) {
      oldStyle.remove();
    }

    // 注入新的 CSS
    const style = document.createElement('style');
    style.id = 'status-colors-theme';
    style.textContent = css;
    document.head.appendChild(style);

    // 保存到 localStorage
    this.saveConfig(config);
  }

  /**
   * 保存配置到 localStorage
   */
  private saveConfig(config: StatusColorConfig): void {
    const configs = this.getAllConfigs();
    const existingIndex = configs.findIndex(c => c.id === config.id);

    if (existingIndex !== -1) {
      configs[existingIndex] = config;
    } else {
      configs.push(config);
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
  }

  /**
   * 獲取所有配置
   */
  getAllConfigs(): StatusColorConfig[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  /**
   * 獲取當前啟用的配置
   */
  getActiveConfig(): StatusColorConfig | null {
    const activeId = localStorage.getItem(this.ACTIVE_CONFIG_KEY);
    if (!activeId) {
      return null;
    }

    const configs = this.getAllConfigs();
    return configs.find(c => c.id === activeId) || null;
  }

  /**
   * 設置當前啟用的配置
   */
  setActiveConfig(configId: string): void {
    localStorage.setItem(this.ACTIVE_CONFIG_KEY, configId);
  }

  /**
   * 創建新配置
   */
  createConfig(name: string, baseConfig?: typeof DEFAULT_THEME): StatusColorConfig {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const config: StatusColorConfig = {
      id,
      name,
      isDefault: false,
      parking: baseConfig?.parking || { ...DEFAULT_THEME.parking },
      calendar: baseConfig?.calendar || { ...DEFAULT_THEME.calendar },
      unit: baseConfig?.unit || { ...DEFAULT_THEME.unit },
      facilityBooking: baseConfig?.facilityBooking || { ...DEFAULT_THEME.facilityBooking },
      facilityPayment: baseConfig?.facilityPayment || { ...DEFAULT_THEME.facilityPayment },
      createdAt: now,
      updatedAt: now,
    };

    this.saveConfig(config);
    return config;
  }

  /**
   * 更新配置
   */
  updateConfig(configId: string, updates: Partial<StatusColorConfig>): StatusColorConfig | null {
    const configs = this.getAllConfigs();
    const index = configs.findIndex(c => c.id === configId);

    if (index === -1) {
      return null;
    }

    configs[index] = {
      ...configs[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configs));
    return configs[index];
  }

  /**
   * 刪除配置
   */
  deleteConfig(configId: string): boolean {
    const configs = this.getAllConfigs();
    const filtered = configs.filter(c => c.id !== configId);

    if (filtered.length === configs.length) {
      return false;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));

    // 如果刪除的是當前啟用的配置，清除啟用狀態
    const activeId = localStorage.getItem(this.ACTIVE_CONFIG_KEY);
    if (activeId === configId) {
      localStorage.removeItem(this.ACTIVE_CONFIG_KEY);
    }

    return true;
  }

  /**
   * 更新特定類別的顏色
   */
  updateCategoryColor<K extends StatusColorCategory>(
    configId: string,
    category: K,
    key: string,
    color: string
  ): StatusColorConfig | null {
    const config = this.getAllConfigs().find(c => c.id === configId);
    if (!config) {
      return null;
    }

    const categoryConfig = config[category] as unknown as Record<string, string>;
    if (categoryConfig && typeof categoryConfig === 'object') {
      categoryConfig[key] = color;
    }

    return this.updateConfig(configId, { [category]: categoryConfig });
  }

  /**
   * 獲取顏色 (帶回退)
   */
  getColor(
    category: StatusColorCategory,
    key: string,
    defaultColor: string = '#94a3b8'
  ): string {
    const config = this.getActiveConfig();
    if (!config) {
      return defaultColor;
    }

    const categoryConfig = config[category] as unknown as Record<string, string> | undefined;
    if (!categoryConfig) {
      return defaultColor;
    }

    return categoryConfig[key] || defaultColor;
  }

  /**
   * 匯出配置
   */
  exportConfig(configId: string): string | null {
    const config = this.getAllConfigs().find(c => c.id === configId);
    if (!config) {
      return null;
    }

    return JSON.stringify(config, null, 2);
  }

  /**
   * 匯入配置
   */
  importConfig(jsonString: string): StatusColorConfig | null {
    try {
      const imported = JSON.parse(jsonString);

      // 驗證必要欄位
      if (!imported.parking || !imported.calendar || !imported.unit) {
        throw new Error('無效的配置格式');
      }

      // 生成新 ID 避免衝突
      const config: StatusColorConfig = {
        ...imported,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.saveConfig(config);
      return config;
    } catch {
      return null;
    }
  }

  /**
   * 重置為預設主題
   */
  resetToDefault(): StatusColorConfig {
    const defaultConfig = this.createConfig('預設主題');
    this.setActiveConfig(defaultConfig.id);
    this.applyTheme(defaultConfig);
    return defaultConfig;
  }
}

export const themeService = new ThemeService();
export default themeService;
