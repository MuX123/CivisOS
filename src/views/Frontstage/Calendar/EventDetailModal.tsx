import React from 'react';
import { CalendarEventV2 } from '../../../types/domain';
import Button from '../../../components/ui/Button';

interface EventDetailModalProps {
  event: CalendarEventV2;
  onClose: () => void;
  onEdit: (event: CalendarEventV2) => void;
  onDelete: (id: string) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[var(--bg-floating)] rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-[var(--color-border)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Status Color */}
        <div 
          className="h-2 w-full"
          style={{ backgroundColor: event.status?.color || '#5865F2' }}
        />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-[var(--text-normal)]">{event.title}</h2>
            <button 
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-normal)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <span 
                className="inline-block px-2 py-1 rounded text-xs font-medium text-white mb-2"
                style={{ backgroundColor: event.status?.color || '#5865F2' }}
              >
                {event.status?.name || '未分類'}
              </span>
            </div>

            <div className="flex items-center text-[var(--text-muted)] text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{formatDate(event.startTime)}</span>
              {event.endTime && (
                <>
                  <span className="mx-1">-</span>
                  <span>{formatDate(event.endTime)}</span>
                </>
              )}
            </div>

            <div className="text-[var(--text-normal)] whitespace-pre-wrap">
              {event.content}
            </div>

            {event.images && event.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {event.images.map((img, idx) => (
                  <img 
                    key={idx} 
                    src={img} 
                    alt={`Event attachment ${idx + 1}`} 
                    className="rounded-lg object-cover w-full h-32 border border-[var(--color-border)]"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--color-border)]">
            <Button
              variant="danger"
              size="small"
              onClick={() => {
                if (confirm('確定要刪除此行事曆嗎？')) {
                  onDelete(event.id);
                  onClose();
                }
              }}
            >
              刪除
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={() => {
                onEdit(event);
                onClose(); // Close detail modal, parent will open edit modal
              }}
            >
              編輯
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailModal;
