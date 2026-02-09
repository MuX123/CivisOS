import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { configActions } from '../../store/modules/config';
import type { SystemConfig, CalendarStatus } from '../../types/domain';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { addStatusConfig, updateStatusConfig, deleteStatusConfig } from '../../store/modules/config';

const CALENDAR_TOOLTIP_SCALE_KEY = 'calendarTooltipScale';
const CALENDAR_HOLIDAYS_KEY = 'calendarHolidays';

// 基準尺寸
const BASE_TOOLTIP_WIDTH = 260;
const BASE_TOOLTIP_HEIGHT = 200;

// 節日介面
interface Holiday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  color: string;
}

const CalendarSettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const configs = useAppSelector((state) => state.config.configs);
  const calendarStatuses = useAppSelector((state) => state.config.calendarStatuses);

  const scaleConfig = configs.find((c) => c.key === CALENDAR_TOOLTIP_SCALE_KEY);

  const [tooltipScale, setTooltipScale] = useState<number>(Number(scaleConfig?.value) || 100);
  
  // 狀態管理
  const [editingStatus, setEditingStatus] = useState<CalendarStatus | null>(null);
  const [statusForm, setStatusForm] = useState({ name: '', color: '#5865F2' });
  
  // 節日管理
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    color: '#FF6B6B'
  });

  useEffect(() => {
    if (scaleConfig?.value) setTooltipScale(Number(scaleConfig.value));
  }, [scaleConfig?.value]);
  
  // 從 localStorage 載入節日
  useEffect(() => {
    const savedHolidays = localStorage.getItem(CALENDAR_HOLIDAYS_KEY);
    if (savedHolidays) {
      try {
        setHolidays(JSON.parse(savedHolidays));
      } catch (e) {
        console.error('Failed to parse holidays:', e);
      }
    }
  }, []);
  
  // 儲存節日到 localStorage
  const saveHolidays = (newHolidays: Holiday[]) => {
    setHolidays(newHolidays);
    localStorage.setItem(CALENDAR_HOLIDAYS_KEY, JSON.stringify(newHolidays));
  };

  const upsertConfig = (key: string, value: number, description: string) => {
    const existing = configs.find((c) => c.key === key);
    const payload: SystemConfig = existing
      ? { ...existing, value, updatedAt: new Date().toISOString() }
      : {
          id: `calendar-setting-${key}-${Date.now()}`,
          key,
          value,
          category: 'general',
          description,
          updatedAt: new Date().toISOString(),
        };
    dispatch(configActions.updateConfig(payload));
  };

  const handleSave = () => {
    upsertConfig(CALENDAR_TOOLTIP_SCALE_KEY, tooltipScale, '行事曆懸浮提示框縮放比例');
    alert('已更新行事曆懸浮視窗設定');
  };

  // 計算實際尺寸
  const actualWidth = BASE_TOOLTIP_WIDTH * (tooltipScale / 100);
  const actualHeight = BASE_TOOLTIP_HEIGHT * (tooltipScale / 100);

  const handleAddStatus = () => {
    if (statusForm.name.trim()) {
      dispatch(addStatusConfig({
        type: 'calendar',
        name: statusForm.name.trim(),
        color: statusForm.color
      }));
      setStatusForm({ name: '', color: '#5865F2' });
    }
  };

  const handleUpdateStatus = () => {
    if (editingStatus && statusForm.name.trim()) {
      dispatch(updateStatusConfig({
        type: 'calendar',
        id: editingStatus.id,
        color: statusForm.color
      }));
      setEditingStatus(null);
      setStatusForm({ name: '', color: '#5865F2' });
    }
  };

  const handleDeleteStatus = (status: CalendarStatus) => {
    if (confirm(`確定要刪除狀態「${status.name}」嗎？`)) {
      dispatch(deleteStatusConfig({ type: 'calendar', id: status.id }));
    }
  };

  const startEditStatus = (status: CalendarStatus) => {
    setEditingStatus(status);
    setStatusForm({ name: status.name, color: status.color });
  };

  const cancelEditStatus = () => {
    setEditingStatus(null);
    setStatusForm({ name: '', color: '#5865F2' });
  };
  
  // 節日管理函數
  const handleAddHoliday = () => {
    if (holidayForm.name.trim() && holidayForm.date) {
      const newHoliday: Holiday = {
        id: `holiday-${Date.now()}`,
        name: holidayForm.name.trim(),
        date: holidayForm.date,
        color: holidayForm.color
      };
      saveHolidays([...holidays, newHoliday]);
      setHolidayForm({
        name: '',
        date: new Date().toISOString().split('T')[0],
        color: '#FF6B6B'
      });
    }
  };
  
  const handleUpdateHoliday = () => {
    if (editingHoliday && holidayForm.name.trim() && holidayForm.date) {
      const updatedHolidays = holidays.map(h => 
        h.id === editingHoliday.id 
          ? { ...h, name: holidayForm.name.trim(), date: holidayForm.date, color: holidayForm.color }
          : h
      );
      saveHolidays(updatedHolidays);
      setEditingHoliday(null);
      setHolidayForm({
        name: '',
        date: new Date().toISOString().split('T')[0],
        color: '#FF6B6B'
      });
    }
  };
  
  const handleDeleteHoliday = (holiday: Holiday) => {
    if (confirm(`確定要刪除節日「${holiday.name}」嗎？`)) {
      saveHolidays(holidays.filter(h => h.id !== holiday.id));
    }
  };
  
  const startEditHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setHolidayForm({
      name: holiday.name,
      date: holiday.date,
      color: holiday.color
    });
  };
  
  const cancelEditHoliday = () => {
    setEditingHoliday(null);
    setHolidayForm({
      name: '',
      date: new Date().toISOString().split('T')[0],
      color: '#FF6B6B'
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-3xl font-bold text-white">行事曆設定</h2>
      </div>

      {/* 狀態管理卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>行事曆狀態管理</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 新增/編輯表單 */}
          <div className="mb-6 p-4 bg-[var(--bg-hover)] rounded-lg">
            <h4 className="text-sm font-medium text-[var(--text-normal)] mb-3">
              {editingStatus ? '編輯狀態' : '新增狀態'}
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/70 mb-1">狀態名稱</label>
                <input
                  type="text"
                  value={statusForm.name}
                  onChange={(e) => setStatusForm({ ...statusForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--dark-mode-cardBorder)] rounded text-[var(--text-normal)] text-sm focus:outline-none focus:border-[#5865F2]"
                  placeholder="輸入狀態名稱"
                />
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">顏色</label>
                <div className="flex gap-2 items-center">
                  <div className="relative w-10 h-10">
                    <input
                      type="color"
                      value={statusForm.color}
                      onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div 
                      className="w-10 h-10 rounded border-0"
                      style={{ backgroundColor: statusForm.color }}
                    />
                  </div>
                  <input
                    type="text"
                    value={statusForm.color}
                    onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--dark-mode-cardBorder)] rounded text-[var(--text-normal)] text-sm focus:outline-none focus:border-[#5865F2]"
                    placeholder="#5865F2"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {editingStatus ? (
                  <>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleUpdateStatus}
                    >
                      更新
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={cancelEditStatus}
                    >
                      取消
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleAddStatus}
                  >
                    新增狀態
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 狀態列表 */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {calendarStatuses.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">尚無狀態設定</p>
            ) : (
              calendarStatuses.map((status) => (
                <div
                  key={status.id}
                  className="flex items-center justify-between p-3 bg-[var(--bg-hover)] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-[var(--text-normal)]">{status.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditStatus(status)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[#5865F2] hover:bg-[var(--bg-primary)] rounded transition-colors"
                      title="編輯"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteStatus(status)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[#ED4245] hover:bg-[var(--bg-primary)] rounded transition-colors"
                      title="刪除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 懸浮視窗大小設定卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>懸浮視窗縮放</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)] mb-6">
            調整月行事曆上滑鼠懸浮顯示的提示視窗縮放比例。設定會立即影響前台顯示。
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-white/70 mb-2">
                縮放比例: {tooltipScale}% (寬度: {Math.round(actualWidth)}px, 高度: {Math.round(actualHeight)}px)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={50}
                  max={200}
                  step={10}
                  value={tooltipScale}
                  onChange={(e) => setTooltipScale(Number(e.target.value))}
                  className="flex-1"
                />
                <input
                  type="number"
                  min={50}
                  max={200}
                  step={10}
                  value={tooltipScale}
                  onChange={(e) => setTooltipScale(Number(e.target.value))}
                  className="w-24 px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--bg-primary)] text-white"
                />
              </div>
            </div>

            {/* 懸浮視窗預覽 */}
            <div className="mt-6">
              <label className="block text-sm text-white/70 mb-3">懸浮視窗預覽</label>
              <div className="bg-[var(--bg-hover)] p-8 rounded-lg flex items-center justify-center min-h-[300px]">
                <div
                  className="bg-[var(--bg-floating)] rounded-lg shadow-lg border border-[var(--color-border)] overflow-hidden"
                  style={{
                    width: `${actualWidth}px`,
                    height: `${actualHeight}px`,
                    transform: 'scale(1)',
                    transition: 'width 0.2s, height 0.2s'
                  }}
                >
                  <div className="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--text-normal)]">2026年2月6日</span>
                    <button className="text-[var(--text-muted)] hover:text-[var(--text-normal)]">×</button>
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#5865F2] mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--text-normal)] font-medium truncate">社區年度大會</div>
                        <div className="text-xs text-[var(--text-muted)]">14:00 - 16:00</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#3BA55D] mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--text-normal)] font-medium truncate">電梯保養維護</div>
                        <div className="text-xs text-[var(--text-muted)]">10:00 - 12:00</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                調整上方滑桿，預覽視窗會即時更新
              </p>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" size="small" onClick={handleSave}>
                儲存設定
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 節日管理卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>節日特殊顏色顯示</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            設定特定日期顯示節日標註與特殊顏色，將在行事曆上以對應顏色標示。
          </p>
          
          {/* 新增/編輯表單 */}
          <div className="mb-6 p-4 bg-[var(--bg-hover)] rounded-lg">
            <h4 className="text-sm font-medium text-[var(--text-normal)] mb-3">
              {editingHoliday ? '編輯節日' : '新增節日'}
            </h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">節日名稱</label>
                  <input
                    type="text"
                    value={holidayForm.name}
                    onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--dark-mode-cardBorder)] rounded text-[var(--text-normal)] text-sm focus:outline-none focus:border-[#5865F2]"
                    placeholder="例如：春節、國慶日"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/70 mb-1">日期</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={holidayForm.date}
                      onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })}
                      className="w-full px-3 py-2 pr-10 bg-[var(--bg-primary)] border border-[var(--dark-mode-cardBorder)] rounded text-[var(--text-normal)] text-sm focus:outline-none focus:border-[#5865F2]"
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/70 mb-1">標註顏色</label>
                <div className="flex gap-2 items-center">
                  <div className="relative w-10 h-10">
                    <input
                      type="color"
                      value={holidayForm.color}
                      onChange={(e) => setHolidayForm({ ...holidayForm, color: e.target.value })}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div 
                      className="w-10 h-10 rounded border-2 border-[var(--dark-mode-cardBorder)]"
                      style={{ backgroundColor: holidayForm.color }}
                    />
                  </div>
                  <input
                    type="text"
                    value={holidayForm.color}
                    onChange={(e) => setHolidayForm({ ...holidayForm, color: e.target.value })}
                    className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--dark-mode-cardBorder)] rounded text-[var(--text-normal)] text-sm focus:outline-none focus:border-[#5865F2]"
                    placeholder="#FF6B6B"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                {editingHoliday ? (
                  <>
                    <Button
                      variant="primary"
                      size="small"
                      onClick={handleUpdateHoliday}
                    >
                      更新
                    </Button>
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={cancelEditHoliday}
                    >
                      取消
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    size="small"
                    onClick={handleAddHoliday}
                  >
                    新增節日
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* 節日列表 */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {holidays.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-4">尚無節日設定</p>
            ) : (
              holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-3 bg-[var(--bg-hover)] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded border border-white/20"
                      style={{ backgroundColor: holiday.color }}
                    />
                    <div>
                      <span className="text-[var(--text-normal)] font-medium">{holiday.name}</span>
                      <span className="text-[var(--text-muted)] text-sm ml-2">{holiday.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditHoliday(holiday)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[#5865F2] hover:bg-[var(--bg-primary)] rounded transition-colors"
                      title="編輯"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteHoliday(holiday)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[#ED4245] hover:bg-[var(--bg-primary)] rounded transition-colors"
                      title="刪除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSettings;
