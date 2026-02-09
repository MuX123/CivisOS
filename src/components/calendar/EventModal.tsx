import React, { useState } from 'react';
import { CalendarEventV2, CalendarStatus } from '../../types/domain';

interface EventModalProps {
  event?: CalendarEventV2;
  initialDate?: string;
  statuses: CalendarStatus[];
  onSave: (event: Partial<CalendarEventV2>) => void;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, initialDate, statuses, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<CalendarEventV2>>(
    event || {
      title: '',
      content: '',
      images: [],
      startTime: initialDate || new Date().toISOString(),
      statusId: statuses[0]?.id || '',
    }
  );

  const [newImage, setNewImage] = useState('');

  const handleAddImage = () => {
    if (newImage.trim()) {
      setFormData({
        ...formData,
        images: [...(formData.images || []), newImage.trim()],
      });
      setNewImage('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{event ? '編輯行事曆' : '新增行事曆'}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>標題 *</label>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="輸入行事曆標題"
              required
            />
          </div>

          <div className="form-group">
            <label>狀態</label>
            <select
              value={formData.statusId || ''}
              onChange={(e) => setFormData({ ...formData, statusId: e.target.value })}
            >
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>內容</label>
            <textarea
              value={formData.content || ''}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="輸入行事曆內容"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>圖片網址</label>
            <div className="image-input-row">
              <input
                type="url"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="輸入圖片網址"
              />
              <button type="button" className="btn-add" onClick={handleAddImage}>
                新增
              </button>
            </div>
            {formData.images && formData.images.length > 0 && (
              <div className="image-preview-grid">
                {formData.images.map((img, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={img} alt={`預覽 ${index + 1}`} />
                    <button type="button" className="btn-remove" onClick={() => handleRemoveImage(index)}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>開始時間 *</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="pr-10"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="form-group">
              <label>結束時間</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={formData.endTime ? new Date(formData.endTime).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="pr-10"
                />
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-save">
              儲存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
