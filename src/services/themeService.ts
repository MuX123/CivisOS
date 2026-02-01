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
  LightModeColors,
  DarkModeColors,
} from '@/types/statusColor';
import {
  DEFAULT_THEME,
  DEFAULT_PARKING_STATUS_COLORS,
  DEFAULT_CALENDAR_STATUS_COLORS,
  DEFAULT_UNIT_STATUS_COLORS,
  DEFAULT_FACILITY_BOOKING_STATUS_COLORS,
  DEFAULT_FACILITY_PAYMENT_STATUS_COLORS,
  DEFAULT_LIGHT_MODE_COLORS,
  DEFAULT_DARK_MODE_COLORS,
} from '@/types/statusColor';

class ThemeService {
  private readonly STORAGE_KEY = 'civisos_status_colors';
  private readonly ACTIVE_CONFIG_KEY = 'civisos_active_color_config';

  /**
   * 生成 CSS 變數字串
   */
  generateCSSVariables(config: StatusColorConfig): string {
    const lines: string[] = [':root {'];

    // 1. 生成狀態顏色變數 (車位、行事曆等)
    const statusCategories = {
      parking: '--parking-status-',
      calendar: '--calendar-status-',
      unit: '--unit-status-',
      facilityBooking: '--facility-booking-',
      facilityPayment: '--facility-payment-',
    };

    Object.entries(statusCategories).forEach(([category, prefix]) => {
      const categoryConfig = config[category as keyof StatusColorConfig] as unknown as Record<string, string>;
      if (categoryConfig && typeof categoryConfig === 'object') {
        Object.entries(categoryConfig).forEach(([key, value]) => {
          if (typeof value === 'string') {
            lines.push(`  ${prefix}${key}: ${value};`);
          }
        });
      }
    });
    lines.push('}');

    // 2. 生成 UI 主題變數 (Light/Dark Mode)
    // 輔助函數：將 camelCase 轉換為 kebab-case CSS 變數名
    // 例如: bgPrimary -> --bg-primary, textNormal -> --text-normal
    const mapToCssVar = (key: string): string => {
      // 特殊映射
      const mapping: Record<string, string> = {
        brandPrimary: '--brand-experiment',
        brandHover: '--brand-experiment-hover',
        brandLight: '--brand-experiment-light',
        success: '--color-success',
        warning: '--color-warning',
        danger: '--color-danger',
        info: '--color-info',
        border: '--color-border',
        borderLight: '--color-border-light',
      };
      
      if (mapping[key]) return mapping[key];
      
      // 預設轉換 (camelCase to kebab-case)
      return '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
    };

    const generateModeCss = (selector: string, modeConfig: Record<string, string>) => {
      const modeLines = [`${selector} {`];
      Object.entries(modeConfig).forEach(([key, value]) => {
        // 跳過非字串值或舊的兼容欄位
        if (typeof value !== 'string' || ['dataBg', 'cardBg', 'cardBorder', 'text', 'hoverBg'].includes(key)) return;
        
        const cssVar = mapToCssVar(key);
        modeLines.push(`  ${cssVar}: ${value};`);

        // 特殊處理: textNormal 需要設置到全局變數 (如果需要覆蓋)
        // 注意: 這裡我們將所有變數都生成到對應的主題 class 下
      });

      // 為了兼容性，生成舊變數
      if (selector.includes('light-theme')) {
         modeLines.push(`  --light-mode-windowBg: ${modeConfig.bgCard || '#ffffff'};`);
         modeLines.push(`  --light-mode-menuBg: ${modeConfig.bgSecondary || '#ffffff'};`);
         modeLines.push(`  --light-mode-menuText: ${modeConfig.textNormal || '#1e3a8a'};`);
         modeLines.push(`  --light-mode-menuHoverBg: ${modeConfig.bgHover || '#eff6ff'};`);
      } else {
         modeLines.push(`  --dark-mode-cardBg: ${modeConfig.bgCard || '#2f3136'};`);
         modeLines.push(`  --dark-mode-cardBorder: ${modeConfig.border || '#202225'};`);
         modeLines.push(`  --dark-mode-text: ${modeConfig.textNormal || '#FFFFFF'};`);
         modeLines.push(`  --dark-mode-hoverBg: ${modeConfig.bgHover || '#36393f'};`);
      }

      modeLines.push('}');
      return modeLines.join('\n');
    };

    // 生成明亮模式 CSS (.light-theme 和 :root)
    // 我們將明亮模式作為預設值放在 :root，但也明確定義 .light-theme
    const lightModeCss = generateModeCss('.light-theme, :root', config.lightMode as unknown as Record<string, string>);
    
    // 生成深色模式 CSS (.dark-theme)
    const darkModeCss = generateModeCss('.dark-theme', config.darkMode as unknown as Record<string, string>);

    return lines.join('\n') + '\n' + lightModeCss + '\n' + darkModeCss;
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
      lightMode: baseConfig?.lightMode || { ...DEFAULT_THEME.lightMode },
      darkMode: baseConfig?.darkMode || { ...DEFAULT_THEME.darkMode },
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
