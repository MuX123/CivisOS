import React from 'react';
import { ResidentV2 } from '../../types/domain';

interface ResidentCardProps {
  resident: ResidentV2;
  onEdit?: (resident: ResidentV2) => void;
}

// Helper function to mask sensitive data
const maskSensitiveData = (data: string | undefined, type: 'name' | 'phone'): string => {
  if (!data) return '未設定';

  if (type === 'name') {
    // Show first character + asterisks
    return data.charAt(0) + '*'.repeat(Math.min(data.length - 1, 3));
  }

  if (type === 'phone') {
    // Show last 4 digits only
    if (data.length <= 4) return '*'.repeat(data.length);
    return '*'.repeat(data.length - 4) + data.slice(-4);
  }

  return data;
};

const ResidentCard: React.FC<ResidentCardProps> = ({ resident, onEdit }) => {
  const statusColor = resident.status?.color || '#6366f1';

  return (
    <div className="resident-card" style={{ borderTopColor: statusColor }}>
      <div className="resident-header">
        <div className="resident-title">
          <h4>{resident.unit?.unitNumber || '未知戶別'}</h4>
          <span className="resident-status" style={{ backgroundColor: statusColor }}>
            {resident.status?.name || '未設定'}
          </span>
        </div>
        <button className="btn-edit" onClick={() => onEdit?.(resident)}>
          編輯
        </button>
      </div>

      <div className="resident-section">
        <h5>區權人</h5>
        <div className="info-row">
          <span className="label">姓名</span>
          <span className="value">{maskSensitiveData(resident.ownerName, 'name')}</span>
        </div>
        <div className="info-row">
          <span className="label">電話</span>
          <span className="value">{maskSensitiveData(resident.ownerPhone, 'phone')}</span>
        </div>
      </div>

      {resident.members.length > 0 && (
        <div className="resident-section">
          <h5>成員 ({resident.members.length})</h5>
          {resident.members.map((member, index) => (
            <div key={index} className="info-row">
              <span className="value">{maskSensitiveData(member.name, 'name')}</span>
              {member.phone && <span className="sub-value">{maskSensitiveData(member.phone, 'phone')}</span>}
            </div>
          ))}
        </div>
      )}

      {resident.tenants.length > 0 && (
        <div className="resident-section">
          <h5>承租人 ({resident.tenants.length})</h5>
          {resident.tenants.map((tenant, index) => (
            <div key={index} className="info-row">
              <span className="value">{maskSensitiveData(tenant.name, 'name')}</span>
              {tenant.phone && <span className="sub-value">{maskSensitiveData(tenant.phone, 'phone')}</span>}
            </div>
          ))}
        </div>
      )}

      {resident.licensePlates.length > 0 && (
        <div className="resident-section">
          <h5>車牌 ({resident.licensePlates.length})</h5>
          <div className="tag-list">
            {resident.licensePlates.map((plate, index) => (
              <span key={index} className="tag plate">{plate}</span>
            ))}
          </div>
        </div>
      )}

      {resident.generalCards.length > 0 && (
        <div className="resident-section">
          <h5>磁扣 ({resident.generalCards.length})</h5>
          <div className="tag-list">
            {resident.generalCards.map((card, index) => (
              <span key={index} className="tag card">
                {card.member}: {card.cardNumber}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResidentCard;
