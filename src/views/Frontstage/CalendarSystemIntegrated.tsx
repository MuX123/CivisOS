import React, { useState, useEffect, useMemo } from 'react';
import '../../assets/styles/calendar.css';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import IntroductionButton from '../../components/ui/IntroductionButton';
import EventCard from '../../components/calendar/EventCard';
import EventModal from '../../components/calendar/EventModal';
import { CalendarEventV2, CalendarStatus } from '../../types/domain';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { calendarActions } from '../../store/modules/calendar';

const CalendarSystemIntegrated: React.FC = () => {
  const dispatch = useAppDispatch();
  const calendarStatuses = useAppSelector(state => state.config.calendarStatuses);
  const calendarConfigs = useAppSelector(state => state.config.configs);
  const calendarEvents = useAppSelector(state => state.calendar.events); // 從 Redux store 讀取事件
  const [activeTab, setActiveTab] = useState<'month-grid' | 'current-month' | 'past' | 'today'>('month-grid');
  const [events, setEvents] = useState<CalendarEventV2[]>([]); // 本地狀態，用於初始化
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventV2 | undefined>();
  const [initialDate, setInitialDate] = useState<string | undefined>();
  const [dayDetailDate, setDayDetailDate] = useState<Date | null>(null);
  const [selectedPastMonth, setSelectedPastMonth] = useState<string>('');
  const [monthCursor, setMonthCursor] = useState<Date>(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [hoverEvents, setHoverEvents] = useState<CalendarEventV2[]>([]);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  // 從設定讀取懸浮視窗縮放比例
  const tooltipScaleConfig = calendarConfigs.find((c) => c.key === 'calendarTooltipScale');
  const tooltipScale = Number(tooltipScaleConfig?.value) || 100;
  
  // 節慶日狀態
  interface Holiday {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    color: string;
  }
  
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  
  // 從 localStorage 載入節日
  useEffect(() => {
    const savedHolidays = localStorage.getItem('calendarHolidays');
    if (savedHolidays) {
      try {
        setHolidays(JSON.parse(savedHolidays));
      } catch (e) {
        console.error('Failed to parse holidays:', e);
      }
    }
  }, []);

  // 全局滑鼠監聽，用於關閉懸浮視窗
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      // 如果沒有懸浮事件，不需要處理
      if (hoverEvents.length === 0) return;

      // 檢查是否在日曆網格區域內
      const calendarGrid = document.querySelector('.calendar-grid-wrapper');
      const tooltip = document.querySelector('.calendar-tooltip-floating');
      
      if (calendarGrid && tooltip) {
        const gridRect = calendarGrid.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        // 檢查滑鼠是否在網格或提示框內
        const isInGrid = (
          e.clientX >= gridRect.left && 
          e.clientX <= gridRect.right && 
          e.clientY >= gridRect.top && 
          e.clientY <= gridRect.bottom
        );
        
        const isInTooltip = (
          e.clientX >= tooltipRect.left && 
          e.clientX <= tooltipRect.right && 
          e.clientY >= tooltipRect.top && 
          e.clientY <= tooltipRect.bottom
        );

        if (!isInGrid && !isInTooltip) {
          setHoverDate(null);
          setHoverEvents([]);
        }
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [hoverEvents]);

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
    
    // 如果 Redux store 中有事件，使用它們；否則使用模擬數據
    if (calendarEvents.length > 0) {
      // 將 CalendarEvent 轉換為 CalendarEventV2
      const eventsV2: CalendarEventV2[] = calendarEvents.map(e => ({
        id: e.id,
        title: e.title,
        content: e.description || '',
        images: [],
        startTime: typeof e.start === 'string' ? e.start : e.start.toISOString(),
        endTime: typeof e.end === 'string' ? e.end : e.end.toISOString(),
        statusId: e.category || '1',
        status: calendarStatuses.find(s => s.name === e.category) || calendarStatuses[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      setEvents(eventsV2);
    } else {
      // 使用模擬數據
      const mockEventsV2: CalendarEventV2[] = mockEvents.map(e => ({
        ...e,
        content: e.content || '',
        images: e.images || [],
        statusId: e.statusId || '1',
      }));
      setEvents(mockEventsV2);
    }
  }, [calendarStatuses, calendarEvents]);

  // Lock body scroll when hover overlay is shown
  useEffect(() => {
    if (hoverEvents.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [hoverEvents]);

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

  const formatTimeSplit = (date: string | Date) => {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? '下午' : '上午';
    const hour12 = hours % 12 || 12;
    return `${period} ${hour12}:${minutes}`;
  };

  const formatEventTimeSplit = (event: CalendarEventV2) => {
    return {
      start: formatTimeSplit(event.startTime),
      end: event.endTime ? formatTimeSplit(event.endTime) : null,
    };
  };

  const todayEvents = events
    .filter(e => isSameDay(e.startTime, new Date()) && !isEventPast(e))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

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
  const hoverDateLabel = hoverDate
    ? hoverDate.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })
    : '';

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
    ? events
        .filter(e => isSameDay(e.startTime, dayDetailDate))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    : [];

  const currentMonthKey = `${monthCursor.getFullYear()}-${String(monthCursor.getMonth() + 1).padStart(2, '0')}`;
  const pastEvents = events.filter(e => isEventPast(e));
  const currentMonthEvents = events.filter(
    e => {
      const eventMonthKey = `${new Date(e.startTime).getFullYear()}-${String(new Date(e.startTime).getMonth() + 1).padStart(2, '0')}`;
      return eventMonthKey === currentMonthKey && !isEventPast(e);
    }
  );
  const pastEventsFiltered = selectedPastMonth
    ? pastEvents.filter(e => {
        const eventMonthKey = `${new Date(e.startTime).getFullYear()}-${String(new Date(e.startTime).getMonth() + 1).padStart(2, '0')}`;
        return eventMonthKey === selectedPastMonth;
      })
    : pastEvents;
  const filteredEvents = activeTab === 'current-month' ? currentMonthEvents : pastEventsFiltered;

  return (
    <div 
      className="calendar-system"
      style={{
        ['--calendar-tooltip-scale' as any]: `${tooltipScale / 100}`,
      }}
    >
      <div className="flex justify-between items-center mb-6 border-b border-[var(--color-border)] pb-4">
        <h2 className="text-3xl font-bold text-white">行事曆</h2>
        <div className="flex items-center gap-2">
          <IntroductionButton pageId="calendar" />
        </div>
      </div>

      {/* 書籤式分頁 */}
      <div className="mb-6 flex gap-2 justify-between items-center">
        <div className="flex gap-2">
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
              activeTab === 'today'
                ? 'bg-[#5865F2] text-white shadow-sm'
                : 'bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-normal)]'
            }`}
            onClick={() => setActiveTab('today')}
          >
            當日行程表
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
      </div>

      {activeTab === 'month-grid' && (
        <Card className="mb-6 calendar-surface">
          <CardHeader className="calendar-header">
            <div className="calendar-header-left">
              <CardTitle>月曆視圖</CardTitle>
              <span className="calendar-header-subtitle">行事曆事件總覽與快速編輯</span>
            </div>
            
            {/* 新增按鈕移動到這裡 (長條型) */}
            <div className="flex-1 flex justify-center px-4">
              <Button
                variant="primary"
                size="small"
                className="w-full max-w-xs"
                onClick={() => {
                  setSelectedEvent(undefined);
                  setInitialDate(undefined);
                  setIsModalOpen(true);
                }}
              >
                + 新增行事曆
              </Button>
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
        <div 
          className="calendar-grid-wrapper"
          onMouseLeave={() => {
            setHoverDate(null);
            setHoverEvents([]);
          }}
        >
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
                  // 檢查是否為節慶日
                  const customHoliday = holidays.find(h => isSameDay(h.date, date));
                  // 檢查是否為週末（六、日）
                  const dayOfWeek = date.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                  // 如果有自定義節日則使用，否則如果是週末則使用預設灰色
                  const holiday = customHoliday || (isWeekend ? { 
                    id: 'weekend', 
                    name: dayOfWeek === 0 ? '週日' : '週六', 
                    date: date.toISOString().split('T')[0],
                    color: '#808080' 
                  } : undefined);

                  return (
                    <div
                      key={date.toISOString()}
                      className={`calendar-day${inMonth ? '' : ' is-out'}${isToday ? ' is-today' : ''}${holiday ? ' is-holiday' : ''}`}
                      style={holiday ? { 
                        borderColor: holiday.color,
                        backgroundColor: `${holiday.color}15` // 15 = ~8% opacity in hex
                      } : undefined}
                      title={holiday ? `${holiday.name}` : undefined}
                      onMouseEnter={(e) => {
                        if (dayEvents.length > 0) {
                          setHoverDate(new Date(date));
                          const sortedEvents = [...dayEvents].sort((a, b) => 
                            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                          );
                          setHoverEvents(sortedEvents);
                          setTooltipPosition({ x: e.clientX, y: e.clientY });
                        }
                      }}
                      onMouseMove={(e) => {
                        if (hoverEvents.length > 0) {
                          setTooltipPosition({ x: e.clientX, y: e.clientY });
                        }
                      }}
                      onDoubleClick={() => setDayDetailDate(new Date(date))}
                    >
                      <div className="calendar-day-top">
                        <span 
                          className="calendar-day-number"
                          style={holiday ? { color: holiday.color } : undefined}
                        >
                          {date.getDate()}
                        </span>
                        {holiday && (
                          <span 
                            className="text-[0.65rem] ml-1 font-bold truncate max-w-[60px] px-1.5 py-0.5 rounded"
                            style={{ 
                              backgroundColor: holiday.color,
                              color: '#fff'
                            }}
                          >
                            {holiday.name}
                          </span>
                        )}
                        <button
                          className="calendar-day-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDayDetailDate(new Date(date));
                          }}
                          title="編輯當日"
                        >
                          ✎
                        </button>
                      </div>

                      <div className="calendar-day-events">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className="calendar-day-event-item"
                            style={{ borderLeft: `3px solid ${getEventColor(event)}` }}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                      </div>

                    </div>
                  );
                })}
                </div>
              </div>
            </div>
            {hoverEvents.length > 0 && hoverDate && (
              <div 
                className="calendar-tooltip-floating"
                style={{ 
                  position: 'fixed',
                  left: tooltipPosition.x + 15,
                  top: tooltipPosition.y - 50,
                  zIndex: 1000,
                  pointerEvents: 'none'
                }}
              >
                <div className="calendar-hover-card" style={{ pointerEvents: 'auto' }}>
                  <div className="calendar-tooltip-header">
                    <div className="flex items-center gap-2">
                      <div className="calendar-tooltip-title">{hoverDateLabel}</div>
                      {(() => {
                        if (!hoverDate) return null;
                        const customHoliday = holidays.find(h => isSameDay(h.date, hoverDate));
                        const dayOfWeek = hoverDate.getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        const holiday = customHoliday || (isWeekend ? { 
                          id: 'weekend', 
                          name: dayOfWeek === 0 ? '週日' : '週六', 
                          date: hoverDate.toISOString().split('T')[0],
                          color: '#808080' 
                        } : undefined);
                        return holiday ? (
                          <span 
                            className="px-2 py-0.5 rounded text-xs font-bold"
                            style={{ 
                              backgroundColor: holiday.color,
                              color: '#fff'
                            }}
                          >
                            {holiday.name}
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <button
                      className="calendar-tooltip-close"
                      onClick={() => {
                        setHoverDate(null);
                        setHoverEvents([]);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="calendar-tooltip-content">
                    <div className="calendar-tooltip-list">
                      {hoverEvents.map((event) => (
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
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'today' && (
        <Card>
          <CardHeader className="calendar-today-header">
            <CardTitle>當日行程表</CardTitle>
            <span className="calendar-today-date">
              {new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </CardHeader>
          <CardContent>
            {todayEvents.length === 0 ? (
              <div className="empty-state">
                <h4>今日沒有行程</h4>
                <p>點擊「新增」建立今天的行事曆</p>
              </div>
            ) : (
              <div className="calendar-today-list">
                {todayEvents.map((event) => (
                  <div className="calendar-today-item" key={event.id}>
                    <div className="calendar-today-time">
                      {formatEventRange(event)}
                      <span>{event.status?.name || '未設定'}</span>
                    </div>
                    <div className="calendar-today-content">
                      <div className="calendar-today-title">
                        <span className="calendar-today-dot" style={{ backgroundColor: getEventColor(event) }} />
                        {event.title}
                      </div>
                      {event.content && <div className="calendar-today-notes">{event.content}</div>}
                      <div className="calendar-today-actions">
                        <Button variant="secondary" size="small" onClick={() => handleEdit(event)}>
                          編輯
                        </Button>
                        <Button variant="secondary" size="small" onClick={() => handleDelete(event.id)}>
                          刪除
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setDayDetailDate(null)}>
          <div
            className="bg-[var(--bg-floating)] rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-2xl"
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
              <div className="calendar-day-timeline">
                {dayEvents.map((event) => {
                  const timeSplit = formatEventTimeSplit(event);
                  return (
                    <div 
                      key={event.id} 
                      className="calendar-day-timeline-item"
                      style={{ ['--event-color' as any]: getEventColor(event) }}
                    >
                      <div className="calendar-day-status-badge">
                        {event.status?.name || '未設定'}
                      </div>
                      <div className="calendar-day-timeline-left">
                        <div className="calendar-day-time-block">
                          <div className="calendar-day-time-start">{timeSplit.start}</div>
                          {timeSplit.end && (
                            <>
                              <div className="calendar-day-time-arrow">↓</div>
                              <div className="calendar-day-time-end">{timeSplit.end}</div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="calendar-day-timeline-right">
                        <div className="calendar-day-title">
                          {event.title}
                        </div>
                        {event.content && <p className="calendar-day-content">{event.content}</p>}
                        {event.images && event.images.length > 0 && (
                          <div className="calendar-day-images">
                            {event.images.map((img, idx) => (
                              <a key={idx} href={img} target="_blank" rel="noreferrer">
                                <img src={img} alt={`event-${idx}`} />
                              </a>
                            ))}
                          </div>
                        )}
                        <div className="calendar-day-actions">
                          <Button variant="secondary" size="small" onClick={() => handleEdit(event)}>
                            編輯
                          </Button>
                          <Button variant="secondary" size="small" onClick={() => handleDelete(event.id)}>
                            刪除
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab !== 'month-grid' && activeTab !== 'today' && (
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

    </div>
  );
};

export default CalendarSystemIntegrated;
