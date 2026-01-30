import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { eventBusActions } from '../../store/modules/eventBus';
import { IoTDevice, IoTEvent } from '../../types/domain';
import '../../assets/styles/iot-event-bus.css';

const IoTEventBus: React.FC = () => {
  const dispatch = useAppDispatch();
  const { devices, events, isConnected, connectionStatus, lastHeartbeat } = useAppSelector(state => state.eventBus);

  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [connectionUrl, setConnectionUrl] = useState<string>('ws://localhost:8080/iot');

  useEffect(() => {
    const mockDevices: IoTDevice[] = [
      {
        id: 'CAM001',
        name: '大門攝影機',
        type: 'camera',
        location: '大門入口',
        status: 'online',
        lastSeen: new Date(),
        data: {
          recording: true,
          motionDetected: false,
          nightVision: false,
        },
        configuration: {
          resolution: '1080p',
          fps: 30,
          motionSensitivity: 'medium',
        },
      },
      {
        id: 'SENS001',
        name: '一樓溫濕度感應器',
        type: 'sensor',
        location: '一樓大廳',
        unitId: 'U001',
        status: 'online',
        lastSeen: new Date(),
        data: {
          temperature: 23.5,
          humidity: 65.2,
          lastUpdate: new Date().toISOString(),
        },
        configuration: {
          alertThreshold: { temperature: 30, humidity: 80 },
          updateInterval: 60,
        },
      },
      {
        id: 'ACC001',
        name: '大門門禁系統',
        type: 'access_control',
        location: '大門',
        status: 'online',
        lastSeen: new Date(),
        data: {
          doorOpen: false,
          lastAccess: '2024-01-15T09:30:00Z',
          authorizedUsers: ['R001', 'R002', 'R003'],
        },
        configuration: {
          autoLockTimeout: 30,
          maxFailedAttempts: 3,
          lockdownMode: false,
        },
      },
      {
        id: 'METER001',
        name: 'A戶電錶',
        type: 'meter',
        location: 'A戶',
        unitId: 'U001',
        status: 'online',
        lastSeen: new Date(),
        data: {
          currentReading: 1250.5,
          monthlyUsage: 380.2,
          powerFactor: 0.95,
          voltage: 220.1,
          lastReading: new Date().toISOString(),
        },
        configuration: {
          readingInterval: 900,
          alertThreshold: 2000,
        },
      },
      {
        id: 'CAM002',
        name: '停車場攝影機',
        type: 'camera',
        location: '停車場B區',
        status: 'offline',
        lastSeen: new Date(Date.now() - 300000),
        data: {
          recording: false,
          motionDetected: false,
          nightVision: true,
        },
        configuration: {
          resolution: '720p',
          fps: 25,
          motionSensitivity: 'high',
        },
      },
      {
        id: 'SENS002',
        name: '停車場車位感應器',
        type: 'sensor',
        location: '停車場B區-001',
        status: 'online',
        lastSeen: new Date(),
        data: {
          occupied: false,
          vehicleDetected: false,
          lastDetection: null,
        },
        configuration: {
          detectionTimeout: 5,
          sensitivity: 'high',
        },
      },
      {
        id: 'ACT001',
        name: '公共照明控制器',
        type: 'actuator',
        location: '一樓大廳',
        status: 'online',
        lastSeen: new Date(),
        data: {
          lightOn: true,
          brightness: 80,
          schedule: {
            on: '18:00',
            off: '23:00',
          },
        },
        configuration: {
          maxBrightness: 100,
          minBrightness: 10,
        },
      },
    ];

    const mockEvents: IoTEvent[] = [
      {
        id: 'EVT001',
        deviceId: 'CAM001',
        eventType: 'motion_detected',
        timestamp: new Date(Date.now() - 60000),
        data: { confidence: 0.85, duration: 3.2 },
        processed: false,
        severity: 'medium',
      },
      {
        id: 'EVT002',
        deviceId: 'SENS001',
        eventType: 'temperature_alert',
        timestamp: new Date(Date.now() - 180000),
        data: { currentTemp: 31.5, threshold: 30 },
        processed: false,
        severity: 'high',
      },
      {
        id: 'EVT003',
        deviceId: 'ACC001',
        eventType: 'access_granted',
        timestamp: new Date(Date.now() - 300000),
        data: { userId: 'R001', method: 'card', accessTime: '09:30' },
        processed: true,
        severity: 'low',
      },
      {
        id: 'EVT004',
        deviceId: 'METER001',
        eventType: 'usage_alert',
        timestamp: new Date(Date.now() - 900000),
        data: { currentUsage: 2100, threshold: 2000, increaseRate: 15.5 },
        processed: false,
        severity: 'medium',
      },
      {
        id: 'EVT005',
        deviceId: 'SENS002',
        eventType: 'vehicle_detected',
        timestamp: new Date(Date.now() - 120000),
        data: { duration: 0, confidence: 0.92 },
        processed: true,
        severity: 'low',
      },
    ];

    dispatch(eventBusActions.setDevices(mockDevices));
    dispatch(eventBusActions.clearEvents());
    mockEvents.forEach(event => {
      dispatch(eventBusActions.addEvent(event));
    });
  }, [dispatch]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        dispatch(eventBusActions.updateHeartbeat());

        dispatch(eventBusActions.updateDeviceData({
          deviceId: 'SENS001',
          data: {
            temperature: 22 + Math.random() * 3,
            humidity: 60 + Math.random() * 10,
            lastUpdate: new Date().toISOString(),
          }
        }));

        dispatch(eventBusActions.updateDeviceData({
          deviceId: 'METER001',
          data: {
            currentReading: 1200 + Math.random() * 100,
            monthlyUsage: 380 + Math.random() * 20,
            lastReading: new Date().toISOString(),
          }
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, dispatch]);

  const connectToEventBus = useCallback(() => {
    dispatch(eventBusActions.setConnectionStatus('connecting'));

    setTimeout(() => {
      dispatch(eventBusActions.setConnected(true));

      const connectionEvent: IoTEvent = {
        id: `EVT${Date.now()}`,
        deviceId: 'SYSTEM',
        eventType: 'connection_established',
        timestamp: new Date(),
        data: { url: connectionUrl, protocol: 'websocket' },
        processed: true,
        severity: 'low',
      };

      dispatch(eventBusActions.addEvent(connectionEvent));
    }, 1000);
  }, [connectionUrl, dispatch]);

  const disconnectFromEventBus = useCallback(() => {
    dispatch(eventBusActions.setConnected(false));

    const disconnectionEvent: IoTEvent = {
      id: `EVT${Date.now()}`,
      deviceId: 'SYSTEM',
      eventType: 'connection_terminated',
      timestamp: new Date(),
      data: { reason: 'manual_disconnect' },
      processed: true,
      severity: 'medium',
    };

    dispatch(eventBusActions.addEvent(disconnectionEvent));
  }, [dispatch]);

  const simulateDeviceEvent = useCallback((deviceId: string, eventType: string, data: Record<string, any>, severity: IoTEvent['severity'] = 'medium') => {
    const event: IoTEvent = {
      id: `EVT${Date.now()}`,
      deviceId,
      eventType,
      timestamp: new Date(),
      data,
      processed: false,
      severity,
    };

    dispatch(eventBusActions.addEvent(event));
  }, [dispatch]);

  const controlDevice = useCallback((deviceId: string, action: string, parameters: Record<string, any> = {}) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    let newData: Record<string, any> = {};

    switch (device.type) {
      case 'actuator':
        if (action === 'toggle_light') {
          newData = { lightOn: !device.data.lightOn };
        } else if (action === 'set_brightness') {
          newData = { brightness: parameters.brightness };
        }
        break;

      case 'access_control':
        if (action === 'unlock_door') {
          newData = { doorOpen: true };
        } else if (action === 'lock_door') {
          newData = { doorOpen: false };
        }
        break;

      case 'camera':
        if (action === 'start_recording') {
          newData = { recording: true };
        } else if (action === 'stop_recording') {
          newData = { recording: false };
        }
        break;
    }

    if (Object.keys(newData).length > 0) {
      dispatch(eventBusActions.updateDeviceData({
        deviceId,
        data: newData
      }));

      simulateDeviceEvent(deviceId, 'device_controlled', { action, parameters: newData }, 'low');
    }
  }, [devices, dispatch, simulateDeviceEvent]);

  const getDeviceStatusColor = (status: IoTDevice['status']) => {
    const statusColors = {
      online: 'var(--color-success)',
      offline: 'var(--color-warning)',
      error: 'var(--color-danger)',
      maintenance: 'var(--color-info)',
    };

    return statusColors[status] || 'var(--color-secondary)';
  };

  const getDeviceTypeIcon = (type: IoTDevice['type']) => {
    const typeIcons = {
      sensor: '📡',
      actuator: '🔧',
      camera: '📹',
      access_control: '🔐',
      meter: '⚡',
    };

    return typeIcons[type] || '📱';
  };

  const getSeverityColor = (severity: IoTEvent['severity']) => {
    const severityColors = {
      low: 'var(--color-success)',
      medium: 'var(--color-warning)',
      high: 'var(--color-danger)',
      critical: 'var(--color-status-maintenance)',
    };

    return severityColors[severity] || 'var(--color-secondary)';
  };

  const filteredDevices = devices.filter(device => {
    if (deviceFilter === 'all') return true;
    if (deviceFilter === 'online') return device.status === 'online';
    if (deviceFilter === 'offline') return device.status === 'offline';
    if (deviceFilter === 'error') return device.status === 'error';
    return false;
  });

  const filteredEvents = events.filter(event => {
    if (eventFilter === 'all') return true;
    return event.eventType === eventFilter;
  });

  return (
    <div className="iot-event-bus animate-fade-in">
      <div className="bus-header">
        <h1>IoT 事件總線</h1>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span className="status-text">
            {connectionStatus === 'connecting' && '連接中...'}
            {connectionStatus === 'connected' && '已連接'}
            {connectionStatus === 'disconnected' && '未連接'}
            {connectionStatus === 'error' && '連接錯誤'}
          </span>
          {lastHeartbeat && (
            <span className="heartbeat">
              最後心跳: {lastHeartbeat.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="bus-controls">
        <Card className="connection-panel">
          <CardHeader>
            <CardTitle>連接設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="connection-config">
              <div className="config-row">
                <label>服務器地址：</label>
                <input
                  type="text"
                  value={connectionUrl}
                  onChange={(e) => setConnectionUrl(e.target.value)}
                  className="url-input"
                />
              </div>

              <div className="config-row">
                <label>
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                  />
                  自動更新
                </label>
              </div>

              <div className="connection-actions">
                <Button
                  variant="primary"
                  onClick={connectToEventBus}
                  disabled={isConnected || connectionStatus === 'connecting'}
                >
                  {connectionStatus === 'connecting' ? '連接中...' : '連接'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={disconnectFromEventBus}
                  disabled={!isConnected}
                >
                  斷開連接
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bus-content">
        <div className="devices-section">
          <Card>
            <CardHeader>
              <CardTitle>
                IoT 設備 ({filteredDevices.length})
              </CardTitle>
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="device-filter"
              >
                <option value="all">全部設備</option>
                <option value="online">在線</option>
                <option value="offline">離線</option>
                <option value="error">錯誤</option>
              </select>
            </CardHeader>
            <CardContent>
              <div className="devices-grid">
                {filteredDevices.map(device => (
                  <div
                    key={device.id}
                    className={`device-card ${selectedDevice === device.id ? 'selected' : ''}`}
                    onClick={() => setSelectedDevice(device.id)}
                  >
                    <div className="device-header">
                      <div className="device-icon">{getDeviceTypeIcon(device.type)}</div>
                      <div className="device-name">{device.name}</div>
                      <div
                        className="device-status"
                        style={{ backgroundColor: getDeviceStatusColor(device.status) }}
                      ></div>
                    </div>

                    <div className="device-info">
                      <div className="info-item">
                        <label>類型：</label>
                        <span>{device.type}</span>
                      </div>
                      <div className="info-item">
                        <label>位置：</label>
                        <span>{device.location}</span>
                      </div>
                      {device.unitId && (
                        <div className="info-item">
                          <label>單元：</label>
                          <span>{device.unitId}</span>
                        </div>
                      )}
                      <div className="info-item">
                        <label>最後更新：</label>
                        <span>{device.lastSeen.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="device-data">
                      <h4>即時數據</h4>
                      <div className="data-grid">
                        {Object.entries(device.data).map(([key, value]) => (
                          <div key={key} className="data-item">
                            <span className="data-key">{key}:</span>
                            <span className="data-value">
                              {typeof value === 'boolean' ? (value ? '是' : '否') :
                                typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="device-controls">
                      {device.type === 'actuator' && (
                        <div className="control-buttons">
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => controlDevice(device.id, 'toggle_light')}
                          >
                            切換電源
                          </Button>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => controlDevice(device.id, 'set_brightness', { brightness: 50 })}
                          >
                            設定亮度
                          </Button>
                        </div>
                      )}

                      {device.type === 'access_control' && (
                        <div className="control-buttons">
                          <Button
                            variant="success"
                            size="small"
                            onClick={() => controlDevice(device.id, 'unlock_door')}
                          >
                            解鎖
                          </Button>
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => controlDevice(device.id, 'lock_door')}
                          >
                            上鎖
                          </Button>
                        </div>
                      )}

                      {device.type === 'camera' && (
                        <div className="control-buttons">
                          <Button
                            variant={device.data.recording ? 'danger' : 'success'}
                            size="small"
                            onClick={() => controlDevice(device.id, device.data.recording ? 'stop_recording' : 'start_recording')}
                          >
                            {device.data.recording ? '停止錄影' : '開始錄影'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="events-section">
          <Card>
            <CardHeader>
              <CardTitle>
                事件日誌 ({filteredEvents.length})
              </CardTitle>
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                className="event-filter"
              >
                <option value="all">全部事件</option>
                <option value="motion_detected">移動偵測</option>
                <option value="temperature_alert">溫度警報</option>
                <option value="access_granted">訪問授權</option>
                <option value="usage_alert">用量警報</option>
                <option value="vehicle_detected">車輛偵測</option>
                <option value="device_controlled">設備控制</option>
              </select>
            </CardHeader>
            <CardContent>
              <div className="events-list">
                {filteredEvents.slice(0, 20).map(event => {
                  const device = devices.find(d => d.id === event.deviceId);
                  return (
                    <div key={event.id} className="event-item">
                      <div className="event-header">
                        <div className="event-severity">
                          <div
                            className="severity-dot"
                            style={{ backgroundColor: getSeverityColor(event.severity) }}
                          ></div>
                          <span className="severity-text">{event.severity}</span>
                        </div>
                        <div className="event-time">{event.timestamp.toLocaleString()}</div>
                        <div className={`event-processed ${event.processed ? 'processed' : 'pending'}`}>
                          {event.processed ? '已處理' : '待處理'}
                        </div>
                      </div>

                      <div className="event-content">
                        <div className="event-device">
                          <span className="device-icon">{getDeviceTypeIcon((device?.type || 'camera') as IoTDevice['type'])}</span>
                          <span className="device-name">{device?.name || event.deviceId}</span>
                        </div>
                        <div className="event-type">{event.eventType}</div>
                        <div className="event-data">
                          {Object.entries(event.data).map(([key, value]) => (
                            <div key={key} className="data-row">
                              <span className="data-key">{key}:</span>
                              <span className="data-value">{JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {!event.processed && (
                        <div className="event-actions">
                          <Button
                            variant="success"
                            size="small"
                            onClick={() => dispatch(eventBusActions.processEvent(event.id))}
                          >
                            標記已處理
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default IoTEventBus;