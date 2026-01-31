import React, { useState } from 'react';
import { FacilityBookingV2, Facility } from '../../types/domain';

interface BookingModalProps {
  booking?: FacilityBookingV2;
  facilities: Facility[];
  onSave: (booking: Partial<FacilityBookingV2>) => void;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  booking,
  facilities,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<FacilityBookingV2>>(
    booking || {
      facilityId: facilities[0]?.id || '',
      bookingType: 'resident',
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      staffName: '',
      paymentStatus: 'unpaid',
      bookingStatus: 'confirmed',
    }
  );

  const [otherFields, setOtherFields] = useState({
    residentName: booking?.residentName || '',
    otherName: booking?.otherName || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      residentName: otherFields.residentName,
      otherName: otherFields.otherName,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{booking ? '編輯預約' : '新增預約'}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>公設項目 *</label>
            <select
              value={formData.facilityId || ''}
              onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
              required
            >
              <option value="">請選擇公設</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>租借人類型 *</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="bookingType"
                  value="resident"
                  checked={formData.bookingType === 'resident'}
                  onChange={() => setFormData({ ...formData, bookingType: 'resident' })}
                />
                <span>住戶</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="bookingType"
                  value="other"
                  checked={formData.bookingType === 'other'}
                  onChange={() => setFormData({ ...formData, bookingType: 'other' })}
                />
                <span>其他</span>
              </label>
            </div>
          </div>

          {formData.bookingType === 'resident' ? (
            <div className="form-group">
              <label>住戶姓名 *</label>
              <input
                type="text"
                value={otherFields.residentName}
                onChange={(e) => setOtherFields({ ...otherFields, residentName: e.target.value })}
                placeholder="輸入住戶姓名"
                required
              />
            </div>
          ) : (
            <div className="form-group">
              <label>其他人姓名 *</label>
              <input
                type="text"
                value={otherFields.otherName}
                onChange={(e) => setOtherFields({ ...otherFields, otherName: e.target.value })}
                placeholder="輸入姓名"
                required
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>預約日期 *</label>
              <input
                type="date"
                value={formData.bookingDate ? new Date(formData.bookingDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>開始時間 *</label>
              <input
                type="time"
                value={formData.startTime || ''}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>結束時間 *</label>
              <input
                type="time"
                value={formData.endTime || ''}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>預約人（工作人員）*</label>
            <input
              type="text"
              value={formData.staffName || ''}
              onChange={(e) => setFormData({ ...formData, staffName: e.target.value })}
              placeholder="輸入預約人姓名"
              required
            />
          </div>

          <div className="form-group">
            <label>付款狀態</label>
            <select
              value={formData.paymentStatus || 'unpaid'}
              onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as 'paid' | 'unpaid' })}
            >
              <option value="unpaid">未付款</option>
              <option value="paid">已付款</option>
            </select>
          </div>

          <div className="form-group">
            <label>備註</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="輸入備註"
              rows={3}
            />
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

export default BookingModal;
