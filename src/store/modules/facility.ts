import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Facility, FacilityBooking, FacilityStats } from '../../types/domain';

interface FacilityState {
  facilities: Facility[];
  bookings: FacilityBooking[];
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
    initializeFacilities: (state, action: PayloadAction<Facility[]>) => {
      state.facilities = action.payload;
      state.loading = false;
    },
    
    initializeBookings: (state, action: PayloadAction<FacilityBooking[]>) => {
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
    
    createBooking: (state, action: PayloadAction<FacilityBooking>) => {
      state.bookings.push(action.payload);
    },
    
    updateBookingStatus: (state, action: PayloadAction<{ id: string; status: string; paymentStatus?: string }>) => {
      const { id, status, paymentStatus } = action.payload;
      const bookingIndex = state.bookings.findIndex(booking => booking.id === id);
      
      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].status = status;
        state.bookings[bookingIndex].updatedAt = new Date();
        
        if (paymentStatus) {
          state.bookings[bookingIndex].paymentStatus = paymentStatus;
        }
      }
    },
    
    approveBooking: (state, action: PayloadAction<string>) => {
      const bookingIndex = state.bookings.findIndex(booking => booking.id === action.payload);
      
      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].status = 'confirmed';
        state.bookings[bookingIndex].updatedAt = new Date();
      }
    },
    
    rejectBooking: (state, action: PayloadAction<string>) => {
      const bookingIndex = state.bookings.findIndex(booking => booking.id === action.payload);
      
      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].status = 'cancelled';
        state.bookings[bookingIndex].updatedAt = new Date();
      }
    },
    
    cancelBooking: (state, action: PayloadAction<string>) => {
      const bookingIndex = state.bookings.findIndex(booking => booking.id === action.payload);
      
      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].status = 'cancelled';
        state.bookings[bookingIndex].paymentStatus = 'refunded';
        state.bookings[bookingIndex].updatedAt = new Date();
      }
    },
    
    completeBooking: (state, action: PayloadAction<string>) => {
      const bookingIndex = state.bookings.findIndex(booking => booking.id === action.payload);
      
      if (bookingIndex !== -1) {
        state.bookings[bookingIndex].status = 'completed';
        state.bookings[bookingIndex].updatedAt = new Date();
      }
    },
    
    deleteBooking: (state, action: PayloadAction<string>) => {
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