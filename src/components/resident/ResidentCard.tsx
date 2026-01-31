import React from 'react';
import { ResidentV2, ResidentStatus } from '../../types/domain';

interface ResidentCardProps {
  resident: ResidentV2;
  onEdit?: (resident: ResidentV2) => void;
}

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
          <span className="value">{resident.ownerName}</span>
        </div>
        <div className="info-row">
          <span className="label">電話</span>
          <span className="value">{resident.ownerPhone}</span>
        </div>
      </div>

      {resident.members.length > 0 && (
        <div className="resident-section">
          <h5>成員 ({resident.members.length})</h5>
          {resident.members.map((member, index) => (
            <div key={index} className="info-row">
              <span className="value">{member.name}</span>
              {member.phone && <span className="sub-value">{member.phone}</span>}
            </div>
          ))}
        </div>
      )}

      {resident.tenants.length > 0 && (
        <div className="resident-section">
          <h5>承租人 ({resident.tenants.length})</h5>
          {resident.tenants.map((tenant, index) => (
            <div key={index} className="info-row">
              <span className="value">{tenant.name}</span>
              {tenant.phone && <span className="sub-value">{tenant.phone}</span>}
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
