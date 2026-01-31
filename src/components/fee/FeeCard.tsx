import React from 'react';
import { FeeUnit, Unit } from '../../types/domain';

interface FeeCardProps {
  unit: Unit;
  config?: FeeUnit;
  onUpdate?: (config: Partial<FeeUnit>) => void;
  readOnly?: boolean;
}

const FeeCard: React.FC<FeeCardProps> = ({ unit, config, onUpdate, readOnly = false }) => {
  const area = config?.area || 0;
  const pricePerArea = config?.pricePerPing || 0;
  const totalFee = area * pricePerArea;

  const handleAreaChange = (value: string) => {
    if (onUpdate && !readOnly) {
      onUpdate({ area: Number(value) });
    }
  };

  const handlePriceChange = (value: string) => {
    if (onUpdate && !readOnly) {
      onUpdate({ pricePerPing: Number(value) });
    }
  };

  const handleNoteChange = (value: string) => {
    if (onUpdate && !readOnly) {
      onUpdate({ notes: value });
    }
  };

  return (
    <div className="fee-card">
      <div className="fee-header">
        <h4 className="fee-title">{unit.unitNumber}</h4>
        {config && (
          <span className={`payment-status ${config.paymentStatus}`}>
            {config.paymentStatus === 'paid' ? '已繳費' :
             config.paymentStatus === 'unpaid' ? '未繳費' : '部分繳費'}
          </span>
        )}
      </div>

      <div className="fee-details">
        <div className="form-row">
          <div className="form-group">
            <label>坪數</label>
            <input
              type="number"
              value={area}
              onChange={(e) => handleAreaChange(e.target.value)}
              disabled={readOnly}
              placeholder="0"
              min="0"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <label>每坪多少元</label>
            <input
              type="number"
              value={pricePerArea}
              onChange={(e) => handlePriceChange(e.target.value)}
              disabled={readOnly}
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="fee-calculation">
          <span className="fee-label">應繳費用:</span>
          <span className="fee-amount">${totalFee.toLocaleString()}</span>
        </div>

        <div className="form-group">
          <label>備註</label>
          <textarea
            value={config?.notes || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
            disabled={readOnly}
            placeholder="輸入備註"
            rows={2}
          />
        </div>
      </div>

      {config?.isSpecial && (
        <div className="special-badge">特殊戶型</div>
      )}
    </div>
  );
};

export default FeeCard;
