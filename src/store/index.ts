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
import { createFullPersistence } from './middleware/persistenceMiddleware'

// Initialize persistence
const persistence = createFullPersistence()

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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(persistence.middleware),
})

// Export persistence utilities
export const {
  rehydrate,
  clearPersistedState,
  getPersistedState,
  isPersisted,
  forcePersist,
} = persistence

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch