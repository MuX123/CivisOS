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
      state.bookings.push(action.payload);
    },

    updateBooking: (state, action: PayloadAction<{ id: string; updates: Partial<FacilityBookingV2> }>) => {
        const { id, updates } = action.payload;
        const index = state.bookings.findIndex(b => b.id === id);
        if (index !== -1) {
            state.bookings[index] = { ...state.bookings[index], ...updates };
        }
    },

    // Specific actions for the requested flow
    // "Past" logic: When Paid -> implied complete/past? 
    // User said: "Past: When data card press Paid button" -> So Paid moves it to "Past" tab? 
    // Or maybe "Past" tab filters by `paymentStatus === 'paid'`?
    // Let's support updating payment status.
    
    setPaymentStatus: (state, action: PayloadAction<{ id: string; status: 'paid' | 'unpaid' }>) => {
        const index = state.bookings.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
            state.bookings[index].paymentStatus = action.payload.status;
            state.bookings[index].updatedAt = new Date().toISOString();
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
