import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CalendarEvent, CalendarView } from '../types/domain';

interface CalendarState {
  events: CalendarEvent[];
  currentView: CalendarView;
  selectedDate: Date;
  loading: boolean;
  error: string | null;
}

const initialState: CalendarState = {
  events: [],
  currentView: {
    currentView: 'month',
    currentDate: new Date(),
    selectedEvents: [],
  },
  selectedDate: new Date(),
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
    setSelectedDate: (state, action: PayloadAction<Date>) => {
      state.selectedDate = action.payload;
      state.currentView.currentDate = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setEvents, addEvent, updateEvent, deleteEvent, setCurrentView, setSelectedDate, setLoading, setError } = calendarSlice.actions;

export const calendarActions = calendarSlice.actions;

export default calendarSlice.reducer;