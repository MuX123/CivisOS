import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  updateStatusConfig,
  resetStatusConfig,
  addStatusConfig,
  deleteStatusConfig
} from '../../store/modules/config';
import { StatusConfig, StatusConfigType } from '../../types/domain';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '@/components/ui/Button';
import { themeService } from '../../services/themeService';
import { DEFAULT_THEME, ThemeUIColors } from '../../types/statusColor';

interface ColorConfigPanelProps {
  onClose?: () => void;
}

// 書籤類型
type MainTab = 'status' | 'website';
type WebsiteSubTab = 'light' | 'dark';

// 顏色說明對照表
const COLOR_DESCRIPTIONS: Record<string, string> = {
  // 背景色
  bgPrimary: '應用程式的最底層背景，通常是頁面的整體背景顏色。',
  bgSecondary: '次要背景區域，通常用於側邊欄、導航列或區塊背景。',
  bgTertiary: '內容區域背景，通常是主要操作區域的底色。',
  bgCard: '卡片、區塊或獨立內容單元的背景顏色。',
  bgFloating: '懸浮元素（如下拉選單、彈出視窗、Tooltip）的背景顏色。',
  bgHover: '鼠標懸停在可互動元素（如列表項、按鈕）上時的背景顏色。',
  bgActive: '元素被點擊或處於活動狀態時的背景顏色。',
  
  // 文字顏色
  textNormal: '頁面中最主要的文字顏色，用於大多數內容。',
  textMuted: '次要文字顏色，用於說明、提示或較不重要的資訊。',
  textHeader: '標題文字顏色，用於各級標題，通常對比度較高。',
  
  // 品牌色
  brandPrimary: '主要品牌識別色，用於主要按鈕、連結和強調元素。',
  brandHover: '主要品牌色在鼠標懸停時的顏色變化。',
  brandLight: '品牌色的淺色變體，用於背景著色或輕微強調。',
  
  // 功能色
  success: '表示成功、完成或正向狀態的顏色（如綠色）。',
  warning: '表示警告、注意或進行中狀態的顏色（如橙色）。',
  danger: '表示錯誤、危險或失敗狀態的顏色（如紅色）。',
  info: '表示一般資訊或提示狀態的顏色（如藍色）。',
  
  // 邊框
  border: '一般邊框顏色，用於分隔線、輸入框邊緣等。',
  borderLight: '較淺的邊框顏色，用於細微的分隔或層次區分。'
};

// 顏色分組定義
const WEBSITE_COLOR_GROUPS = [
  {
    id: 'backgrounds',
    title: '背景顏色 (Backgrounds)',
    keys: ['bgPrimary', 'bgSecondary', 'bgTertiary', 'bgCard', 'bgFloating', 'bgHover', 'bgActive']
  },
  {
    id: 'typography',
    title: '文字顏色 (Typography)',
    keys: ['textNormal', 'textMuted', 'textHeader']
  },
  {
    id: 'brand',
    title: '品牌色彩 (Brand)',
    keys: ['brandPrimary', 'brandHover', 'brandLight']
  },
  {
    id: 'functional',
    title: '功能狀態 (Functional)',
    keys: ['success', 'warning', 'danger', 'info']
  },
  {
    id: 'borders',
    title: '邊框 (Borders)',
    keys: ['border', 'borderLight']
  }
];

const ColorConfigPanel: React.FC<ColorConfigPanelProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  
  // 狀態設定
  const parkingStatuses = useAppSelector((state: any) => state.config.parkingStatuses) as StatusConfig[];
  const calendarStatuses = useAppSelector((state: any) => state.config.calendarStatuses) as StatusConfig[];
  const houseStatuses = useAppSelector((state: any) => state.config.houseStatuses) as StatusConfig[];
  
  // 網站顏色設定
  const lightModeColors = useAppSelector((state: any) => state.config.lightModeColors) as StatusConfig[];
  const darkModeColors = useAppSelector((state: any) => state.config.darkModeColors) as StatusConfig[];
  
  // 書籤狀態
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('status');
  const [activeWebsiteSubTab, setActiveWebsiteSubTab] = useState<WebsiteSubTab>('light');

  // 說明彈窗狀態
  const [explanation, setExplanation] = useState<{ title: string; content: string; x: number; y: number } | null>(null);

  // 當狀態顏色變化時，重新應用 CSS 變量
  useEffect(() => {
    const config = themeService.getActiveConfig();
    if (!config) return;

    // 輔助函數：將 StatusConfig[] 轉換為鍵值對物件
    const reduceColors = (colors: StatusConfig[]) => {
      return colors.reduce((acc, curr) => {
        acc[curr.id] = curr.color;
        return acc;
      }, {} as Record<string, string>);
    };

    const lightConfig = reduceColors(lightModeColors);
    const darkConfig = reduceColors(darkModeColors);

    // 將 Redux store 中的顏色轉換為 StatusColorConfig 格式
    const updatedConfig = {
      ...config,
      parking: {
        available: parkingStatuses.find(s => s.name === '可租用')?.color || DEFAULT_THEME.parking.available,
        occupied: parkingStatuses.find(s => s.name === '已佔用')?.color || DEFAULT_THEME.parking.occupied,
        reserved: parkingStatuses.find(s => s.name === '保留')?.color || DEFAULT_THEME.parking.reserved,
        maintenance: parkingStatuses.find(s => s.name === '維護中')?.color || DEFAULT_THEME.parking.maintenance,
        rented: parkingStatuses.find(s => s.name === '已出租')?.color || DEFAULT_THEME.parking.rented,
      },
      calendar: {
        community: calendarStatuses.find(s => s.name === '一般')?.color || DEFAULT_THEME.calendar.community,
        maintenance: calendarStatuses.find(s => s.name === '重要')?.color || DEFAULT_THEME.calendar.maintenance,
        security: calendarStatuses.find(s => s.name === '緊急')?.color || DEFAULT_THEME.calendar.security,
        celebration: calendarStatuses.find(s => s.name === '完成')?.color || DEFAULT_THEME.calendar.celebration,
        meeting: calendarStatuses.find(s => s.name === '會議')?.color || DEFAULT_THEME.calendar.meeting,
        reminder: calendarStatuses.find(s => s.name === '提醒')?.color || DEFAULT_THEME.calendar.reminder,
      },
      unit: {
        occupied: houseStatuses.find(s => s.name === '已入住')?.color || DEFAULT_THEME.unit.occupied,
        vacant: houseStatuses.find(s => s.name === '空屋')?.color || DEFAULT_THEME.unit.vacant,
        maintenance: houseStatuses.find(s => s.name === '裝修中')?.color || DEFAULT_THEME.unit.maintenance,
        pending: houseStatuses.find(s => s.name === '待處理')?.color || DEFAULT_THEME.unit.pending,
      },
      // 直接展開所有 UI 顏色設定
      lightMode: {
        ...DEFAULT_THEME.lightMode,
        ...lightConfig,
      },
      darkMode: {
        ...DEFAULT_THEME.darkMode,
        ...darkConfig,
      },
    };

    themeService.applyTheme(updatedConfig);
  }, [parkingStatuses, calendarStatuses, houseStatuses, lightModeColors, darkModeColors]);

  const updateStatus = (type: StatusConfigType, id: string, color: string) => {
    dispatch(updateStatusConfig({ type, id, color }));
  };

  const handleAddStatus = (type: StatusConfigType) => {
    const name = prompt('請輸入狀態名稱:');
    if (name) {
      dispatch(addStatusConfig({ type, name, color: '#000000' }));
    }
  };

  const handleDeleteStatus = (type: StatusConfigType, id: string) => {
    if (confirm('確定要刪除此狀態嗎？')) {
      dispatch(deleteStatusConfig({ type, id }));
    }
  };

  const handleShowExplanation = (e: React.MouseEvent, title: string, id: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const description = COLOR_DESCRIPTIONS[id] || '暫無說明';
    setExplanation({
      title,
      content: description,
      x: rect.left + window.scrollX,
      y: rect.bottom + window.scrollY + 5
    });
  };

  // 關閉說明彈窗
  useEffect(() => {
    const handleClickOutside = () => setExplanation(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // 顏色列元件
  const ColorRow: React.FC<{
    type: StatusConfigType;
    status: StatusConfig;
    onChange: (color: string) => void;
    onDelete?: () => void;
    showHelp?: boolean;
  }> = ({ status, onChange, onDelete, showHelp }) => (
    <div className="flex items-center justify-between p-3 border-b hover:bg-[var(--bg-hover)] last:border-b-0 transition-colors">
      <div className="flex items-center gap-3">
        <div 
          className="w-6 h-6 rounded border shadow-sm"
          style={{ backgroundColor: status.color }}
        ></div>
        <span className="font-medium text-[var(--text-normal)]">{status.name}</span>
        {showHelp && (
          <button 
            className="text-[var(--text-muted)] hover:text-[var(--text-normal)] transition-colors rounded-full w-5 h-5 flex items-center justify-center border border-[var(--color-border)] text-xs"
            onClick={(e) => handleShowExplanation(e, status.name, status.id)}
            title="查看說明"
          >
            ?
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input 
          type="color" 
          value={status.color} 
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
        />
        {onDelete && (
          <button 
            onClick={onDelete}
            className="p-1 text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] rounded transition-colors"
            title="刪除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  // 區塊元件
  const Section: React.FC<{ 
    title: string; 
    children: React.ReactNode; 
    onReset: () => void;
    onAdd?: () => void;
  }> = ({ title, children, onReset, onAdd }) => (
    <Card className="mb-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          {onAdd && (
            <Button onClick={onAdd} variant="primary" size="small">
              + 新增
            </Button>
          )}
          <Button onClick={onReset} variant="secondary" size="small">
            恢復預設
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-100">
          {children}
        </div>
      </CardContent>
    </Card>
  );

  // 主書籤按鈕
  const MainTabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    label: string;
  }> = ({ active, onClick, label }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium transition-all ${
        active 
          ? 'border-b-2 border-[var(--brand-experiment)] text-[var(--brand-experiment)]' 
          : 'text-[var(--text-muted)] hover:text-[var(--text-normal)]'
      }`}
    >
      {label}
    </button>
  );

  // 子書籤按鈕
  const SubTabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    label: string;
    icon?: React.ReactNode;
  }> = ({ active, onClick, label, icon }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        active 
          ? 'bg-[var(--brand-experiment)] text-white' 
          : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-normal)]'
      }`}
    >
      {icon}
    </button>
  );

  // 渲染狀態設定內容
  const renderStatusContent = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 車位狀態 */}
      <Section 
        title="車位狀態" 
        onReset={() => dispatch(resetStatusConfig('parking'))}
        onAdd={() => handleAddStatus('parking')}
      >
        {parkingStatuses.map(status => (
          <ColorRow
            key={status.id}
            type="parking"
            status={status}
            onChange={(color) => updateStatus('parking', status.id, color)}
            onDelete={() => handleDeleteStatus('parking', status.id)}
          />
        ))}
      </Section>
      
      {/* 行事曆狀態 */}
      <Section 
        title="行事曆狀態"
        onReset={() => dispatch(resetStatusConfig('calendar'))}
        onAdd={() => handleAddStatus('calendar')}
      >
        {calendarStatuses.map(status => (
          <ColorRow
            key={status.id}
            type="calendar"
            status={status}
            onChange={(color) => updateStatus('calendar', status.id, color)}
            onDelete={() => handleDeleteStatus('calendar', status.id)}
          />
        ))}
      </Section>
      
      {/* 房屋狀態 */}
      <Section 
        title="房屋狀態"
        onReset={() => dispatch(resetStatusConfig('house'))}
        onAdd={() => handleAddStatus('house')}
      >
        {houseStatuses.map(status => (
          <ColorRow
            key={status.id}
            type="house"
            status={status}
            onChange={(color) => updateStatus('house', status.id, color)}
            onDelete={() => handleDeleteStatus('house', status.id)}
          />
        ))}
      </Section>
    </div>
  );

  // 渲染網站顏色設定內容 (分組顯示)
  const renderWebsiteContent = () => {
    const currentMode = activeWebsiteSubTab;
    const currentColors = currentMode === 'light' ? lightModeColors : darkModeColors;
    const type = currentMode === 'light' ? 'lightMode' : 'darkMode';

    return (
      <div>
        {/* 子書籤：明亮主題 / 黑暗主題 */}
        <div className="flex gap-4 mb-6">
          <SubTabButton
            active={activeWebsiteSubTab === 'light'}
            onClick={() => setActiveWebsiteSubTab('light')}
            label="☀️ 明亮主題"
          />
          <SubTabButton
            active={activeWebsiteSubTab === 'dark'}
            onClick={() => setActiveWebsiteSubTab('dark')}
            label="🌙 黑暗主題"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WEBSITE_COLOR_GROUPS.map(group => {
            // 篩選屬於當前群組的顏色設定
            const groupColors = currentColors.filter(c => group.keys.includes(c.id));
            if (groupColors.length === 0) return null;

            return (
              <Section 
                key={group.id}
                title={group.title}
                onReset={() => dispatch(resetStatusConfig(type))}
              >
                {groupColors.map(status => (
                  <ColorRow
                    key={status.id}
                    type={type}
                    status={status}
                    onChange={(color) => updateStatus(type, status.id, color)}
                    showHelp={true}
                  />
                ))}
              </Section>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="color-config-panel p-6 max-w-7xl mx-auto relative">
      {/* 標題 */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-[var(--text-normal)]">顏色狀態設定</h2>
        {onClose && (
          <Button onClick={onClose} variant="secondary" size="small">
            ✕
          </Button>
        )}
      </div>
      
      {/* 主書籤：狀態設定 | 網站顏色設定 */}
      <div className="flex border-b border-[var(--color-border)] mb-6">
        <MainTabButton
          active={activeMainTab === 'status'}
          onClick={() => setActiveMainTab('status')}
          label="📋 狀態設定"
        />
        <MainTabButton
          active={activeMainTab === 'website'}
          onClick={() => setActiveMainTab('website')}
          label="🎨 網站顏色設定"
        />
      </div>

      {/* 內容區域 */}
      <div className="panel-content">
        {activeMainTab === 'status' && renderStatusContent()}
        {activeMainTab === 'website' && renderWebsiteContent()}
      </div>

      {/* 說明彈窗 */}
      {explanation && (
        <div 
          className="fixed z-50 bg-[var(--bg-floating)] border border-[var(--color-border)] shadow-xl rounded-lg p-4 w-64 text-sm animate-in fade-in zoom-in-95 duration-200"
          style={{ 
            top: explanation.y, 
            left: explanation.x,
            transform: 'translateX(-50%)' // 居中對齊
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="font-bold mb-2 text-[var(--brand-experiment)]">{explanation.title}</h4>
          <p className="text-[var(--text-normal)] leading-relaxed">{explanation.content}</p>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[var(--bg-floating)] border-l border-t border-[var(--color-border)] rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default ColorConfigPanel;