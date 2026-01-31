import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EventCard from '../../components/calendar/EventCard';
import EventModal from '../../components/calendar/EventModal';
import { CalendarEventV2, CalendarStatus } from '../../types/domain';
// TODO: 等後台 AI 完成後取消註解
// import { useAppSelector } from '../../store/hooks';
import '../../assets/styles/calendar.css';

const CalendarSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
  const [events, setEvents] = useState<CalendarEventV2[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventV2 | undefined>();

  // TODO: 等後台 AI 完成後，使用以下方式從 config store 讀取狀態
  // const calendarStatuses = useAppSelector(state => state.config.calendarStatuses);
  // const statuses = calendarStatuses.map(s => ({ id: s.id, name: s.name, color: s.color }));

  // 模擬狀態設定 (後台完成後將被取代)
  const statuses: CalendarStatus[] = [
    { id: '1', name: '一般', color: '#6366f1' },
    { id: '2', name: '重要', color: '#f59e0b' },
    { id: '3', name: '緊急', color: '#ef4444' },
    { id: '4', name: '完成', color: '#22c55e' },
  ];

  useEffect(() => {
    // 模擬數據
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
        startTime: new Date(Date.now() - 86400000 * 7).toISOString(),
        statusId: '3',
        status: statuses[3],
        isPast: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter((e) =>
    activeTab === 'current' ? !e.isPast : e.isPast
  );

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

      <Card>
        <CardHeader>
          <div className="tabs-navigation flex gap-1 bg-[#202225] p-1 rounded-lg inline-flex">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'current'
                  ? 'bg-[#5865F2] text-white shadow-sm'
                  : 'text-[#b9bbbe] hover:text-[#dcddde]'
              }`}
              onClick={() => setActiveTab('current')}
            >
              行事曆
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'current' ? 'bg-[#7B7BE6]' : 'bg-[#202225]'
              }`}>
                {events.filter((e) => !e.isPast).length}
              </span>
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'past'
                  ? 'bg-[#5865F2] text-white shadow-sm'
                  : 'text-[#b9bbbe] hover:text-[#dcddde]'
              }`}
              onClick={() => setActiveTab('past')}
            >
              過去紀錄
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === 'past' ? 'bg-[#7B7BE6]' : 'bg-[#202225]'
              }`}>
                {events.filter((e) => e.isPast).length}
              </span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEvents.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h4>沒有行事曆</h4>
              <p>點擊上方按鈕新增第一個行事曆</p>
            </div>
          ) : (
            <div className="events-list">
              {filteredEvents.map((event) => (
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
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <EventModal
          event={selectedEvent}
          statuses={statuses}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(undefined);
          }}
        />
      )}
    </div>
  );
};

export default CalendarSystem;
