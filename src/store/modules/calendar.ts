import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CalendarEvent, CalendarView } from '../../types/domain';

export interface CalendarState {
  events: CalendarEvent[];
  currentView: CalendarView;
  selectedDate: string; // Changed from Date to string
  loading: boolean;
  error: string | null;
}

const initialState: CalendarState = {
  events: [],
  currentView: {
    currentView: 'month',
    currentDate: new Date().toISOString(), // Use ISO string
    selectedEvents: [],
  },
  selectedDate: new Date().toISOString(), // Use ISO string
  loading: false,
  error: null,
};

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<CalendarEvent[]>) => {
      state.events = action.payload;
      state.loading = false;
    },
    addEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.events.push(action.payload);
    },
    updateEvent: (state, action: PayloadAction<{ id: string; updates: Partial<CalendarEvent> }>) => {
      const { id, updates } = action.payload;
      const index = state.events.findIndex(event => event.id === id);

      if (index !== -1) {
        state.events[index] = { ...state.events[index], ...updates };
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter(event => event.id !== action.payload);
    },
    setCurrentView: (state, action: PayloadAction<Partial<CalendarView>>) => {
      state.currentView = { ...state.currentView, ...action.payload };
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      state.currentView.currentDate = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearAllData: (state) => {
      state.events = [];
      state.currentView = {
        currentView: 'month',
        currentDate: new Date().toISOString(),
        selectedEvents: [],
      };
      state.selectedDate = new Date().toISOString();
      state.loading = false;
      state.error = null;
    },
  },
});

export const { setEvents, addEvent, updateEvent, deleteEvent, setCurrentView, setSelectedDate, setLoading, setError, clearAllData } = calendarSlice.actions;

export const calendarActions = calendarSlice.actions;

export default calendarSlice.reducer;