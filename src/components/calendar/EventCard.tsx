import React from 'react';
import { CalendarEventV2, CalendarStatus } from '../../types/domain';

interface EventCardProps {
  event: CalendarEventV2;
  onEdit?: (event: CalendarEventV2) => void;
  onDelete?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onEdit, onDelete }) => {
  const statusColor = event.status?.color || '#5865F2';
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
      style={{ ['--event-color' as any]: statusColor }}
    >
      <div className="event-card-header">
        <div className="event-card-title">
          <span className="event-card-dot" />
          <h4>{event.title}</h4>
        </div>
        <div className="event-card-tags">
          {isPast && <span className="event-expired-badge">已過期</span>}
          <span className="event-status" style={{ backgroundColor: statusColor }}>
            {event.status?.name || '未設定'}
          </span>
        </div>
      </div>

      {event.content && <p className="event-card-body">{event.content}</p>}

      {event.images && event.images.length > 0 && (
        <div className="event-images">
          {event.images.map((img, index) => (
            <img key={index} src={img} alt={`${event.title} - ${index + 1}`} className="event-image" />
          ))}
        </div>
      )}

      <div className="event-card-footer">
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
    </div>
  );
};

export default EventCard;
