import { configureStore } from '@reduxjs/toolkit'
import buildingSlice from './modules/building'
import floorSlice from './modules/floor'
import unitSlice from './modules/unit'
import parkingSlice from './modules/parking'
import residentSlice from './modules/resident'
import facilitySlice from './modules/facility'
import configSlice from './modules/config'
import depositSlice from './modules/deposit'
import calendarSlice from './modules/calendar'
import eventBusSlice from './modules/eventBus'
import authSlice from './modules/auth'
import feeSlice from './modules/fee'
import { createFullPersistence } from './middleware/persistenceMiddleware'
import { errorMonitoringMiddleware } from './middleware/errorMiddleware'

// Initialize persistence
const persistence = createFullPersistence()

// 排除 Serialization 檢查的 action
const ignoredPersistActions = [
  'persist/PERSIST',
  'persist/REHYDRATE',
];

export const store = configureStore({
  reducer: {
    auth: authSlice,
    building: buildingSlice,
    floor: floorSlice,
    unit: unitSlice,
    parking: parkingSlice,
    resident: residentSlice,
    facility: facilitySlice,
    config: configSlice,
    deposit: depositSlice,
    calendar: calendarSlice,
    eventBus: eventBusSlice,
    fee: feeSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略持久化相關 action
        ignoredActions: ignoredPersistActions,
        // 忽略持久化狀態路徑
        ignoredPaths: ['_persist'],
      },
    }).concat(
      // 錯誤監控 Middleware
      errorMonitoringMiddleware,
      // 持久化 Middleware
      persistence.middleware
    ),
  // 開發工具
  devTools: import.meta.env?.DEV,
})

// Export persistence utilities
export const {
  rehydrate,
  clearPersistedState,
  getPersistedState,
  isPersisted,
  forcePersist,
} = persistence

export * from './types'
export type AppDispatch = typeof store.dispatch