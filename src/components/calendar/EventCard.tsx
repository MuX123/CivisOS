import React from 'react';
import { CalendarEventV2, CalendarStatus } from '../../types/domain';

interface EventCardProps {
  event: CalendarEventV2;
  onEdit?: (event: CalendarEventV2) => void;
  onDelete?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const statusColor = event.status?.color || '#6366f1';
  const isPast = (() => {
    if (event.isPast) return true;
    const targetTime = event.endTime ?? event.startTime;
    return new Date(targetTime).getTime() < Date.now();
  })();

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`event-card${isPast ? ' is-past' : ''}`}
      style={{ borderLeftColor: isPast ? '#9ca3af' : statusColor }}
    >
      <div className="event-header">
        <h4 className="event-title">{event.title}</h4>
        <div className="flex items-center gap-2">
          {isPast && <span className="event-expired-badge">已過期</span>}
          <span className="event-status" style={{ backgroundColor: statusColor }}>
            {event.status?.name || '未設定'}
          </span>
        </div>
      </div>

      <div className="event-content">
        <p className="event-text">{event.content}</p>
      </div>

      {event.images && event.images.length > 0 && (
        <div className="event-images">
          {event.images.map((img, index) => (
            <img key={index} src={img} alt={`${event.title} - ${index + 1}`} className="event-image" />
          ))}
        </div>
      )}

      <div className="event-time">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{formatDate(event.startTime)}</span>
        {event.endTime && <span> - {formatDate(event.endTime)}</span>}
      </div>

      <div className="event-actions">
        <button className="event-btn edit" onClick={() => onEdit?.(event)}>
          編輯
        </button>
        <button className="event-btn delete" onClick={() => onDelete?.(event.id)}>
          刪除
        </button>
      </div>
    </div>
  );
};

export default EventCard;
