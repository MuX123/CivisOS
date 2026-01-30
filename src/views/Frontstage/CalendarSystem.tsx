import React, { useState, useEffect } from 'react'
import { CalendarEvent } from '../../types/domain'
import { useAppDispatch } from '../../store/hooks'
import { addEvent, updateEvent, deleteEvent } from '../../store/modules/calendar'

const CalendarSystem: React.FC = () => {
  const dispatch = useAppDispatch()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  useEffect(() => {
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: '社區會議',
        start: new Date('2024-01-15T10:00:00'),
        end: new Date('2024-01-15T12:00:00'),
        category: 'community',
        location: '會議室',
        description: '月度社區管理會議',
        color: 'var(--color-info)'
      },
      {
        id: '2',
        title: '設施保養',
        start: new Date('2024-01-20T09:00:00'),
        end: new Date('2024-01-20T17:00:00'),
        category: 'maintenance',
        location: '電梯設備',
        description: '定期設施保養維護',
        color: 'var(--color-danger)'
      },
      {
        id: '3',
        title: '健身房預約',
        start: new Date('2024-01-25T18:00:00'),
        end: new Date('2024-01-25T19:00:00'),
        category: 'booking',
        location: '健身房',
        description: '個人健身時間',
        color: 'var(--color-success)'
      }
    ]
    setEvents(sampleEvents)
  }, [])

  const handleAddEvent = () => {
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: '新事件',
      start: new Date().toISOString(), // Use ISO string
      end: new Date().toISOString(), // Use ISO string
      category: 'personal',
      color: 'var(--color-text-muted)'
    }
    dispatch(addEvent(newEvent))
    setEvents([...events, newEvent])
  }

  const handleUpdateEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleDeleteEvent = (eventId: string) => {
    dispatch(deleteEvent(eventId))
    setEvents(events.filter(e => e.id !== eventId))
  }

  const getEventColor = (category: string) => {
    const colors: Record<string, string> = {
      community: 'var(--color-info)',
      maintenance: 'var(--color-danger)',
      personal: 'var(--color-text-muted)',
      booking: 'var(--color-success)'
    }
    return colors[category] || 'var(--color-text-muted)'
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatTime = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">日曆管理</h2>
          <button
            onClick={handleAddEvent}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            新增事件
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">即將到來的事件</h3>
        </div>

        {events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>目前沒有預定的事件</p>
            <button
              onClick={handleAddEvent}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              創建第一個事件
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {events.map((event) => (
              <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getEventColor(event.category) }}
                      />
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                    </div>

                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">時間:</span> {formatDate(event.start)} {formatTime(event.start)} - {formatTime(event.end)}
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">地點:</span> {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-600">{event.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleUpdateEvent(event)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="編輯"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="刪除"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">總事件數</h4>
          <p className="text-2xl font-bold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">社區活動</h4>
          <p className="text-2xl font-bold text-blue-600">
            {events.filter(e => e.category === 'community').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">設施保養</h4>
          <p className="text-2xl font-bold text-red-600">
            {events.filter(e => e.category === 'maintenance').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">設施預約</h4>
          <p className="text-2xl font-bold text-green-600">
            {events.filter(e => e.category === 'booking').length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default CalendarSystem