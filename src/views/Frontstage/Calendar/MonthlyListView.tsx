import React, { useState } from 'react';
import { CalendarEventV2 } from '../../../types/domain';
import EventCard from '../../../components/calendar/EventCard';
import Button from '../../../components/ui/Button';

interface MonthlyListViewProps {
  events: CalendarEventV2[];
  onEdit: (event: CalendarEventV2) => void;
  onDelete: (id: string) => void;
}

const MonthlyListView: React.FC<MonthlyListViewProps> = ({ events, onEdit, onDelete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.startTime);
    return (
      eventDate.getMonth() === currentDate.getMonth() &&
      eventDate.getFullYear() === currentDate.getFullYear()
    );
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="monthly-list-view">
      <div className="flex justify-between items-center mb-4 bg-[var(--bg-secondary)] p-3 rounded-lg">
        <Button variant="secondary" size="small" onClick={handlePrevMonth}>
          &lt; 上個月
        </Button>
        <h2 className="text-lg font-bold text-[var(--text-normal)]">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </h2>
        <Button variant="secondary" size="small" onClick={handleNextMonth}>
          下個月 &gt;
        </Button>
      </div>

      <div className="events-list space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)]">
            本月沒有行事曆活動
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

export default MonthlyListView;
