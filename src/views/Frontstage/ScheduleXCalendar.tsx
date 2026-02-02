import React, { useState, useEffect, useRef } from 'react';
import { useCalendarApp, ScheduleXCalendar as ScheduleXComponent } from '@schedule-x/react';
import {
  createViewWeek,
  createViewDay,
  createViewMonthGrid,
} from '@schedule-x/calendar';
import '@schedule-x/theme-default/dist/index.css';
import '../../assets/styles/schedule-x-custom.css';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EventCard from '../../components/calendar/EventCard';
import EventModal from '../../components/calendar/EventModal';
import { CalendarEventV2, CalendarStatus } from '../../types/domain';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { addStatusConfig, updateStatusConfig, deleteStatusConfig } from '../../store/modules/config';

const ScheduleXCalendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const calendarStatuses = useAppSelector(state => state.config.calendarStatuses);
  const [activeTab, setActiveTab] = useState<'current-month' | 'past' | 'settings'>('current-month');
  const [events, setEvents] = useState<CalendarEventV2[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventV2 | undefined>();
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<CalendarStatus | null>(null);
  const [statusForm, setStatusForm] = useState({ name: '', color: '#5a7fd6' });
  const calendarAppRef = useRef<any>(null);

  // 使用 config store 的狀態設定，不再使用模擬資料

  useEffect(() => {
    // 確保 calendarStatuses 載入後再初始化事件
    if (calendarStatuses.length === 0) return;

    // 模擬更多數據
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

  const currentEvents = events.filter(e => !isEventPast(e));
  const pastEvents = events.filter(e => isEventPast(e));
  const displayEvents = activeTab === 'current-month' ? currentEvents : pastEvents;

  // Helper to format date for Schedule-X (YYYY-MM-DD HH:mm)
  const formatDateForScheduleX = (date: string | Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 轉換事件為 Schedule-X 格式（顯示所有事件，過期事件用灰色）
  const scheduleXEvents = events.map(event => {
    let color = event.status?.color || '#5a7fd6';

    if (isEventPast(event)) {
      color = '#FFFFFF'; // 灰色表示過期
    }

    return {
      id: event.id,
      title: event.title,
      start: formatDateForScheduleX(event.startTime),
      end: event.endTime ? formatDateForScheduleX(event.endTime) : formatDateForScheduleX(event.startTime),
      description: event.content,
      color: color,
    };
  });

  const calendar = useCalendarApp({
    defaultView: createViewMonthGrid().name,
    views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
    events: scheduleXEvents,
    callbacks: {
      onEventClick(calendarEvent) {
        const originalEvent = events.find(e => e.id === calendarEvent.id);
        if (originalEvent) {
          setSelectedEvent(originalEvent);
          setIsModalOpen(true);
        }
      },
    },
  });

  // 當 events 更新時，更新日曆
  useEffect(() => {
    if (calendar && (calendar as any).eventsService) {
      (calendar as any).eventsService.set(scheduleXEvents);
    }
  }, [events, calendar]);

  const handleSave = (eventData: Partial<CalendarEventV2>) => {
    if (selectedEvent) {
      setEvents(events.map((e) => (e.id === selectedEvent.id ? { ...e, ...eventData } : e)));
    } else {
      const newEvent: CalendarEventV2 = {
        id: `event-${Date.now()}`,
        ...eventData,
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

  const handleEventClick = (event: any) => {
    const originalEvent = events.find(e => e.id === event.id);
    if (originalEvent) {
      setSelectedEvent(originalEvent);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="calendar-system">
      <div className="page-header flex justify-between items-center mb-4">
        <div className="header-content">
          <h1 className="text-xl font-bold text-white">行事曆</h1>
          <p className="text-white text-sm">管理社區行事曆與活動通知</p>
        </div>
        <div className="flex gap-2">
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
              setIsModalOpen(true);
            }}
          >
            新增
          </Button>
        </div>
      </div>

      {/* 第一個區塊：月曆表 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="tabs-navigation flex gap-1 bg-[var(--dark-mode-cardBorder,#202225)] p-1 rounded-lg inline-flex">
            <button
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === 'current-month'
              ? 'bg-[#5a7fd6] text-white shadow-sm'
              : 'text-[var(--dark-mode-text,#b9bbbe)] hover:text-[#dcddde]'
          }`}
          onClick={() => setActiveTab('current-month')}
        >
          月行事曆
          <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
            activeTab === 'current-month' ? 'bg-[#7B7BE6]' : 'bg-[var(--dark-mode-cardBorder,#202225)]'
          }`}>
            {currentEvents.length}
          </span>
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
            activeTab === 'past'
              ? 'bg-[#5a7fd6] text-white shadow-sm'
              : 'text-[var(--dark-mode-text,#b9bbbe)] hover:text-[#dcddde]'
          }`}
          onClick={() => setActiveTab('past')}
        >
          月行事曆
          <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
            activeTab === 'current-month' ? 'bg-[#7B7BE6]' : 'bg-[var(--dark-mode-cardBorder,#202225)]'
          }`}>
            {currentEvents.length}
          </span>
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
            activeTab === 'past'
              ? 'bg-[#5865F2] text-white shadow-sm'
              : 'text-[var(--dark-mode-text,#FFFFFF)] hover:text-[#dcddde]'
          }`}
          onClick={() => setActiveTab('past')}
        >
              過期行事曆
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'past' ? 'bg-[#7B7BE6]' : 'bg-[var(--dark-mode-cardBorder,#202225)]'
              }`}>
                {pastEvents.length}
              </span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'current-month' ? (
            <div className="calendar-container">
              {/* Schedule-X 月曆組件 */}
              <div className="schedule-x-wrapper">
                <ScheduleXComponent 
                  calendarApp={calendar}
                />
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h4>過期行事曆列表</h4>
              <p>請在下方查看過期行事曆資料</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 第二個區塊：數據列表（顯示5筆資料）*/}
      <div className="data-section">
        {activeTab === 'current-month' ? (
          <Card>
            <CardHeader>
              <CardTitle>即將到來的行事曆</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="events-scroll-container">
                {currentEvents.length === 0 ? (
                  <div className="empty-state">
                    <p className="text-[var(--text-muted)]">即將到來的行事曆</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentEvents.slice(0, 5).map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEdit={(e) => {
                          setSelectedEvent(e);
                          setIsModalOpen(true);
                        }}
                        onDelete={handleDelete}
                      />
                    ))}
                    {currentEvents.length > 5 && (
                      <div className="text-center text-[var(--text-muted)] text-sm">
                        還有 {currentEvents.length - 5} 筆更多行事曆...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>過期行事曆列表</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="events-scroll-container">
                {pastEvents.length === 0 ? (
                  <div className="empty-state">
                    <p className="text-[var(--text-muted)]">沒有過期行事曆</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 將過期事件按月份分組 */}
                    {(() => {
                      // 按月份分組
                      const groupedByMonth: Record<string, CalendarEventV2[]> = {};
                      pastEvents.forEach(event => {
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
                              <div
                                key={event.id}
                                className="event-item p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setIsModalOpen(true);
                                }}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-bold text-[var(--text-normal)]">{event.title}</h3>
                                  <span
                                    className="px-2 py-1 rounded text-xs text-white opacity-70"
                                    style={{ backgroundColor: event.status?.color || '#5865F2' }}
                                  >
                                    {event.status?.name}
                                  </span>
                                </div>
                                <p className="text-sm text-[var(--text-muted)] mb-2">{event.content}</p>
                                <p className="text-xs text-[var(--text-muted)]">
                                  {new Date(event.startTime).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 事件編輯彈窗 */}
      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          statuses={calendarStatuses}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(undefined);
          }}
        />
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
                    className="w-full px-3 py-2 bg-[var(--bg-primary)] border border-[var(--dark-mode-cardBorder)] rounded text-[var(--text-normal)] text-sm focus:outline-none focus:border-[#5a7fd6]"
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
                      className="flex-1 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--dark-mode-cardBorder)] rounded text-[var(--text-normal)] text-sm focus:outline-none focus:border-[#5a7fd6]"
                      placeholder="#5a7fd6"
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
                      className="p-1.5 text-[var(--text-muted)] hover:text-[#5a7fd6] hover:bg-[var(--bg-primary)] rounded transition-colors"
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

export default ScheduleXCalendar;