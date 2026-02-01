import React, { useState } from 'react';
import { CalendarEventV2 } from '../../../types/domain';
import EventCard from '../../../components/calendar/EventCard';
import Button from '../../../components/ui/Button';

interface HistoryListViewProps {
  events: CalendarEventV2[];
  onEdit: (event: CalendarEventV2) => void;
  onDelete: (id: string) => void;
}

const HistoryListView: React.FC<HistoryListViewProps> = ({ events, onEdit, onDelete }) => {
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isEventPast = (event: CalendarEventV2) => {
    if (event.isPast) return true;
    const compareTime = event.endTime ?? event.startTime;
    return new Date(compareTime).getTime() < Date.now();
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    const isSameMonth = eventDate.getMonth() === currentDate.getMonth() &&
                        eventDate.getFullYear() === currentDate.getFullYear();
    return isSameMonth && isEventPast(event);
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="history-list-view">
      <div className="flex justify-between items-center mb-4 bg-[var(--bg-secondary)] p-3 rounded-lg">
        <Button variant="secondary" size="small" onClick={handlePrevMonth}>
          &lt; 上個月
        </Button>
        <h2 className="text-lg font-bold text-[var(--text-normal)]">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月 (歷史紀錄)
        </h2>
        <Button variant="secondary" size="small" onClick={handleNextMonth}>
          下個月 &gt;
        </Button>
      </div>

      <div className="events-list space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            本月沒有歷史紀錄
          </div>
        ) : (
          filteredEvents.map(event => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryListView;
