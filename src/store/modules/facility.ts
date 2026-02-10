import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Facility, FacilityBookingV2, FacilityStats } from '../../types/domain';

// Use FacilityBookingV2 which corresponds to "FacilityBooking" in user request context
// But wait, existing code used FacilityBooking (V1). 
// The user request implies new fields: Staff, Resident vs Other, etc.
// These match FacilityBookingV2 in domain.ts which I saw earlier!

export interface FacilityState {
  facilities: Facility[];
  bookings: FacilityBookingV2[];
  stats: FacilityStats;
  loading: boolean;
  error: string | null;
}

const initialState: FacilityState = {
  facilities: [],
  bookings: [],
  stats: {
    totalFacilities: 0,
    availableFacilities: 0,
    totalBookings: 0,
    todayBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    averageUtilizationRate: 0,
  },
  loading: false,
  error: null,
};

const facilitySlice = createSlice({
  name: 'facility',
  initialState,
  reducers: {
    rehydrate: (state, action: PayloadAction<Partial<FacilityState>>) => {
      return { ...state, ...action.payload, loading: false, error: null };
    },
    initializeFacilities: (state, action: PayloadAction<Facility[]>) => {
      state.facilities = action.payload;
      state.loading = false;
    },

    initializeBookings: (state, action: PayloadAction<FacilityBookingV2[]>) => {
      state.bookings = action.payload;
    },

    addFacility: (state, action: PayloadAction<Facility>) => {
      state.facilities.push(action.payload);
    },

    updateFacility: (state, action: PayloadAction<{ id: string; updates: Partial<Facility> }>) => {
      const { id, updates } = action.payload;
      const facilityIndex = state.facilities.findIndex(facility => facility.id === id);

      if (facilityIndex !== -1) {
        state.facilities[facilityIndex] = { ...state.facilities[facilityIndex], ...updates };
      }
    },

    deleteFacility: (state, action: PayloadAction<string>) => {
      state.facilities = state.facilities.filter(facility => facility.id !== action.payload);
    },

    createBooking: (state, action: PayloadAction<FacilityBookingV2>) => {
      const { facilityId, startTime, endTime, bookingDate } = action.payload;

      // 修復 HIGH-08: 檢查時間衝突
      const hasConflict = state.bookings.some(booking => {
        // 只檢查同一設施、同一日期、非取消/刪除狀態的預約
        if (
          booking.facilityId !== facilityId ||
          booking.bookingDate !== bookingDate ||
          booking.bookingStatus === 'cancelled' ||
          booking.bookingStatus === 'deleted'
        ) {
          return false;
        }

        // 檢查時間區間是否重疊
        // 情況1: 新預約開始時間在現有預約時間內
        // 情況2: 新預約結束時間在現有預約時間內
        // 情況3: 新預約完全包含現有預約
        return (
          (startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (startTime <= booking.startTime && endTime >= booking.endTime)
        );
      });

      if (hasConflict) {
        console.error(`[Facility] 預約時間衝突: 設施 ${facilityId} 在 ${bookingDate} ${startTime}-${endTime} 已被預約`);
        state.error = `預約失敗: 該時段已被預約`;
        return;
      }

      state.bookings.push(action.payload);
      state.error = null;
    },

    updateBooking: (state, action: PayloadAction<{ id: string; updates: Partial<FacilityBookingV2> }>) => {
      const { id, updates } = action.payload;
      const index = state.bookings.findIndex(b => b.id === id);
      if (index !== -1) {
        const booking = state.bookings[index];

        // 修復 MEDIUM-10: 防止軟刪除或取消後修改資料
        if (booking.bookingStatus === 'cancelled' || booking.bookingStatus === 'deleted') {
          console.error(`[Facility] 無法修改預約 ${id}: 狀態為 ${booking.bookingStatus}`);
          state.error = `無法修改：預約已${booking.bookingStatus === 'cancelled' ? '取消' : '刪除'}。`;
          return;
        }

        state.bookings[index] = { ...state.bookings[index], ...updates };
        state.bookings[index].updatedAt = new Date().toISOString();
        state.error = null;
      }
    },

    // Specific actions for the requested flow
    // "Past" logic: When Paid -> implied complete/past? 
    // User said: "Past: When data card press Paid button" -> So Paid moves it to "Past" tab? 
    // Or maybe "Past" tab filters by `paymentStatus === 'paid'`?
    // Let's support updating payment status.

    // 修復 HIGH-09: 添加付款狀態驗證
    setPaymentStatus: (state, action: PayloadAction<{ id: string; status: 'paid' | 'unpaid' }>) => {
      const index = state.bookings.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        const booking = state.bookings[index];

        // 只允許 confirmed 狀態的預約更新付款狀態
        if (booking.bookingStatus !== 'confirmed') {
          console.error(`[Facility] 無法更新付款狀態: 預約狀態為 ${booking.bookingStatus}`);
          state.error = `無法更新付款狀態: 預約已${booking.bookingStatus === 'cancelled' ? '取消' : '刪除'}`;
          return;
        }

        state.bookings[index].paymentStatus = action.payload.status;
        state.bookings[index].updatedAt = new Date().toISOString();
        state.error = null;
      }
    },

    // "Cancel": Press Cancel button -> Moves to Cancelled
    cancelBooking: (state, action: PayloadAction<string>) => {
      const bookingIndex = state.bookings.findIndex(booking => booking.id === action.payload);
      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].bookingStatus = 'cancelled';
        state.bookings[bookingIndex].updatedAt = new Date().toISOString();
      }
    },

    // "Delete": Press Delete button -> Moves to Deleted (soft delete? or separate status?)
    // User said: "Delete: Press Delete button -> Data moves to Deleted"
    // So we need a 'deleted' status. FacilityBookingV2 has 'confirmed' | 'cancelled' | 'deleted'.
    softDeleteBooking: (state, action: PayloadAction<string>) => {
      const bookingIndex = state.bookings.findIndex(booking => booking.id === action.payload);
      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].bookingStatus = 'deleted';
        state.bookings[bookingIndex].updatedAt = new Date().toISOString();
      }
    },

    // Hard delete if needed
    deleteBookingPermanent: (state, action: PayloadAction<string>) => {
      state.bookings = state.bookings.filter(booking => booking.id !== action.payload);
    },

    updateStats: (state, action: PayloadAction<Partial<FacilityStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const facilityActions = facilitySlice.actions;

export default facilitySlice.reducer;
