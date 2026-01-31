import React, { useState, useEffect } from 'react';
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
import { CalendarEventV2, CalendarStatus } from '../../types/domain';

const ScheduleXCalendar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current-month' | 'past'>('current-month');
  const [events, setEvents] = useState<CalendarEventV2[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventV2 | undefined>();

  // 模擬狀態設定
  const statuses: CalendarStatus[] = [
    { id: '1', name: '一般', color: '#6366f1' },
    { id: '2', name: '重要', color: '#f59e0b' },
    { id: '3', name: '緊急', color: '#ef4444' },
    { id: '4', name: '完成', color: '#22c55e' },
  ];

  useEffect(() => {
    // 模擬更多數據
    const mockEvents: CalendarEventV2[] = [
      {
        id: '1',
        title: '社區年度大會',
        content: '年度住戶大會，討論社區重大事項並進行管委會選舉。',
        images: [],
        startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
        endTime: new Date(Date.now() + 86400000 * 3 + 7200000).toISOString(),
        statusId: '2',
        status: statuses[1],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: '電梯保養維護',
        content: '定期電梯保養，屆時電梯將暫停使用2小時。',
        images: [],
        startTime: new Date(Date.now() + 86400000 * 5).toISOString(),
        statusId: '1',
        status: statuses[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: '春節聯歡活動',
        content: '農曆春節住戶聯歡活動，地點為社區活動中心。',
        images: [],
        startTime: new Date(Date.now() + 86400000 * 10).toISOString(),
        statusId: '3',
        status: statuses[2],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: '月管理費繳費通知',
        content: '本月管理費繳費截止日，請各戶長及时繳費。',
        images: [],
        startTime: new Date(Date.now() + 86400000 * 15).toISOString(),
        statusId: '1',
        status: statuses[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        title: '社區環境清掃活動',
        content: '社區環境大掃除，歡迎住戶參與共同維護社區環境。',
        images: [],
        startTime: new Date(Date.now() + 86400000 * 20).toISOString(),
        statusId: '2',
        status: statuses[1],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '6',
        title: '住戶大會（過期）',
        content: '去年第四季住戶大會，完成重要決議事項。',
        images: [],
        startTime: new Date(Date.now() - 86400000 * 30).toISOString(),
        statusId: '4',
        status: statuses[3],
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
        statusId: '1',
        status: statuses[0],
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
        statusId: '3',
        status: statuses[2],
        isPast: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setEvents(mockEvents);
  }, []);

  const currentEvents = events.filter(e => !e.isPast);
  const pastEvents = events.filter(e => e.isPast);
  const displayEvents = activeTab === 'current-month' ? currentEvents : pastEvents;

  // 轉換事件為 Schedule-X 格式（只顯示當前月份的）
  const scheduleXEvents = activeTab === 'current-month' 
    ? currentEvents.map(event => ({
        id: event.id,
        title: event.title,
        start: event.startTime,
        end: event.endTime,
        description: event.content,
        color: event.status?.color || '#6366f1',
      }))
    : []; // 過期頁面不顯示日曆

  const calendar = useCalendarApp({
    defaultView: createViewMonthGrid().name,
    views: [createViewDay(), createViewWeek(), createViewMonthGrid()],
    events: scheduleXEvents,
  });

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
          <p className="text-gray-400 text-sm">管理社區行事曆與活動通知</p>
        </div>
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

      {/* 第一個區塊：月曆表 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="tabs-navigation flex gap-1 bg-[#202225] p-1 rounded-lg inline-flex">
            <button
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === 'current-month'
                  ? 'bg-[#5865F2] text-white shadow-sm'
                  : 'text-[#b9bbbe] hover:text-[#dcddde]'
              }`}
              onClick={() => setActiveTab('current-month')}
            >
              月行事曆
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'current-month' ? 'bg-[#7B7BE6]' : 'bg-[#202225]'
              }`}>
                {currentEvents.length}
              </span>
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                activeTab === 'past'
                  ? 'bg-[#5865F2] text-white shadow-sm'
                  : 'text-[#b9bbbe] hover:text-[#dcddde]'
              }`}
              onClick={() => setActiveTab('past')}
            >
              過期行事曆
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'past' ? 'bg-[#7B7BE6]' : 'bg-[#202225]'
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
                      <div 
                        key={event.id}
                        className="event-item p-4 border rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-[var(--text-normal)]">{event.title}</h3>
                          <span 
                            className="px-2 py-1 rounded text-xs text-white"
                            style={{ backgroundColor: event.status?.color || '#6366f1' }}
                          >
                            {event.status?.name}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mb-2">{event.content}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Date(event.startTime).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
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
                  <div className="space-y-3">
                    {pastEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="event-item p-4 border rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-[var(--text-normal)]">{event.title}</h3>
                          <span 
                            className="px-2 py-1 rounded text-xs text-white"
                            style={{ backgroundColor: event.status?.color || '#6366f1' }}
                          >
                            {event.status?.name}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mb-2">{event.content}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {new Date(event.startTime).toLocaleDateString('zh-TW')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 事件模態框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-floating)] rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-[var(--text-normal)]">
              {selectedEvent ? '編輯行事曆' : '新增行事曆'}
            </h3>
            {/* 這裡可以添加表單，目前暫時簡化 */}
            <div className="flex justify-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedEvent(undefined);
                }}
              >
                取消
              </Button>
              <Button variant="primary">
                {selectedEvent ? '更新' : '新增'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleXCalendar;