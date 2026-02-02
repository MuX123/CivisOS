import { createSlice, PayloadAction } from '@reduxjs/toolkit';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 頁面介紹設定類型
export interface PageIntroduction {
  id: string;
  pageId: string;
  pageName: string;
  title: string;
  content: string;
  updatedAt: string;
}

// 按鈕配置類型
export interface ButtonConfig {
  size: number;
  backgroundColor: string;
  textColor: string;
  opacity: number;
  showBorder: boolean;
  borderColor: string;
  fontSize: string;
  line1: string;
  line2: string;
}

export interface IntroductionState {
  introductions: PageIntroduction[];
  buttonConfig: ButtonConfig;
  loading: boolean;
  error: string | null;
}

// 預設按鈕配置
const defaultButtonConfig: ButtonConfig = {
  size: 40,
  backgroundColor: '#FEE75C',
  textColor: '#000000',
  opacity: 0.7,
  showBorder: false,
  borderColor: '#FEE75C',
  fontSize: '10px',
  line1: '使用',
  line2: '介紹',
};

// 預設的頁面介紹
const defaultIntroductions: PageIntroduction[] = [
  {
    id: 'intro-parking',
    pageId: 'parking',
    pageName: '停車管理',
    title: '停車管理功能介紹',
    content: '即時車位狀態監控與管理系統，提供車位租用、收入統計、分區篩選等功能。',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intro-calendar',
    pageId: 'calendar',
    pageName: '行事曆',
    title: '行事曆功能介紹',
    content: '社區活動與會議管理，支援多視圖切換與事件提醒功能。',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intro-facility',
    pageId: 'facility',
    pageName: '公設預約',
    title: '公設預約功能介紹',
    content: '管理社區公共設施預約，包含審批流程與使用統計。',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intro-resident',
    pageId: 'resident',
    pageName: '住戶管理',
    title: '住戶管理功能介紹',
    content: '住戶資料管理系統，支援多成員家庭與門禁卡管理。',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intro-deposit',
    pageId: 'deposit',
    pageName: '寄放管理',
    title: '寄放管理功能介紹',
    content: '押金與寄放物品管理，提供完整的交易追蹤與退款流程。',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intro-fee',
    pageId: 'fee',
    pageName: '管理費系統',
    title: '管理費系統功能介紹',
    content: '管理費計算與繳費追蹤，支援期數設定與費率調整。',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intro-fee-settings',
    pageId: 'fee-settings',
    pageName: '管理費設定',
    title: '管理費設定功能介紹',
    content: '設定各戶別的管理費率、繳費期數與自訂費用項目。',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intro-building',
    pageId: 'building',
    pageName: '棟數設定',
    title: '棟數設定功能介紹',
    content: '設定社區建築結構，包含棟別、樓層與戶別資訊。',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intro-parking-settings',
    pageId: 'parking-settings',
    pageName: '車位設定',
    title: '車位設定功能介紹',
    content: '設定停車場區域、車位編號與狀態配置。',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intro-data-sync',
    pageId: 'data-sync',
    pageName: '資料同步',
    title: '資料同步功能介紹',
    content: '資料備份、還原與同步設定，確保資料安全性。',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intro-color-config',
    pageId: 'color-config',
    pageName: '顏色設定',
    title: '顏色設定功能介紹',
    content: '自訂系統主題顏色與狀態色彩配置。',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'intro-introduction',
    pageId: 'introduction',
    pageName: '介紹設定',
    title: '介紹設定功能介紹',
    content: '設定各功能頁面的介紹內容，供使用者了解系統功能。',
    updatedAt: new Date().toISOString(),
  },
];

const initialState: IntroductionState = {
  introductions: [...defaultIntroductions],
  buttonConfig: { ...defaultButtonConfig },
  loading: false,
  error: null,
};

const introductionSlice = createSlice({
  name: 'introduction',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<IntroductionState>>) => {
      if (action.payload) {
        Object.assign(state, action.payload);
        // 確保新頁面的預設介紹存在
        defaultIntroductions.forEach((defaultIntro) => {
          const exists = state.introductions.find((i) => i.pageId === defaultIntro.pageId);
          if (!exists) {
            state.introductions.push(defaultIntro);
          }
        });
      }
    },
    
    // 新增介紹
    addIntroduction: (state, action: PayloadAction<Omit<PageIntroduction, 'id' | 'updatedAt'>>) => {
      const newIntroduction: PageIntroduction = {
        ...action.payload,
        id: generateId(),
        updatedAt: new Date().toISOString(),
      };
      state.introductions.push(newIntroduction);
    },
    
    // 更新介紹
    updateIntroduction: (state, action: PayloadAction<{ id: string } & Partial<PageIntroduction>>) => {
      const { id, ...updates } = action.payload;
      const index = state.introductions.findIndex((i) => i.id === id);
      if (index !== -1) {
        state.introductions[index] = {
          ...state.introductions[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    // 更新介紹內容（依據 pageId）
    updateIntroductionByPageId: (state, action: PayloadAction<{ pageId: string; title: string; content: string }>) => {
      const { pageId, title, content } = action.payload;
      const index = state.introductions.findIndex((i) => i.pageId === pageId);
      if (index !== -1) {
        state.introductions[index] = {
          ...state.introductions[index],
          title,
          content,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    
    // 刪除介紹
    deleteIntroduction: (state, action: PayloadAction<string>) => {
      state.introductions = state.introductions.filter((i) => i.id !== action.payload);
    },
    
    // 重設為預設值
    resetToDefault: (state) => {
      state.introductions = [...defaultIntroductions];
    },
    
    // 更新按鈕配置
    updateButtonConfig: (state, action: PayloadAction<Partial<ButtonConfig>>) => {
      state.buttonConfig = {
        ...state.buttonConfig,
        ...action.payload,
      };
    },
    
    // 重設按鈕配置為預設值
    resetButtonConfig: (state) => {
      state.buttonConfig = { ...defaultButtonConfig };
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  rehydrate,
  addIntroduction,
  updateIntroduction,
  updateIntroductionByPageId,
  deleteIntroduction,
  resetToDefault,
  updateButtonConfig,
  resetButtonConfig,
  setLoading,
  setError,
} = introductionSlice.actions;

export const introductionActions = introductionSlice.actions;
export default introductionSlice.reducer;
