import React, { useState, useEffect, useCallback } from 'react'
import { CalendarEvent, BookingStatus } from '../../types/domain'
import { useAppDispatch } from '../../store/hooks'
import { addEvent, updateEvent, deleteEvent } from '../../store/modules/calendar'

const CalendarSystem: React.FC = () => {
  const dispatch = useAppDispatch()
  const [currentEvents, setCurrentEvents] = useState<CalendarEvent[]>([])
  const [pastEvents, setPastEvents] = useState<CalendarEvent[]>([])
  const [selectedTab, setSelectedTab] = useState<'current' | 'past'>('current')
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    startDate: '',
    startTime: '',
    endDate: '',
    status: BookingStatus.PENDING,
  })

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = () => {
    // 模擬載入行事曆事件
    const now = new Date()
    const mockCurrentEvents: CalendarEvent[] = [
      {
        id: 'event_1',
        title: '社區月會',
        description: '討論社區管理事務',
        imageUrl: 'https://picsum.photos/seed/community1/200/150.jpg',
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7天後
        startTime: '19:00',
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 7天後2小時
        status: BookingStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'event_2',
        title: '設備維護',
        description: '電梯定期檢查與維護',
        imageUrl: 'https://picsum.photos/seed/maintenance2/200/150.jpg',
        startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3天後
        startTime: '09:00',
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 3天後4小時
        status: BookingStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const mockPastEvents: CalendarEvent[] = [
      {
        id: 'past_event_1',
        title: '春節聯歡活動',
        description: '社區春節聯歡活動，提供餐點與娛樂',
        imageUrl: 'https://picsum.photos/seed/spring1/200/150.jpg',
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30天前
        startTime: '18:00',
        endDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6小時活動
        status: BookingStatus.COMPLETED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'past_event_2',
        title: '消防演習',
        description: '年度消防演習與安全教育',
        imageUrl: 'https://picsum.photos/seed/fire1/200/150.jpg',
        startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60天前
        startTime: '14:00',
        endDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2小時
        status: BookingStatus.COMPLETED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    setCurrentEvents(mockCurrentEvents)
    setPastEvents(mockPastEvents)
  }

  const handleAddEvent = useCallback(() => {
    if (!newEventForm.title) return

    const event: CalendarEvent = {
      id: `event_${Date.now()}`,
      title: newEventForm.title,
      description: newEventForm.description,
      imageUrl: newEventForm.imageUrl,
      startDate: new Date(newEventForm.startDate),
      startTime: newEventForm.startTime,
      endDate: new Date(newEventForm.endDate),
      status: BookingStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    dispatch(addEvent(event))
    resetForm()
    showSuccess('事件新增成功')
  }, [dispatch, newEventForm])

  const handleUpdateEventStatus = useCallback((eventId: string, newStatus: BookingStatus) => {
    const event = [...currentEvents, ...pastEvents].find(e => e.id === eventId)
    if (event) {
      const updatedEvent = {
        ...event,
        status: newStatus,
        updatedAt: new Date(),
      }
      dispatch(updateEvent(updatedEvent))
      showSuccess(`事件狀態已更新為: ${getStatusText(newStatus)}`)
    }
  }, [currentEvents, pastEvents, dispatch])

  const handleDeleteEvent = useCallback((eventId: string) => {
    dispatch(deleteEvent(eventId))
    showSuccess('事件已刪除')
    loadEvents() // 重新載入
  }, [dispatch])

  const handleEditEvent = useCallback((event: CalendarEvent) => {
    setEditingEvent({
      ...event,
      startDate: event.startDate.toISOString().split('T')[0],
      startTime: event.startTime,
      endDate: event.endDate.toISOString().split('T')[0],
      imageUrl: event.imageUrl || '',
    })
  }, [])

  const handleSaveEvent = useCallback(() => {
    if (!editingEvent) return

    const updatedEvent: CalendarEvent = {
      ...editingEvent,
      startDate: new Date(editingEvent.startDate),
      endDate: new Date(editingEvent.endDate),
      status: editingEvent.status,
      updatedAt: new Date(),
    }

    dispatch(updateEvent(updatedEvent))
    setEditingEvent(null)
    loadEvents() // 重新載入
    showSuccess('事件更新成功')
  }, [dispatch, editingEvent])

  const resetForm = () => {
    setNewEventForm({
      title: '',
      description: '',
      imageUrl: '',
      startDate: '',
      startTime: '',
      endDate: '',
      status: BookingStatus.PENDING,
    })
  }

  const getStatusText = (status: BookingStatus): string => {
    const statusMap = {
      [BookingStatus.PENDING]: '待確認',
      [BookingStatus.CONFIRMED]: '已確認',
      [BookingStatus.CANCELLED]: '已取消',
      [BookingStatus.COMPLETED]: '已完成',
      [BookingStatus.EXPIRED]: '已過期',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: BookingStatus): string => {
    const colorMap = {
      [BookingStatus.PENDING]: 'var(--status-pending)',
      [BookingStatus.CONFIRMED]: 'var(--status-confirmed)',
      [BookingStatus.CANCELLED]: 'var(--status-cancelled)',
      [BookingStatus.COMPLETED]: 'var(--status-completed)',
      [BookingStatus.EXPIRED]: 'var(--status-expired)',
    }
    return colorMap[status] || 'var(--status-pending)'
  }

  const EventCard = ({ event, showStatusSelector = false }: { 
    event: CalendarEvent, 
    showStatusSelector?: boolean 
  }) => (
    <div className={`event-card status-${event.status}`} style={{ '--card-status-color': getStatusColor(event.status) }}>
      <div className="event-header">
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className="event-image" />
        )}
        <div className="event-info">
          <h4 className="event-title">{event.title}</h4>
          <p className="event-description">{event.description}</p>
          <div className="event-datetime">
            <span className="date">{event.startDate.toLocaleDateString('zh-TW')}</span>
            <span className="time">{event.startTime} - {event.endTime}</span>
          </div>
        </div>
      </div>
      
      <div className="event-actions">
        <button onClick={() => handleEditEvent(event)} className="edit-btn">
          ✏️ 編輯
        </button>
        
        {showStatusSelector && (
          <select 
            value={event.status} 
            onChange={(e) => handleUpdateEventStatus(event.id, e.target.value as BookingStatus)}
            className="status-select"
          >
            <option value={BookingStatus.PENDING}>待確認</option>
            <option value={BookingStatus.CONFIRMED}>已確認</option>
            <option value={BookingStatus.CANCELLED}>已取消</option>
            <option value={BookingStatus.COMPLETED}>已完成</option>
          </select>
        )}
        
        <button onClick={() => handleDeleteEvent(event.id)} className="delete-btn">
          🗑️ 刪除
        </button>
      </div>
    </div>
  )

  const TabContent = ({ type, events }: { type: 'current' | 'past', events: CalendarEvent[] }) => (
    <div className={`calendar-tab ${type}`}>
      <div className="tab-header">
        <h3>{type === 'current' ? '📅 當前行事曆' : '📜 過去行事曆'}</h3>
        <button 
          onClick={() => setEditingEvent({
            id: '',
            title: '',
            description: '',
            imageUrl: '',
            startDate: '',
            startTime: '',
            endDate: '',
            status: BookingStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
          })}
          className="add-event-btn"
        >
          ➕ 新增事件
        </button>
      </div>
      
      <div className="events-grid">
        {events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{type === 'current' ? '📅' : '📜'}</div>
            <p>{type === 'current' ? '尚無當前事件' : '尚無歷史事件'}</p>
          </div>
        ) : (
          events.map(event => (
            <EventCard 
              key={event.id} 
              event={event} 
              showStatusSelector={type === 'current'}
            />
          ))
        )}
      </div>
    </div>
  )

  return (
    <div className="calendar-system">
      <div className="calendar-tabs">
        <div className="tab-selector">
          <button 
            className={`tab-btn ${selectedTab === 'current' ? 'active' : ''}`}
            onClick={() => setSelectedTab('current')}
          >
            當前 ({currentEvents.length})
          </button>
          <button 
            className={`tab-btn ${selectedTab === 'past' ? 'active' : ''}`}
            onClick={() => setSelectedTab('past')}
          >
            過去 ({pastEvents.length})
          </button>
        </div>
        
        {selectedTab === 'current' && (
          <TabContent type="current" events={currentEvents} />
        )}
        
        {selectedTab === 'past' && (
          <TabContent type="past" events={pastEvents} />
        )}
      </div>

      {/* 新增/編輯事件模態視窗 */}
      {editingEvent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingEvent.id ? '編輯事件' : '新增事件'}</h3>
              <button onClick={() => setEditingEvent(null)} className="close-btn">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>標題</label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="請輸入事件標題"
                />
              </div>
              <div className="form-group">
                <label>描述</label>
                <textarea
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="請輸入事件描述"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>圖片網址</label>
                <input
                  type="text"
                  value={editingEvent.imageUrl}
                  onChange={(e) => setEditingEvent({ ...editingEvent, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>開始日期</label>
                  <input
                    type="date"
                    value={editingEvent.startDate}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>結束日期</label>
                  <input
                    type="date"
                    value={editingEvent.endDate}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>開始時間</label>
                  <input
                    type="time"
                    value={editingEvent.startTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>結束時間</label>
                  <input
                    type="time"
                    value={editingEvent.endTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button onClick={handleSaveEvent} className="save-btn">
                  💾 儲存
                </button>
                <button onClick={() => setEditingEvent(null)} className="cancel-btn">
                  ❌ 取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 顯示成功消息的輔助函數
const showSuccess = (message: string) => {
  // 實際應用中會使用 Toast 或其他通知系統
  console.log('Success:', message)
  alert(message) // 簡化實現
}

export default CalendarSystem