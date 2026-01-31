import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateStatusConfig, resetStatusConfig } from '../../store/modules/config';
import { StatusConfig, StatusConfigType } from '../../types/domain';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

interface ColorConfigPanelProps {
  onClose?: () => void;
}

const ColorConfigPanel: React.FC<ColorConfigPanelProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const parkingStatuses = useAppSelector((state: any) => state.config.parkingStatuses) as StatusConfig[];
  const calendarStatuses = useAppSelector((state: any) => state.config.calendarStatuses) as StatusConfig[];
  const houseStatuses = useAppSelector((state: any) => state.config.houseStatuses) as StatusConfig[];

  const updateStatus = (type: StatusConfigType, id: string, color: string) => {
    dispatch(updateStatusConfig({ type, id, color }));
  };

  const ColorRow: React.FC<{
    type: StatusConfigType;
    status: StatusConfig;
    onChange: (color: string) => void;
  }> = ({ status, onChange }) => (
    <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div 
            className="w-6 h-6 rounded border shadow-sm"
            style={{ backgroundColor: status.color }}
        ></div>
        <span className="font-medium">{status.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-mono">{status.color}</span>
        <input 
            type="color" 
            value={status.color} 
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
        />
      </div>
    </div>
  );

  const Section: React.FC<{ title: string; children: React.ReactNode; onReset: () => void }> = ({ title, children, onReset }) => (
    <Card className="mb-6">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>{title}</CardTitle>
        <button onClick={onReset} className="text-xs text-gray-500 hover:text-blue-600">
            恢復預設
        </button>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
            {children}
        </div>
      </CardContent>
    </Card>
  );
  
  const PreviewSection = () => (
      <Card className="mb-6">
          <CardHeader><CardTitle>即時預覽</CardTitle></CardHeader>
          <CardContent>
              <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 border rounded text-center">
                      <h4 className="text-sm font-bold mb-2">車位</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                          {parkingStatuses.map(s => (
                              <div key={s.id} className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: s.color }}>
                                  {s.name}
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="p-3 border rounded text-center">
                      <h4 className="text-sm font-bold mb-2">行事曆</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                          {calendarStatuses.map(s => (
                              <div key={s.id} className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: s.color }}>
                                  {s.name}
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="p-3 border rounded text-center">
                      <h4 className="text-sm font-bold mb-2">房屋</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                          {houseStatuses.map(s => (
                              <div key={s.id} className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: s.color }}>
                                  {s.name}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </CardContent>
      </Card>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">顏色狀態設定</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                {/* 車位狀態 */}
                <Section 
                    title="車位狀態" 
                    onReset={() => dispatch(resetStatusConfig('parking'))}
                >
                    {parkingStatuses.map(status => (
                    <ColorRow
                        key={status.id}
                        type="parking"
                        status={status}
                        onChange={(color) => updateStatus('parking', status.id, color)}
                    />
                    ))}
                </Section>
                
                {/* 行事曆狀態 */}
                <Section 
                    title="行事曆狀態"
                    onReset={() => dispatch(resetStatusConfig('calendar'))}
                >
                    {calendarStatuses.map(status => (
                    <ColorRow
                        key={status.id}
                        type="calendar"
                        status={status}
                        onChange={(color) => updateStatus('calendar', status.id, color)}
                    />
                    ))}
                </Section>
                
                {/* 房屋狀態 */}
                <Section 
                    title="房屋狀態"
                    onReset={() => dispatch(resetStatusConfig('house'))}
                >
                    {houseStatuses.map(status => (
                    <ColorRow
                        key={status.id}
                        type="house"
                        status={status}
                        onChange={(color) => updateStatus('house', status.id, color)}
                    />
                    ))}
                </Section>
            </div>
            
            <div>
                <PreviewSection />
                <div className="bg-blue-50 p-4 rounded text-sm text-blue-800">
                    <p className="font-bold mb-1">💡 提示</p>
                    <p>此處設定的顏色將應用於全系統的：</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>後台管理介面</li>
                        <li>前台住戶 APP</li>
                        <li>中控室監控看板</li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ColorConfigPanel;
