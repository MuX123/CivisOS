import React from 'react';
import { FacilityBookingV2 } from '../../types/domain';

interface BookingCardProps {
  booking: FacilityBookingV2;
  onPay?: (id: string) => void;
  onCancel?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (booking: FacilityBookingV2) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPay,
  onCancel,
  onDelete,
  onEdit,
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = () => {
    switch (booking.bookingStatus) {
      case 'confirmed':
        return <span className="status-badge confirmed">已預約</span>;
      case 'cancelled':
        return <span className="status-badge cancelled">已取消</span>;
      case 'deleted':
        return <span className="status-badge deleted">已刪除</span>;
      default:
        return null;
    }
  };

  const getPaymentBadge = () => {
    switch (booking.paymentStatus) {
      case 'paid':
        return <span className="payment-badge paid">已付款</span>;
      case 'unpaid':
        return <span className="payment-badge unpaid">未付款</span>;
      default:
        return null;
    }
  };

  return (
    <div className="booking-card">
      <div className="booking-header">
        <div className="booking-info">
          <h4 className="booking-title">
            {booking.facility?.name || '公設預約'}
          </h4>
          <div className="booking-badges">
            {getStatusBadge()}
            {getPaymentBadge()}
          </div>
        </div>
      </div>

      <div className="booking-details">
        <div className="detail-row">
          <span className="detail-label">預約人</span>
          <span className="detail-value">
            {booking.bookingType === 'resident'
              ? `${booking.residentName || '住戶'}`
              : booking.otherName || '其他'}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">日期</span>
          <span className="detail-value">{formatDate(booking.bookingDate)}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">時間</span>
          <span className="detail-value">
            {booking.startTime} - {booking.endTime}
          </span>
        </div>
        <div className="detail-row">
          <span className="detail-label">預約人</span>
          <span className="detail-value">{booking.staffName}</span>
        </div>
        {booking.notes && (
          <div className="detail-row notes">
            <span className="detail-label">備註</span>
            <span className="detail-value">{booking.notes}</span>
          </div>
        )}
      </div>

      <div className="booking-actions">
        {booking.bookingStatus === 'confirmed' && (
          <>
            <button className="btn-action edit" onClick={() => onEdit?.(booking)}>
              編輯
            </button>
            <button className="btn-action cancel" onClick={() => onCancel?.(booking.id)}>
              取消
            </button>
            {booking.paymentStatus === 'unpaid' && (
              <button className="btn-action pay" onClick={() => onPay?.(booking.id)}>
                已付款
              </button>
            )}
          </>
        )}
        {booking.bookingStatus !== 'deleted' && (
          <button className="btn-action delete" onClick={() => onDelete?.(booking.id)}>
            刪除
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
