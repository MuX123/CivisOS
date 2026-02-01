import React, { useEffect } from 'react';
import { useCalendarApp, ScheduleXCalendar as ScheduleXComponent } from '@schedule-x/react';
import {
  createViewWeek,
  createViewDay,
  createViewMonthGrid,
} from '@schedule-x/calendar';
import { CalendarEventV2 } from '../../../types/domain';
import '@schedule-x/theme-default/dist/index.css';
import '../../../assets/styles/schedule-x-custom.css';

interface CalendarViewProps {
  events: CalendarEventV2[];
  onEventClick: (event: CalendarEventV2) => void;
  onDateClick?: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onEventClick, onDateClick }) => {
  const isEventPast = (event: CalendarEventV2) => {
    if (event.isPast) return true;
    const compareTime = event.endTime ?? event.startTime;
    return new Date(compareTime).getTime() < Date.now();
  };

  const formatDateForScheduleX = (date: string | Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const scheduleXEvents = events.map(event => {
    let color = event.status?.color || 'var(--calendar-status-community)';
    
    if (isEventPast(event)) {
      color = 'var(--calendar-status-past)';
    }

    return {
      id: event.id,
      title: event.title,
      start: formatDateForScheduleX(event.startTime),
      end: event.endTime ? formatDateForScheduleX(event.endTime) : formatDateForScheduleX(event.startTime),
      description: event.content,
      color: color,
    };
  });

  const calendar = useCalendarApp({
    defaultView: createViewMonthGrid().name,
    views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
    events: scheduleXEvents,
    callbacks: {
      onEventClick(calendarEvent) {
        const originalEvent = events.find(e => e.id === calendarEvent.id);
        if (originalEvent) {
          onEventClick(originalEvent);
        }
      },
      onClickDateTime(dateTime) {
        // dateTime is YYYY-MM-DD HH:mm
        if (onDateClick) {
           onDateClick(dateTime.split(' ')[0]);
        }
      }
    },
  });

  useEffect(() => {
    if (calendar && (calendar as any).eventsService) {
      (calendar as any).eventsService.set(scheduleXEvents);
    }
  }, [events, calendar]);

  return (
    <div className="calendar-container h-full">
      <div className="schedule-x-wrapper h-full">
        <ScheduleXComponent calendarApp={calendar} />
      </div>
    </div>
  );
};

export default CalendarView;
