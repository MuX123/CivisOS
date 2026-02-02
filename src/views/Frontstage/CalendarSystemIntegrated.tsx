import React, { useState, useEffect, useMemo } from 'react';
import '../../assets/styles/calendar.css';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import IntroductionButton from '../../components/ui/IntroductionButton';
import EventCard from '../../components/calendar/EventCard';
import EventModal from '../../components/calendar/EventModal';
import { CalendarEventV2, CalendarStatus } from '../../types/domain';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addStatusConfig, updateStatusConfig, deleteStatusConfig } from '../../store/modules/config';

const CalendarSystemIntegrated: React.FC = () => {
  const dispatch = useAppDispatch();
  const calendarStatuses = useAppSelector(state => state.config.calendarStatuses);
  const [activeTab, setActiveTab] = useState<'month-grid' | 'current-month' | 'past'>('month-grid');
  const [events, setEvents] = useState<CalendarEventV2[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventV2 | undefined>();
  const [initialDate, setInitialDate] = useState<string | undefined>();
  const [dayDetailDate, setDayDetailDate] = useState<Date | null>(null);
  const [selectedPastMonth, setSelectedPastMonth] = useState<string>('');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<CalendarStatus | null>(null);
  const [statusForm, setStatusForm] = useState({ name: '', color: '#5865F2' });
  const [monthCursor, setMonthCursor] = useState<Date>(new Date());

  // 初始化模拟数据（后续可以替换为 API 调用）
  useEffect(() => {
    // 确保 calendarStatuses 载入后再初始化事件
    if (calendarStatuses.length === 0) return;

    // 模拟更多数据
    const mockEvents: CalendarEventV2[] = [
      {
        id: '1',
        title: '社區年度大會',
        content: '年度住戶大會，討論社區重大事項並進行管委會選舉。',
        images: [],
        startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 3 + 7200000).toISOString(),
        statusId: calendarStatuses[1]?.id || '2',
        status: calendarStatuses[1],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: '電梯保養維護',
        content: '定期電梯保養，屆時電梯將暫停使用2小時。',
        images: [],
        startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 5 + 7200000).toISOString(),
        statusId: calendarStatuses[0]?.id || '1',
        status: calendarStatuses[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: '春節聯歡活動',
        content: '農曆春節住戶聯歡活動，地點為社區活動中心。',
        images: [],
        startTime: new Date(Date.now() + 86400000 * 10).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 10 + 7200000).toISOString(),
        statusId: calendarStatuses[2]?.id || '3',
        status: calendarStatuses[2],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: '月管理費繳費通知',
        content: '本月管理費繳費截止日，請各戶長及时繳費。',
        images: [],
        startTime: new Date(Date.now() + 86400000 * 15).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 15 + 7200000).toISOString(),
        statusId: calendarStatuses[0]?.id || '1',
        status: calendarStatuses[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        title: '社區環境清掃活動',
        content: '社區環境大掃除，歡迎住戶參與共同維護社區環境。',
        images: [],
        startTime: new Date(Date.now() + 86400000 * 20).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 20 + 7200000).toISOString(),
        statusId: calendarStatuses[1]?.id || '2',
        status: calendarStatuses[1],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '6',
        title: '住戶大會（過期）',
        content: '去年第四季住戶大會，完成重要決議事項。',
        images: [],
        startTime: new Date(Date.now() - 86400000 * 30).toISOString(),
        endTime: new Date(Date.now() - 86400000 * 30 + 7200000).toISOString(),
        statusId: calendarStatuses[3]?.id || '4',
        status: calendarStatuses[3],
        isPast: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '7',
        title: '電梯年度檢測（過期）',
        content: '年度電梯安全檢測，確保運行安全。',
        images: [],
        startTime: new Date(Date.now() - 86400000 * 60).toISOString(),
        endTime: new Date(Date.now() - 86400000 * 60 + 7200000).toISOString(),
        statusId: calendarStatuses[0]?.id || '1',
        status: calendarStatuses[0],
        isPast: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '8',
        title: '聖誕節裝飾活動（過期）',
        content: '社區聖誕節裝飾活動，已成功舉辦完成。',
        images: [],
        startTime: new Date(Date.now() - 86400000 * 45).toISOString(),
        endTime: new Date(Date.now() - 86400000 * 45 + 7200000).toISOString(),
        statusId: calendarStatuses[2]?.id || '3',
        status: calendarStatuses[2],
        isPast: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setEvents(mockEvents);
  }, [calendarStatuses]);

  const isEventPast = (event: CalendarEventV2) => {
    if (event.isPast) return true;
    const compareTime = event.endTime ?? event.startTime;
    return new Date(compareTime).getTime() < Date.now();
  };

  const getMonthKey = (date: string | Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const isSameDay = (a: string | Date, b: string | Date) => {
    const da = new Date(a);
    const db = new Date(b);
    return (
      da.getFullYear() === db.getFullYear() &&
      da.getMonth() === db.getMonth() &&
      da.getDate() === db.getDate()
    );
  };

  const getEventColor = (event: CalendarEventV2) => {
    if (isEventPast(event)) return 'var(--calendar-status-past)';
    return event.status?.color || 'var(--calendar-status-community)';
  };

  const formatTime = (date: string | Date) =>
    new Date(date).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatEventRange = (event: CalendarEventV2) => {
    const start = formatTime(event.startTime);
    if (event.endTime) {
      return `${start} - ${formatTime(event.endTime)}`;
    }
    return start;
  };

  const currentMonthKey = getMonthKey(new Date());
  const pastEvents = events.filter(e => isEventPast(e));
  const currentMonthEvents = events.filter(
    e => getMonthKey(e.startTime) === currentMonthKey && !isEventPast(e)
  );
  const pastEventsFiltered = selectedPastMonth
    ? pastEvents.filter(e => getMonthKey(e.startTime) === selectedPastMonth)
    : pastEvents;
  const filteredEvents = activeTab === 'current-month' ? currentMonthEvents : pastEventsFiltered;

  const getMonthLabel = (date: Date) =>
    date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });

  const getMonthGridStart = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const startOffset = firstDay.getDay();
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - startOffset);
    return start;
  };

  const monthDays = useMemo(() => {
    const start = getMonthGridStart(monthCursor);
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return {
        date: day,
        inMonth: day.getMonth() === monthCursor.getMonth(),
      };
    });
  }, [monthCursor]);

  const monthLabel = useMemo(() => getMonthLabel(monthCursor), [monthCursor]);

  const handleSave = (eventData: Partial<CalendarEventV2>) => {
    // 根据 statusId 查找对应的 status 对象
    const status = calendarStatuses.find(s => s.id === eventData.statusId);
    const eventWithStatus = { ...eventData, status };

    if (selectedEvent) {
      // 编辑模式
      setEvents(events.map((e) => (e.id === selectedEvent.id ? { 
        ...e, 
        ...eventWithStatus, 
        updatedAt: new Date().toISOString() 
      } : e)));
    } else {
      // 新增模式
      const newEvent: CalendarEventV2 = {
        id: `event-${Date.now()}`,
        ...eventWithStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPast: false,
      } as CalendarEventV2;
      setEvents([...events, newEvent]);
    }
    setIsModalOpen(false);
    setSelectedEvent(undefined);
  };

  const handleDelete = (id: string) => {
    if (confirm('確定要刪除此行事曆嗎？')) {
      setEvents(events.filter((e) => e.id !== id));
    }
  };

  const handleEdit = (event: CalendarEventV2) => {
    setDayDetailDate(null);
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const dayEvents = dayDetailDate
    ? events.filter(e => isSameDay(e.startTime, dayDetailDate))
    : [];

  return (
    <div className="calendar-system">
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-3xl font-bold text-white">行事曆</h2>
        <div className="flex items-center gap-2">
          <IntroductionButton pageId="calendar" />
          <Button
            variant="secondary"
            size="small"
            onClick={() => setStatusModalOpen(true)}
          >
            狀態管理
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={() => {
              setSelectedEvent(undefined);
              setInitialDate(undefined);
              setIsModalOpen(true);
            }}
          >
            新增
          </Button>
        </div>
      </div>

      {/* 書籤式分頁 */}
      <div className="mb-6 flex gap-2">
        <button
          className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
            activeTab === 'month-grid'
              ? 'bg-[#5865F2] text-white shadow-sm'
              : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('month-grid')}
        >
          月行事曆圖表
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
            activeTab === 'current-month'
              ? 'bg-[#5865F2] text-white shadow-sm'
              : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('current-month')}
        >
          當月行事曆
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
            activeTab === 'past'
              ? 'bg-[#5865F2] text-white shadow-sm'
              : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-normal)]'
          }`}
          onClick={() => setActiveTab('past')}
        >
          過期行事曆
        </button>
      </div>

      {activeTab === 'month-grid' && (
        <Card className="mb-6 calendar-surface">
          <CardHeader className="calendar-header">
            <div className="calendar-header-left">
              <CardTitle>月曆視圖</CardTitle>
              <span className="calendar-header-subtitle">行事曆事件總覽與快速編輯</span>
            </div>
            <div className="calendar-header-controls">
              <div className="calendar-month-switch">
                <button
                  className="calendar-nav-btn"
                  onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
                  aria-label="上一個月"
                >
                  ‹
                </button>
                <div className="calendar-month-label">{monthLabel}</div>
                <button
                  className="calendar-nav-btn"
                  onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
                  aria-label="下一個月"
                >
                  ›
                </button>
              </div>
              <Button
                variant="secondary"
                size="small"
                onClick={() => setMonthCursor(new Date())}
              >
                今天
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="calendar-grid">
              <div className="calendar-grid-weekdays">
                {['日', '一', '二', '三', '四', '五', '六'].map((label) => (
                  <div key={label} className="calendar-weekday">
                    {label}
                  </div>
                ))}
              </div>
              <div className="calendar-grid-days">
                {monthDays.map(({ date, inMonth }) => {
                  const dayEvents = events.filter((event) => isSameDay(event.startTime, date));
                  const isToday = isSameDay(date, new Date());

                  return (
                    <div
                      key={date.toISOString()}
                      className={`calendar-day${inMonth ? '' : ' is-out'}${isToday ? ' is-today' : ''}`}
                    >
                      <div className="calendar-day-top">
                        <span className="calendar-day-number">{date.getDate()}</span>
                        <button
                          className="calendar-day-edit"
                          onClick={() => setDayDetailDate(new Date(date))}
                          title="編輯當日"
                        >
                          ✎
                        </button>
                      </div>

                      <div className="calendar-day-dots">
                        {dayEvents.slice(0, 4).map((event) => (
                          <span
                            key={event.id}
                            className="calendar-dot"
                            style={{ backgroundColor: getEventColor(event) }}
                          />
                        ))}
                        {dayEvents.length > 4 && (
                          <span className="calendar-dot-more">+{dayEvents.length - 4}</span>
                        )}
                      </div>

                      {dayEvents.length > 0 && (
                        <div className="calendar-day-tooltip">
                          <div className="calendar-tooltip-title">
                            {date.toLocaleDateString('zh-TW', {
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short',
                            })}
                          </div>
                          <div className="calendar-tooltip-list">
                            {dayEvents.map((event) => (
                              <div className="calendar-tooltip-item" key={event.id}>
                                <span
                                  className="calendar-tooltip-dot"
                                  style={{ backgroundColor: getEventColor(event) }}
                                />
                                <div className="calendar-tooltip-text">
                                  <div className="calendar-tooltip-event">{event.title}</div>
                                  <div className="calendar-tooltip-time">{formatEventRange(event)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab !== 'month-grid' && (
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle>{activeTab === 'current-month' ? '當月行事曆' : '過期行事曆'}</CardTitle>
            {activeTab === 'past' && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-white/70">選擇月份</label>
                <input
                  type="month"
                  value={selectedPastMonth}
                  onChange={(e) => setSelectedPastMonth(e.target.value)}
                  className="px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--bg-primary)] text-[var(--text-normal)] text-sm"
                />
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => setSelectedPastMonth('')}
                >
                  全部
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="events-list-container">
              {filteredEvents.length === 0 ? (
                <div className="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <h4>{activeTab === 'current-month' ? '沒有當月行事曆' : '沒有過期行事曆'}</h4>
                  <p>點擊上方按鈕新增行事曆</p>
                </div>
              ) : (
                <div className="events-list">
                  {/* 當月：顯示所有當月事件 */}
                  {activeTab === 'current-month' ? (
                    filteredEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    /* 過期：按月份分組顯示 */
                    <div className="space-y-6">
                      {(() => {
                        // 按月份分組
                        const groupedByMonth: Record<string, CalendarEventV2[]> = {};
                        filteredEvents.forEach(event => {
                          const monthKey = new Date(event.startTime).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
                          if (!groupedByMonth[monthKey]) {
                            groupedByMonth[monthKey] = [];
                          }
                          groupedByMonth[monthKey].push(event);
                        });

                        // 取得排序後的月份陣列（由新到舊）
                        const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => {
                          const dateA = new Date(a);
                          const dateB = new Date(b);
                          return dateB.getTime() - dateA.getTime();
                        });

                        return sortedMonths.map(month => (
                          <div key={month} className="month-group">
                            <h3 className="text-sm font-bold text-[var(--text-muted)] mb-3 px-2 border-b border-[var(--color-border)] pb-1">
                              {month}
                            </h3>
                            <div className="space-y-3">
                              {groupedByMonth[month].map(event => (
                                <EventCard
                                  key={event.id}
                                  event={event}
                                  onEdit={handleEdit}
                                  onDelete={handleDelete}
                                />
                              ))}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 事件編輯彈窗（使用原有的 EventModal） */}
      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          initialDate={initialDate}
          statuses={calendarStatuses}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(undefined);
            setInitialDate(undefined);
          }}
        />
      )}

      {/* 當日細項彈窗 */}
      {dayDetailDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDayDetailDate(null)}>
          <div
            className="bg-[var(--bg-floating)] rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-normal)]">當日行事曆</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {dayDetailDate.toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => {
                    setSelectedEvent(undefined);
                    setInitialDate(dayDetailDate.toISOString());
                    setIsModalOpen(true);
                  }}
                >
                  新增
                </Button>
                <Button variant="secondary" size="small" onClick={() => setDayDetailDate(null)}>
                  關閉
                </Button>
              </div>
            </div>

            {dayEvents.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] py-10">當日無行事曆</div>
            ) : (
              <div className="space-y-4">
                {dayEvents.map((event) => (
                  <div key={event.id} className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--bg-primary)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-[var(--text-normal)]">{event.title}</h4>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Date(event.startTime).toLocaleString()}
                          {event.endTime ? ` ～ ${new Date(event.endTime).toLocaleString()}` : ''}
                        </p>
                      </div>
                      <Button variant="secondary" size="small" onClick={() => handleEdit(event)}>
                        編輯
                      </Button>
                    </div>
                    {event.content && (
                      <p className="mt-2 text-sm text-[var(--text-normal)]">{event.content}</p>
                    )}
                    {event.images && event.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {event.images.map((img, idx) => (
                          <a key={idx} href={img} target="_blank" rel="noreferrer">
                            <img src={img} alt={`event-${idx}`} className="w-full h-24 object-cover rounded" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 狀態管理模態框 */}
      {statusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-floating)] rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[var(--text-normal)]">行事曆狀態管理</h3>
              <button
                onClick={() => {
                  setStatusModalOpen(false);
                  setEditingStatus(null);
                  setStatusForm({ name: '', color: '#5865F2' });
                }}
                className="text-white hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 新增/編輯表單 */}
            <div className="mb-4 p-4 bg-[var(--bg-hover)] rounded-lg">
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
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={statusForm.color}
                      onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
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
                        onClick={() => {
                          if (editingStatus && statusForm.name.trim()) {
                            dispatch(updateStatusConfig({
                              type: 'calendar',
                              id: editingStatus.id,
                              color: statusForm.color
                            }));
                            // 更新名稱需要額外處理，這裡簡化只更新顏色
                            setEditingStatus(null);
                            setStatusForm({ name: '', color: '#5865F2' });
                          }
                        }}
                      >
                        更新
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          setEditingStatus(null);
                          setStatusForm({ name: '', color: '#5865F2' });
                        }}
                      >
                        取消
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => {
                        if (statusForm.name.trim()) {
                          dispatch(addStatusConfig({
                            type: 'calendar',
                            name: statusForm.name.trim(),
                            color: statusForm.color
                          }));
                          setStatusForm({ name: '', color: '#5865F2' });
                        }
                      }}
                    >
                      新增
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* 狀態列表 */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {calendarStatuses.map((status) => (
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
                      onClick={() => {
                        setEditingStatus(status);
                        setStatusForm({ name: status.name, color: status.color });
                      }}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[#5865F2] hover:bg-[var(--bg-primary)] rounded transition-colors"
                      title="編輯"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`確定要刪除狀態「${status.name}」嗎？`)) {
                          dispatch(deleteStatusConfig({ type: 'calendar', id: status.id }));
                        }
                      }}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[#ED4245] hover:bg-[var(--bg-primary)] rounded transition-colors"
                      title="刪除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--dark-mode-cardBorder)]">
              <Button
                variant="secondary"
                size="small"
                className="w-full"
                onClick={() => {
                  if (confirm('確定要重置為預設狀態嗎？')) {
                    // 這裡可以添加重置功能
                  }
                }}
              >
                重置為預設狀態
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSystemIntegrated;
